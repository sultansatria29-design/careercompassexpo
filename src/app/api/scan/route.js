import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

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

// POST: Verifikasi tiket QR dan catat kehadiran
export async function POST(request) {
  try {
    const body = await request.json();
    let regNumber = String(body.registration_number || "").trim();
    
    // Jika input berupa full URL (misal: https://.../scan?reg=CCE2026-00001)
    if (regNumber.includes("reg=")) {
      try {
        const url = new URL(regNumber.startsWith("http") ? regNumber : `http://dummy.com/${regNumber}`);
        const paramReg = url.searchParams.get("reg");
        if (paramReg) regNumber = paramReg.trim();
      } catch {
        // Abaikan parse error, gunakan regNumber asli
      }
    }

    if (!regNumber) {
      return NextResponse.json(
        { success: false, status: "EMPTY_CODE", message: "Nomor registrasi tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Tanggal scan: gunakan simulasi jika disediakan, atau default tanggal server WIB
    const targetDate = body.scan_date ? String(body.scan_date).trim() : getJakartaDate();

    const supabase = getSupabase();

    // 1. Cari data peserta berdasarkan registration_number (case-insensitive)
    const { data: participant, error: partError } = await supabase
      .from("participants")
      .select("id, registration_number, full_name, email, phone, participant_status, institution")
      .ilike("registration_number", regNumber)
      .maybeSingle();

    if (partError || !participant) {
      return NextResponse.json(
        {
          success: false,
          status: "NOT_FOUND",
          message: `Nomor registrasi "${regNumber}" tidak ditemukan di database.`,
        },
        { status: 404 }
      );
    }

    // 2. Ambil data preferensi kehadiran dari tabel surveys
    const { data: survey } = await supabase
      .from("surveys")
      .select("feedback, faculty, major")
      .eq("participant_id", participant.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let valid_dates = ["2026-11-18", "2026-11-19"];
    let attendance_day_label = "Kedua Hari (18 & 19 November 2026)";
    let attendance_day = "BOTH";

    if (survey?.feedback) {
      try {
        const parsed = typeof survey.feedback === "string" ? JSON.parse(survey.feedback) : survey.feedback;
        if (Array.isArray(parsed.valid_dates) && parsed.valid_dates.length > 0) {
          valid_dates = parsed.valid_dates;
        }
        if (parsed.attendance_day_label) {
          attendance_day_label = parsed.attendance_day_label;
        }
        if (parsed.attendance_day) {
          attendance_day = parsed.attendance_day;
        }
      } catch (e) {
        console.warn("Gagal parse survey feedback JSON:", e);
      }
    }

    // 3. VALIDASI HARI: Apakah tanggal scan sesuai dengan hari kehadiran yang dipilih peserta?
    const isDateValid = valid_dates.includes(targetDate);

    if (!isDateValid) {
      return NextResponse.json(
        {
          success: false,
          status: "DATE_MISMATCH",
          message: `AKSES DITOLAK: Tiket ini terdaftar untuk "${attendance_day_label}". Tidak berlaku untuk tanggal scan ${targetDate}.`,
          participant: {
            id: participant.id,
            full_name: participant.full_name,
            registration_number: participant.registration_number,
            institution: participant.institution,
            participant_status: participant.participant_status,
            registered_day: attendance_day_label,
            valid_dates,
          },
          scan_date: targetDate,
        },
        { status: 403 }
      );
    }

    // 4. CEK DUPLIKASI: Apakah peserta sudah check-in pada tanggal scan tersebut?
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("id, checked_in_at, event_date")
      .eq("participant_id", participant.id)
      .eq("event_date", targetDate)
      .maybeSingle();

    if (existingAttendance) {
      const timeStr = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(existingAttendance.checked_in_at));

      return NextResponse.json(
        {
          success: false,
          status: "ALREADY_CHECKED_IN",
          message: `SUDAH CHECK-IN: Peserta ${participant.full_name} (${participant.registration_number}) sudah melakukan check-in hari ini pada pukul ${timeStr} WIB.`,
          participant: {
            id: participant.id,
            full_name: participant.full_name,
            registration_number: participant.registration_number,
            institution: participant.institution,
            participant_status: participant.participant_status,
            registered_day: attendance_day_label,
          },
          checked_in_at: existingAttendance.checked_in_at,
          scan_date: targetDate,
        },
        { status: 409 }
      );
    }

    // 5. CATAT KEHADIRAN: Masukkan ke tabel attendance
    const { data: newAttendance, error: attError } = await supabase
      .from("attendance")
      .insert({
        participant_id: participant.id,
        event_date: targetDate,
        checked_in_by: null,
      })
      .select("id, participant_id, event_date, checked_in_at")
      .single();

    if (attError) {
      console.error("Attendance insert error:", attError);
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan check-in kehadiran peserta." },
        { status: 500 }
      );
    }

    const timeStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(newAttendance.checked_in_at));

    return NextResponse.json(
      {
        success: true,
        status: "SUCCESS",
        message: `CHECK-IN BERHASIL: Selamat datang, ${participant.full_name}! Pukul ${timeStr} WIB.`,
        participant: {
          id: participant.id,
          full_name: participant.full_name,
          registration_number: participant.registration_number,
          institution: participant.institution,
          participant_status: participant.participant_status,
          registered_day: attendance_day_label,
          email: participant.email,
          phone: participant.phone,
        },
        checked_in_at: newAttendance.checked_in_at,
        scan_date: targetDate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Scan API Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

// GET: Statistik kehadiran dan log scan terkini untuk meja panitia
export async function GET() {
  try {
    const supabase = getSupabase();

    // Hitung total hadir Day 1 (18 Nov 2026)
    const { count: countDay1 } = await supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("event_date", "2026-11-18");

    // Hitung total hadir Day 2 (19 Nov 2026)
    const { count: countDay2 } = await supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("event_date", "2026-11-19");

    // 15 log kehadiran terakhir
    const { data: recentLogs, error: logError } = await supabase
      .from("attendance")
      .select(`
        id,
        event_date,
        checked_in_at,
        participants (
          registration_number,
          full_name,
          institution,
          participant_status
        )
      `)
      .order("checked_in_at", { ascending: false })
      .limit(15);

    return NextResponse.json({
      success: true,
      stats: {
        total_day1: countDay1 || 0,
        total_day2: countDay2 || 0,
        total_overall: (countDay1 || 0) + (countDay2 || 0),
      },
      recent_logs: recentLogs || [],
    });
  } catch (error) {
    console.error("Scan GET stats error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat statistik." },
      { status: 500 }
    );
  }
}
