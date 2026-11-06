import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function parseJobDescription(desc) {
  if (!desc) return { text: "", poster_url: "", start_date: "", end_date: "", is_expired: false };
  try {
    if (typeof desc === "string" && desc.trim().startsWith("{")) {
      const parsed = JSON.parse(desc);
      const start_date = parsed.start_date || "";
      const end_date = parsed.end_date || "";

      let is_expired = false;
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        if (new Date() > end) {
          is_expired = true;
        }
      }

      return {
        text: parsed.text || "",
        poster_url: parsed.poster_url || "",
        start_date,
        end_date,
        is_expired,
        is_walk_in: Boolean(parsed.is_walk_in),
      };
    }
  } catch {}
  return { text: desc, poster_url: "", start_date: "", end_date: "", is_expired: false, is_walk_in: false };
}

// GET: Ambil semua lowongan aktif yang siap dilamar peserta di landing page
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*, companies(name, logo_url, website, description)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching public jobs in /api/jobs:", error);
      throw error;
    }

    const enrichedJobs = (jobs || []).map((j) => {
      let meta = {};
      try {
        if (typeof j.companies?.description === "string" && j.companies.description.startsWith("{")) {
          meta = JSON.parse(j.companies.description);
        }
      } catch {
        meta = {};
      }

      const descObj = parseJobDescription(j.description);

      return {
        ...j,
        raw_description: j.description,
        description: descObj.text,
        poster_url: descObj.poster_url,
        start_date: descObj.start_date,
        end_date: descObj.end_date,
        is_expired: descObj.is_expired,
        is_walk_in: descObj.is_walk_in,
        company_name: j.companies?.name || "Perusahaan Rekanan",
        company_logo: j.companies?.logo_url || "",
        company_website: j.companies?.website || "",
        company_industry: meta.industry || "",
        company_address: meta.address || "",
        company_bio: meta.bio || "",
      };
    });

    // Lowongan yang sudah melewati batas tanggal otomatis terhapus / tidak tampil di landing page
    const activePublicJobs = enrichedJobs.filter((job) => {
      if (!job.is_active) return false;
      if (job.is_expired) return false;
      if (job.start_date) {
        const start = new Date(job.start_date);
        start.setHours(0, 0, 0, 0);
        if (new Date() < start) return false;
      }
      return true;
    });

    return NextResponse.json({
      success: true,
      jobs: activePublicJobs,
      count: activePublicJobs.length,
    });
  } catch (err) {
    console.error("Error in /api/jobs:", err);
    return NextResponse.json(
      { success: false, error: err.message, jobs: [] },
      { status: 500 }
    );
  }
}
