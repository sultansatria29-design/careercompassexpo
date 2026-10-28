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

    // 3. Ambil data survei (untuk preferensi hari dan fakultas/jurusan)
    const { data: surveys, error: sErr } = await supabase
      .from("surveys")
      .select("participant_id, faculty, major, feedback");

    if (sErr) throw sErr;

    // Buat map survei berdasarkan participant_id
    const surveyMap = {};
    (surveys || []).forEach((s) => {
      let parsedFeedback = {};
      if (s.feedback) {
        try {
          parsedFeedback = typeof s.feedback === "string" ? JSON.parse(s.feedback) : s.feedback;
        } catch {
          parsedFeedback = {};
        }
      }
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
    });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data admin." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus data check-in presensi jika terjadi salah scan
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get("id");

    if (!attendanceId) {
      return NextResponse.json({ success: false, message: "ID presensi diperlukan." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("attendance").delete().eq("id", attendanceId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Data presensi berhasil dihapus." });
  } catch (error) {
    console.error("Admin attendance delete error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus presensi." },
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
