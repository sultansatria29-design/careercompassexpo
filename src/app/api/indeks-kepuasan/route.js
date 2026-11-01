import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function POST(req) {
  try {
    const body = await req.json();
    const {
      email,
      fullName,
      status = "Mahasiwa",
      institution = "UIN Syarif Hidayatullah Jakarta",
      facultyMajorText = "",
      facultyChoice = "",
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
      q11,
    } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: "Email dan Nama Lengkap wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Simpan langsung ke database Supabase (tabel surveys) untuk Admin Console
    let participantId = null;
    try {
      // Coba cari peserta berdasarkan email jika ada
      const { data: pData } = await supabase
        .from("participants")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .limit(1)
        .maybeSingle();

      if (pData?.id) {
        participantId = pData.id;
      }
    } catch {}

    // Hitung rating rata-rata dari q1 s/d q11
    const scores = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11]
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);
    const avgRating =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 5;

    const surveyFeedback = {
      source: "CCE_2026_SATISFACTION_INDEX",
      submitted_at: new Date().toISOString(),
      email: email.trim(),
      full_name: fullName.trim(),
      status,
      institution,
      faculty_choice: facultyChoice,
      faculty_major_text: facultyMajorText,
      ratings: {
        q1_fasilitas_fisik: q1,
        q2_informasi_lengkap: q2,
        q3_kebersihan_kerapihan: q3,
        q4_peta_lokasi: q4,
        q5_jadwal_tepat: q5,
        q6_panitia_sigap: q6,
        q7_kecepatan_info: q7,
        q8_pengetahuan_partner: q8,
        q9_keyakinan_info: q9,
        q10_kepedulian_panitia: q10,
        q11_didengarkan_diperhatikan: q11,
      },
      average_score: avgRating,
    };

    const { error: insertErr } = await supabase.from("surveys").insert({
      participant_id: participantId,
      institution: institution || "UIN Syarif Hidayatullah Jakarta",
      faculty: facultyChoice || null,
      major: facultyMajorText || null,
      rating: Math.round(avgRating),
      feedback: JSON.stringify(surveyFeedback),
    });

    if (insertErr) {
      console.error("Error inserting survey to Supabase:", insertErr);
      throw insertErr;
    }


    return NextResponse.json({
      success: true,
      message:
        "Terima kasih! Indeks kepuasan Anda telah berhasil dikirimkan dan tercatat di sistem.",
    });
  } catch (error) {
    console.error("Error submit indeks kepuasan:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengirim formulir indeks kepuasan." },
      { status: 500 }
    );
  }
}
