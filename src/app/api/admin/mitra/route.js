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

// GET: Ambil seluruh data pendaftaran mitra perusahaan beserta status verifikasinya
export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Ambil seluruh data perusahaan
    const { data: companies, error: cErr } = await supabase
      .from("companies")
      .select("id, name, description, website, logo_url, created_at")
      .order("created_at", { ascending: false });

    if (cErr) throw cErr;

    // 2. Ambil seluruh data lowongan lengkap untuk kurasi Walk-In Interview oleh Admin
    const { data: allJobs, error: jErr } = await supabase
      .from("jobs")
      .select("id, company_id, title, description, requirements, location, is_active, created_at")
      .order("created_at", { ascending: false });

    const jobCountMap = {};
    if (!jErr && allJobs) {
      allJobs.forEach((j) => {
        if (!jobCountMap[j.company_id]) jobCountMap[j.company_id] = 0;
        jobCountMap[j.company_id] += 1;
      });
    }

    const companyMap = {};
    (companies || []).forEach((c) => {
      companyMap[c.id] = c;
    });

    const parsedJobs = (allJobs || []).map((j) => {
      let descObj = {};
      try {
        descObj = typeof j.description === "string" ? JSON.parse(j.description) : j.description || {};
      } catch {
        descObj = { text: j.description || "" };
      }

      let is_expired = false;
      if (descObj.end_date) {
        const end = new Date(descObj.end_date);
        end.setHours(23, 59, 59, 999);
        if (new Date() > end) {
          is_expired = true;
        }
      }

      const comp = companyMap[j.company_id] || {};

      return {
        id: j.id,
        company_id: j.company_id,
        company_name: comp.name || "Perusahaan Mitra",
        company_logo: comp.logo_url || "",
        title: j.title,
        description: descObj.text || "",
        poster_url: descObj.poster_url || "",
        start_date: descObj.start_date || "",
        end_date: descObj.end_date || "",
        is_expired,
        location: j.location || "Jakarta",
        is_active: Boolean(j.is_active),
        is_walk_in: Boolean(descObj.is_walk_in),
        created_at: j.created_at,
      };
    });

    // 3. Parsing metadata perusahaan
    const parsedCompanies = (companies || []).map((c) => {
      let meta = {};
      try {
        meta = typeof c.description === "string" ? JSON.parse(c.description) : c.description || {};
      } catch {
        meta = { bio: c.description || "" };
      }

      // Default status verifikasi: jika belum ada status, default-kan ke 'pending'
      const status = meta.verification_status || "pending";

      return {
        id: c.id,
        name: c.name,
        website: c.website || meta.website || "-",
        logo_url: c.logo_url || meta.logo_url || "",
        created_at: c.created_at,
        email: meta.email || "-",
        phone: meta.phone || "-",
        pic_name: meta.pic_name || "-",
        industry: meta.industry || "Umum",
        address: meta.address || "-",
        company_size: meta.company_size || "1-50 Karyawan",
        bio: meta.bio || "-",
        registered_at: meta.registered_at || c.created_at,
        verification_status: status, // 'pending' | 'verified' | 'rejected'
        verified_at: meta.verified_at || null,
        verified_by: meta.verified_by || null,
        rejection_reason: meta.rejection_reason || null,
        admin_notes: meta.admin_notes || "",
        total_jobs: jobCountMap[c.id] || 0,
      };
    });

    // 4. Hitung statistik verifikasi mitra & lowongan walk-in
    const totalCompanies = parsedCompanies.length;
    const pendingCount = parsedCompanies.filter((c) => c.verification_status === "pending").length;
    const verifiedCount = parsedCompanies.filter((c) => c.verification_status === "verified").length;
    const rejectedCount = parsedCompanies.filter((c) => c.verification_status === "rejected").length;
    const walkInJobsCount = parsedJobs.filter((j) => j.is_walk_in).length;

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCompanies,
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
        total_jobs: parsedJobs.length,
        walk_in_jobs: walkInJobsCount,
      },
      companies: parsedCompanies,
      jobs: parsedJobs,
    });
  } catch (error) {
    console.error("Admin mitra fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data mitra." },
      { status: 500 }
    );
  }
}

