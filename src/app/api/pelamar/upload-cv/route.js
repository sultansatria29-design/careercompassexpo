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

// POST: Upload File CV Pelamar ke Supabase Storage (Maks. 10MB)
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const participant_id = formData.get("participant_id") || "pelamar";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "File CV wajib diunggah." },
        { status: 400 }
      );
    }

    // Validasi ukuran: maksimal 10MB (sesuai Google Form di Gambar 2 & 3)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas CV melebihi batas maksimal 10MB." },
        { status: 400 }
      );
    }

    // Validasi tipe berkas (PDF, DOC, DOCX, PNG, JPG, JPEG)
    const allowedMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedMime.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format berkas tidak didukung. Harap unggah dokumen PDF, DOC, DOCX, atau gambar PNG/JPG.",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buat nama file unik
    const cleanOrigName = (file.name || "cv.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = cleanOrigName.split(".").pop() || "pdf";
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `cv_${participant_id}_${timestamp}_${randomSuffix}.${ext}`;
    const filePath = `resumes/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Gagal upload CV ke storage:", uploadError);
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
    console.error("Error in /api/pelamar/upload-cv:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengunggah berkas CV." },
      { status: 500 }
    );
  }
}
