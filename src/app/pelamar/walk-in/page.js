"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function WalkInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("job") || "";
  const initialCompanyId = searchParams.get("company") || "";

  // Session Pelamar
  const [pelamar, setPelamar] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Data Perusahaan & Lowongan
  const [companies, setCompanies] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Stepper Form (1 = Pilih Perusahaan [Gambar 2], 2 = Pilih Posisi & Upload CV [Gambar 3])
  const [step, setStep] = useState(1);

  // Form Fields
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [applicantNotes, setApplicantNotes] = useState("");

  // Upload CV State
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [cvFileSize, setCvFileSize] = useState(0);
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  // Form Submitting & Toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // 1. Cek Sesi Pelamar dari localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cce_pelamar_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPelamar(parsed);
        } catch {
          setPelamar(null);
        }
      }
      setIsCheckingSession(false);
    }
  }, []);

  // 2. Fetch Opsi Perusahaan & Lowongan
  useEffect(() => {
    async function fetchOptions() {
      setIsLoadingOptions(true);
      try {
        const res = await fetch("/api/pelamar/walkin-options");
        const data = await res.json();
        if (res.ok && Array.isArray(data.companies)) {
          setCompanies(data.companies);

          // Jika ada initialCompanyId atau initialJobId, auto-select
          if (initialCompanyId) {
            setSelectedCompanyId(initialCompanyId);
            if (initialJobId) {
              setSelectedJobId(initialJobId);
              setStep(2); // langsung ke langkah 2 jika datang dari halaman lowongan
            }
          } else if (initialJobId) {
            // Cari company id berdasarkan job id
            const matchedComp = data.companies.find((c) =>
              c.jobs.some((j) => j.id === initialJobId)
            );
            if (matchedComp) {
              setSelectedCompanyId(matchedComp.id);
              setSelectedJobId(initialJobId);
              setStep(2);
            }
          }
        }
      } catch (err) {
        console.error("Gagal fetch walkin options:", err);
      } finally {
        setIsLoadingOptions(false);
      }
    }
    fetchOptions();
  }, [initialCompanyId, initialJobId]);

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  }

  // Dapatkan detail perusahaan terpilih
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || null;
  // Lowongan untuk perusahaan terpilih
  const availableJobs = selectedCompany ? selectedCompany.jobs || [] : [];
  // Detail lowongan terpilih
  const selectedJob = availableJobs.find((j) => j.id === selectedJobId) || null;

  // Handle Pilih File CV (PDF, DOC, DOCX, PNG, JPG maks 10MB)
  async function handleCvChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedMime.includes(file.type)) {
      showToast("Format file tidak didukung. Harap pilih dokumen PDF, DOC, DOCX, atau gambar PNG/JPG.");
      e.target.value = "";
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      showToast("Ukuran berkas CV melebihi batas maksimal 10MB!");
      e.target.value = "";
      return;
    }

    setCvFile(file);
    setCvFileName(file.name);
    setCvFileSize(file.size);
    setIsUploadingCv(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("participant_id", pelamar?.id || "guest");

      const res = await fetch("/api/pelamar/upload-cv", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah CV.");

      setCvUrl(data.url);
      showToast("Berkas CV berhasil diunggah!");
    } catch (err) {
      showToast(`Gagal unggah: ${err.message}`);
      setCvFile(null);
      setCvFileName("");
    } finally {
      setIsUploadingCv(false);
    }
  }

  function handleRemoveCv() {
    setCvFile(null);
    setCvUrl("");
    setCvFileName("");
    setCvFileSize(0);
  }

  // Handle Next ke Step 2 (Gambar 2 -> Gambar 3)
  function handleNextStep() {
    if (!selectedCompanyId) {
      setErrorMsg("Harap pilih salah satu perusahaan yang Anda minati.");
      return;
    }
    setErrorMsg("");
    // Jika belum pilih posisi di perusahaan tersebut, pilih yang pertama
    if (!selectedJobId || !availableJobs.some((j) => j.id === selectedJobId)) {
      if (availableJobs.length > 0) {
        setSelectedJobId(availableJobs[0].id);
      }
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Handle Submit Lamaran Walk-In Interview
  async function handleSubmitApplication(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!pelamar) {
      setErrorMsg("Anda harus masuk ke akun pelamar terlebih dahulu untuk mengirimkan lamaran.");
      return;
    }

    if (!selectedCompanyId) {
      setErrorMsg("Harap pilih perusahaan tujuan.");
      setStep(1);
      return;
    }

    if (!selectedJobId) {
      setErrorMsg("Harap pilih posisi pekerjaan yang Anda inginkan.");
      return;
    }

    if (!cvUrl) {
      setErrorMsg("Harap unggah berkas CV Anda terlebih dahulu.");
      return;
    }

    if (isUploadingCv) {
      showToast("Sedang mengunggah berkas CV, mohon tunggu sebentar...");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/pelamar/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: pelamar.id,
          job_id: selectedJobId,
          cv_path: cvUrl,
          portfolio_url: portfolioUrl || null,
          notes: applicantNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim formulir lamaran.");

      showToast("Lamaran Walk-In Interview berhasil dikirim!");

      // Arahkan ke dashboard pelamar
      setTimeout(() => {
        router.push("/pelamar/dashboard?submitted=true");
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0E041A] text-white selection:bg-[#EF17D8] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none fixed -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#7226FF]/15 blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-[#EF17D8]/15 blur-[140px]" />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce rounded-2xl border border-white/20 bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-xl">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#170A2D]/95 px-4 sm:px-8 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-22 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
              <img
                src="/images/logo-puskar.png"
                alt="Pusat Karier UIN Jakarta"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-base font-black tracking-tight hidden sm:inline">
              CCE<span className="text-[#EF17D8]"> 2026</span>
            </span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4 text-xs">
            {pelamar ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-purple-200/80 font-medium">
                  Masuk sebagai: <strong>{pelamar.full_name}</strong>
                </span>
                <Link
                  href="/pelamar/dashboard"
                  className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/15 px-3 py-1.5 font-bold text-fuchsia-300 hover:bg-fuchsia-500/25 transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Dashboard Saya</span>
                </Link>
              </div>
            ) : (
              <Link
                href={`/pelamar?redirect=${encodeURIComponent(
                  `/pelamar/walk-in?company=${selectedCompanyId}&job=${selectedJobId}`
                )}`}
                className="rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-3.5 py-1.5 font-bold text-white shadow-md hover:scale-105 transition"
              >
                Masuk / Daftar Akun
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl w-full px-4 py-8 sm:py-12 z-10 flex-1">
        {/* Banner Alert Jika Belum Login */}
        {!isCheckingSession && !pelamar && (
          <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <span>
                <strong>Perhatian:</strong> Anda belum masuk ke akun pelamar. Anda dapat memilih perusahaan dan mengisi formulir sekarang, namun silakan daftar/masuk agar lamaran dapat terhubung ke dashboard Anda.
              </span>
            </div>
            <Link
              href={`/pelamar?redirect=${encodeURIComponent(
                `/pelamar/walk-in?company=${selectedCompanyId}&job=${selectedJobId}`
              )}`}
              className="shrink-0 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition"
            >
              Masuk / Daftar Sekarang
            </Link>
          </div>
        )}

        {/* Title Header Form Walk In Interview */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#2D1252] via-[#1F0C3B] to-[#140827] p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-0.5 text-[10px] font-extrabold text-fuchsia-300 border border-purple-500/30 uppercase tracking-widest">
                Official Walk-In Interview Form
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Formulir Pendaftaran Walk-In Interview
              </h1>
              <p className="text-xs text-purple-200/70 leading-relaxed max-w-xl">
                Career Compass Expo 2026 — Auditorium Harun Nasution UIN Jakarta.
                Lamaran akan langsung masuk ke dashboard HR mitra untuk proses seleksi &amp; jadwal wawancara langsung di booth.
              </p>
            </div>

            {/* Step Progress Pill */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 shrink-0">
              <span className="text-[11px] font-bold text-purple-300">
                Tahap {step} dari 2
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2.5 w-7 rounded-full transition-all ${step >= 1 ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8]" : "bg-white/20"}`} />
                <span className={`h-2.5 w-7 rounded-full transition-all ${step >= 2 ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8]" : "bg-white/20"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 1: PERUSAHAAN YANG KAMU MINATI (PERSIS GAMBAR 2)      */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="rounded-3xl border border-white/15 bg-[#170A2D]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6">
            <div className="pb-4 border-b border-white/10">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Perusahaan yang kamu minati:</span>
                <span className="text-rose-400">*</span>
              </h2>
              <p className="text-xs text-purple-300/70 mt-1">
                Pilih salah satu perusahaan rekanan CCE 2026 yang ingin Anda tuju untuk proses walk-in interview.
              </p>
            </div>

            {isLoadingOptions ? (
              <div className="py-12 text-center text-xs text-purple-300/60">
                Memuat daftar perusahaan mitra...
              </div>
            ) : companies.length === 0 ? (
              <div className="py-10 text-center text-xs text-purple-300/70">
                Belum ada perusahaan mitra dengan lowongan aktif saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {companies.map((comp) => {
                  const isChecked = selectedCompanyId === comp.id;
                  return (
                    <label
                      key={comp.id}
                      onClick={() => setSelectedCompanyId(comp.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? "border-fuchsia-500 bg-gradient-to-r from-purple-900/40 to-fuchsia-900/30 shadow-lg shadow-purple-900/30 scale-[1.01]"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Radio indicator */}
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                            isChecked
                              ? "border-fuchsia-400 bg-fuchsia-500"
                              : "border-purple-300/40 bg-white/5"
                          }`}
                        >
                          {isChecked && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>

                        {/* Logo Perusahaan jika ada */}
                        {comp.logo_url ? (
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-white p-1 overflow-hidden shadow-xs flex items-center justify-center">
                            <img
                              src={comp.logo_url}
                              alt={comp.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-xs font-bold text-white">
                            {comp.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className="block text-sm font-bold text-white truncate">
                            {comp.name}
                          </span>
                          {comp.industry && (
                            <span className="block text-[11px] text-purple-300/60 truncate">
                              {comp.industry}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge kuantitas posisi */}
                      <span className="shrink-0 ml-3 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                        {comp.total_jobs} Posisi
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Bottom Controls Langkah 1 */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedCompanyId("")}
                className="text-xs font-semibold text-purple-300/70 hover:text-white transition"
              >
                Kosongkan pilihan
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedCompanyId}
                className="rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-fuchsia-600/30 transition hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <span>Berikutnya</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 2: POSISI SESUAI PERUSAHAAN & CV (PERSIS GAMBAR 3)     */}
        {/* ============================================================== */}
        {step === 2 && (
          <form
            onSubmit={handleSubmitApplication}
            className="rounded-3xl border border-white/15 bg-[#170A2D]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6"
          >
            {/* Header Perusahaan Terpilih (Sesuai Banner Cyan / Biru di Gambar 3) */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-purple-950/50 to-purple-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedCompany?.logo_url ? (
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 overflow-hidden shadow-xs flex items-center justify-center">
                    <img
                      src={selectedCompany.logo_url}
                      alt={selectedCompany.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
                    {selectedCompany?.name?.charAt(0) || "P"}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-black text-white">
                    {selectedCompany?.name || "Perusahaan Rekanan"}
                  </h2>
                  <p className="text-xs text-cyan-200/80">
                    {selectedCompany?.industry || "Partner Rekrutmen CCE 2026"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="shrink-0 text-xs font-bold text-purple-300 hover:text-white transition flex items-center gap-1 underline underline-offset-4"
              >
                <span>Ganti Perusahaan</span>
              </button>
            </div>

            {/* SEKSI 0: Ringkasan Profil Pelamar */}
            {pelamar && (
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>Pelamar: <strong>{pelamar.full_name}</strong></span>
                  </span>
                  <span className="text-[10px] text-fuchsia-300 font-mono">
                    {pelamar.registration_number || "CCE2026-ONLINE"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-white/5">
                  <div className="rounded-xl bg-white/5 p-2">
                    <span className="text-[10px] text-purple-300/70 block">Usia</span>
                    <span className="font-semibold text-white">{pelamar.age ? `${pelamar.age} Thn` : "-"}</span>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2">
                    <span className="text-[10px] text-purple-300/70 block">IPK Terakhir</span>
                    <span className="font-semibold text-amber-300">{pelamar.gpa || "-"}</span>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2">
                    <span className="text-[10px] text-purple-300/70 block">Kelulusan</span>
                    <span className="font-semibold text-white truncate block">{pelamar.graduation_year || "-"}</span>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2">
                    <span className="text-[10px] text-purple-300/70 block">Bukti Regis CCE</span>
                    <span className="font-semibold text-emerald-300 truncate block">
                      {pelamar.cce_proof_url ? "✓ Terlampir" : "Belum diunggah"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 1: Posisi yang diinginkan * (Radio List sesuai Gambar 3) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-white">
                  Posisi yang diinginkan <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-purple-300/70">
                  {availableJobs.length} posisi tersedia
                </span>
              </div>

              {availableJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-purple-300/70">
                  Belum ada posisi lowongan yang dibuka oleh perusahaan ini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {availableJobs.map((job) => {
                    const isSelected = selectedJobId === job.id;
                    return (
                      <label
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`flex items-start justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? "border-fuchsia-500 bg-purple-900/40 shadow-md"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`flex h-4 w-4 shrink-0 mt-0.5 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? "border-fuchsia-400 bg-fuchsia-500"
                                : "border-purple-300/40 bg-white/5"
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="block text-xs sm:text-sm font-bold text-white">
                              {job.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-purple-300/70 mt-0.5">
                              <span>{job.employment_type || "Full-time"}</span>
                              <span>•</span>
                              <span>{job.location || "Jakarta"}</span>
                              {job.quota && (
                                <>
                                  <span>•</span>
                                  <span>Kuota: {job.quota}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/lowongan/${job.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-fuchsia-400 hover:text-fuchsia-300 shrink-0 font-semibold underline mt-0.5"
                          title="Lihat kualifikasi lengkap posisi ini"
                        >
                          Lihat Kualifikasi ↗
                        </Link>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEKSI 2: Masukkan CV * (Upload Berkas Gambar 3) */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-white">
                  Masukkan CV <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-purple-300/70">
                  Maks. 10 MB (PDF, DOC, DOCX, PNG, JPG)
                </span>
              </div>

              {cvUrl ? (
                /* Card Preview CV Terunggah */
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                        {cvFileName || "CV_Pelamar.pdf"}
                      </span>
                      <span className="block text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Berkas berhasil diunggah</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-purple-200 hover:bg-white/20 transition"
                    >
                      Buka
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveCv}
                      className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60 transition cursor-pointer"
                    >
                      Ganti
                    </button>
                  </div>
                </div>
              ) : (
                /* Box Upload Berkas Kosong */
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center cursor-pointer hover:border-fuchsia-400 hover:bg-fuchsia-500/5 transition group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 text-fuchsia-400 group-hover:scale-110 transition">
                    {isUploadingCv ? (
                      <svg className="w-6 h-6 animate-spin text-fuchsia-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                  </div>

                  <div className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition">
                    {isUploadingCv ? "Mengunggah berkas CV ke server..." : "Tambahkan Berkas CV"}
                  </div>
                  <div className="text-[11px] text-purple-300/60">
                    Klik untuk memilih berkas dari perangkat (Maks. 10 MB)
                  </div>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                    onChange={handleCvChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* SEKSI 3: Tautan Portofolio (Opsional) */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
              <label className="block font-bold text-purple-200">
                Tautan Portofolio / LinkedIn / GitHub <span className="text-purple-400/60 font-normal">(Opsional)</span>
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://linkedin.com/in/... atau tautan portofolio online"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
              />
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-purple-200 hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>← Kembali</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !selectedJobId || !cvUrl || isUploadingCv}
                className="rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-fuchsia-600/30 transition hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Mengirimkan Lamaran...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Lamaran Walk-In Interview</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer Mini */}
      <footer className="border-t border-white/10 py-4 text-center text-xs text-purple-300/50">
        © 2026 Career Compass Expo — Walk-In Interview Registration Portal
      </footer>
    </div>
  );
}

export default function WalkInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0E041A] flex items-center justify-center text-purple-300 text-sm">
          Memuat formulir walk-in interview...
        </div>
      }
    >
      <WalkInFormContent />
    </Suspense>
  );
}