// PATCH: Verifikasi status pendaftaran mitra ATAU kurasi akses Walk-In Interview lowongan
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { action, company_id, job_id, is_walk_in, reason, notes } = body;

    const supabase = getSupabase();

    // 1. Kurasi Akses Walk-In Interview Lowongan (Khusus Admin)
    if (action === "toggle_walk_in") {
      if (!job_id) {
        return NextResponse.json(
          { success: false, message: "Job ID diperlukan." },
          { status: 400 }
        );
      }

      const { data: targetJob, error: tjErr } = await supabase
        .from("jobs")
        .select("id, title, description")
        .eq("id", job_id)
        .single();

      if (tjErr || !targetJob) {
        return NextResponse.json(
          { success: false, message: "Lowongan tidak ditemukan." },
          { status: 404 }
        );
      }

      let descObj = {};
      try {
        descObj = typeof targetJob.description === "string" ? JSON.parse(targetJob.description) : targetJob.description || {};
      } catch {
        descObj = { text: targetJob.description || "" };
      }

      descObj.is_walk_in = Boolean(is_walk_in);

      const { error: updErr } = await supabase
        .from("jobs")
        .update({ description: JSON.stringify(descObj) })
        .eq("id", job_id);

      if (updErr) throw updErr;

      return NextResponse.json({
        success: true,
        message: `Akses Walk-In Interview untuk posisi "${targetJob.title}" berhasil di${is_walk_in ? "aktifkan" : "nonaktifkan"}.`,
        job_id,
        is_walk_in: descObj.is_walk_in,
      });
    }

    if (!company_id || !action) {
      return NextResponse.json(
        { success: false, message: "Company ID dan action diperlukan." },
        { status: 400 }
      );
    }

    // 1. Ambil data perusahaan lama
    const { data: existing, error: eErr } = await supabase
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .single();

    if (eErr || !existing) {
      return NextResponse.json(
        { success: false, message: "Perusahaan tidak ditemukan." },
        { status: 404 }
      );
    }

    let prevMeta = {};
    try {
      prevMeta = typeof existing.description === "string" ? JSON.parse(existing.description) : existing.description || {};
    } catch {
      prevMeta = { bio: existing.description || "" };
    }

    let updatedMeta = { ...prevMeta };
    let logMessage = "";

    if (action === "approve" || action === "verify") {
      updatedMeta.verification_status = "verified";
      updatedMeta.verified_at = new Date().toISOString();
      updatedMeta.verified_by = "Admin Pusat Karier UIN";
      updatedMeta.rejection_reason = null;
      if (notes) updatedMeta.admin_notes = notes;
      logMessage = `Perusahaan "${existing.name}" berhasil diverifikasi dan disetujui sebagai mitra CCE 2026.`;
    } else if (action === "reject") {
      updatedMeta.verification_status = "rejected";
      updatedMeta.rejection_reason = reason || "Profil perusahaan belum memenuhi syarat kurasi kemitraan CCE 2026.";
      if (notes) updatedMeta.admin_notes = notes;
      logMessage = `Pendaftaran kemitraan "${existing.name}" telah ditolak.`;
    } else if (action === "reset" || action === "pending") {
      updatedMeta.verification_status = "pending";
      updatedMeta.verified_at = null;
      updatedMeta.verified_by = null;
      updatedMeta.rejection_reason = null;
      logMessage = `Status perusahaan "${existing.name}" dikembalikan ke antrean peninjauan (Pending).`;
    } else {
      return NextResponse.json(
        { success: false, message: "Action tidak dikenali. Gunakan 'approve', 'reject', atau 'reset'." },
        { status: 400 }
      );
    }

    // 2. Simpan kembali ke Supabase
    const { data: updated, error: uErr } = await supabase
      .from("companies")
      .update({
        description: JSON.stringify(updatedMeta),
      })
      .eq("id", company_id)
      .select()
      .single();

    if (uErr) throw uErr;

    return NextResponse.json({
      success: true,
      message: logMessage,
      company: {
        id: updated.id,
        name: updated.name,
        verification_status: updatedMeta.verification_status,
        verified_at: updatedMeta.verified_at,
        rejection_reason: updatedMeta.rejection_reason,
      },
    });
  } catch (error) {
    console.error("Admin mitra update error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui status mitra." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus data mitra jika pendaftaran terindikasi spam / dibatalkan
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get("id");
    const paramIds = searchParams.get("company_ids");

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    let targetIds = [];
    if (body.company_ids && Array.isArray(body.company_ids)) {
      targetIds = body.company_ids.filter(Boolean);
    } else if (paramIds) {
      targetIds = paramIds.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (company_id) {
      targetIds = [company_id];
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "ID perusahaan diperlukan." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 1. Ambil seluruh lowongan (jobs) milik perusahaan target
    const { data: jobs, error: jErr } = await supabase
      .from("jobs")
      .select("id")
      .in("company_id", targetIds);

    if (jErr) throw jErr;

    const jobIds = (jobs || []).map((j) => j.id).filter(Boolean);

    if (jobIds.length > 0) {
      // 2. Ambil seluruh applications (lamaran) yang terhubung dengan lowongan tersebut
      const { data: apps, error: aErr } = await supabase
        .from("applications")
        .select("id")
        .in("job_id", jobIds);

      if (aErr) throw aErr;

      const appIds = (apps || []).map((a) => a.id).filter(Boolean);

      // 3. Hapus jadwal wawancara (interviews) terlebih dahulu untuk menghindari pelanggaran foreign key
      if (appIds.length > 0) {
        const { error: intAppErr } = await supabase
          .from("interviews")
          .delete()
          .in("application_id", appIds);

        if (intAppErr) {
          console.warn("Interviews by application cleanup warning:", intAppErr.message);
        }
      }

      // Bersihkan juga jika tabel interviews menyimpan company_id langsung
      try {
        await supabase
          .from("interviews")
          .delete()
          .in("company_id", targetIds);
      } catch (err) {
        // Kolom company_id di interviews bersifat opsional
      }

      // 4. Hapus data lamaran pekerjaan (applications)
      const { error: delAppErr } = await supabase
        .from("applications")
        .delete()
        .in("job_id", jobIds);

      if (delAppErr) throw delAppErr;

      // 5. Hapus lowongan pekerjaan (jobs)
      const { error: delJobErr } = await supabase
        .from("jobs")
        .delete()
        .in("id", jobIds);

      if (delJobErr) throw delJobErr;
    }

    // 6. Hapus perusahaan dari tabel companies
    const { error: dErr } = await supabase
      .from("companies")
      .delete()
      .in("id", targetIds);

    if (dErr) throw dErr;

    return NextResponse.json({
      success: true,
      message: `Data ${targetIds.length > 1 ? `${targetIds.length} mitra` : "mitra perusahaan"} dan seluruh lowongan terkait berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Admin mitra delete error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus perusahaan." },
      { status: 500 }
    );
  }
}

