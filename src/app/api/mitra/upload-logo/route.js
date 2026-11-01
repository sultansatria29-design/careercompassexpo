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

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const company_name = formData.get("company_name") || "mitra";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "File logo perusahaan wajib diunggah." },
        { status: 400 }
      );
    }

    // Validasi tipe file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format file tidak didukung. Harap unggah logo dalam format PNG, JPG, WEBP, atau SVG.",
        },
        { status: 400 }
      );
    }

    // Validasi ukuran file (maksimal 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "Ukuran file melebihi batas maksimal 5MB. Silakan kompres atau pilih file logo lain.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = "png";
    if (file.type === "image/jpeg" || file.type === "image/jpg") ext = "jpg";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/svg+xml") ext = "svg";
    else if (file.type === "image/png") ext = "png";

    const cleanName = String(company_name || "logo")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30) || "mitra";

    const fileName = `logos/logo-${cleanName}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}.${ext}`;

    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from("posters")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload logo error:", uploadError);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("posters").getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (err) {
    console.error("Error in upload-logo:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengunggah logo perusahaan." },
      { status: 500 }
    );
  }
}
