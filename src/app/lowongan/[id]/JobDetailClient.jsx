"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function JobDetailClient({ initialJob, jobId }) {
  const [job, setJob] = useState(initialJob);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggedInPelamar, setIsLoggedInPelamar] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cce_pelamar_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) setIsLoggedInPelamar(true);
        } catch {}
      }
    }
  }, []);

  // Jika lowongan tidak ditemukan
  if (!job) {
    return (
      <main className="min-h-screen bg-[#1E0C36] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full text-center rounded-3xl border border-white/10 bg-[#160A2C]/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-white">Lowongan Tidak Ditemukan</h1>
            <p className="mt-2 text-xs text-purple-200/70 leading-relaxed">
              Posisi lowongan yang Anda cari mungkin telah ditutup atau tidak lagi tersedia.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/#lowongan"
                className="w-full rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] py-2.5 text-xs font-bold text-white shadow-lg transition hover:scale-105"
              >
                Lihat Lowongan Lainnya
              </Link>
              <Link
                href="/"
                className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-purple-200 hover:bg-white/20 transition"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const companyName = job.company_name || job.companies?.name || "Perusahaan Rekanan";
  const companyLogo = job.company_logo || job.companies?.logo_url || "";
  const companyIndustry = job.company_industry || "";
  const companyAddress = job.company_address || "";
  const companyBio = job.company_bio || "";
  const companyWebsite = job.company_website || job.companies?.website || "";
  const posterUrl = job.poster_url || "";
  const hasLogo = Boolean(companyLogo);
  const companyInitial = companyName.charAt(0).toUpperCase();

  // Helper untuk memformat teks list (requirements & description)
  function formatListItems(text) {
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => item.replace(/^[-*•]\s*/, ""));
  }

  const requirementsList = formatListItems(job.requirements);
  const descriptionList = formatListItems(job.description);

  function handleCopyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const walkInTarget = `/pelamar/walk-in?job=${encodeURIComponent(job.id)}&company=${encodeURIComponent(job.company_id || "")}`;
  const applyUrl = isLoggedInPelamar
    ? walkInTarget
    : `/pelamar?redirect=${encodeURIComponent(walkInTarget)}&job=${encodeURIComponent(job.id)}&company=${encodeURIComponent(job.company_id || "")}`;
  const shareWaText = encodeURIComponent(
    `Halo! Ada lowongan menarik "${job.title}" di ${companyName} pada Career Compass Expo 2026 UIN Jakarta. Cek detail dan kirim lamaran di: ${typeof window !== "undefined" ? window.location.href : ""}`
  );

  function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate) return null;
    const options = { day: "numeric", month: "short", year: "numeric" };
    const s = startDate ? new Date(startDate).toLocaleDateString("id-ID", options) : "";
    const e = endDate ? new Date(endDate).toLocaleDateString("id-ID", options) : "";
    if (s && e) return `${s} — ${e}`;
    if (e) return `Batas: ${e}`;
    return `Mulai: ${s}`;
  }

  const dateRangeStr = formatDateRange(job.start_date, job.end_date);
  const isExpired = Boolean(job.is_expired);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-100 selection:text-purple-900">
      {/* Navbar Global */}
      <Navbar />

      {/* Breadcrumb & Navigation Bar */}
      <section className="border-b border-slate-200 bg-white px-4 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs">
          <Link
            href="/#lowongan"
            className="inline-flex items-center gap-1.5 font-bold text-purple-600 hover:text-purple-800 transition group"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Daftar Lowongan</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 font-medium">
            <Link href="/" className="hover:text-purple-600 transition">Beranda</Link>
            <span>/</span>
            <Link href="/#lowongan" className="hover:text-purple-600 transition">Lowongan</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">{job.title}</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ============================================================== */}
          {/* KOLOM KIRI: POSTER FLYER & INFO PERUSAHAAN (SESUAI CONTOH GAMBAR 2) */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Poster Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-xs transition duration-300 hover:border-purple-300 hover:shadow-md">
              {posterUrl ? (
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={posterUrl}
                    alt={`Brosur Lowongan ${job.title} - ${companyName}`}
                    className="w-full h-auto object-cover max-h-[640px] rounded-2xl transition duration-300 group-hover:scale-[1.02]"
                    loading="eager"
                  />
                  {/* Overlay Action Zoom */}
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-lg border border-slate-700 transition hover:bg-slate-900 hover:scale-105 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    <span>Perbesar Poster</span>
                  </button>
                </div>
              ) : (
                /* Poster Placeholder Tematik CCE */
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-slate-50 to-purple-100/70 p-8 text-center border border-purple-200 min-h-[380px] flex flex-col justify-between items-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-black uppercase tracking-wider text-purple-700 border border-purple-200 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Career Compass Expo 2026</span>
                  </div>

                  {/* Center Content */}
                  <div className="my-8 space-y-4">
                    {hasLogo ? (
                      <div className="mx-auto h-20 w-20 rounded-2xl bg-white p-2.5 shadow-sm border border-slate-200 flex items-center justify-center">
                        <img src={companyLogo} alt={companyName} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7226FF] to-[#EF17D8] text-2xl font-black text-white shadow-md">
                        {companyInitial}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 leading-snug">{job.title}</h3>
                      <p className="text-sm font-semibold text-slate-600 mt-1">{companyName}</p>
                    </div>
                  </div>

                  {/* Bottom Note */}
                  <div className="rounded-xl bg-white border border-purple-100 px-4 py-2 text-[11px] text-purple-700 font-medium shadow-2xs">
                    Poster flyer resmi terlampir pada profil lowongan
                  </div>
                </div>
              )}
            </div>

            {/* Profil Perusahaan Singkat Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                {hasLogo ? (
                  <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 p-1.5 shrink-0 overflow-hidden shadow-2xs">
                    <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-base font-black text-white shrink-0 shadow-2xs">
                    {companyInitial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">{companyName}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mitra Terverifikasi CCE</span>
                    </span>
                  </div>
                </div>
              </div>

              {companyBio && (
                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {companyBio}
                </p>
              )}

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                {companyIndustry && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span><strong>Sektor:</strong> {companyIndustry}</span>
                  </div>
                )}
                {companyAddress && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span><strong>Lokasi Kantor:</strong> {companyAddress}</span>
                  </div>
                )}
                {companyWebsite && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a
                      href={companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline font-semibold flex items-center gap-1"
                    >
                      <span>Kunjungi Website Resmi</span>
                      <span>↗</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Share & Copy Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${shareWaText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 py-2 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share WA</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      <span>Salin Tautan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* KOLOM KANAN: DETAIL REQUIREMENTS, DESKRIPSI, APPLY (SESUAI GAMBAR 2) */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Posisi & Ringkasan Tag */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-purple-50 px-3.5 py-1 text-xs font-black tracking-wide text-purple-700 border border-purple-200">
                  {job.employment_type || "Full-time"}
                </span>

                {isExpired ? (
                  <span className="rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Pendaftaran Ditutup / Kedaluwarsa</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Siap Menerima Lamaran</span>
                  </span>
                )}

                {job.quota && (
                  <span className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Kuota: {job.quota} Posisi</span>
                  </span>
                )}

                {dateRangeStr && (
                  <span className="rounded-full bg-fuchsia-50 px-3.5 py-1 text-xs font-semibold text-fuchsia-700 border border-fuchsia-200 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Periode: {dateRangeStr}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {job.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <span>{companyName}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{job.location || "Jakarta (Hybrid)"}</span>
                </span>
              </div>
            </div>

            {/* Expired Warning Banner jika sudah melewati batas tanggal */}
            {isExpired && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-start gap-3 shadow-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-rose-900 block text-sm mb-0.5">Periode Pendaftaran Lowongan Telah Berakhir</span>
                  Lowongan posisi ini telah melewati batas waktu pendaftaran ({dateRangeStr || "jadwal yang ditentukan"}). Pendaftaran telah ditutup otomatis dan lowongan ini tidak lagi menerima berkas pelamar baru.
                </div>
              </div>
            )}

            {/* CARD 1: REQUIREMENTS (PERSYARATAN & KUALIFIKASI) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Requirements</h2>
                  <p className="text-xs text-slate-500">Kualifikasi &amp; Persyaratan Kandidat</p>
                </div>
              </div>

              <div className="mt-6">
                {requirementsList.length > 0 ? (
                  <ul className="space-y-3.5">
                    {requirementsList.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 border border-purple-200 text-purple-600 mt-0.5">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    {job.requirements || "Kualifikasi umum sesuai standar perusahaan rekanan."}
                  </p>
                )}
              </div>
            </div>

            {/* CARD 2: JOB DESCRIPTIONS (DESKRIPSI TUGAS & TANGGUNG JAWAB) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Job Descriptions</h2>
                  <p className="text-xs text-slate-500">Uraian Tugas &amp; Tanggung Jawab Posisi</p>
                </div>
              </div>

              <div className="mt-6">
                {descriptionList.length > 0 ? (
                  <ul className="space-y-3.5">
                    {descriptionList.map((desc, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                        <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500 mt-2" />
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {job.description || "Uraian tugas akan dijelaskan lebih lanjut saat proses seleksi berkas & wawancara."}
                  </p>
                )}
              </div>
            </div>

            {/* CARD 3: TOMBOL APPLY NOW */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                    {isExpired ? (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </span>
                        <span>Periode Pendaftaran Telah Berakhir</span>
                      </>
                    ) : (
                      "Tertarik Mengisi Posisi Ini?"
                    )}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                    {isExpired
                      ? "Batas waktu pendaftaran untuk lowongan ini telah lewat. Lowongan ini diarsipkan dan tidak lagi menerima kiriman berkas baru."
                      : "Kirim berkas lamaran dan CV Anda sekarang. Lamaran akan langsung terhubung ke dashboard HR mitra di Career Compass Expo 2026."}
                  </p>
                </div>

                {isExpired ? (
                  <button
                    type="button"
                    disabled
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 px-8 py-4 text-sm font-bold uppercase tracking-wider text-slate-400 cursor-not-allowed shadow-inner"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Pendaftaran Ditutup</span>
                  </button>
                ) : (
                  <Link
                    href={applyUrl}
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-md shadow-purple-600/20 transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    <span>Lamar Sekarang</span>
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL UNTUK PERBESAR POSTER */}
      {lightboxOpen && posterUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[95vh] overflow-hidden rounded-2xl border border-white/20 bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-950">
              <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                Brosur: {job.title} — {companyName}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[85vh] flex items-center justify-center">
              <img
                src={posterUrl}
                alt={`Poster Lengkap ${job.title}`}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Global */}
      <footer className="mt-16 border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <span>© 2026 Career Compass Expo — UIN Syarif Hidayatullah Jakarta</span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <Link
              href="/#lowongan"
              className="text-purple-600 hover:text-purple-800 transition-colors font-semibold"
            >
              Semua Lowongan
            </Link>
            <div className="flex items-center">
              <span>Dev by&nbsp;</span>
              <a
                href="https://www.instagram.com/satriaalbantanii"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#EF17D8] hover:text-purple-700 hover:underline transition-colors"
              >
                Sultan Satria
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
