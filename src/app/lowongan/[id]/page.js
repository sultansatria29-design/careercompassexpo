import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import JobDetailClient from "./JobDetailClient";

function getSupabaseServer() {
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

async function getJobById(id) {
  try {
    const supabase = getSupabaseServer();
    const { data: job, error } = await supabase
      .from("jobs")
      .select("*, companies(name, logo_url, website, description)")
      .eq("id", id)
      .single();

    if (error || !job) {
      console.warn(`Lowongan dengan ID ${id} tidak ditemukan:`, error?.message);
      return null;
    }

    let meta = {};
    try {
      if (
        typeof job.companies?.description === "string" &&
        job.companies.description.startsWith("{")
      ) {
        meta = JSON.parse(job.companies.description);
      }
    } catch {
      meta = {};
    }

    const descObj = parseJobDescription(job.description);

    return {
      ...job,
      raw_description: job.description,
      description: descObj.text,
      poster_url: descObj.poster_url,
      company_name: job.companies?.name || "Perusahaan Rekanan",
      company_logo: job.companies?.logo_url || "",
      company_website: job.companies?.website || "",
      company_industry: meta.industry || "",
      company_address: meta.address || "",
      company_bio: meta.bio || "",
    };
  } catch (err) {
    console.error("Error in getJobById:", err);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase.from("jobs").select("id").eq("is_active", true);
    return (data || []).map((j) => ({ id: String(j.id) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const job = await getJobById(id);

    if (!job) {
      return {
        title: "Lowongan Tidak Ditemukan | Career Compas Expo 2026",
      };
    }

    const title = `${job.title} — ${job.company_name} | CCE 2026 UIN Jakarta`;
    const description =
      job.description ||
      `Informasi kualifikasi dan lowongan kerja ${job.title} di ${job.company_name} pada Career Compas Expo 2026 UIN Jakarta.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: job.poster_url ? [job.poster_url] : [],
      },
    };
  } catch {
    return {
      title: "Lowongan Kerja | Career Compas Expo 2026",
    };
  }
}

export default function JobPage({ params }) {
  return (
    <Suspense fallback={<JobPageLoading />}>
      <JobPageContent params={params} />
    </Suspense>
  );
}

async function JobPageContent({ params }) {
  const { id } = await params;
  const job = await getJobById(id);

  return <JobDetailClient initialJob={job} jobId={id} />;
}

function JobPageLoading() {
  return (
    <div className="min-h-screen bg-[#1E0C36] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-purple-300">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
        <p className="text-xs font-semibold animate-pulse">Memuat detail lowongan pekerjaan...</p>
      </div>
    </div>
  );
}
