import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkGoogleDriveConfig } from "@/app/lib/googleDrive";

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

    // 4. Ambil seluruh data pendaftaran lamaran & walk-in interview
    const { data: rawApps } = await supabase
      .from("applications")
      .select("id, participant_id, job_id, status, cv_path, portfolio_url, created_at")
      .order("created_at", { ascending: false });

    // 5. Ambil data jobs untuk judul lowongan, perusahaan, dan flag walk-in
    const { data: rawJobs } = await supabase
      .from("jobs")
      .select("id, company_id, title, location, employment_type, description");

    const jobMap = {};
    (rawJobs || []).forEach((j) => {
      let descObj = {};
      try {
        descObj = typeof j.description === "string" ? JSON.parse(j.description) : j.description || {};
      } catch {
        descObj = {};
      }
      jobMap[j.id] = {
        ...j,
        is_walk_in: Boolean(descObj.is_walk_in),
      };
    });

    // 6. Ambil data companies untuk nama perusahaan & logo
    const { data: rawCompanies } = await supabase
      .from("companies")
      .select("id, name, logo_url, website, description");

    const companyMap = {};
    (rawCompanies || []).forEach((c) => {
      let meta = {};
      if (c.description) {
        try {
          meta = typeof c.description === "string" ? JSON.parse(c.description) : c.description;
        } catch {
          meta = {};
        }
      }
      companyMap[c.id] = {
        ...c,
        industry: meta.industry || "-",
      };
    });

    // 7. Ambil data interviews untuk informasi jadwal wawancara walk-in
    const { data: rawInterviews } = await supabase
      .from("interviews")
      .select("id, application_id, participant_id, company_id, status, interview_date, notes");

    const interviewMap = {};
    (rawInterviews || []).forEach((item) => {
      interviewMap[item.application_id] = item;
    });

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
          tactlink_drive_url: parsedFeedback.tactlink_drive_url || null,
          tactlink_drive_id: parsedFeedback.tactlink_drive_id || null,
          tactlink_drive_thumb: parsedFeedback.tactlink_drive_thumb || null,
          tactlink_storage: parsedFeedback.tactlink_storage || (parsedFeedback.tactlink_drive_id ? "google_drive" : null),
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

    // 8. Bentuk daftar pendaftaran lowongan & walk-in interview lengkap
    const jobRegistrationsList = (rawApps || []).map((app) => {
      const part = participantMap[app.participant_id] || {};
      const job = jobMap[app.job_id] || {};
      const interview = interviewMap[app.id] || null;
      const targetCompanyId = job.company_id || interview?.company_id || null;
      const comp = companyMap[targetCompanyId] || {};

      // Format label hari wawancara
      let dayLabel = null;
      const rawDate = interview?.interview_date;
      const rawNotes = interview?.notes || "";
      if (rawDate === "2026-11-18" || rawNotes.includes("Rabu") || rawNotes.includes("18 Nov")) {
        dayLabel = "Rabu, 18 Nov 2026";
      } else if (rawDate === "2026-11-19" || rawNotes.includes("Kamis") || rawNotes.includes("19 Nov")) {
        dayLabel = "Kamis, 19 Nov 2026";
      } else if (rawDate) {
        dayLabel = rawDate;
      }

      const isWalkIn = Boolean(job.is_walk_in || interview || dayLabel);

      return {
        id: app.id,
        application_id: app.id,
        created_at: app.created_at,
        status: app.status || "submitted",
        cv_path: app.cv_path || null,
        portfolio_url: app.portfolio_url || null,

        // Data Peserta / Pelamar
        participant_id: app.participant_id,
        registration_number: part.registration_number || "-",
        full_name: part.full_name || "Tanpa Nama",
        email: part.email || "-",
        phone: part.phone || "-",
        domicile: part.domicile || "-",
        participant_status: part.participant_status || "Umum",
        institution: part.institution || "-",
        faculty: part.survey?.faculty || "-",
        major: part.survey?.major || "-",

        // Data Perusahaan
        company_id: comp.id || job.company_id || null,
        company_name: comp.name || "-",
        company_logo: comp.logo_url || null,
        company_industry: comp.industry || "-",

        // Data Lowongan
        job_id: app.job_id,
        job_title: job.title || "Posisi Lowongan",
        job_location: job.location || "Jakarta",
        job_type: job.employment_type || "Full-time",
        is_walk_in: isWalkIn,

        // Jadwal Walk-In Interview
        interview_date: rawDate || null,
        interview_day_label: isWalkIn ? (dayLabel || "Belum Ditentukan") : null,
        interview_notes: interview?.notes || null,
        interview_status: interview?.status || null,
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

    let tactlinkCount = 0;
    let driveCount = 0;
    Object.values(surveyMap).forEach((s) => {
      if (s.tactlink_proof) {
        tactlinkCount++;
        if (s.tactlink_drive_id || s.tactlink_storage === "google_drive") {
          driveCount++;
        }
      }
    });

    let driveConfig = { configured: false, folderUrl: null };
    try {
      driveConfig = await checkGoogleDriveConfig();
    } catch (dErr) {
      console.warn("Drive config check error:", dErr);
    }

    return NextResponse.json({
      success: true,
      stats: {
        total_participants: totalParticipants,
        total_attendances: totalAttendances,
        day1_attendances: day1Attendances,
        day2_attendances: day2Attendances,
        attendance_rate: totalParticipants > 0 ? Math.round((totalAttendances / totalParticipants) * 100) : 0,
        category_stats: categoryStats,
        tactlink_stats: {
          total_uploaded: tactlinkCount,
          total_in_drive: driveCount,
          pending_sync: Math.max(0, tactlinkCount - driveCount),
          drive_configured: Boolean(driveConfig.configured),
          drive_folder_url: driveConfig.folderUrl,
          drive_folder_name: driveConfig.folderName || "Folder Google Drive",
          drive_message: driveConfig.message,
        },
        job_registration_stats: {
          total: jobRegistrationsList.length,
          walk_in_total: jobRegistrationsList.filter((j) => j.is_walk_in).length,
          day1_total: jobRegistrationsList.filter((j) => j.interview_day_label?.includes("Rabu")).length,
          day2_total: jobRegistrationsList.filter((j) => j.interview_day_label?.includes("Kamis")).length,
        },
      },
      presensi: presensiList,
      participants: (participants || []).map((p) => ({
        ...p,
        survey: surveyMap[p.id] || null,
        has_checked_in: (attendances || []).some((a) => a.participant_id === p.id),
      })),
      job_registrations: jobRegistrationsList,
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
    const paramIds = searchParams.get("participant_ids");

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const supabase = getSupabase();

    // 0. Hapus Data Lamaran / Pendaftaran Lowongan (Single atau Bulk Masal)
    if (
      action === "delete_application" ||
      action === "bulk_delete_applications" ||
      searchParams.get("application_id") ||
      searchParams.get("application_ids") ||
      (body.application_ids && Array.isArray(body.application_ids))
    ) {
      let targetAppIds = [];
      if (body.application_ids && Array.isArray(body.application_ids)) {
        targetAppIds = body.application_ids.filter(Boolean);
      } else if (searchParams.get("application_ids")) {
        targetAppIds = searchParams.get("application_ids").split(",").map((s) => s.trim()).filter(Boolean);
      } else if (searchParams.get("application_id")) {
        targetAppIds = [searchParams.get("application_id")];
      }

      if (targetAppIds.length > 0) {
        // Hapus interviews terkait dulu
        await supabase.from("interviews").delete().in("application_id", targetAppIds);
        // Hapus applications
        const { error: delAppErr } = await supabase.from("applications").delete().in("id", targetAppIds);
        if (delAppErr) throw delAppErr;

        return NextResponse.json({
          success: true,
          message: `${targetAppIds.length} data pendaftaran lowongan berhasil dihapus.`,
        });
      }
    }

    // 1. Hapus Peserta (Single atau Bulk Masal)
    if (
      action === "delete_participant" ||
      action === "bulk_delete_participants" ||
      participantId ||
      paramIds ||
      (body.participant_ids && Array.isArray(body.participant_ids))
    ) {
      let targetIds = [];
      if (body.participant_ids && Array.isArray(body.participant_ids)) {
        targetIds = body.participant_ids.filter(Boolean);
      } else if (paramIds) {
        targetIds = paramIds.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (participantId) {
        targetIds = [participantId];
      } else if (attendanceId && action === "delete_participant") {
        targetIds = [attendanceId];
      }

      if (targetIds.length === 0) {
        return NextResponse.json(
          { success: false, message: "ID peserta yang ingin dihapus tidak ditemukan." },
          { status: 400 }
        );
      }

      // Ambil data peserta terlebih dahulu untuk referensi email (membersihkan survei kepuasan jika ada)
      const { data: partsData } = await supabase
        .from("participants")
        .select("id, email")
        .in("id", targetIds);

      const emails = (partsData || [])
        .map((p) => p.email?.toLowerCase().trim())
        .filter(Boolean);

      // Cari semua ID lamaran yang terkait dengan peserta-peserta ini
      const { data: userApps } = await supabase
        .from("applications")
        .select("id")
        .in("participant_id", targetIds);

      const appIds = (userApps || []).map((a) => a.id).filter(Boolean);

      // HAPUS BERURUTAN SESUAI HIERARKI FOREIGN KEY:
      // a. Hapus interviews berdasarkan application_id DAN participant_id
      if (appIds.length > 0) {
        const { error: intAppErr } = await supabase
          .from("interviews")
          .delete()
          .in("application_id", appIds);
        if (intAppErr) console.warn("Interviews by app cleanup warning:", intAppErr.message);
      }

      const { error: intPartErr } = await supabase
        .from("interviews")
        .delete()
        .in("participant_id", targetIds);
      if (intPartErr) console.warn("Interviews by participant cleanup warning:", intPartErr.message);

      // b. Hapus lamaran pekerjaan (applications)
      const { error: appErr } = await supabase
        .from("applications")
        .delete()
        .in("participant_id", targetIds);
      if (appErr) console.warn("Applications cleanup warning:", appErr.message);

      // c. Hapus presensi (attendance)
      const { error: attErr } = await supabase
        .from("attendance")
        .delete()
        .in("participant_id", targetIds);
      if (attErr) console.warn("Attendance cleanup warning:", attErr.message);

      // d. Hapus survei registrasi awal (surveys) berdasarkan participant_id
      const { error: survErr } = await supabase
        .from("surveys")
        .delete()
        .in("participant_id", targetIds);
      if (survErr) console.warn("Surveys cleanup warning:", survErr.message);

      // e. Hapus survei kepuasan yang menyimpan email peserta di feedback JSON
      if (emails.length > 0) {
        try {
          const { data: matchedSurveys } = await supabase
            .from("surveys")
            .select("id, feedback");
          const toDeleteSurveyIds = (matchedSurveys || [])
            .filter((s) => {
              try {
                const fb = typeof s.feedback === "string" ? JSON.parse(s.feedback) : s.feedback;
                return fb && fb.email && emails.includes(fb.email.toLowerCase().trim());
              } catch {
                return false;
              }
            })
            .map((s) => s.id);

          if (toDeleteSurveyIds.length > 0) {
            await supabase.from("surveys").delete().in("id", toDeleteSurveyIds);
          }
        } catch (e) {
          console.warn("Survey cleanup by email warning:", e.message);
        }
      }

      // f. Hapus data utama di tabel participants
      const { error: partErr } = await supabase
        .from("participants")
        .delete()
        .in("id", targetIds);

      if (partErr) throw partErr;

      return NextResponse.json({
        success: true,
        message:
          targetIds.length === 1
            ? "Data peserta berhasil dihapus secara permanen beserta seluruh riwayat terkait."
            : `${targetIds.length} data peserta berhasil dihapus secara permanen.`,
        deletedCount: targetIds.length,
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
