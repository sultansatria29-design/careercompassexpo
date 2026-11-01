import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

function hashPassword(password) {
  if (!password) return "";
  return crypto.createHash("sha256").update(password.trim()).digest("hex");
}

// POST: Register / Login / Get Profile Pelamar
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = getSupabase();

    // ==========================================
    // 1. REGISTER PELAMAR BARU
    // ==========================================
    if (action === "register") {
      const full_name = String(body.full_name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();
      const password = String(body.password || "").trim();
      const participant_status = String(body.participant_status || "Mahasiswa").trim();
      const institution = String(body.institution || "UIN Syarif Hidayatullah Jakarta").trim();
      const domicile = String(body.domicile || "DKI Jakarta").trim();
      const major = String(body.major || "").trim();
      const faculty = String(body.faculty || "").trim();
      const age = String(body.age || "").trim();
      const graduation_year = String(body.graduation_year || "").trim();
      const gpa = String(body.gpa || "").trim();
      const cce_regis_confirmed = String(body.cce_regis_confirmed || "Sudah").trim();
      const cce_proof_url = String(body.cce_proof_url || "").trim();
      const cce_proof_name = String(body.cce_proof_name || "").trim();

      if (!full_name || full_name.length < 3) {
        return NextResponse.json({ error: "Nama lengkap minimal 3 karakter." }, { status: 400 });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
      }
      if (!phone || phone.length < 8) {
        return NextResponse.json({ error: "Nomor WhatsApp/HP minimal 8 digit." }, { status: 400 });
      }
      if (!password || password.length < 6) {
        return NextResponse.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
      }

      const passwordHash = hashPassword(password);

      // Cek apakah email sudah ada di tabel participants
      const { data: existingPart } = await supabase
        .from("participants")
        .select("id, registration_number, full_name, email")
        .eq("email", email)
        .maybeSingle();

      let participant = null;

      if (existingPart) {
        // Jika sudah terdaftar (misal dari form expo), perbarui data & set password di surveys
        participant = existingPart;
      } else {
        // Buat peserta baru
        const { data: newPart, error: pErr } = await supabase
          .from("participants")
          .insert({
            full_name,
            email,
            phone,
            domicile,
            participant_status,
            institution,
          })
          .select("id, registration_number, full_name, email, phone, domicile, participant_status, institution")
          .single();

        if (pErr) throw pErr;
        participant = newPart;
      }

      // Simpan hash password & profil pelamar di surveys table
      const { data: existingSurvey } = await supabase
        .from("surveys")
        .select("id, feedback, faculty, major")
        .eq("participant_id", participant.id)
        .maybeSingle();

      let meta = {};
      if (existingSurvey?.feedback) {
        try {
          meta = typeof existingSurvey.feedback === "string" ? JSON.parse(existingSurvey.feedback) : existingSurvey.feedback;
        } catch {}
      }

      meta.password_hash = passwordHash;
      meta.major = major || meta.major || "";
      meta.faculty = faculty || meta.faculty || "";
      meta.age = age || meta.age || "";
      meta.graduation_year = graduation_year || meta.graduation_year || "";
      meta.gpa = gpa || meta.gpa || "";
      meta.cce_regis_confirmed = cce_regis_confirmed || meta.cce_regis_confirmed || "Sudah";
      meta.cce_proof_url = cce_proof_url || meta.cce_proof_url || "";
      meta.cce_proof_name = cce_proof_name || meta.cce_proof_name || "";
      meta.role = "pelamar";
      meta.updated_at = new Date().toISOString();

      if (existingSurvey) {
        await supabase
          .from("surveys")
          .update({
            feedback: JSON.stringify(meta),
            institution: institution || participant.institution,
            faculty: faculty || existingSurvey.faculty,
            major: major || existingSurvey.major,
          })
          .eq("id", existingSurvey.id);
      } else {
        await supabase.from("surveys").insert({
          participant_id: participant.id,
          institution: institution || participant.institution,
          faculty: faculty || null,
          major: major || null,
          rating: 5,
          feedback: JSON.stringify(meta),
        });
      }

      return NextResponse.json({
        success: true,
        message: "Akun pelamar berhasil dibuat! Selamat datang di Career Compass Expo 2026.",
        pelamar: {
          id: participant.id,
          registration_number: participant.registration_number,
          full_name: participant.full_name,
          email: participant.email,
          phone: participant.phone || phone,
          domicile: participant.domicile || domicile,
          institution: participant.institution || institution,
          participant_status: participant.participant_status || participant_status,
          faculty: faculty || "",
          major: major || "",
          age: age || "",
          graduation_year: graduation_year || "",
          gpa: gpa || "",
          cce_regis_confirmed: cce_regis_confirmed || "Sudah",
          cce_proof_url: cce_proof_url || "",
          cce_proof_name: cce_proof_name || "",
        },
      });
    }

    // ==========================================
    // 2. LOGIN PELAMAR
    // ==========================================
    if (action === "login") {
      const identifier = String(body.identifier || "").trim().toLowerCase(); // Email atau No. Registrasi
      const password = String(body.password || "").trim();

      if (!identifier) {
        return NextResponse.json({ error: "Masukkan Email atau Nomor Registrasi Anda." }, { status: 400 });
      }
      if (!password) {
        return NextResponse.json({ error: "Masukkan kata sandi Anda." }, { status: 400 });
      }

      // Cari peserta berdasarkan email atau registration_number
      let partQuery = supabase.from("participants").select("*");
      if (identifier.includes("@")) {
        partQuery = partQuery.eq("email", identifier);
      } else {
        partQuery = partQuery.ilike("registration_number", `%${identifier}%`);
      }

      const { data: participant, error: pErr } = await partQuery.maybeSingle();

      if (pErr || !participant) {
        return NextResponse.json(
          { error: "Akun pelamar tidak ditemukan. Silakan periksa kembali email atau nomor registrasi Anda, atau daftar akun baru." },
          { status: 404 }
        );
      }

      // Cek password hash di surveys
      const { data: survey } = await supabase
        .from("surveys")
        .select("feedback, faculty, major")
        .eq("participant_id", participant.id)
        .maybeSingle();

      let meta = {};
      if (survey?.feedback) {
        try {
          meta = typeof survey.feedback === "string" ? JSON.parse(survey.feedback) : survey.feedback;
        } catch {}
      }

      const inputHash = hashPassword(password);
      // Validasi: jika sudah ada password hash, harus cocok.
      // Jika akun dibuat via form registrasi umum lama tanpa password, izinkan login jika password = nomor telepon atau cocok
      const storedHash = meta.password_hash;
      const cleanPhone = (participant.phone || "").replace(/[^0-9]/g, "");
      const cleanInput = password.replace(/[^0-9]/g, "");

      const isValidPassword =
        (storedHash && storedHash === inputHash) ||
        (!storedHash && (password === participant.phone || (cleanPhone && cleanPhone.endsWith(cleanInput))));

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Kata sandi yang Anda masukkan salah. Jika baru pertama kali login, Anda dapat mendaftar untuk menyetel kata sandi baru." },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Selamat datang kembali, ${participant.full_name}!`,
        pelamar: {
          id: participant.id,
          registration_number: participant.registration_number,
          full_name: participant.full_name,
          email: participant.email,
          phone: participant.phone,
          domicile: participant.domicile,
          institution: participant.institution,
          participant_status: participant.participant_status,
          faculty: survey?.faculty || meta.faculty || "",
          major: survey?.major || meta.major || "",
          age: meta.age || "",
          graduation_year: meta.graduation_year || "",
          gpa: meta.gpa || "",
          cce_regis_confirmed: meta.cce_regis_confirmed || "Sudah",
          cce_proof_url: meta.cce_proof_url || "",
          cce_proof_name: meta.cce_proof_name || "",
        },
      });
    }

    // ==========================================
    // 3. GET PROFILE PELAMAR
    // ==========================================
    if (action === "get_profile") {
      const { participant_id } = body;
      if (!participant_id) {
        return NextResponse.json({ error: "Participant ID diperlukan." }, { status: 400 });
      }

      const { data: participant, error } = await supabase
        .from("participants")
        .select("*")
        .eq("id", participant_id)
        .single();

      if (error || !participant) {
        return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
      }

      const { data: survey } = await supabase
        .from("surveys")
        .select("faculty, major, feedback")
        .eq("participant_id", participant.id)
        .maybeSingle();

      let meta = {};
      try {
        meta = typeof survey?.feedback === "string" ? JSON.parse(survey.feedback) : survey?.feedback || {};
      } catch {}

      return NextResponse.json({
        success: true,
        pelamar: {
          id: participant.id,
          registration_number: participant.registration_number,
          full_name: participant.full_name,
          email: participant.email,
          phone: participant.phone,
          domicile: participant.domicile,
          institution: participant.institution,
          participant_status: participant.participant_status,
          faculty: survey?.faculty || meta.faculty || "",
          major: survey?.major || meta.major || "",
          age: meta.age || "",
          graduation_year: meta.graduation_year || "",
          gpa: meta.gpa || "",
          cce_regis_confirmed: meta.cce_regis_confirmed || "Sudah",
          cce_proof_url: meta.cce_proof_url || "",
          cce_proof_name: meta.cce_proof_name || "",
        },
      });
    }

    return NextResponse.json({ error: "Action tidak dikenal." }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/pelamar/auth:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
