import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();

    const full_name = String(body.full_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    let domicile = String(body.domicile || "").trim();
    const domicile_other = String(body.domicile_other || "").trim();
    const participant_status = String(body.participant_status || "").trim();
    
    // Instansi & Data UIN
    const institution_type = String(body.institution_type || "").trim();
    let institution = String(body.institution || "").trim();
    const semester = String(body.semester || "").trim();
    const faculty = String(body.faculty || "").trim();
    const major = String(body.major || "").trim();

    // Halaman 2: Hari Kehadiran & Survei
    const attendance_day = String(body.attendance_day || "DAY1").trim();
    const visit_plans = Array.isArray(body.visit_plans) ? body.visit_plans : [];
    const info_source = String(body.info_source || "").trim();
    const info_source_other = String(body.info_source_other || "").trim();
    const expectations = String(body.expectations || "").trim();

    // Halaman 3: Bukti Download TactLink
    const tactlink_proof = typeof body.tactlink_proof === "string" ? body.tactlink_proof : null;
    const tactlink_filename = typeof body.tactlink_filename === "string" ? body.tactlink_filename : null;

    // Honeypot sederhana untuk menahan bot
    if (body.website) {
      return NextResponse.json(
        { success: false, message: "Permintaan tidak valid." },
        { status: 400 }
      );
    }

    const validStatuses = ["Mahasiswa", "Alumni", "Umum"];
    const validDomisili = [
      "Tangerang Selatan",
      "DKI Jakarta",
      "Depok",
      "Kota Tangerang",
      "Lainnya",
    ];

    if (domicile === "Lainnya" && domicile_other) {
      domicile = "Lainnya";
    }

    // Tentukan instansi
    if (institution_type === "UIN Syarif Hidayatullah Jakarta") {
      institution = "UIN Syarif Hidayatullah Jakarta";
    }

    // Mapping Hari Kehadiran
    let attendance_day_label = "Day 1 — Rabu, 18 November 2026";
    let valid_dates = ["2026-11-18"];

    if (attendance_day === "DAY2") {
      attendance_day_label = "Day 2 — Kamis, 19 November 2026";
      valid_dates = ["2026-11-19"];
    } else if (attendance_day === "BOTH") {
      attendance_day_label = "Kedua Hari (18 & 19 November 2026)";
      valid_dates = ["2026-11-18", "2026-11-19"];
    }

    // Validasi Dasar
    if (
      full_name.length < 3 ||
      full_name.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !/^\+?[0-9\s-]{9,18}$/.test(phone) ||
      !validDomisili.includes(domicile) ||
      !validStatuses.includes(participant_status)
    ) {
      return NextResponse.json(
        { success: false, message: "Periksa kembali data diri pada formulir." },
        { status: 400 }
      );
    }

    // Validasi Halaman 2 (Rencana Kunjungan & Survei)
    if (!attendance_day || !["DAY1", "DAY2", "BOTH"].includes(attendance_day)) {
      return NextResponse.json(
        { success: false, message: "Pilih hari rencana kehadiran acara." },
        { status: 400 }
      );
    }

    if (visit_plans.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pilih minimal satu rencana kunjungan CCE." },
        { status: 400 }
      );
    }

    if (!info_source) {
      return NextResponse.json(
        { success: false, message: "Pilih sumber informasi kegiatan CCE." },
        { status: 400 }
      );
    }

    if (!expectations || expectations.length < 2) {
      return NextResponse.json(
        { success: false, message: "Harap isi harapan kamu dalam menghadiri acara ini." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // 1. Simpan ke tabel participants
    const { data: participantData, error: participantError } = await supabase
      .from("participants")
      .insert({
        full_name,
        email,
        phone,
        domicile: domicile === "Lainnya" && domicile_other ? `Lainnya (${domicile_other})` : domicile,
        participant_status,
        institution: institution || (institution_type || null),
      })
      .select("id, registration_number, full_name, email")
      .single();

    if (participantError) {
      if (participantError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message: "Email ini sudah terdaftar sebagai peserta.",
          },
          { status: 409 }
        );
      }

      console.error("Registration database error:", participantError);

      return NextResponse.json(
        { success: false, message: "Gagal menyimpan pendaftaran peserta." },
        { status: 500 }
      );
    }

    // 2. Simpan preferensi kehadiran, rencana kunjungan & survei ke tabel surveys
    try {
      const finalInfoSource = info_source === "Yang lain" && info_source_other
        ? `Yang lain: ${info_source_other}`
        : info_source;

      await supabase.from("surveys").insert({
        participant_id: participantData.id,
        institution: institution || institution_type || null,
        faculty: faculty || null,
        major: major || null,
        rating: 5,
        feedback: JSON.stringify({
          attendance_day,
          attendance_day_label,
          valid_dates,
          visit_plans,
          info_source: finalInfoSource,
          expectations,
          semester: semester || null,
          domicile_other: domicile_other || null,
          tactlink_proof: tactlink_proof || null,
          tactlink_filename: tactlink_filename || null,
        }),
      });
    } catch (surveyErr) {
      console.warn("Survey table insert warning:", surveyErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil!",
        participant: {
          registration_number: participantData.registration_number,
          full_name: participantData.full_name,
          email: participantData.email,
          attendance_day,
          attendance_day_label,
          valid_dates,
          visit_plans,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
