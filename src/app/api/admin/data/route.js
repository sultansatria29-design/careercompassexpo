import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// GET: Ambil seluruh data peserta, presensi, survei, dan statistik untuk Admin Dashboard
export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Ambil seluruh peserta
    const { data: participants, error: pErr } = await supabase
      .from("participants")
      .select("id, registration_number, full_name, email, phone, domicile, participant_status, institution, created_at")
      .order("created_at", { ascending: false });

    if (pErr) throw pErr;

    // 2. Ambil seluruh presensi (attendance)
    const { data: attendances, error: aErr } = await supabase
      .from("attendance")
      .select("id, participant_id, event_date, checked_in_at, checked_in_by")
      .order("checked_in_at", { ascending: false });

    if (aErr) throw aErr;

    // 3. Ambil seluruh data survei (baik survei registrasi awal maupun indeks kepuasan)
    const { data: surveys, error: sErr } = await supabase
      .from("surveys")
      .select("id, participant_id, institution, faculty, major, rating, feedback, created_at")
      .order("created_at", { ascending: false });

    if (sErr) throw sErr;

    // Buat map survei registrasi awal berdasarkan participant_id
    // DAN kumpulkan data Indeks Kepuasan Peserta
    const surveyMap = {};
    const indeksKepuasanList = [];

    (surveys || []).forEach((s) => {
      let parsedFeedback = {};
      if (s.feedback) {
        try {
          parsedFeedback = typeof s.feedback === "string" ? JSON.parse(s.feedback) : s.feedback;
        } catch {
          parsedFeedback = {};
        }
      }

      // Jika ini adalah respon Indeks Kepuasan
      if (parsedFeedback.source === "CCE_2026_SATISFACTION_INDEX" || parsedFeedback.ratings) {
        indeksKepuasanList.push({
          id: s.id,
          created_at: s.created_at || parsedFeedback.submitted_at || null,
          email: parsedFeedback.email || "-",
          full_name: parsedFeedback.full_name || "Peserta CCE",
          status: parsedFeedback.status || "Mahasiwa",
          institution: s.institution || parsedFeedback.institution || "UIN Syarif Hidayatullah Jakarta",
          faculty: s.faculty || parsedFeedback.faculty_choice || "-",
          major: s.major || parsedFeedback.faculty_major_text || "-",
          rating: s.rating || parsedFeedback.average_score || 5,
          ratings: parsedFeedback.ratings || {},
          average_score: parsedFeedback.average_score || s.rating || 5,
        });
      } else if (s.participant_id) {
        // Survei registrasi awal peserta CCE
        surveyMap[s.participant_id] = {
          faculty: s.faculty,
          major: s.major,
          semester: parsedFeedback.semester || null,
          attendance_day: parsedFeedback.attendance_day || "DAY1",
          attendance_day_label: parsedFeedback.attendance_day_label || "Day 1 — 18 Nov 2026",
          visit_plans: parsedFeedback.visit_plans || [],
          info_source: parsedFeedback.info_source || null,
          expectations: parsedFeedback.expectations || null,
          tactlink_proof: parsedFeedback.tactlink_proof || null,
          tactlink_filename: parsedFeedback.tactlink_filename || null,
        };
      }
    });

    // Buat map peserta berdasarkan id
    const participantMap = {};
    (participants || []).forEach((p) => {
      participantMap[p.id] = {
        ...p,
        survey: surveyMap[p.id] || null,
      };
    });

    // Gabungkan data presensi dengan detail peserta
    const presensiList = (attendances || []).map((att) => {
      const part = participantMap[att.participant_id] || {};
      return {
        id: att.id,
        participant_id: att.participant_id,
        event_date: att.event_date,
        checked_in_at: att.checked_in_at,
        checked_in_by: att.checked_in_by,
        registration_number: part.registration_number || "-",
        full_name: part.full_name || "Tanpa Nama",
        email: part.email || "-",
        phone: part.phone || "-",
        domicile: part.domicile || "-",
        participant_status: part.participant_status || "Umum",
        institution: part.institution || "-",
        survey: part.survey || null,
      };
    });

    // Hitung statistik
    const totalParticipants = participants ? participants.length : 0;
    const totalAttendances = attendances ? attendances.length : 0;
    const day1Attendances = (attendances || []).filter((a) => a.event_date === "2026-11-18").length;
    const day2Attendances = (attendances || []).filter((a) => a.event_date === "2026-11-19").length;

    const categoryStats = {
      Mahasiswa: (participants || []).filter((p) => p.participant_status === "Mahasiswa").length,
      Alumni: (participants || []).filter((p) => p.participant_status === "Alumni").length,
      Umum: (participants || []).filter((p) => p.participant_status === "Umum").length,
    };

    // Statistik Indeks Kepuasan
    const totalSurveys = indeksKepuasanList.length;
    const overallAvgScore =
      totalSurveys > 0
        ? Math.round(
            (indeksKepuasanList.reduce((acc, curr) => acc + (Number(curr.average_score) || 5), 0) /
              totalSurveys) *
              10
          ) / 10
        : 0;

    const qKeys = [
      { key: "q1_fasilitas_fisik", label: "Fasilitas Fisik Acara" },
      { key: "q2_informasi_lengkap", label: "Kelengkapan Informasi" },
      { key: "q3_kebersihan_kerapihan", label: "Kebersihan & Kerapihan Lokasi" },
      { key: "q4_peta_lokasi", label: "Kemudahan Peta Lokasi" },
      { key: "q5_jadwal_tepat", label: "Ketepatan Waktu & Jadwal" },
      { key: "q6_panitia_sigap", label: "Kesigapan Pelayanan Panitia" },
      { key: "q7_kecepatan_info", label: "Kecepatan Perolehan Informasi" },
      { key: "q8_pengetahuan_partner", label: "Pemahaman Partner/Mitra" },
      { key: "q9_keyakinan_info", label: "Tingkat Keyakinan Informasi" },
      { key: "q10_kepedulian_panitia", label: "Kepedulian Terhadap Kebutuhan" },
      { key: "q11_didengarkan_diperhatikan", label: "Perhatian & Mendengarkan Peserta" },
    ];

    const questionAverages = qKeys.map(({ key, label }) => {
      const validAnswers = indeksKepuasanList
        .map((item) => Number(item.ratings?.[key]))
        .filter((val) => !isNaN(val) && val > 0);
      const avg =
        validAnswers.length > 0
          ? Math.round((validAnswers.reduce((a, b) => a + b, 0) / validAnswers.length) * 10) / 10
          : 0;
      return { key, label, average: avg, total_responses: validAnswers.length };
    });

    return NextResponse.json({
      success: true,
      stats: {
        total_participants: totalParticipants,
        total_attendances: totalAttendances,
        day1_attendances: day1Attendances,
        day2_attendances: day2Attendances,
        attendance_rate: totalParticipants > 0 ? Math.round((totalAttendances / totalParticipants) * 100) : 0,
        category_stats: categoryStats,
      },
      presensi: presensiList,
      participants: (participants || []).map((p) => ({
        ...p,
        survey: surveyMap[p.id] || null,
        has_checked_in: (attendances || []).some((a) => a.participant_id === p.id),
      })),
      indeks_kepuasan: {
        total_respondents: totalSurveys,
        overall_average: overallAvgScore,
        question_averages: questionAverages,
        list: indeksKepuasanList,
      },
    });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data admin." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus data peserta atau data check-in presensi
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const participantId = searchParams.get("participant_id");
    const attendanceId = searchParams.get("id");

    const supabase = getSupabase();

    // 1. Hapus Peserta Lengkap (beserta seluruh riwayat presensi, survei, dan lamaran)
    if (action === "delete_participant" || participantId) {
      const targetId = participantId || attendanceId;
      if (!targetId) {
        return NextResponse.json(
          { success: false, message: "ID peserta diperlukan." },
          { status: 400 }
        );
      }

      // Ambil data peserta terlebih dahulu untuk referensi email jika ada
      const { data: partData } = await supabase
        .from("participants")
        .select("id, email")
        .eq("id", targetId)
        .maybeSingle();

      // Hapus data berelasi terlebih dahulu agar tidak terjadi foreign key constraint error
      // a. Hapus catatan presensi (attendance)
      await supabase.from("attendance").delete().eq("participant_id", targetId);

      // b. Hapus survei registrasi awal berdasarkan participant_id
      await supabase.from("surveys").delete().eq("participant_id", targetId);

      // c. Hapus survei kepuasan dengan email terkait jika ada
      if (partData?.email) {
        try {
          const { data: matchedSurveys } = await supabase.from("surveys").select("id, feedback");
          const toDelete = (matchedSurveys || [])
            .filter((s) => {
              try {
                const fb = typeof s.feedback === "string" ? JSON.parse(s.feedback) : s.feedback;
                return fb && fb.email && fb.email.toLowerCase() === partData.email.toLowerCase();
              } catch {
                return false;
              }
            })
            .map((s) => s.id);

          if (toDelete.length > 0) {
            await supabase.from("surveys").delete().in("id", toDelete);
          }
        } catch (e) {
          console.warn("Survey cleanup by email warning:", e.message);
        }
      }

      // d. Hapus lamaran pekerjaan (applications) jika ada
      try {
        await supabase.from("applications").delete().eq("participant_id", targetId);
      } catch (e) {
        console.warn("Applications cleanup warning:", e.message);
      }

      // e. Hapus data utama di tabel participants
      const { error: partErr } = await supabase
        .from("participants")
        .delete()
        .eq("id", targetId);

      if (partErr) throw partErr;

      return NextResponse.json({
        success: true,
        message: "Data peserta berhasil dihapus secara permanen beserta riwayat terkait.",
      });
    }

    // 2. Hapus Presensi Saja
    if (!attendanceId) {
      return NextResponse.json({ success: false, message: "ID presensi diperlukan." }, { status: 400 });
    }

    const { error } = await supabase.from("attendance").delete().eq("id", attendanceId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Data presensi berhasil dihapus." });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus data." },
      { status: 500 }
    );
  }
}

// POST: Check-in manual peserta langsung dari Admin Dashboard
export async function POST(request) {
  try {
    const body = await request.json();
    const { participant_id, event_date } = body;

    if (!participant_id || !event_date) {
      return NextResponse.json(
        { success: false, message: "Participant ID dan tanggal acara diperlukan." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Cek apakah sudah pernah check-in pada tanggal tersebut
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("participant_id", participant_id)
      .eq("event_date", event_date)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Peserta ini sudah tercatat check-in pada tanggal tersebut." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        participant_id,
        event_date,
        checked_in_by: "Admin Manual",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Presensi manual berhasil dicatat.", data });
  } catch (error) {
    console.error("Admin manual check-in error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mencatat presensi manual." },
      { status: 500 }
    );
  }
}
