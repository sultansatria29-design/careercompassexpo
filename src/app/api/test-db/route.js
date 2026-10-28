
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { error } = await supabase
      .from("participants")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Koneksi Supabase berhasil!",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Koneksi gagal. Periksa konfigurasi Supabase.",
      },
      { status: 500 }
    );
  }
}
