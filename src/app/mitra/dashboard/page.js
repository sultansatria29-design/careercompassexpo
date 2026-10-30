"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Definisi Tahapan Rekrutmen
const RECRUITMENT_STAGES = [
  { id: "submitted", label: "Berkas Masuk", step: 1, color: "bg-blue-500", text: "text-blue-400" },
  { id: "screening", label: "Seleksi Berkas", step: 2, color: "bg-amber-500", text: "text-amber-400" },
  { id: "assessment", label: "Tes / Asesmen", step: 3, color: "bg-purple-500", text: "text-purple-400" },
  { id: "interview", label: "Wawancara", step: 4, color: "bg-cyan-500", text: "text-cyan-400" },
  { id: "accepted", label: "Diterima / Offering", step: 5, color: "bg-emerald-500", text: "text-emerald-400" },
];

export default function MitraDashboardPage() {
  const router = useRouter();

  // State Profil Perusahaan
  const [company, setCompany] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("applicants"); // 'applicants' | 'jobs' | 'profile'

  // State Lowongan (Jobs)
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null = mode tambah
  const [jobForm, setJobForm] = useState({
    title: "",
    employment_type: "Full-time",
    location: "Jakarta (Hybrid)",
    quota: 2,
    description: "",
    requirements: "",
    is_active: true,
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

  // Load Session Perusahaan saat mount & guard akses publik
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const params = new URLSearchParams(window.location.search);
      const hasDevParam =
        params.get("dev") === "true" ||
        params.get("preview") === "true" ||
        params.get("key") === "cce2026";
      const hasDevStorage = localStorage.getItem("cce_mitra_dev_unlocked") === "true";
      const stored = localStorage.getItem("cce_mitra_session");

      // Jika di production publik dan belum ada izin dev/sesi, arahkan ke halaman info /mitra
      if (!isLocalhost && !hasDevParam && !hasDevStorage && !stored) {
        router.push("/mitra");
        return;
      }

      if (hasDevParam) {
        localStorage.setItem("cce_mitra_dev_unlocked", "true");
      }

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCompany(parsed);
          fetchJobs(parsed.id);
          fetchApplicants(parsed.id);
          fetchProfile(parsed.id);
        } catch {
          setupFallbackCompany();
        }
      } else {
        setupFallbackCompany();
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

  function setupFallbackCompany() {
    // Sediakan default profil demo jika belum ada sesi
    const defaultDemo = {
      id: "demo-mitra-uin",
      name: "PT Nusantara Digital Solusindo",
      industry: "Teknologi & Informasi (IT)",
      pic_name: "Rian Hendrawan (HR)",
      email: "recruitment@nusantaradigital.id",
      phone: "081299887766",
      website: "https://nusantaradigital.id",
      address: "Jakarta Selatan",
      company_size: "51-200 Karyawan",
      bio: "Perusahaan mitra rekrutmen resmi Career Campus Expo 2026 UIN Syarif Hidayatullah Jakarta.",
      logo_url: "",
      verification_status: "verified",
    };
    setCompany(defaultDemo);
    if (typeof window !== "undefined") {
      localStorage.setItem("cce_mitra_session", JSON.stringify(defaultDemo));
    }
    fetchJobs(defaultDemo.id);
    fetchApplicants(defaultDemo.id);
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

    try {
      if (editingJob) {
        // Mode Edit
        const res = await fetch("/api/mitra/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingJob.id,
            company_id: company.id,
            ...jobForm,
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
            ...jobForm,
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
    setJobForm({
      title: "",
      employment_type: "Full-time",
      location: "Jakarta (Hybrid)",
      quota: 2,
      description: "",
      requirements: "",
      is_active: true,
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
    const matchStage = selectedStageFilter === "all" || app.status === selectedStageFilter;
    const matchSearch =
      !searchQuery ||
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchJob && matchStage && matchSearch;
  });

  // Hitung Metrik Ringkasan
  const totalJobsCount = jobs.length;
  const activeJobsCount = jobs.filter((j) => j.is_active).length;
  const totalApplicantsCount = applicants.length;
  const inReviewCount = applicants.filter(
    (a) => ["screening", "assessment", "interview"].includes(a.status)
  ).length;
  const acceptedCount = applicants.filter((a) => a.status === "accepted").length;

  return (
    <div className="min-h-screen bg-[#0E041A] text-white selection:bg-[#EF17D8] selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce rounded-2xl border border-white/20 bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-3.5 text-sm font-bold text-white shadow-2xl backdrop-blur-xl">
          {toastMsg}
        </div>
      )}

      {/* Top Navbar Mitra */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#170A2D]/95 px-4 sm:px-8 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand & Perusahaan */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-20 items-center justify-center rounded-lg bg-white p-1">
                <img
                  src="/images/logo-puskar.png"
                  alt="Pusat Karier UIN"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
            <div className="h-5 w-[1px] bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 text-xs font-black text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              <div>
                <div className="text-sm font-black tracking-tight flex items-center gap-2">
                  <span>{company?.name || "Dashboard Mitra"}</span>
                  {company?.verification_status === "verified" ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Mitra Terverifikasi
                    </span>
                  ) : company?.verification_status === "rejected" ? (
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <svg className="h-3 w-3 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Pengajuan Ditolak
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                      <svg className="h-3 w-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Menunggu Verifikasi Admin
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-purple-300/70 hidden sm:block">
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
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-purple-200 hover:bg-white/10 hover:text-white transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Lihat Halaman Expo</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2 text-xs font-bold text-red-200 hover:bg-red-900/60 transition cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with 3D Accessories */}
      <main className="relative mx-auto max-w-7xl px-4 sm:px-8 py-6 sm:py-8 overflow-hidden">
        {/* Aksesoris 3D Skyscraper Build 1 (Decorative Background) */}
        <div className="hidden xl:block absolute -right-12 top-20 w-32 pointer-events-none select-none opacity-25 animate-float-slow z-0">
          <img
            src="/images/icons/build%201.png"
            alt="Aksesoris Gedung Mitra"
            className="w-full h-auto drop-shadow-[0_10px_30px_rgba(114,38,255,0.4)]"
          />
        </div>

        {/* Aksesoris 3D Tech Prism (Decorative Background) */}
        <div className="hidden xl:block absolute -left-10 top-72 w-28 pointer-events-none select-none opacity-20 animate-float-reverse z-0">
          <img
            src="/images/icons/tech%202.png"
            alt="Aksesoris Tech Prism"
            className="w-full h-auto drop-shadow-[0_10px_25px_rgba(239,23,216,0.4)]"
          />
        </div>

        {/* Banner Status Verifikasi Akun Perusahaan */}
        {company?.verification_status === "pending" && (
          <div className="mb-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-purple-950/60 to-purple-900/30 p-4 sm:p-5 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-amber-200">
                      Akun Perusahaan Dalam Proses Penyaringan &amp; Verifikasi Admin
                    </h4>
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Dalam Antrean Kurasi
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/80 mt-1 max-w-3xl leading-relaxed">
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
                className="shrink-0 rounded-xl border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-200 transition flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
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
          <div className="mb-6 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/20 via-rose-950/60 to-purple-950/40 p-4 sm:p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-rose-200">
                  Pendaftaran Kemitraan Belum Disetujui (Ditolak)
                </h4>
                <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                  Catatan Tim Kurator: <strong>{company?.rejection_reason || "Profil perusahaan belum memenuhi standar kualifikasi kemitraan expo CCE 2026."}</strong>
                </p>
                <p className="text-xs text-purple-300/70 mt-1.5">
                  Jika Anda meyakini ini adalah kekeliruan atau ingin melengkapi dokumen legalitas, silakan hubungi tim Pusat Karier UIN Jakarta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPI / Metric Cards with SVG Icons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
              <span>Lowongan Aktif</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">
              {activeJobsCount}
              <span className="text-xs font-normal text-purple-300/60 ml-1">/ {totalJobsCount} total</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-400">Siap menerima lamaran</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
              <span>Total Pelamar</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{totalApplicantsCount}</div>
            <div className="mt-1 text-[11px] text-purple-300/70">Mahasiswa &amp; Alumni UIN</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
              <span>Sedang Diproses</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-300">{inReviewCount}</div>
            <div className="mt-1 text-[11px] text-amber-400/80">Screening / Tes / Interview</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
              <span>Lolos / Diterima</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">{acceptedCount}</div>
            <div className="mt-1 text-[11px] text-emerald-400/80">Tahap Offering Selesai</div>
          </div>
        </div>

        {/* Tab Navigation Menu with SVG Icons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveMainTab("applicants")}
              className={`rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeMainTab === "applicants"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg"
                  : "text-purple-300/70 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Data Pelamar &amp; Tahapan Seleksi ({applicants.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab("jobs")}
              className={`rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeMainTab === "jobs"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg"
                  : "text-purple-300/70 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Kelola Lowongan ({jobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab("profile")}
              className={`rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeMainTab === "profile"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg"
                  : "text-purple-300/70 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-lg cursor-pointer ${
                company?.verification_status === "verified"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] shadow-purple-600/30 hover:scale-105"
                  : "bg-purple-950/60 border border-amber-500/40 text-amber-200"
              }`}
            >
              <span>+ Buat Lowongan Baru</span>
              {company?.verification_status !== "verified" && (
                <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-semibold border border-amber-400/30">
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-900/40 px-3.5 py-2 text-xs font-bold text-purple-200 hover:bg-purple-800/60 hover:text-white transition cursor-pointer"
                title="Tambahkan kandidat mahasiswa UIN untuk mencoba mencentang tahap seleksi"
              >
                <svg className="h-3.5 w-3.5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            <div className="rounded-2xl border border-white/10 bg-[#160A2C]/80 p-4 backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div>
                  <label className="block text-[11px] font-bold text-purple-300/80 mb-1">
                    Cari Nama, Email, atau Prodi
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik kata kunci pencarian..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>

                {/* Filter Lowongan */}
                <div>
                  <label className="block text-[11px] font-bold text-purple-300/80 mb-1">
                    Pilih Posisi Lowongan
                  </label>
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-3.5 py-2 text-xs text-white focus:border-fuchsia-400 focus:outline-none"
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
                  <label className="block text-[11px] font-bold text-purple-300/80 mb-1">
                    Filter Tahap Seleksi
                  </label>
                  <select
                    value={selectedStageFilter}
                    onChange={(e) => setSelectedStageFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-3.5 py-2 text-xs text-white focus:border-fuchsia-400 focus:outline-none"
                  >
                    <option value="all">Semua Tahap Rekrutmen</option>
                    <option value="submitted">1. Berkas Masuk</option>
                    <option value="screening">2. Seleksi Berkas (Screening)</option>
                    <option value="assessment">3. Tes / Asesmen</option>
                    <option value="interview">4. Wawancara / Interview</option>
                    <option value="accepted">5. Diterima / Offering</option>
                    <option value="rejected">Tidak Lolos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Instruction Banner on how to check stages */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-purple-950/40 px-5 py-3 text-xs text-purple-200">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
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
              <div className="flex items-center gap-2 shrink-0 text-[11px]">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500"></span> Berkas
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500"></span> Screening
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500"></span> Tes
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500"></span> Wawancara
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Diterima
              </div>
            </div>

            {/* Table / List of Applicants */}
            {isLoadingApplicants ? (
              <div className="py-16 text-center text-sm text-purple-300/60">
                Memuat data pelamar...
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 mx-auto mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white">Belum Ada Pelamar yang Sesuai</h3>
                <p className="mt-1 text-xs text-purple-300/70 max-w-md mx-auto">
                  Belum ada lamaran masuk untuk kriteria filter ini. Anda dapat mengklik tombol di bawah untuk mengisi data simulasi mahasiswa UIN.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateDemoApplicants}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-fuchsia-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Buat 5 Pelamar Simulasi Mahasiswa UIN</span>
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#160A2C]/90 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-purple-300">
                      <tr>
                        <th className="px-4 py-3.5 font-bold">Kandidat Pelamar</th>
                        <th className="px-4 py-3.5 font-bold">Posisi Lowongan</th>
                        <th className="px-4 py-3.5 font-bold">Institusi / Prodi</th>
                        <th className="px-4 py-3.5 font-bold text-center">
                          Tahapan Seleksi (Centang untuk Update)
                        </th>
                        <th className="px-4 py-3.5 font-bold text-right">Aksi &amp; Kontak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredApplicants.map((app) => {
                        const currentStageIdx = RECRUITMENT_STAGES.findIndex(
                          (s) => s.id === app.status
                        );
                        const isRejected = app.status === "rejected";

                        return (
                          <tr key={app.id} className="hover:bg-white/5 transition">
                            {/* Candidate Info */}
                            <td className="px-4 py-4">
                              <div className="font-bold text-white text-sm">{app.full_name}</div>
                              <div className="text-[11px] text-purple-300/70">{app.email}</div>
                              <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                                Reg: {app.registration_number || "CCE2026-ONLINE"}
                              </div>
                            </td>

                            {/* Job Title */}
                            <td className="px-4 py-4">
                              <span className="font-semibold text-purple-200">{app.job_title}</span>
                              <div className="text-[10px] text-purple-400/80">{app.job_type}</div>
                            </td>

                            {/* Institution / Major */}
                            <td className="px-4 py-4">
                              <div className="text-purple-200 font-medium">{app.institution}</div>
                              <div className="text-[11px] text-purple-300/60">{app.domicile || "Jabodetabek"}</div>
                            </td>

                            {/* INTERACTIVE STAGE CHECKBOXES */}
                            <td className="px-4 py-4">
                              {isRejected ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-[11px] font-bold text-red-300">
                                    <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                    Tidak Lolos Kualifikasi
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateApplicantStage(app.id, "submitted", app.full_name)}
                                    className="text-[10px] text-purple-300 underline hover:text-white"
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
                                            ? "bg-white/15 ring-2 ring-fuchsia-400 scale-105"
                                            : isPassed
                                            ? "bg-white/5 hover:bg-white/10"
                                            : "opacity-40 hover:opacity-80"
                                        }`}
                                      >
                                        <div
                                          className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition ${
                                            isPassed
                                              ? `${stg.color} text-white shadow-md`
                                              : "border border-white/20 bg-white/5 text-purple-300"
                                          }`}
                                        >
                                          {isPassed ? "✓" : stg.step}
                                        </div>
                                        <span className="text-[10px] font-semibold text-purple-200 hidden md:block">
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
                                    className="ml-1 rounded-lg border border-red-500/20 bg-red-950/30 p-1.5 text-xs text-red-300 hover:bg-red-900/50 hover:text-white transition"
                                  >
                                    ✕
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
                                      `Halo ${app.full_name}, kami dari tim HR ${company.name} ingin mengonfirmasi terkait lamaran Anda untuk posisi ${app.job_title} di Career Campus Expo 2026 UIN Jakarta.`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-600/50 hover:text-white transition"
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
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-purple-200 hover:bg-white/20 hover:text-white transition cursor-pointer"
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Daftar Lowongan Pekerjaan Perusahaan</h2>
                <p className="text-xs text-purple-300/70 mt-0.5">
                  Publikasikan posisi karir untuk dilihat oleh ribuan pencari kerja di Career Campus Expo 2026.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingJob(null);
                  resetJobForm();
                  setJobModalOpen(true);
                }}
                className="rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition cursor-pointer"
              >
                + Tambah Lowongan
              </button>
            </div>

            {isLoadingJobs ? (
              <div className="py-16 text-center text-sm text-purple-300/60">
                Memuat daftar lowongan...
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 text-purple-300">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white">Belum Ada Lowongan yang Dibuat</h3>
                <p className="mt-1 text-xs text-purple-300/70 max-w-md mx-auto">
                  Perusahaan Anda belum mempublikasikan lowongan. Klik tombol di bawah untuk membuat lowongan pertama Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingJob(null);
                    resetJobForm();
                    setJobModalOpen(true);
                  }}
                  className="mt-4 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  + Buat Lowongan Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#160A2C]/90 p-5 shadow-xl transition hover:border-purple-500/40"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border flex items-center gap-1.5 ${
                            job.is_active
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${job.is_active ? "bg-emerald-400 animate-pulse" : "bg-gray-400"}`}></span>
                          <span>{job.is_active ? "Aktif" : "Ditutup"}</span>
                        </span>
                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                          {job.employment_type}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white">{job.title}</h3>
                      <div className="text-xs text-purple-300/70 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{job.location || "Jakarta"}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Kuota: {job.quota || 1} orang</span>
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-purple-200/80 line-clamp-2 leading-relaxed">
                        {job.description || "Tidak ada deskripsi singkat."}
                      </p>

                      {job.requirements && (
                        <div className="mt-2 text-[11px] text-purple-300/60 line-clamp-1">
                          <strong>Kualifikasi:</strong> {job.requirements}
                        </div>
                      )}
                    </div>

                    {/* Bottom Stats & Actions */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobFilter(job.id);
                          setActiveMainTab("applicants");
                        }}
                        className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1.5"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span>{job.applicant_count || 0} Pelamar</span>
                        <span>→</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleJobActive(job)}
                          title={job.is_active ? "Tutup lowongan" : "Aktifkan lowongan"}
                          className="rounded-lg bg-white/10 p-1.5 text-xs text-purple-200 hover:bg-white/20 transition cursor-pointer"
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
                          className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-bold text-purple-200 hover:bg-white/20 transition cursor-pointer"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="rounded-lg bg-red-950/40 border border-red-500/20 p-1.5 text-xs text-red-300 hover:bg-red-900/60 transition cursor-pointer"
                          title="Hapus lowongan"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PROFIL PERUSAHAAN (COMPANY PROFILE SETTINGS)           */}
        {/* ============================================================== */}
        {activeMainTab === "profile" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-[#160A2C]/90 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-2">Profil Perusahaan Mitra CCE 2026</h2>
            <p className="text-xs text-purple-300/70 mb-6">
              Informasi ini akan ditampilkan kepada kandidat peserta saat melihat lowongan dan booth expo.
            </p>

            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-950 border border-purple-500/30 text-purple-300">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M9 8h1" />
                    <path d="M9 12h1" />
                    <path d="M9 16h1" />
                    <path d="M14 8h1" />
                    <path d="M14 12h1" />
                    <path d="M14 16h1" />
                    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-white text-base">{company?.name}</div>
                  <div className="text-xs text-purple-300">{company?.industry}</div>
                  <div className="text-[11px] text-purple-400 mt-0.5">ID: {company?.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                  <div className="text-[11px] font-bold text-purple-300/70">Narahubung / PIC</div>
                  <div className="font-semibold text-white mt-0.5">{company?.pic_name || "-"}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                  <div className="text-[11px] font-bold text-purple-300/70">Email Akun</div>
                  <div className="font-semibold text-white mt-0.5">{company?.email || "-"}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                  <div className="text-[11px] font-bold text-purple-300/70">WhatsApp PIC</div>
                  <div className="font-semibold text-white mt-0.5">{company?.phone || "-"}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                  <div className="text-[11px] font-bold text-purple-300/70">Website</div>
                  <div className="font-semibold text-fuchsia-400 mt-0.5 truncate">
                    {company?.website || "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <div className="text-[11px] font-bold text-purple-300/70">Lokasi / Alamat Kantor</div>
                <div className="text-xs text-white mt-0.5">{company?.address || "-"}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <div className="text-[11px] font-bold text-purple-300/70">Tentang Perusahaan</div>
                <div className="text-xs text-purple-200/80 mt-1 leading-relaxed">{company?.bio || "-"}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: BUAT / EDIT LOWONGAN                                    */}
      {/* ============================================================== */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#170A2D] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="flex items-center gap-2 text-base font-black text-white">
                {editingJob ? (
                  <>
                    <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Edit Lowongan Pekerjaan</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className="text-purple-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-purple-200 mb-1">
                  Judul Posisi / Jabatan <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="Misal: Frontend Developer, Management Trainee"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">Tipe Pekerjaan</label>
                  <select
                    value={jobForm.employment_type}
                    onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-3.5 py-2.5 text-white focus:border-fuchsia-400 focus:outline-none"
                  >
                    <option value="Full-time">Full-time (Penuh Waktu)</option>
                    <option value="Internship">Internship (Magang)</option>
                    <option value="Part-time">Part-time (Paruh Waktu)</option>
                    <option value="Contract">Kontrak / Project-based</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">Kuota Penerimaan</label>
                  <input
                    type="number"
                    min="1"
                    value={jobForm.quota}
                    onChange={(e) => setJobForm({ ...jobForm, quota: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-purple-200 mb-1">Lokasi &amp; Sistem Kerja</label>
                <input
                  type="text"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  placeholder="Contoh: Jakarta (Hybrid), BSD Tangerang (On-site), Remote"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-purple-200 mb-1">Deskripsi Pekerjaan / Tanggung Jawab</label>
                <textarea
                  rows={3}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Uraikan tanggung jawab dan aktivitas posisi ini..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-purple-200 mb-1">Kualifikasi &amp; Persyaratan</label>
                <textarea
                  rows={2}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="Contoh: Mahasiswa tingkat akhir / S1 semua jurusan, IPK min 3.00, menguasai komunikasi..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={jobForm.is_active}
                  onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded accent-fuchsia-500"
                />
                <label htmlFor="isActiveCheck" className="text-purple-200 font-medium">
                  Publikasikan lowongan sebagai aktif sekarang
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-purple-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#170A2D] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Detail Kandidat Pelamar</h3>
              <button
                type="button"
                onClick={() => setDetailModalApplicant(null)}
                className="text-purple-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-bold text-white text-base">{detailModalApplicant.full_name}</div>
                <div className="text-purple-300 mt-0.5">{detailModalApplicant.institution}</div>
                <div className="text-[11px] text-purple-400 mt-1">
                  Melamar: <strong>{detailModalApplicant.job_title}</strong> ({detailModalApplicant.job_type})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] text-purple-300/70">Email</div>
                  <div className="font-medium text-white mt-0.5 break-all">{detailModalApplicant.email}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] text-purple-300/70">No. WhatsApp</div>
                  <div className="font-medium text-white mt-0.5">{detailModalApplicant.phone}</div>
                </div>
              </div>

              {/* Berkas CV & Portfolio */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="font-bold text-purple-200">Berkas Pelamar:</div>
                <div className="flex flex-wrap gap-2">
                  {detailModalApplicant.cv_path ? (
                    <a
                      href={detailModalApplicant.cv_path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 px-3 py-1.5 font-bold text-purple-200 hover:bg-purple-600/50 hover:text-white transition"
                    >
                      <svg className="w-3.5 h-3.5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <span className="text-purple-400">CV terlampir di akun peserta</span>
                  )}

                  {detailModalApplicant.portfolio_url && (
                    <a
                      href={detailModalApplicant.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-fuchsia-600/30 border border-fuchsia-500/40 px-3 py-1.5 font-bold text-fuchsia-200 hover:bg-fuchsia-600/50 hover:text-white transition"
                    >
                      <svg className="w-3.5 h-3.5 text-fuchsia-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="font-bold text-purple-200">Ubah Tahap Seleksi:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RECRUITMENT_STAGES.map((stg) => {
                    const isSelected = detailModalApplicant.status === stg.id;
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
                        className={`rounded-xl py-2 px-2 text-center font-bold text-[11px] transition ${
                          isSelected
                            ? `${stg.color} text-white shadow-md scale-105`
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {stg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Catatan / Jadwal Wawancara */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-3">
                <div className="font-bold text-purple-200">Jadwal / Catatan Interview Booth:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-purple-300/80 mb-1">Tanggal Wawancara</label>
                    <input
                      type="date"
                      value={interviewForm.date}
                      onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-[#1E0C36] px-3 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-purple-300/80 mb-1">Catatan HR / Hasil</label>
                    <input
                      type="text"
                      value={interviewForm.notes}
                      onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                      placeholder="Misal: Lolos tahap 1, hadir pukul 10:00"
                      className="w-full rounded-lg border border-white/15 bg-[#1E0C36] px-3 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setDetailModalApplicant(null)}
                  className="rounded-xl bg-white/10 px-5 py-2.5 font-bold text-white hover:bg-white/20 transition"
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
