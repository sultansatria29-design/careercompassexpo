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
      };
    }
  } catch {}
  return { text: desc, poster_url: "", start_date: "", end_date: "", is_expired: false };
}

// GET: Ambil daftar perusahaan & lowongan aktif untuk formulir Walk-In Interview (Gambar 2 & 3)
export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Ambil semua perusahaan
    const { data: companies, error: cErr } = await supabase
      .from("companies")
      .select("id, name, logo_url, website, description")
      .order("name", { ascending: true });

    if (cErr) throw cErr;

    // 2. Ambil semua lowongan aktif
    const { data: jobs, error: jErr } = await supabase
      .from("jobs")
      .select("id, company_id, title, description, requirements, location, employment_type, quota, is_active")
      .eq("is_active", true)
      .order("title", { ascending: true });

    if (jErr) throw jErr;

    // Filter hanya lowongan yang belum expired
    const activeJobs = (jobs || []).filter((j) => {
      const descObj = parseJobDescription(j.description);
      if (descObj.is_expired) return false;
      if (descObj.start_date) {
        const start = new Date(descObj.start_date);
        start.setHours(0, 0, 0, 0);
        if (new Date() < start) return false;
      }
      return true;
    });

    // Petakan lowongan ke dalam perusahaannya
    const jobsByCompany = {};
    activeJobs.forEach((job) => {
      const descObj = parseJobDescription(job.description);
      if (!jobsByCompany[job.company_id]) {
        jobsByCompany[job.company_id] = [];
      }
      jobsByCompany[job.company_id].push({
        id: job.id,
        title: job.title,
        clean_description: descObj.text,
        poster_url: descObj.poster_url,
        requirements: job.requirements,
        location: job.location,
        employment_type: job.employment_type,
        quota: job.quota,
      });
    });

    // Gabungkan data perusahaan yang memiliki lowongan aktif
    const enrichedCompanies = (companies || [])
      .map((c) => {
        let meta = {};
        try {
          meta = typeof c.description === "string" ? JSON.parse(c.description) : c.description || {};
        } catch {
          meta = {};
        }

        const compJobs = jobsByCompany[c.id] || [];

        return {
          id: c.id,
          name: c.name,
          logo_url: c.logo_url || "",
          website: c.website || "",
          industry: meta.industry || "",
          address: meta.address || "",
          bio: meta.bio || (typeof c.description === "string" && !c.description.startsWith("{") ? c.description : ""),
          jobs: compJobs,
          total_jobs: compJobs.length,
        };
      })
      .filter((c) => c.jobs.length > 0); // Hanya perusahaan yang memiliki lowongan aktif untuk walk-in interview

    return NextResponse.json({
      success: true,
      companies: enrichedCompanies,
    });
  } catch (err) {
    console.error("Error in /api/pelamar/walkin-options:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat opsi walk-in interview." },
      { status: 500 }
    );
  }
}
