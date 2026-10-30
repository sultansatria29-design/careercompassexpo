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

    // 2. Ambil seluruh data lowongan untuk menghitung jumlah lowongan per perusahaan
    const { data: jobs, error: jErr } = await supabase
      .from("jobs")
      .select("id, company_id, is_active");

    const jobCountMap = {};
    if (!jErr && jobs) {
      jobs.forEach((j) => {
        if (!jobCountMap[j.company_id]) jobCountMap[j.company_id] = 0;
        jobCountMap[j.company_id] += 1;
      });
    }

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

    // 4. Hitung statistik verifikasi mitra
    const totalCompanies = parsedCompanies.length;
    const pendingCount = parsedCompanies.filter((c) => c.verification_status === "pending").length;
    const verifiedCount = parsedCompanies.filter((c) => c.verification_status === "verified").length;
    const rejectedCount = parsedCompanies.filter((c) => c.verification_status === "rejected").length;

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCompanies,
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
      },
      companies: parsedCompanies,
    });
  } catch (error) {
    console.error("Admin mitra fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data mitra." },
      { status: 500 }
    );
  }
}

// PATCH: Verifikasi (Setujui / Tolak / Reset) status pendaftaran mitra
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { company_id, action, reason, notes } = body;

    if (!company_id || !action) {
      return NextResponse.json(
        { success: false, message: "Company ID dan action diperlukan." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

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

// DELETE: Hapus data mitra jika pendaftaran terindikasi spam
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get("id");

    if (!company_id) {
      return NextResponse.json(
        { success: false, message: "Company ID diperlukan." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 1. Ambil jobs milik perusahaan
    const { data: jobs } = await supabase.from("jobs").select("id").eq("company_id", company_id);
    const jobIds = (jobs || []).map((j) => j.id);

    // 2. Hapus applications yang terhubung
    if (jobIds.length > 0) {
      await supabase.from("applications").delete().in("job_id", jobIds);
      await supabase.from("jobs").delete().eq("company_id", company_id);
    }

    // 3. Hapus perusahaan
    const { error: dErr } = await supabase.from("companies").delete().eq("id", company_id);
    if (dErr) throw dErr;

    return NextResponse.json({
      success: true,
      message: "Data perusahaan dan data terkait berhasil dihapus.",
    });
  } catch (error) {
    console.error("Admin mitra delete error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus perusahaan." },
      { status: 500 }
    );
  }
}
