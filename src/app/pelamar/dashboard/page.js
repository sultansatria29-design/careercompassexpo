"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Definisi Tahapan Seleksi (Sesuai constraint database Supabase & Dashboard Mitra)
const STAGES = [
  { id: "submitted", label: "Berkas Masuk", step: 1, color: "blue" },
  { id: "reviewed", label: "Seleksi Berkas", step: 2, color: "amber" },
  { id: "shortlisted", label: "Wawancara", step: 3, color: "cyan" },
  { id: "accepted", label: "Diterima / Offering", step: 4, color: "emerald" },
];

function getStageStep(status) {
  if (status === "submitted") return 1;
  if (status === "reviewed" || status === "screening") return 2;
  if (status === "shortlisted" || status === "assessment" || status === "interview") return 3;
  if (status === "accepted") return 4;
  return 1;
}

export default function PelamarDashboardPage() {
  const router = useRouter();

  // State Pelamar & Applications
  const [pelamar, setPelamar] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Load session & applications
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cce_pelamar_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPelamar(parsed);
          fetchApplications(parsed.id);
          fetchFreshProfile(parsed.id);
        } catch {
          router.push("/pelamar");
        }
      } else {
        router.push("/pelamar");
      }
    }
  }, [router]);

  async function fetchFreshProfile(participantId) {
    try {
      const res = await fetch("/api/pelamar/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_profile", participant_id: participantId }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.pelamar) {
        setPelamar(data.pelamar);
        localStorage.setItem("cce_pelamar_session", JSON.stringify(data.pelamar));
      }
    } catch (err) {
      console.error("Gagal refresh profil pelamar:", err);
    }
  }

  async function fetchApplications(participantId) {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/pelamar/applications?participant_id=${participantId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Gagal memuat lamaran pelamar:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cce_pelamar_session");
      showToast("Anda telah keluar dari akun pelamar.");
      setTimeout(() => {
        router.push("/pelamar");
      }, 500);
    }
  }

  // Ringkasan Metrik
  const totalApplied = applications.length;
  const inProgressCount = applications.filter((a) =>
    ["submitted", "reviewed", "screening"].includes(a.status)
  ).length;
  const interviewCount = applications.filter((a) =>
    ["shortlisted", "interview", "assessment"].includes(a.status)
  ).length;
  const acceptedCount = applications.filter((a) => a.status === "accepted").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-[family-name:var(--font-poppins)] antialiased selection:bg-purple-600 selection:text-white flex flex-col justify-between">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-xl">
          {toastMsg}
        </div>
      )}

      {/* Navbar Pelamar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 sm:px-8 py-3.5 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-22 items-center justify-center rounded-lg bg-slate-100 p-1 border border-slate-200 shadow-xs">
                <img
                  src="/images/logo-puskar.png"
                  alt="Pusat Karier UIN Jakarta"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-xs font-black">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <span className="text-sm font-black tracking-tight text-slate-900">Dashboard Pelamar</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Beranda Expo</span>
            </Link>

            <Link
              href="/pelamar/walk-in"
              className="rounded-xl bg-purple-600 hover:bg-purple-700 px-3.5 py-2 font-bold text-white shadow-xs transition flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Form Walk-In Interview</span>
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-8 py-6 sm:py-8 z-10 flex-1 space-y-6 sm:space-y-8">
        {/* Banner Profil Pelamar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-2xl font-black text-white shadow-xs border border-purple-200">
                {pelamar?.full_name ? pelamar.full_name.charAt(0).toUpperCase() : "P"}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {pelamar?.full_name || "Pelamar CCE 2026"}
                  </h1>
                  {pelamar?.registration_number && (
                    <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 font-mono">
                      {pelamar.registration_number}
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    {pelamar?.participant_status || "Mahasiswa"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                  <span>{pelamar?.institution || "UIN Syarif Hidayatullah Jakarta"}</span>
                  {pelamar?.faculty && (
                    <>
                      <span>•</span>
                      <span className="text-purple-700 font-medium">{pelamar.faculty}</span>
                    </>
                  )}
                  {pelamar?.major && (
                    <>
                      <span>•</span>
                      <span>{pelamar.major}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{pelamar?.email}</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                  {pelamar?.age && (
                    <span>
                      Usia: <strong className="text-slate-900">{pelamar.age} Thn</strong>
                    </span>
                  )}
                  {pelamar?.gpa && (
                    <span>
                      IPK: <strong className="text-amber-700">{pelamar.gpa}</strong>
                    </span>
                  )}
                  {pelamar?.graduation_year && (
                    <span>
                      Kelulusan: <strong className="text-slate-900">{pelamar.graduation_year}</strong>
                    </span>
                  )}
                  {pelamar?.cce_proof_url && (
                    <a
                      href={pelamar.cce_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 underline font-semibold hover:text-emerald-800 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 text-emerald-600 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Bukti Regis CCE Terlampir</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <button
                type="button"
                onClick={() => fetchApplications(pelamar?.id)}
                disabled={isRefreshing}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                title="Perbarui status lamaran terkini dari database"
              >
                <svg
                  className={`h-3.5 w-3.5 text-purple-600 ${isRefreshing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRefreshing ? "Menyegarkan..." : "Refresh Status"}</span>
              </button>

              <Link
                href="/pelamar/walk-in"
                className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5"
              >
                <span>+ Lamar Posisi Walk-In</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Ringkasan Metrik Pelamar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Total Dilamar</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{totalApplied}</div>
            <div className="mt-1 text-[11px] text-slate-500">Posisi terkirim</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Dalam Seleksi</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{inProgressCount}</div>
            <div className="mt-1 text-[11px] text-amber-700 font-medium">Screening &amp; Tes</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Wawancara Walk-In</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{interviewCount}</div>
            <div className="mt-1 text-[11px] text-blue-700 font-medium">Wawancara dijadwalkan</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Diterima / Offering</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700">{acceptedCount}</div>
            <div className="mt-1 text-[11px] text-emerald-700 font-medium">Lolos seleksi</div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DAFTAR LAMARAN & LIVE SELECTION STAGE TRACKER                   */}
        {/* ============================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Tahapan Proses Lamaran Anda</span>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 border border-purple-200 font-semibold">
                  {applications.length} Posisi
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Status seleksi di bawah ini terhubung langsung secara real-time dengan dashboard HR Mitra perusahaan.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Memuat data tahapan seleksi...
            </div>
          ) : applications.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">Belum Ada Lamaran yang Dikirimkan</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Anda belum mengirimkan lamaran ke perusahaan manapun. Pilih perusahaan impianmu dan kirim berkas melalui formulir Walk-In Interview sekarang!
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/pelamar/walk-in"
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
                >
                  + Mulai Formulir Walk-In Interview
                </Link>
                <Link
                  href="/#lowongan"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition"
                >
                  Jelajahi Lowongan di Expo
                </Link>
              </div>
            </div>
          ) : (
            /* Cards List of Applications */
            <div className="space-y-4">
              {applications.map((app) => {
                const currentStep = getStageStep(app.status);
                const isRejected = app.status === "rejected";
                const isAccepted = app.status === "accepted";
                const isInterview = app.status === "shortlisted" || app.status === "interview";

                return (
                  <div
                    key={app.id}
                    className={`rounded-3xl border p-5 sm:p-6 shadow-xs transition-all ${
                      isAccepted
                        ? "border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                        : isRejected
                        ? "border-rose-200 bg-white hover:border-rose-300 hover:shadow-sm"
                        : isInterview
                        ? "border-blue-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Top Job & Company Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3.5">
                        {app.company_logo ? (
                          <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 p-1 overflow-hidden shadow-xs flex items-center justify-center">
                            <img
                              src={app.company_logo}
                              alt={app.company_name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-sm font-bold text-white shadow-xs">
                            {app.company_name?.charAt(0) || "P"}
                          </div>
                        )}

                        <div>
                          <span className="text-xs text-slate-500 font-semibold block">
                            {app.company_name}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900">
                            {app.job_title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{app.employment_type}</span>
                            <span>•</span>
                            <span>{app.job_location || "Jakarta"}</span>
                            <span>•</span>
                            <span>
                              Dilamar pada{" "}
                              {new Date(app.applied_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {isRejected ? (
                          <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>Belum Memenuhi Syarat</span>
                          </span>
                        ) : isAccepted ? (
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Diterima / Offering</span>
                          </span>
                        ) : (
                          <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                            <span>{app.status_label}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* INTERACTIVE 4-STEP VISUAL PROGRESS TRACKER */}
                    <div className="py-5">
                      <div className="text-[11px] font-bold text-slate-700 mb-3 flex items-center justify-between">
                        <span>Progress Tahap Seleksi HR:</span>
                        <span className="text-slate-500 font-normal">
                          {isRejected ? "Tahapan Berhenti" : `Tahap ${currentStep} dari 4`}
                        </span>
                      </div>

                      {/* Stepper Bar Grid */}
                      <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {STAGES.map((s) => {
                          const isPastOrCurrent = currentStep >= s.step && !isRejected;
                          const isCurrentActive = currentStep === s.step && !isRejected;

                          return (
                            <div key={s.id} className="space-y-2">
                              {/* Pill Step Bar */}
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isPastOrCurrent
                                    ? "bg-purple-600 shadow-xs"
                                    : "bg-slate-200"
                                }`}
                              />
                              {/* Step Label */}
                              <div className="hidden sm:block">
                                <span
                                  className={`block text-[11px] ${
                                    isCurrentActive
                                      ? "text-purple-700 font-bold"
                                      : isPastOrCurrent
                                      ? "text-slate-800 font-medium"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {s.step}. {s.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Stepper Label */}
                      <div className="block sm:hidden text-xs font-bold text-purple-700 mt-2">
                        Sedang di: {app.status_label}
                      </div>
                    </div>

                    {/* KOTAK KHUSUS: UNDANGAN WAWANCARA (JIKA STATUS = INTERVIEW) */}
                    {isInterview && (
                      <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn shadow-xs">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </span>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-blue-900">
                              Undangan Wawancara / Walk-In Interview!
                            </h4>
                            <p className="text-xs text-blue-800">
                              Jadwal: <strong>{app.interview_date || "18–19 November 2026 (Booth CCE 2026)"}</strong>
                            </p>
                            {app.interview_notes && (
                              <p className="text-xs text-blue-900 italic bg-blue-100/60 p-2 rounded-lg border border-blue-200 mt-1">
                                Pesan dari HR: &ldquo;{app.interview_notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-blue-800 sm:text-right shrink-0">
                          <span className="block font-semibold">Tempat: Booth {app.company_name}</span>
                          <span className="block text-[11px] text-blue-600">Auditorium Harun Nasution</span>
                        </div>
                      </div>
                    )}

                    {/* KOTAK KHUSUS: DITERIMA / OFFERING */}
                    {isAccepted && (
                      <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex items-start gap-3 animate-fadeIn shadow-xs">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900">
                            Selamat! Anda Dinyatakan Lolos / Diterima! 🎉
                          </h4>
                          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                            Pihak HR dari {app.company_name} telah menyetujui berkas dan tahapan seleksi Anda. Tim rekruter akan segera menghubungi Anda melalui email atau WhatsApp untuk proses offering dan orientasi kerja.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* KOTAK KHUSUS: REJECTED */}
                    {isRejected && (
                      <div className="mt-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 flex items-start gap-3 shadow-xs">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-rose-900">
                            Status Seleksi Selesai
                          </h4>
                          <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                            Terima kasih atas antusiasme Anda. Saat ini kualifikasi Anda belum sesuai dengan kebutuhan posisi ini. Jangan berkecil hati, silakan melamar ke posisi dan perusahaan lain di Career Compass Expo 2026!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions on Card */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {app.cv_path && (
                          <a
                            href={app.cv_path}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-700 hover:text-purple-900 transition font-semibold flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Lihat CV Terkirim</span>
                          </a>
                        )}

                        {app.portfolio_url && (
                          <a
                            href={app.portfolio_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 hover:text-blue-900 transition font-semibold flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Portofolio</span>
                          </a>
                        )}
                      </div>

                      <Link
                        href={`/lowongan/${app.job_id}`}
                        target="_blank"
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-slate-700 hover:text-slate-900 transition font-bold shadow-xs"
                      >
                        Detail Lowongan ↗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        © 2026 Career Compass Expo — Pusat Pengembangan Karier UIN Syarif Hidayatullah Jakarta
      </footer>
    </div>
  );
}
