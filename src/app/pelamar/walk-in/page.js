"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function WalkInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("job") || "";
  const initialCompanyId = searchParams.get("company") || "";
  const initialType = searchParams.get("type") === "walkin" ? "walkin" : "regular";

  // Mode Formulir: 'regular' (Formulir Pendaftaran Lamaran Pekerjaan) atau 'walkin' (Formulir Pendaftaran Walk-In Interview)
  const [formType, setFormType] = useState(initialType);

  // Session Pelamar
  const [pelamar, setPelamar] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Data Perusahaan & Lowongan
  const [companies, setCompanies] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Stepper Form (1 = Pilih Perusahaan, 2 = Pilih Posisi & Upload CV)
  const [step, setStep] = useState(1);

  // Form Fields
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [interviewDay, setInterviewDay] = useState("Rabu"); // "Rabu" | "Kamis"
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

          // Jika ada initialJobId, tentukan formType otomatis sesuai status lowongan
          if (initialJobId) {
            let foundJob = null;
            let foundCompany = null;
            data.companies.forEach((c) => {
              const match = (c.jobs || []).find((j) => j.id === initialJobId);
              if (match) {
                foundJob = match;
                foundCompany = c;
              }
            });
            if (foundJob) {
              if (foundJob.is_walk_in && !searchParams.get("type")) {
                setFormType("walkin");
              } else if (!foundJob.is_walk_in && !searchParams.get("type")) {
                setFormType("regular");
              }
              if (foundCompany) {
                setSelectedCompanyId(foundCompany.id);
                setSelectedJobId(foundJob.id);
                setStep(2);
              }
            }
          } else if (initialCompanyId) {
            setSelectedCompanyId(initialCompanyId);
          }
        }
      } catch (err) {
        console.error("Gagal fetch walkin options:", err);
      } finally {
        setIsLoadingOptions(false);
      }
    }
    fetchOptions();
  }, [initialCompanyId, initialJobId, searchParams]);

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  }

  // Switcher Mode Formulir: 'regular' vs 'walkin'
  function handleSwitchFormType(newType) {
    if (newType === formType) return;
    setFormType(newType);
    setErrorMsg("");

    // Periksa apakah perusahaan saat ini memiliki lowongan di mode baru
    const compValid = companies.some((c) => {
      if (c.id !== selectedCompanyId) return false;
      const relevantJobs = newType === "walkin"
        ? (c.jobs || []).filter((j) => j.is_walk_in)
        : (c.jobs || []);
      return relevantJobs.length > 0;
    });

    if (!compValid) {
      setSelectedCompanyId("");
      setSelectedJobId("");
      setStep(1);
    } else {
      const targetComp = companies.find((c) => c.id === selectedCompanyId);
      const relevantJobs = newType === "walkin"
        ? (targetComp?.jobs || []).filter((j) => j.is_walk_in)
        : (targetComp?.jobs || []);
      if (!relevantJobs.some((j) => j.id === selectedJobId)) {
        if (relevantJobs.length > 0) {
          setSelectedJobId(relevantJobs[0].id);
        } else {
          setSelectedJobId("");
          setStep(1);
        }
      }
    }
  }

  // Saring perusahaan & lowongan sesuai mode formulir yang aktif
  const availableCompanies = companies
    .map((c) => {
      const modeJobs = formType === "walkin"
        ? (c.jobs || []).filter((j) => j.is_walk_in)
        : (c.jobs || []);
      return {
        ...c,
        jobs: modeJobs,
        total_jobs: modeJobs.length,
      };
    })
    .filter((c) => c.jobs.length > 0);

  // Dapatkan detail perusahaan terpilih
  const selectedCompany = availableCompanies.find((c) => c.id === selectedCompanyId) || null;
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
          interview_day: interviewDay,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim formulir lamaran.");

      showToast(
        formType === "walkin"
          ? "Lamaran Walk-In Interview berhasil dikirim!"
          : "Lamaran Pekerjaan berhasil dikirim!"
      );

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
    <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100 selection:text-purple-900 flex flex-col justify-between overflow-x-hidden">
      {/* Background Decorative Subtle Glow */}
      <div className="pointer-events-none fixed -left-40 top-20 h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-fuchsia-200/30 blur-[140px]" />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce rounded-2xl border border-purple-200 bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-xl">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 sm:px-8 py-3.5 backdrop-blur-md shadow-2xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-22 items-center justify-center rounded-lg bg-white p-1 border border-slate-100 shadow-xs">
              <img
                src="/images/logo-puskar.png"
                alt="Pusat Karier UIN Jakarta"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900 hidden sm:inline">
              CCE<span className="text-[#EF17D8]"> 2026</span>
            </span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4 text-xs">
            {pelamar ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-slate-600 font-medium">
                  Masuk sebagai: <strong className="text-slate-900">{pelamar.full_name}</strong>
                </span>
                <Link
                  href="/pelamar/dashboard"
                  className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 font-bold text-purple-700 hover:bg-purple-100 transition flex items-center gap-1.5"
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
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
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
              className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition"
            >
              Masuk / Daftar Sekarang
            </Link>
          </div>
        )}

        {/* Pilihan Jenis Formulir Pendaftaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSwitchFormType("regular")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              formType === "regular"
                ? "border-purple-300 bg-white shadow-md ring-2 ring-purple-500/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${formType === "regular" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-500"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-extrabold text-sm sm:text-base ${formType === "regular" ? "text-purple-900" : "text-slate-900"}`}>
                  Formulir Lamaran Pekerjaan
                </span>
                {formType === "regular" && (
                  <span className="rounded-full bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 shrink-0">Dipilih</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pendaftaran lamaran pekerjaan reguler / online untuk peninjauan berkas mitra expo.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchFormType("walkin")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              formType === "walkin"
                ? "border-purple-300 bg-white shadow-md ring-2 ring-purple-500/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${formType === "walkin" ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs" : "bg-slate-100 text-slate-500"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-extrabold text-sm sm:text-base ${formType === "walkin" ? "text-purple-900" : "text-slate-900"}`}>
                  Formulir Walk-In Interview
                </span>
                {formType === "walkin" && (
                  <span className="rounded-full bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white text-[10px] font-bold px-2 py-0.5 shrink-0">Dipilih</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pendaftaran wawancara langsung di booth expo UIN Jakarta (khusus posisi pilihan admin).
              </p>
            </div>
          </button>
        </div>

        {/* Title Header Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-0.5 text-[10px] font-extrabold text-purple-700 border border-purple-200 uppercase tracking-widest">
                {formType === "walkin" ? "Official Walk-In Interview Form" : "Official Job Application Form"}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {formType === "walkin"
                  ? "Formulir Pendaftaran Walk-In Interview"
                  : "Formulir Pendaftaran Lamaran Pekerjaan"}
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {formType === "walkin"
                  ? "Career Compass Expo 2026 — Auditorium Harun Nasution UIN Jakarta. Lamaran akan langsung masuk ke dashboard HR mitra untuk proses seleksi & jadwal wawancara langsung di booth."
                  : "Career Compass Expo 2026. Lamaran Anda akan dikirim langsung ke tim rekrutmen mitra perusahaan untuk peninjauan berkas secara online."}
              </p>
            </div>

            {/* Step Progress Pill */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
              <span className="text-[11px] font-bold text-purple-700">
                Tahap {step} dari 2
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2.5 w-7 rounded-full transition-all ${step >= 1 ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8]" : "bg-slate-200"}`} />
                <span className={`h-2.5 w-7 rounded-full transition-all ${step >= 2 ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8]" : "bg-slate-200"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn">
            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 1: PERUSAHAAN YANG KAMU MINATI                         */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs animate-fadeIn space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Perusahaan yang kamu minati:</span>
                <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {formType === "walkin"
                  ? "Pilih salah satu perusahaan rekanan CCE 2026 yang membuka posisi walk-in interview (khusus pilihan admin)."
                  : "Pilih salah satu perusahaan rekanan CCE 2026 yang membuka lowongan pekerjaan."}
              </p>
            </div>

            {isLoadingOptions ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Memuat daftar perusahaan mitra...
              </div>
            ) : availableCompanies.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-600 space-y-3">
                <p>
                  {formType === "walkin"
                    ? "Belum ada posisi lowongan yang diaktifkan untuk Walk-In Interview oleh admin expo saat ini."
                    : "Belum ada perusahaan mitra dengan lowongan aktif saat ini."}
                </p>
                {formType === "walkin" && (
                  <button
                    type="button"
                    onClick={() => handleSwitchFormType("regular")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                  >
                    <span>Beralih ke Formulir Lamaran Pekerjaan Reguler</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {availableCompanies.map((comp) => {
                  const isChecked = selectedCompanyId === comp.id;
                  return (
                    <label
                      key={comp.id}
                      onClick={() => setSelectedCompanyId(comp.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? "border-purple-500 bg-purple-50/60 shadow-sm ring-1 ring-purple-500/20 scale-[1.01]"
                          : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Radio indicator */}
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                            isChecked
                              ? "border-purple-600 bg-purple-600"
                              : "border-slate-300 bg-slate-50"
                          }`}
                        >
                          {isChecked && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>

                        {/* Logo Perusahaan jika ada */}
                        {comp.logo_url ? (
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-white p-1 border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center">
                            <img
                              src={comp.logo_url}
                              alt={comp.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-xs font-bold text-white shadow-2xs">
                            {comp.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className={`block text-sm font-bold truncate ${isChecked ? "text-purple-950" : "text-slate-900"}`}>
                            {comp.name}
                          </span>
                          {comp.industry && (
                            <span className="block text-[11px] text-slate-500 truncate">
                              {comp.industry}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge kuantitas posisi */}
                      <span className={`shrink-0 ml-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        isChecked
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {comp.total_jobs} Posisi {formType === "walkin" ? "Walk-In" : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Bottom Controls Langkah 1 */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedCompanyId("")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                Kosongkan pilihan
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedCompanyId}
                className="rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/20 transition hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center justify-center"
              >
                <span>Berikutnya</span>
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
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs animate-fadeIn space-y-6"
          >
            {/* Header Perusahaan Terpilih (Sesuai Banner di Gambar 3) */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedCompany?.logo_url ? (
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center">
                    <img
                      src={selectedCompany.logo_url}
                      alt={selectedCompany.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-sm font-bold text-white shadow-2xs">
                    {selectedCompany?.name?.charAt(0) || "P"}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {selectedCompany?.name || "Perusahaan Rekanan"}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {selectedCompany?.industry || "Partner Rekrutmen CCE 2026"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="shrink-0 text-xs font-bold text-purple-700 hover:text-purple-900 transition flex items-center gap-1 underline underline-offset-4 cursor-pointer"
              >
                <span>Ganti Perusahaan</span>
              </button>
            </div>

            {/* SEKSI 0: Ringkasan Profil Pelamar */}
            {pelamar && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Pelamar: <strong>{pelamar.full_name}</strong></span>
                  </span>
                  <span className="text-[10px] text-purple-700 font-mono font-bold">
                    {pelamar.registration_number || "CCE2026-ONLINE"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-200">
                  <div className="rounded-xl bg-white border border-slate-200 p-2 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">Usia</span>
                    <span className="font-semibold text-slate-900">{pelamar.age ? `${pelamar.age} Thn` : "-"}</span>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-2 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">IPK Terakhir</span>
                    <span className="font-semibold text-purple-700">{pelamar.gpa || "-"}</span>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-2 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">Kelulusan</span>
                    <span className="font-semibold text-slate-900 truncate block">{pelamar.graduation_year || "-"}</span>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-2 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">Bukti Regis CCE</span>
                    <span className="font-semibold text-emerald-700 truncate block">
                      {pelamar.cce_proof_url ? "✓ Terlampir" : "Belum diunggah"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 1: Posisi yang diinginkan * (Radio List sesuai Gambar 3) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900">
                  Posisi yang diinginkan <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {availableJobs.length} posisi tersedia
                </span>
              </div>

              {availableJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
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
                            ? "border-purple-500 bg-purple-50/60 shadow-xs ring-1 ring-purple-500/20"
                            : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/80"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`flex h-4 w-4 shrink-0 mt-0.5 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? "border-purple-600 bg-purple-600"
                                : "border-slate-300 bg-slate-50"
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className={`block text-xs sm:text-sm font-bold ${isSelected ? "text-purple-950" : "text-slate-900"}`}>
                              {job.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{job.location || "Jakarta"}</span>
                              {job.is_walk_in && (
                                <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[9px] font-extrabold text-fuchsia-700 border border-fuchsia-200">
                                  ✓ Walk-In Interview
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/lowongan/${job.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-purple-600 hover:text-purple-800 shrink-0 font-semibold underline mt-0.5"
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

            {/* SEKSI: Penjadwalan Wawancara Walk-In (Hari: Rabu atau Kamis) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900">
                  Penjadwalan Wawancara Walk-In <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  Pilih Hari Kehadiran
                </span>
              </div>
              <p className="text-xs text-slate-500 -mt-1">
                Silakan pilih hari kehadiran Anda untuk sesi wawancara langsung (walk-in interview) di booth perusahaan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opsi Hari Rabu */}
                <label
                  onClick={() => setInterviewDay("Rabu")}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    interviewDay === "Rabu"
                      ? "border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-600/20"
                      : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                      interviewDay === "Rabu"
                        ? "border-purple-600 bg-purple-600"
                        : "border-slate-300 bg-slate-50"
                    }`}
                  >
                    {interviewDay === "Rabu" && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Rabu</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md">
                        Hari 1
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      18 November 2026
                    </div>
                  </div>
                </label>

                {/* Opsi Hari Kamis */}
                <label
                  onClick={() => setInterviewDay("Kamis")}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    interviewDay === "Kamis"
                      ? "border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-600/20"
                      : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                      interviewDay === "Kamis"
                        ? "border-purple-600 bg-purple-600"
                        : "border-slate-300 bg-slate-50"
                    }`}
                  >
                    {interviewDay === "Kamis" && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Kamis</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md">
                        Hari 2
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      19 November 2026
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* SEKSI 2: Masukkan CV * (Upload Berkas Gambar 3) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900">
                  Masukkan CV <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Maks. 10 MB (PDF, DOC, DOCX, PNG, JPG)
                </span>
              </div>

              {cvUrl ? (
                /* Card Preview CV Terunggah */
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {cvFileName || "CV_Pelamar.pdf"}
                      </span>
                      <span className="block text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
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
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition"
                    >
                      Buka
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveCv}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs transition cursor-pointer"
                    >
                      Ganti
                    </button>
                  </div>
                </div>
              ) : (
                /* Box Upload Berkas Kosong */
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 group-hover:scale-110 transition shadow-2xs">
                    {isUploadingCv ? (
                      <svg className="w-6 h-6 animate-spin text-purple-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition">
                    {isUploadingCv ? "Mengunggah berkas CV ke server..." : "Tambahkan Berkas CV"}
                  </div>
                  <div className="text-[11px] text-slate-500">
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
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <label className="block font-bold text-slate-700">
                Tautan Portofolio / LinkedIn <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://linkedin.com/in/... atau tautan portofolio online"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
              />
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>← Kembali</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !selectedJobId || !cvUrl || isUploadingCv}
                className="rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-md shadow-purple-600/20 transition hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
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
                    <span>
                      {formType === "walkin" ? "Kirim Lamaran Walk-In Interview" : "Kirim Lamaran Pekerjaan"}
                    </span>
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
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © 2026 Career Compass Expo — Portal Pendaftaran Lamaran &amp; Walk-In Interview
      </footer>
    </div>
  );
}

export default function WalkInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
          Memuat formulir walk-in interview...
        </div>
      }
    >
      <WalkInFormContent />
    </Suspense>
  );
}
