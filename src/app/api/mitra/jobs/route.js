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

// GET: Ambil daftar lowongan milik perusahaan tertentu
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get("company_id");

    const supabase = getSupabase();

    let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });

    if (company_id) {
      query = query.eq("company_id", company_id);
    }

    const { data: jobs, error: jErr } = await query;
    if (jErr) throw jErr;

    // Ambil juga hitungan pelamar untuk masing-masing lowongan
    const jobIds = (jobs || []).map((j) => j.id);
    let applicationCounts = {};

    if (jobIds.length > 0) {
      const { data: apps, error: aErr } = await supabase
        .from("applications")
        .select("id, job_id, status")
        .in("job_id", jobIds);

      if (!aErr && apps) {
        apps.forEach((a) => {
          if (!applicationCounts[a.job_id]) {
            applicationCounts[a.job_id] = { total: 0, accepted: 0, in_review: 0 };
          }
          applicationCounts[a.job_id].total += 1;
          if (a.status === "accepted") {
            applicationCounts[a.job_id].accepted += 1;
          } else if (a.status !== "rejected") {
            applicationCounts[a.job_id].in_review += 1;
          }
        });
      }
    }

    const enrichedJobs = (jobs || []).map((j) => {
      const descObj = parseJobDescription(j.description);
      return {
        ...j,
        raw_description: j.description,
        description: descObj.text,
        poster_url: descObj.poster_url,
        applicant_count: applicationCounts[j.id]?.total || 0,
        accepted_count: applicationCounts[j.id]?.accepted || 0,
        review_count: applicationCounts[j.id]?.in_review || 0,
      };
    });

    return NextResponse.json({
      success: true,
      jobs: enrichedJobs,
    });
  } catch (err) {
    console.error("Error in GET /api/mitra/jobs:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat daftar lowongan." },
      { status: 500 }
    );
  }
}

// POST: Buat lowongan baru
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_id,
      title,
      description,
      requirements,
      location,
      employment_type,
      quota,
      is_active,
      poster_url,
    } = body;

    if (!company_id || !title) {
      return NextResponse.json(
        { error: "Company ID dan Judul Lowongan wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Verifikasi kelayakan mitra: Perusahaan harus sudah disetujui (verified) oleh admin
    if (company_id !== "demo-mitra-uin") {
      const { data: comp } = await supabase
        .from("companies")
        .select("name, description")
        .eq("id", company_id)
        .single();

      let meta = {};
      try {
        meta = typeof comp?.description === "string" ? JSON.parse(comp.description) : comp?.description || {};
      } catch {
        meta = {};
      }

      const status = meta.verification_status || "pending";
      if (status !== "verified") {
        const statusLabel = status === "rejected" ? "Ditolak" : "Menunggu Verifikasi Admin";
        return NextResponse.json(
          {
            error: `Akun perusahaan belum dapat menerbitkan lowongan (Status: ${statusLabel}). Pendaftaran kemitraan harus melalui proses verifikasi dan penyaringan admin Pusat Karier UIN Jakarta.`,
          },
          { status: 403 }
        );
      }
    }

    const cleanDesc = (description || "").trim();
    const formattedDescription = poster_url
      ? JSON.stringify({ text: cleanDesc, poster_url })
      : cleanDesc;

    const { data: newJob, error: jErr } = await supabase
      .from("jobs")
      .insert({
        company_id,
        title: title.trim(),
        description: formattedDescription,
        requirements: requirements || "",
        location: location || "Jakarta (Hybrid)",
        employment_type: employment_type || "Full-time",
        quota: quota ? parseInt(quota, 10) : 1,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      })
      .select()
      .single();

    if (jErr) throw jErr;

    const descObj = parseJobDescription(newJob.description);

    return NextResponse.json({
      success: true,
      message: `Lowongan "${newJob.title}" berhasil diterbitkan!`,
      job: {
        ...newJob,
        raw_description: newJob.description,
        description: descObj.text,
        poster_url: descObj.poster_url,
        applicant_count: 0,
      },
    });
  } catch (err) {
    console.error("Error in POST /api/mitra/jobs:", err);
    return NextResponse.json(
      { error: err.message || "Gagal membuat lowongan." },
      { status: 500 }
    );
  }
}

// PUT: Edit / Update lowongan
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      company_id,
      title,
      description,
      requirements,
      location,
      employment_type,
      quota,
      is_active,
      poster_url,
    } = body;

    if (!id || !company_id) {
      return NextResponse.json(
        { error: "Job ID dan Company ID wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Verifikasi lowongan milik perusahaan ini
    const { data: existing, error: checkErr } = await supabase
      .from("jobs")
      .select("id, company_id, description")
      .eq("id", id)
      .eq("company_id", company_id)
      .single();

    if (checkErr || !existing) {
      return NextResponse.json(
        { error: "Lowongan tidak ditemukan atau Anda tidak memiliki akses untuk mengeditnya." },
        { status: 404 }
      );
    }

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (requirements !== undefined) updatePayload.requirements = requirements;
    if (location !== undefined) updatePayload.location = location;
    if (employment_type !== undefined) updatePayload.employment_type = employment_type;
    if (quota !== undefined) updatePayload.quota = parseInt(quota, 10);
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);

    const existingDesc = parseJobDescription(existing.description);
    const textToUse = description !== undefined ? description.trim() : existingDesc.text;
    const posterToUse = poster_url !== undefined ? poster_url : existingDesc.poster_url;

    if (description !== undefined || poster_url !== undefined) {
      updatePayload.description = posterToUse
        ? JSON.stringify({ text: textToUse, poster_url: posterToUse })
        : textToUse;
    }

    const { data: updatedJob, error: uErr } = await supabase
      .from("jobs")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (uErr) throw uErr;

    const descObj = parseJobDescription(updatedJob.description);

    return NextResponse.json({
      success: true,
      message: "Data lowongan berhasil diperbarui.",
      job: {
        ...updatedJob,
        raw_description: updatedJob.description,
        description: descObj.text,
        poster_url: descObj.poster_url,
      },
    });
  } catch (err) {
    console.error("Error in PUT /api/mitra/jobs:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui lowongan." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus lowongan
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const company_id = searchParams.get("company_id");

    if (!id || !company_id) {
      return NextResponse.json(
        { error: "Job ID dan Company ID wajib disertakan." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Hapus aplikasi terkait terlebih dahulu jika ada
    await supabase.from("applications").delete().eq("job_id", id);

    const { error: delErr } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("company_id", company_id);

    if (delErr) throw delErr;

    return NextResponse.json({
      success: true,
      message: "Lowongan dan data pendaftaran terkait berhasil dihapus.",
    });
  } catch (err) {
    console.error("Error in DELETE /api/mitra/jobs:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghapus lowongan." },
      { status: 500 }
    );
  }
}
