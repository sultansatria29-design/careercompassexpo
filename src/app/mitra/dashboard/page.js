"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Definisi Tahapan Rekrutmen (Sesuai constraint database Supabase: submitted, reviewed, shortlisted, accepted)
const RECRUITMENT_STAGES = [
  { id: "submitted", label: "Berkas Masuk", shortLabel: "Berkas", step: 1, color: "bg-blue-500", text: "text-blue-400" },
  { id: "reviewed", label: "Seleksi Berkas", shortLabel: "Seleksi", step: 2, color: "bg-amber-500", text: "text-amber-400" },
  { id: "shortlisted", label: "Wawancara", shortLabel: "Wawancara", step: 3, color: "bg-cyan-500", text: "text-cyan-400" },
  { id: "accepted", label: "Diterima / Offering", shortLabel: "Diterima", step: 4, color: "bg-emerald-500", text: "text-emerald-400" },
];

function formatJobDateRange(startDate, endDate) {
  if (!startDate && !endDate) return null;
  const opt = { day: "numeric", month: "short", year: "numeric" };
  try {
    if (startDate && endDate) {
      const s = new Date(startDate).toLocaleDateString("id-ID", opt);
      const e = new Date(endDate).toLocaleDateString("id-ID", opt);
      return `${s} — ${e}`;
    }
    if (endDate) {
      const e = new Date(endDate).toLocaleDateString("id-ID", opt);
      return `Batas: ${e}`;
    }
    const s = new Date(startDate).toLocaleDateString("id-ID", opt);
    return `Mulai: ${s}`;
  } catch {
    return null;
  }
}

