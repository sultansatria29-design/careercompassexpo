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
  if (!desc) return { text: "", poster_url: "" };
  try {
    if (typeof desc === "string" && desc.trim().startsWith("{")) {
      const parsed = JSON.parse(desc);
      return {
        text: parsed.text || "",
        poster_url: parsed.poster_url || "",
      };
    }
  } catch {}
  return { text: desc, poster_url: "" };
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
        company_name: j.companies?.name || "Perusahaan Rekanan",
        company_logo: j.companies?.logo_url || "",
        company_website: j.companies?.website || "",
        company_industry: meta.industry || "",
        company_address: meta.address || "",
        company_bio: meta.bio || "",
      };
    });

    return NextResponse.json({
      success: true,
      jobs: enrichedJobs,
      count: enrichedJobs.length,
    });
  } catch (err) {
    console.error("Error in /api/jobs:", err);
    return NextResponse.json(
      { success: false, error: err.message, jobs: [] },
      { status: 500 }
    );
  }
}
