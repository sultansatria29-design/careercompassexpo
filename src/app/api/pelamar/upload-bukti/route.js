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

// POST: Upload File Bukti Registrasi CCE 2026 ke Supabase Storage (Maks. 10MB)
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const participant_id = formData.get("participant_id") || "peserta";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "File bukti registrasi wajib diunggah." },
        { status: 400 }
      );
    }

    // Validasi ukuran: maksimal 10MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas bukti registrasi melebihi batas maksimal 10MB." },
        { status: 400 }
      );
    }

    // Validasi tipe berkas
    const allowedMime = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMime.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format berkas tidak didukung. Harap unggah dokumen PDF atau gambar PNG/JPG/WEBP.",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buat nama file unik
    const cleanOrigName = (file.name || "bukti.png").replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = cleanOrigName.split(".").pop() || "png";
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `bukti_${participant_id}_${timestamp}_${randomSuffix}.${ext}`;
    const filePath = `bukti_registrasi/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Gagal upload bukti registrasi ke storage:", uploadError);
      throw uploadError;
    }

    // Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (err) {
    console.error("Error in /api/pelamar/upload-bukti:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengunggah berkas bukti registrasi." },
      { status: 500 }
    );
  }
}