export default function MitraDashboardPage() {
  const router = useRouter();

  // State Profil Perusahaan
  const [company, setCompany] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("applicants"); // 'applicants' | 'jobs' | 'profile'
  const [isUploadingCompanyLogo, setIsUploadingCompanyLogo] = useState(false);

  // State Lowongan (Jobs)
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null = mode tambah
  const [jobStatusTab, setJobStatusTab] = useState("all"); // 'all' | 'active' | 'archived'
  const [jobForm, setJobForm] = useState({
    title: "",
    employment_type: "Full-time",
    location: "Jakarta (Hybrid)",
    quota: 2,
    description: "",
    requirements: "",
    is_active: true,
    start_date: "",
    end_date: "",
    poster_url: "",
    poster_file: null,
    poster_preview: "",
    is_uploading_poster: false,
  });

  // State Pelamar (Applicants)
  const [applicants, setApplicants] = useState([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [selectedStageFilter, setSelectedStageFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailModalApplicant, setDetailModalApplicant] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ date: "", notes: "" });

  // State Toast & Feedback
  const [toastMsg, setToastMsg] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load Session Perusahaan saat mount & guard akses
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cce_mitra_session");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCompany(parsed);
          fetchJobs(parsed.id);
          fetchApplicants(parsed.id);
          fetchProfile(parsed.id);
        } catch {
          router.push("/mitra");
        }
      } else {
        router.push("/mitra");
      }
    }
  }, [router]);

  // Sinkronisasi status verifikasi & profil perusahaan real-time dari database
  async function fetchProfile(companyId) {
    if (!companyId || companyId.startsWith("demo-")) return;
    try {
      const res = await fetch("/api/mitra/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_profile", company_id: companyId }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.company) {
        setCompany((prev) => ({ ...prev, ...data.company }));
        if (typeof window !== "undefined") {
          localStorage.setItem("cce_mitra_session", JSON.stringify(data.company));
        }
      }
    } catch (err) {
      console.error("Gagal sinkronisasi profil perusahaan:", err);
    }
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  }

  // 1. Fetch Daftar Lowongan
  async function fetchJobs(companyId) {
    setIsLoadingJobs(true);
    try {
      const res = await fetch(`/api/mitra/jobs?company_id=${companyId}`);
      const data = await res.json();
      if (res.ok && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error("Gagal fetch jobs:", err);
    } finally {
      setIsLoadingJobs(false);
    }
  }

  // 2. Fetch Daftar Pelamar
  async function fetchApplicants(companyId, jobId = "all") {
    setIsLoadingApplicants(true);
    try {
      const url =
        jobId === "all"
          ? `/api/mitra/applicants?company_id=${companyId}`
          : `/api/mitra/applicants?company_id=${companyId}&job_id=${jobId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.applicants) {
        setApplicants(data.applicants);
      }
    } catch (err) {
      console.error("Gagal fetch applicants:", err);
    } finally {
      setIsLoadingApplicants(false);
    }
  }

  // Upload Poster Lowongan dengan validasi maksimal 5MB (PNG, JPG, WEBP)
  async function handlePosterFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("Format file tidak didukung. Harap pilih gambar PNG, JPG, atau WEBP.");
      e.target.value = "";
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      showToast("Ukuran poster melebihi batas maksimal 5MB!");
      e.target.value = "";
      return;
    }

    // Buat URL preview lokal sementara
    const localPreview = URL.createObjectURL(file);
    setJobForm((prev) => ({
      ...prev,
      poster_file: file,
      poster_preview: localPreview,
      is_uploading_poster: true,
    }));

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("company_id", company?.id || "mitra");

      const res = await fetch("/api/mitra/upload-poster", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setJobForm((prev) => ({
        ...prev,
        poster_url: data.url,
        poster_preview: data.url,
        is_uploading_poster: false,
      }));
      showToast("Poster lowongan berhasil diunggah!");
    } catch (err) {
      showToast(`Gagal unggah poster: ${err.message}`);
      setJobForm((prev) => ({
        ...prev,
        is_uploading_poster: false,
      }));
    }
  }

  function handleRemovePoster() {
    setJobForm((prev) => ({
      ...prev,
      poster_url: "",
      poster_file: null,
      poster_preview: "",
      is_uploading_poster: false,
    }));
  }

  // Upload Logo Perusahaan (Profil Mitra)
  async function handleCompanyLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      showToast("Format file tidak didukung. Harap pilih gambar PNG, JPG, WEBP, atau SVG.");
      e.target.value = "";
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      showToast("Ukuran logo melebihi batas maksimal 5MB!");
      e.target.value = "";
      return;
    }

    setIsUploadingCompanyLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("company_name", company?.name || "mitra");

      const res = await fetch("/api/mitra/upload-logo", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah logo.");

      const newLogoUrl = data.url;

      // Update di database jika bukan demo session
      if (company?.id && !company.id.startsWith("demo-")) {
        const updateRes = await fetch("/api/mitra/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_profile",
            company_id: company.id,
            logo_url: newLogoUrl,
          }),
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok) throw new Error(updateData.error || "Gagal memperbarui profil di server.");
      }

      const updatedCompany = { ...company, logo_url: newLogoUrl };
      setCompany(updatedCompany);
      if (typeof window !== "undefined") {
        localStorage.setItem("cce_mitra_session", JSON.stringify(updatedCompany));
      }
      showToast("Logo perusahaan berhasil diperbarui!");
    } catch (err) {
      showToast(`Gagal update logo: ${err.message}`);
    } finally {
      setIsUploadingCompanyLogo(false);
      e.target.value = "";
    }
  }

  // 3. Tambah / Edit Lowongan
  async function handleSaveJob(e) {
    e.preventDefault();
    if (!company) return;

    if (company.verification_status !== "verified") {
      showToast(
        company.verification_status === "rejected"
          ? "Pendaftaran ditolak: Akun belum memenuhi syarat verifikasi kemitraan."
          : "Penerbitan lowongan dibatasi: Akun Anda sedang dalam proses penyaringan & verifikasi admin."
      );
      return;
    }

    if (!jobForm.title) {
      showToast("Judul posisi lowongan wajib diisi.");
      return;
    }

    if (jobForm.start_date && jobForm.end_date && jobForm.end_date < jobForm.start_date) {
      showToast("Batas tanggal akhir pendaftaran tidak boleh sebelum tanggal mulai.");
      return;
    }

    if (jobForm.is_uploading_poster) {
      showToast("Harap tunggu proses pengunggahan poster selesai terlebih dahulu.");
      return;
    }

    try {
      const payload = {
        title: jobForm.title,
        employment_type: jobForm.employment_type,
        location: jobForm.location,
        quota: jobForm.quota,
        description: jobForm.description,
        requirements: jobForm.requirements,
        is_active: jobForm.is_active,
        start_date: jobForm.start_date || null,
        end_date: jobForm.end_date || null,
        poster_url: jobForm.poster_url || "",
      };

      if (editingJob) {
        // Mode Edit
        const res = await fetch("/api/mitra/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingJob.id,
            company_id: company.id,
            ...payload,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showToast("Lowongan berhasil diperbarui!");
      } else {
        // Mode Tambah Baru
        const res = await fetch("/api/mitra/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_id: company.id,
            ...payload,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showToast(`Lowongan "${jobForm.title}" berhasil diterbitkan!`);
      }

      setJobModalOpen(false);
      setEditingJob(null);
      resetJobForm();
      fetchJobs(company.id);
    } catch (err) {
      showToast(`Gagal menyimpan: ${err.message}`);
    }
  }

  function resetJobForm() {
    const today = new Date().toISOString().split("T")[0];
    setJobForm({
      title: "",
      employment_type: "Full-time",
      location: "Jakarta (Hybrid)",
      quota: 2,
      description: "",
      requirements: "",
      is_active: true,
      start_date: today,
      end_date: "",
      poster_url: "",
      poster_file: null,
      poster_preview: "",
      is_uploading_poster: false,
    });
  }

  function openEditJobModal(job) {
    setEditingJob(job);
    setJobForm({
      title: job.title || "",
      employment_type: job.employment_type || "Full-time",
      location: job.location || "Jakarta (Hybrid)",
      quota: job.quota || 1,
      description: job.description || "",
      requirements: job.requirements || "",
      is_active: job.is_active !== undefined ? job.is_active : true,
      start_date: job.start_date || "",
      end_date: job.end_date || "",
      poster_url: job.poster_url || "",
      poster_file: null,
      poster_preview: job.poster_url || "",
      is_uploading_poster: false,
    });
    setJobModalOpen(true);
  }

  async function handleDeleteJob(jobId, title) {
    if (!confirm(`Apakah Anda yakin ingin menghapus lowongan "${title}" beserta data pendaftarannya?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/mitra/jobs?id=${jobId}&company_id=${company.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Lowongan "${title}" telah dihapus.`);
      fetchJobs(company.id);
      fetchApplicants(company.id);
    } catch (err) {
      showToast(`Gagal menghapus: ${err.message}`);
    }
  }

  async function handleToggleJobActive(job) {
    try {
      const newStatus = !job.is_active;
      const res = await fetch("/api/mitra/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: job.id,
          company_id: company.id,
          is_active: newStatus,
        }),
      });
      if (res.ok) {
        showToast(`Lowongan "${job.title}" diubah menjadi ${newStatus ? "AKTIF" : "DITUTUP"}`);
        fetchJobs(company.id);
      }
    } catch (err) {
      showToast("Gagal memperbarui status lowongan.");
    }
  }

  // 4. MENCENTANG TAHAP SELEKSI SI PELAMAR (FITUR UTAMA)
  async function handleUpdateApplicantStage(applicantId, newStage, candidateName) {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/mitra/applicants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicantId,
          status: newStage,
          company_id: company.id,
          interview_date: interviewForm.date || undefined,
          interview_notes: interviewForm.notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update state lokal secara instan
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId ? { ...app, status: newStage } : app
        )
      );

      if (detailModalApplicant && detailModalApplicant.id === applicantId) {
        setDetailModalApplicant((prev) => ({ ...prev, status: newStage }));
      }

      const stageObj = RECRUITMENT_STAGES.find((s) => s.id === newStage);
      const stageName = stageObj ? stageObj.label : newStage;
      showToast(`Berhasil: ${candidateName} dinaikkan ke tahap "${stageName}"!`);
    } catch (err) {
      showToast(`Gagal mengubah tahap: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  // 5. Generate Pelamar Simulasi jika baru daftar
  async function handleGenerateDemoApplicants() {
    if (jobs.length === 0) {
      showToast("Buat minimal 1 lowongan terlebih dahulu sebelum membuat pelamar simulasi.");
      setActiveMainTab("jobs");
      return;
    }

    const targetJobId = selectedJobFilter !== "all" ? selectedJobFilter : jobs[0].id;
    try {
      const res = await fetch("/api/mitra/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: targetJobId,
          company_id: company.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(data.message);
      fetchApplicants(company.id);
      fetchJobs(company.id);
    } catch (err) {
      showToast("Gagal membuat pelamar: " + err.message);
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cce_mitra_session");
    }
    router.push("/mitra");
  }

  // Filter Pelamar berdasarkan Lowongan, Tahap, dan Pencarian
  const filteredApplicants = applicants.filter((app) => {
    const matchJob = selectedJobFilter === "all" || app.job_id === selectedJobFilter;
    let matchStage = selectedStageFilter === "all" || app.status === selectedStageFilter;
    if (selectedStageFilter === "reviewed" && (app.status === "reviewed" || app.status === "screening")) matchStage = true;
    if (selectedStageFilter === "shortlisted" && (app.status === "shortlisted" || app.status === "interview" || app.status === "assessment")) matchStage = true;

    const matchSearch =
      !searchQuery ||
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchJob && matchStage && matchSearch;
  });

  // Filter Lowongan: 'all' | 'active' | 'archived'
  const filteredJobs = jobs.filter((j) => {
    if (jobStatusTab === "active") return j.is_active && !j.is_expired;
    if (jobStatusTab === "archived") return !j.is_active || j.is_expired;
    return true;
  });

  // Hitung Metrik Ringkasan
  const totalJobsCount = jobs.length;
  const activeJobsCount = jobs.filter((j) => j.is_active && !j.is_expired).length;
  const archivedJobsCount = jobs.filter((j) => !j.is_active || j.is_expired).length;
  const totalApplicantsCount = applicants.length;
  const inReviewCount = applicants.filter(
    (a) => ["reviewed", "shortlisted", "screening", "assessment", "interview"].includes(a.status)
  ).length;
  const acceptedCount = applicants.filter((a) => a.status === "accepted").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-[family-name:var(--font-poppins)] antialiased selection:bg-purple-600 selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-2xl backdrop-blur-xl">
          {toastMsg}
        </div>
      )}

      {/* Top Navbar Mitra */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 sm:px-8 py-3 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand & Perusahaan */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-20 items-center justify-center rounded-lg bg-slate-100 p-1 border border-slate-200">
                <img
                  src="/images/logo-puskar.png"
                  alt="Pusat Karier UIN"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              <div>
                <div className="text-sm font-black tracking-tight flex items-center gap-2 text-slate-900">
                  <span>{company?.name || "Dashboard Mitra"}</span>
                  {company?.verification_status === "verified" ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Mitra Terverifikasi
                    </span>
                  ) : company?.verification_status === "rejected" ? (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 flex items-center gap-1">
                      <svg className="h-3 w-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Pengajuan Ditolak
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
                      <svg className="h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Menunggu Verifikasi Admin
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {company?.industry || "Partner Rekrutmen CCE 2026"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Lihat Halaman Expo</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-xs cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative mx-auto max-w-7xl px-4 sm:px-8 py-6 sm:py-8 overflow-hidden">
        {/* Banner Status Verifikasi Akun Perusahaan */}
        {company?.verification_status === "pending" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-amber-900">
                      Akun Perusahaan Dalam Proses Penyaringan &amp; Verifikasi Admin
                    </h4>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Dalam Antrean Kurasi
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/90 mt-1 max-w-3xl leading-relaxed">
                    Pusat Karier UIN Syarif Hidayatullah Jakarta sedang memverifikasi legalitas dan profil perusahaan Anda untuk memastikan keamanan peserta expo. Selama peninjauan, fitur pembuatan lowongan kerja dibatasi sementara hingga disetujui admin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (company?.id) {
                    fetchProfile(company.id);
                    showToast("Memperbarui status verifikasi terkini dari server...");
                  }
                }}
                className="shrink-0 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/70 px-3.5 py-2 text-xs font-bold text-amber-800 transition flex items-center gap-1.5 self-end sm:self-auto shadow-xs cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Cek Status Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {company?.verification_status === "rejected" && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-rose-900">
                  Pendaftaran Kemitraan Belum Disetujui (Ditolak)
                </h4>
                <p className="text-xs text-rose-800/90 mt-1 leading-relaxed">
                  Catatan Tim Kurator: <strong>{company?.rejection_reason || "Profil perusahaan belum memenuhi standar kualifikasi kemitraan expo CCE 2026."}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  Jika Anda meyakini ini adalah kekeliruan atau ingin melengkapi dokumen legalitas, silakan hubungi tim Pusat Karier UIN Jakarta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPI / Metric Cards with SVG Icons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Lowongan Aktif</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-[family-name:var(--font-montserrat)]">
              {activeJobsCount}
              <span className="text-xs font-normal text-slate-400 ml-1">/ {totalJobsCount} total</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-600">Siap menerima lamaran</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Total Pelamar</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-[family-name:var(--font-montserrat)]">
              {totalApplicantsCount}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Mahasiswa &amp; Alumni UIN</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Sedang Diproses</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 font-[family-name:var(--font-montserrat)]">
              {inReviewCount}
            </div>
            <div className="mt-1 text-[11px] text-amber-700">Screening / Tes / Interview</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Lolos / Diterima</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 font-[family-name:var(--font-montserrat)]">
              {acceptedCount}
            </div>
            <div className="mt-1 text-[11px] text-emerald-700">Tahap Offering Selesai</div>
          </div>
        </div>

        {/* Tab Navigation Menu with SVG Icons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 gap-1 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveMainTab("applicants")}
              className={`rounded-xl px-4 sm:px-6 py-2.5 font-bold transition flex items-center gap-2 cursor-pointer ${
                activeMainTab === "applicants"
                  ? "bg-white text-purple-700 shadow-xs border-b-2 border-purple-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Data Pelamar &amp; Tahapan Seleksi ({applicants.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab("jobs")}
              className={`rounded-xl px-4 sm:px-6 py-2.5 font-bold transition flex items-center gap-2 cursor-pointer ${
                activeMainTab === "jobs"
                  ? "bg-white text-purple-700 shadow-xs border-b-2 border-purple-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Kelola Lowongan ({jobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab("profile")}
              className={`rounded-xl px-4 sm:px-6 py-2.5 font-bold transition flex items-center gap-2 cursor-pointer ${
                activeMainTab === "profile"
                  ? "bg-white text-purple-700 shadow-xs border-b-2 border-purple-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Profil Perusahaan</span>
            </button>
          </div>

          {/* Action button on right based on active tab */}
          {activeMainTab === "jobs" && (
            <button
              type="button"
              onClick={() => {
                if (company?.verification_status !== "verified") {
                  showToast(
                    company?.verification_status === "rejected"
                      ? "Pendaftaran ditolak: Akun belum memenuhi syarat verifikasi kemitraan."
                      : "Fitur dibatasi: Akun Anda sedang dalam proses penyaringan & verifikasi oleh admin Pusat Karier UIN Jakarta."
                  );
                  return;
                }
                setEditingJob(null);
                resetJobForm();
                setJobModalOpen(true);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-xs cursor-pointer ${
                company?.verification_status === "verified"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                  : "bg-slate-200 border border-amber-300 text-amber-800"
              }`}
            >
              <span>+ Buat Lowongan Baru</span>
              {company?.verification_status !== "verified" && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold border border-amber-300">
                  Perlu Verifikasi
                </span>
              )}
            </button>
          )}

          {activeMainTab === "applicants" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateDemoApplicants}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition shadow-xs cursor-pointer"
                title="Tambahkan kandidat mahasiswa UIN untuk mencoba mencentang tahap seleksi"
              >
                <svg className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Simulasi Pelamar UIN</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: DATA PELAMAR & CENTANG TAHAP SELEKSI (FITUR UTAMA)     */}
        {/* ============================================================== */}
        {activeMainTab === "applicants" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cari Nama, Email, atau Prodi
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik kata kunci pencarian..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
                  />
                </div>

                {/* Filter Lowongan */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pilih Posisi Lowongan
                  </label>
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-600 focus:bg-white focus:outline-none transition"
                  >
                    <option value="all">Semua Posisi Lowongan ({applicants.length})</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.applicant_count || 0} pelamar)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Tahap */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Filter Tahap Seleksi
                  </label>
                  <select
                    value={selectedStageFilter}
                    onChange={(e) => setSelectedStageFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-600 focus:bg-white focus:outline-none transition"
                  >
                    <option value="all">Semua Tahap Rekrutmen</option>
                    <option value="submitted">1. Berkas Masuk</option>
                    <option value="reviewed">2. Seleksi Berkas</option>
                    <option value="shortlisted">3. Wawancara Booth CCE</option>
                    <option value="accepted">4. Diterima / Offering</option>
                    <option value="rejected">Tidak Lolos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Instruction Banner on how to check stages */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 text-xs text-purple-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
                  </svg>
                </span>
                <span>
                  <strong>Panduan Tahap Pelamar:</strong> Centang kotak tahapan di bawah untuk memajukan status pelamar secara <em>real-time</em> (dari Berkas Masuk hingga Offering).
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[11px] text-purple-800 font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500"></span> Berkas
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500"></span> Seleksi
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500"></span> Wawancara
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Diterima
              </div>
            </div>

            {/* Table / List of Applicants */}
            {isLoadingApplicants ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Memuat data pelamar...
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 mx-auto mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900">Belum Ada Pelamar yang Sesuai</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Belum ada lamaran masuk untuk kriteria filter ini. Anda dapat mengklik tombol di bawah untuk mengisi data simulasi mahasiswa UIN.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateDemoApplicants}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Buat 5 Pelamar Simulasi Mahasiswa UIN</span>
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="px-4 py-3.5">Kandidat Pelamar</th>
                        <th className="px-4 py-3.5">Posisi Lowongan</th>
                        <th className="px-4 py-3.5">Institusi / Prodi</th>
                        <th className="px-4 py-3.5 text-center">
                          Tahapan Seleksi (Centang untuk Update)
                        </th>
                        <th className="px-4 py-3.5 text-right">Aksi &amp; Kontak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplicants.map((app) => {
                        const STAGE_ID_ALIAS = {
                          submitted: "submitted",
                          screening: "reviewed",
                          reviewed: "reviewed",
                          assessment: "shortlisted",
                          interview: "shortlisted",
                          shortlisted: "shortlisted",
                          accepted: "accepted",
                        };
                        const normalizedStatus = STAGE_ID_ALIAS[app.status] || app.status;
                        const currentStageIdx = RECRUITMENT_STAGES.findIndex(
                          (s) => s.id === normalizedStatus
                        );
                        const isRejected = app.status === "rejected";

                        return (
                          <tr key={app.id} className="hover:bg-slate-50/80 transition">
                            {/* Candidate Info */}
                            <td className="px-4 py-4">
                              <div className="font-bold text-slate-900 text-sm">{app.full_name}</div>
                              <div className="text-[11px] text-slate-500">{app.email}</div>
                              <div className="text-[10px] text-purple-700 font-mono mt-0.5 font-medium">
                                Reg: {app.registration_number || "CCE2026-ONLINE"}
                              </div>
                            </td>

                            {/* Job Title */}
                            <td className="px-4 py-4">
                              <span className="font-semibold text-slate-800">{app.job_title}</span>
                              <div className="text-[10px] text-slate-500">{app.job_type}</div>
                            </td>

                            {/* Institution / Major */}
                            <td className="px-4 py-4">
                              <div className="text-slate-800 font-medium">{app.institution}</div>
                              <div className="text-[11px] text-slate-500">{app.domicile || "Jabodetabek"}</div>
                            </td>

                            {/* INTERACTIVE STAGE CHECKBOXES */}
                            <td className="px-4 py-4">
                              {isRejected ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700">
                                    <svg className="w-3 h-3 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                    Tidak Lolos Kualifikasi
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateApplicantStage(app.id, "submitted", app.full_name)}
                                    className="text-[10px] text-purple-600 underline hover:text-purple-800 font-medium cursor-pointer"
                                  >
                                    Reset ke Awal
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                  {RECRUITMENT_STAGES.map((stg, idx) => {
                                    const isPassed = currentStageIdx >= idx;
                                    const isCurrent = currentStageIdx === idx;

                                    return (
                                      <button
                                        key={stg.id}
                                        type="button"
                                        disabled={isUpdatingStatus}
                                        onClick={() => handleUpdateApplicantStage(app.id, stg.id, app.full_name)}
                                        title={`Klik untuk mencentang tahap ${stg.label}`}
                                        className={`group relative flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all cursor-pointer ${
                                          isCurrent
                                            ? "bg-purple-50 ring-2 ring-purple-600 scale-105 shadow-xs"
                                            : isPassed
                                            ? "bg-slate-100 hover:bg-slate-200/70"
                                            : "opacity-40 hover:opacity-80"
                                        }`}
                                      >
                                        <div
                                          className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition ${
                                            isPassed
                                              ? `${stg.color} text-white shadow-xs`
                                              : "border border-slate-200 bg-slate-100 text-slate-400"
                                          }`}
                                        >
                                          {isPassed ? (
                                            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          ) : (
                                            stg.step
                                          )}
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-600 hidden md:block">
                                          {stg.label.split(" ")[0]}
                                        </span>
                                      </button>
                                    );
                                  })}

                                  {/* Reject button */}
                                  <button
                                    type="button"
                                    disabled={isUpdatingStatus}
                                    onClick={() => handleUpdateApplicantStage(app.id, "rejected", app.full_name)}
                                    title="Tandai tidak lolos"
                                    className="ml-1 rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs text-rose-600 hover:bg-rose-100 transition flex items-center justify-center cursor-pointer"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Actions & WhatsApp */}
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* WA Direct Link */}
                                {app.phone && (
                                  <a
                                    href={`https://wa.me/${app.phone.replace(/^0/, "62")}?text=${encodeURIComponent(
                                      `Halo ${app.full_name}, kami dari tim HR ${company.name} ingin mengonfirmasi terkait lamaran Anda untuk posisi ${app.job_title} di Career Compass Expo 2026 UIN Jakarta.`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                    title="Hubungi via WhatsApp"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>WA</span>
                                  </a>
                                )}

                                {/* Detail & CV */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDetailModalApplicant(app);
                                    setInterviewForm({
                                      date: app.interview_date || "",
                                      notes: app.interview_notes || "",
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                                >
                                  <span>Detail</span>
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: KELOLA LOWONGAN (BUAT & EDIT LOWONGAN)                  */}
        {/* ============================================================== */}
        {activeMainTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daftar Lowongan Pekerjaan Perusahaan</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publikasikan posisi karir untuk dilihat oleh ribuan pencari kerja di Career Compass Expo 2026.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingJob(null);
                  resetJobForm();
                  setJobModalOpen(true);
                }}
                className="shrink-0 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                + Tambah Lowongan
              </button>
            </div>

            {/* Filter Tabs Status Lowongan: Semua, Aktif, Arsip */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
              <button
                type="button"
                onClick={() => setJobStatusTab("all")}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  jobStatusTab === "all"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>Semua Lowongan</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  jobStatusTab === "all" ? "bg-purple-700/90 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {jobs.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setJobStatusTab("active")}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  jobStatusTab === "active"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${jobStatusTab === "active" ? "bg-emerald-200" : "bg-emerald-500"} animate-pulse`}></span>
                <span>Aktif di Landing Page</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  jobStatusTab === "active" ? "bg-emerald-700/90 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {jobs.filter((j) => j.is_active && !j.is_expired).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setJobStatusTab("archived")}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  jobStatusTab === "archived"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Arsip / Berakhir</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  jobStatusTab === "archived" ? "bg-amber-700/90 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {jobs.filter((j) => !j.is_active || j.is_expired).length}
                </span>
              </button>
            </div>

            {isLoadingJobs ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Memuat daftar lowongan...
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-600">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900">Belum Ada Lowongan yang Dibuat</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Perusahaan Anda belum mempublikasikan lowongan. Klik tombol di bawah untuk membuat lowongan pertama Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingJob(null);
                    resetJobForm();
                    setJobModalOpen(true);
                  }}
                  className="mt-4 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  + Buat Lowongan Pertama
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900">Tidak Ada Lowongan Pada Kategori Ini</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  {jobStatusTab === "active"
                    ? "Tidak ada lowongan yang berstatus aktif di landing page saat ini."
                    : "Belum ada lowongan yang masuk ke arsip atau telah melewati batas tanggal."}
                </p>
                <button
                  type="button"
                  onClick={() => setJobStatusTab("all")}
                  className="mt-4 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  Tampilkan Semua Lowongan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job) => {
                  const dateRange = formatJobDateRange(job.start_date, job.end_date);
                  return (
                    <div
                      key={job.id}
                      className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition ${
                        job.is_expired
                          ? "border-amber-200 bg-white hover:border-amber-300 hover:shadow-sm"
                          : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm"
                      }`}
                    >
                      <div>
                        {/* Poster Preview Banner jika ada */}
                        {job.poster_url && (
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl mb-3 bg-slate-100 border border-slate-200 group/img">
                            <img
                              src={job.poster_url}
                              alt={`Poster ${job.title}`}
                              className="h-full w-full object-cover object-top transition duration-300 group-hover/img:scale-105"
                            />
                            <span className="absolute bottom-1.5 right-1.5 rounded-md bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/20">
                              Poster Terpasang
                            </span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {job.is_expired ? (
                            <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              <span>Arsip / Berakhir</span>
                            </span>
                          ) : job.is_active ? (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Aktif di Landing Page</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                              <span>Ditutup (Nonaktif)</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{job.location || "Jakarta"}</span>
                          </span>
                        </div>

                        {/* Periode Tanggal Lowongan */}
                        {dateRange && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-purple-900 bg-purple-50 rounded-lg px-2.5 py-1.5 border border-purple-200 font-medium">
                            <svg className="h-3.5 w-3.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Periode: <strong>{dateRange}</strong></span>
                          </div>
                        )}

                        {/* Alert Notice Jika Expired / Diarsipkan */}
                        {job.is_expired && (
                          <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                            <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="leading-tight">
                              <span className="font-bold text-amber-800 block">Tersimpan di Arsip</span>
                              <span className="text-[10px] text-amber-700">
                                Melewati batas tanggal &amp; otomatis terhapus dari landing page. Klik <strong>Edit</strong> untuk memperpanjang batas tanggal dan mengaktifkannya lagi.
                              </span>
                            </div>
                          </div>
                        )}

                        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {job.description || "Tidak ada deskripsi singkat."}
                        </p>

                        {job.requirements && (
                          <div className="mt-2 text-[11px] text-slate-500 line-clamp-1">
                            <strong className="text-slate-700">Kualifikasi:</strong> {job.requirements}
                          </div>
                        )}
                      </div>

                      {/* Bottom Stats & Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobFilter(job.id);
                            setActiveMainTab("applicants");
                          }}
                          className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <span>{job.applicant_count || 0} Pelamar</span>
                          <span>→</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`/lowongan/${job.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Lihat halaman detail lowongan publik"
                          >
                            <svg className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Detail</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleToggleJobActive(job)}
                            title={job.is_active ? "Tutup lowongan" : "Aktifkan lowongan"}
                            className="rounded-lg border border-slate-200 bg-slate-100 p-1.5 text-xs text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                          >
                            {job.is_active ? (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditJobModal(job)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="rounded-lg bg-rose-50 border border-rose-200 p-1.5 text-xs text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                            title="Hapus lowongan"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PROFIL PERUSAHAAN (COMPANY PROFILE SETTINGS)           */}
        {/* ============================================================== */}
        {activeMainTab === "profile" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Profil Perusahaan Mitra CCE 2026</h2>
            <p className="text-xs text-slate-500 mb-6">
              Informasi ini akan ditampilkan kepada kandidat peserta saat melihat lowongan dan booth expo.
            </p>

            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 p-1.5 overflow-hidden shrink-0 shadow-xs">
                    {company?.logo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={company.logo_url}
                        alt={company?.name || "Logo Perusahaan"}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" />
                        <path d="M9 8h1" />
                        <path d="M9 12h1" />
                        <path d="M9 16h1" />
                        <path d="M14 8h1" />
                        <path d="M14 12h1" />
                        <path d="M14 16h1" />
                        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                      </svg>
                    )}
                    {isUploadingCompanyLogo && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-base">{company?.name}</div>
                    <div className="text-xs text-slate-500">{company?.industry}</div>
                    <div className="text-[11px] text-purple-700 font-mono mt-0.5 font-medium">ID: {company?.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-700 transition-all shadow-xs">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={handleCompanyLogoUpload}
                      disabled={isUploadingCompanyLogo}
                      className="hidden"
                    />
                    <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{isUploadingCompanyLogo ? "Mengunggah..." : company?.logo_url ? "Ganti Logo" : "Upload Logo"}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="text-[11px] font-bold text-slate-500">Narahubung / PIC</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{company?.pic_name || "-"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="text-[11px] font-bold text-slate-500">Email Akun</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{company?.email || "-"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="text-[11px] font-bold text-slate-500">WhatsApp PIC</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{company?.phone || "-"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="text-[11px] font-bold text-slate-500">Website</div>
                  <div className="font-semibold text-purple-600 mt-0.5 truncate">
                    {company?.website || "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="text-[11px] font-bold text-slate-500">Lokasi / Alamat Kantor</div>
                <div className="text-xs text-slate-800 mt-0.5">{company?.address || "-"}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="text-[11px] font-bold text-slate-500">Tentang Perusahaan</div>
                <div className="text-xs text-slate-700 mt-1 leading-relaxed">{company?.bio || "-"}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: BUAT / EDIT LOWONGAN                                    */}
      {/* ============================================================== */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900">
                {editingJob ? (
                  <>
                    <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Edit Lowongan Pekerjaan</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>Tambah Lowongan Pekerjaan Baru</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setJobModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Posisi / Jabatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="Misal: Frontend Developer, Management Trainee"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
                />
              </div>



              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi &amp; Sistem Kerja</label>
                <input
                  type="text"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  placeholder="Contoh: Jakarta (Hybrid), BSD Tangerang (On-site), Remote"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Rentang Periode Pendaftaran Lowongan (Auto-Arsip saat lewat batas) */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Rentang Periode Pendaftaran Lowongan
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    Auto-Arsip Otomatis
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tanggal Mulai Dibuka
                    </label>
                    <input
                      type="date"
                      value={jobForm.start_date}
                      onChange={(e) => setJobForm({ ...jobForm, start_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 focus:border-purple-600 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Batas Akhir / Deadline Lamaran
                    </label>
                    <input
                      type="date"
                      value={jobForm.end_date}
                      onChange={(e) => setJobForm({ ...jobForm, end_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 focus:border-purple-600 focus:outline-none transition"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-2 pt-1 border-t border-slate-200">
                  <svg className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Ketika telah melewati batas tanggal akhir, lowongan akan <strong>otomatis terhapus dari landing page</strong> publik, namun <strong>tetap tersimpan sebagai arsip</strong> di dashboard mitra ini.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Pekerjaan / Tanggung Jawab</label>
                <textarea
                  rows={3}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Uraikan tanggung jawab dan aktivitas posisi ini..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kualifikasi &amp; Persyaratan</label>
                <textarea
                  rows={2}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="Contoh: Mahasiswa tingkat akhir / S1 semua jurusan, IPK min 3.00, menguasai komunikasi..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Upload Poster Lowongan (PNG, JPG, WEBP - Maks. 5MB) */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Poster / Brosur Lowongan
                  </label>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Maks. 5MB (PNG, JPG, WEBP)
                  </span>
                </div>

                {jobForm.poster_preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-purple-200 bg-white p-2.5 shadow-xs">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
                      <img
                        src={jobForm.poster_preview}
                        alt="Preview Poster Lowongan"
                        className="max-h-full max-w-full object-contain"
                      />
                      {jobForm.is_uploading_poster && (
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                          <svg className="w-6 h-6 animate-spin text-purple-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span className="text-xs font-bold text-white">Mengunggah poster ke server...</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Poster terlampir</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePoster}
                        className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      >
                        Hapus Poster
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/40 transition group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div className="text-xs font-bold text-slate-700 group-hover:text-purple-700 transition">
                      Klik untuk Unggah Poster Lowongan
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Format didukung: PNG, JPG, JPEG, WEBP (Maksimal 5MB)
                    </div>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                      onChange={handlePosterFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={jobForm.is_active}
                  onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded accent-purple-600"
                />
                <label htmlFor="isActiveCheck" className="text-slate-700 font-medium">
                  Publikasikan lowongan sebagai aktif sekarang
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  {editingJob ? "Simpan Perubahan" : "Terbitkan Lowongan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DETAIL PELAMAR & JADWAL WAWANCARA                       */}
      {/* ============================================================== */}
      {detailModalApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">Detail Kandidat Pelamar</h3>
              <button
                type="button"
                onClick={() => setDetailModalApplicant(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="font-bold text-slate-900 text-base">{detailModalApplicant.full_name}</div>
                <div className="text-slate-600 mt-0.5">{detailModalApplicant.institution}</div>
                <div className="text-[11px] text-purple-700 mt-1 font-medium">
                  Melamar: <strong className="text-purple-900">{detailModalApplicant.job_title}</strong> ({detailModalApplicant.job_type})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</div>
                  <div className="font-medium text-slate-900 mt-0.5 break-all">{detailModalApplicant.email}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. WhatsApp</div>
                  <div className="font-medium text-slate-900 mt-0.5">{detailModalApplicant.phone}</div>
                </div>
              </div>

              {/* Data Akademik & Profil Tambahan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usia</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {detailModalApplicant.age ? `${detailModalApplicant.age} Thn` : "-"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IPK / GPA</div>
                  <div className="font-semibold text-amber-700 mt-0.5">
                    {detailModalApplicant.gpa || "-"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tahun Lulus</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {detailModalApplicant.graduation_year || "-"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fakultas</div>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate" title={detailModalApplicant.faculty}>
                    {detailModalApplicant.faculty || "-"}
                  </div>
                </div>
              </div>

              {/* Berkas CV & Portfolio */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <div className="font-bold text-slate-700">Berkas Pelamar:</div>
                <div className="flex flex-wrap gap-2">
                  {detailModalApplicant.cv_path ? (
                    <a
                      href={detailModalApplicant.cv_path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 font-bold text-purple-700 hover:bg-purple-100 transition shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <span>Lihat CV / Resume</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    <span className="text-slate-400">CV terlampir di akun peserta</span>
                  )}

                  {detailModalApplicant.cce_proof_url && (
                    <a
                      href={detailModalApplicant.cce_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Bukti Regis CCE</span>
                      <span>↗</span>
                    </a>
                  )}

                  {detailModalApplicant.portfolio_url && (
                    <a
                      href={detailModalApplicant.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span>Portofolio / LinkedIn</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Status Stepper in Modal */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <div className="font-bold text-slate-700">Ubah Tahap Seleksi:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RECRUITMENT_STAGES.map((stg) => {
                    const STAGE_ID_ALIAS = {
                      submitted: "submitted",
                      screening: "reviewed",
                      reviewed: "reviewed",
                      assessment: "shortlisted",
                      interview: "shortlisted",
                      shortlisted: "shortlisted",
                      accepted: "accepted",
                    };
                    const normalizedAppStatus = STAGE_ID_ALIAS[detailModalApplicant.status] || detailModalApplicant.status;
                    const isSelected = normalizedAppStatus === stg.id;
                    return (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() =>
                          handleUpdateApplicantStage(
                            detailModalApplicant.id,
                            stg.id,
                            detailModalApplicant.full_name
                          )
                        }
                        className={`rounded-xl py-2 px-2 text-center font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? `${stg.color} text-white shadow-xs scale-105`
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>{stg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Catatan / Jadwal Wawancara */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                <div className="font-bold text-slate-700">Jadwal / Catatan Interview Booth:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Wawancara</label>
                    <input
                      type="date"
                      value={interviewForm.date}
                      onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-purple-600 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan HR / Hasil</label>
                    <input
                      type="text"
                      value={interviewForm.notes}
                      onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                      placeholder="Misal: Lolos tahap 1, hadir pukul 10:00"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setDetailModalApplicant(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
