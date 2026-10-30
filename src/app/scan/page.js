"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ScannerContent() {
  const searchParams = useSearchParams();
  const urlReg = searchParams.get("reg") || "";

  // Pilihan tanggal scan operasional
  const [scanDate, setScanDate] = useState("2026-11-18"); // Default Day 1
  const [customDate, setCustomDate] = useState("");
  const [activeDateMode, setActiveDateMode] = useState("DAY1"); // DAY1, DAY2, TODAY, CUSTOM

  // Input nomor registrasi / QR payload
  const [inputCode, setInputCode] = useState(urlReg);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Statistik & Log Kehadiran Terkini
  const [stats, setStats] = useState({ total_day1: 0, total_day2: 0, total_overall: 0 });
  const [recentLogs, setRecentLogs] = useState([]);

  // Kamera scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const inputRef = useRef(null);

  // Update scan date sesuai mode
  function handleDateModeChange(mode) {
    setActiveDateMode(mode);
    setScanResult(null);

    if (mode === "DAY1") {
      setScanDate("2026-11-18");
    } else if (mode === "DAY2") {
      setScanDate("2026-11-19");
    } else if (mode === "TODAY") {
      const todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      setScanDate(todayStr);
    } else if (mode === "CUSTOM" && customDate) {
      setScanDate(customDate);
    }
  }

  // Muat data statistik & log kehadiran
  async function fetchStats() {
    try {
      const res = await fetch("/api/scan");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recent_logs || []);
      }
    } catch (err) {
      console.warn("Gagal mengambil statistik kehadiran:", err);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  // Eksekusi verifikasi kehadiran
  async function verifyAttendance(codeToVerify) {
    const code = (codeToVerify || inputCode).trim();
    if (!code) return;

    setLoading(true);
    setScanResult(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_number: code,
          scan_date: scanDate,
        }),
      });

      const data = await response.json();
      setScanResult(data);

      // Refresh log jika berhasil check-in
      if (data.success) {
        fetchStats();
      }
    } catch (err) {
      setScanResult({
        success: false,
        status: "ERROR",
        message: err.message || "Gagal menghubungi server.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Jika URL memiliki parameter ?reg=..., otomatis verifikasi
  useEffect(() => {
    if (urlReg) {
      setInputCode(urlReg);
      verifyAttendance(urlReg);
    }
  }, [urlReg]);

  // Handler Submit Form Manual
  function handleSubmit(e) {
    e.preventDefault();
    verifyAttendance(inputCode);
  }

  // Fitur Kamera Scanner
  async function startCamera() {
    setCameraError("");
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Deteksi Barcode / QR jika didukung browser
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ["qr_code", "code_128", "code_39"],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                stopCamera();
                setInputCode(rawValue);
                verifyAttendance(rawValue);
              }
            } catch (detectorErr) {
              // Ignore occasional frame read failure
            }
          }
        }, 400);
      } else {
        setCameraError("Browser ini tidak mendukung pembaca QR otomatis langsung di kamera. Gunakan scanner gun atau masukkan nomor registrasi.");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Kamera tidak dapat diakses. Pastikan izin kamera aktif.");
      setIsCameraActive(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsCameraActive(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0F071D] text-white">
      {/* Header Panitia */}
      <header className="sticky top-0 z-40 border-b border-purple-900/50 bg-[#160B29]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin?tab=qr-gate" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#EF17D8] p-1.5 shadow-lg shadow-purple-900/40">
                <img
                  src="/images/icons/robot%204.png"
                  alt="CCE Scanner"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="block text-sm font-extrabold tracking-tight text-white sm:text-base">
                  PANITIA CCE 2026
                </span>
                <span className="block text-[11px] font-semibold text-purple-300">
                  QR Scanner & Verifikasi Kehadiran
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin?tab=qr-gate"
              className="rounded-xl border border-purple-800 bg-purple-950/60 px-3.5 py-1.5 text-xs font-bold text-purple-200 transition hover:bg-purple-900 hover:text-white flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Dashboard QR Admin</span>
            </Link>
            <Link
              href="/registrasi"
              className="rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-800/30 transition hover:opacity-95"
            >
              Form Registrasi
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Banner Pemilihan Tanggal Scan (Simulasi / Operasional) */}
        <section className="mb-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#1E0C36] via-[#2A114E] to-[#1E0C36] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#EF17D8]/20 to-transparent blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
                  Sistem Validasi Tanggal Kehadiran
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                Meja Registrasi Ulang Masuk
              </h1>
              <p className="mt-1 text-xs text-purple-200 sm:text-sm">
                Tiket peserta <strong>hanya dapat divalidasi dan check-in jika tanggal scan cocok</strong> dengan hari yang didaftarkan.
              </p>
            </div>

            {/* Toggle Tanggal Operasional */}
            <div className="flex flex-col gap-2 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Pilih Tanggal Scan (Simulasi Hari-H):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDateModeChange("DAY1")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDateMode === "DAY1"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400"
                      : "bg-purple-900/60 text-purple-200 hover:bg-purple-800"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Hari 1 (18 Nov 2026)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDateModeChange("DAY2")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDateMode === "DAY2"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400"
                      : "bg-purple-900/60 text-purple-200 hover:bg-purple-800"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Hari 2 (19 Nov 2026)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDateModeChange("TODAY")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDateMode === "TODAY"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400"
                      : "bg-purple-900/60 text-purple-200 hover:bg-purple-800"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Hari Ini (Real-Time)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Indikator Status Tanggal Aktif */}
          <div className="mt-5 rounded-2xl border border-purple-400/20 bg-purple-950/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-800/40 text-purple-300 border border-purple-500/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div>
                <span className="text-xs text-purple-300 block">Tanggal Scan Sedang Aktif:</span>
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {scanDate === "2026-11-18" && "Day 1 — Rabu, 18 November 2026 (2026-11-18)"}
                  {scanDate === "2026-11-19" && "Day 2 — Kamis, 19 November 2026 (2026-11-19)"}
                  {scanDate !== "2026-11-18" && scanDate !== "2026-11-19" && `${scanDate} (Simulasi Custom / Hari Ini)`}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[11px] text-purple-300 block">Lokasi:</span>
              <span className="text-xs font-bold text-purple-100">Auditorium Harun Nasution</span>
            </div>
          </div>
        </section>

        {/* Grid: Kiri Area Scan, Kanan Statistik & Log Kehadiran */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Scanner Form & Live Feedback (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box Input Nomor / Scan */}
            <div className="rounded-3xl border border-purple-800/40 bg-[#1A0C30] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Pemindaian Tiket Peserta</span>
                </h2>
                
                {/* Tombol Kamera Toggle */}
                <button
                  type="button"
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isCameraActive
                      ? "bg-red-500/80 hover:bg-red-600 text-white"
                      : "bg-purple-700/80 hover:bg-purple-600 text-white"
                  }`}
                >
                  {isCameraActive ? (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                      </svg>
                      <span>Matikan Kamera</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Buka Kamera QR</span>
                    </>
                  )}
                </button>
              </div>

              {/* Viewport Kamera jika aktif */}
              {isCameraActive && (
                <div className="mb-5 overflow-hidden rounded-2xl border-2 border-[#EF17D8] bg-black p-2 relative">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />
                    {/* Reticle / Target Scanner */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-48 w-48 rounded-2xl border-2 border-emerald-400 border-dashed animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-2 text-center text-xs text-purple-200">
                    Arahkan kamera ke QR Code pada E-Ticket peserta
                  </p>
                  {cameraError && (
                    <p className="mt-1 text-center text-xs text-amber-300 font-medium">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}

              {/* Form Input Manual / Barcode Gun */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="regInput" className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                    Nomor Registrasi / Link QR Tiket
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      id="regInput"
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Contoh: CCE2026-00007 atau scan QR code"
                      className="w-full rounded-2xl border border-purple-700/60 bg-[#120824] px-4 py-3.5 pl-11 text-base font-semibold text-white placeholder-purple-400/50 outline-none transition focus:border-[#7226FF] focus:ring-2 focus:ring-[#7226FF]/30 font-mono"
                      autoFocus
                    />
                    <span className="absolute left-4 top-4 text-purple-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    {inputCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setInputCode("");
                          setScanResult(null);
                        }}
                        className="absolute right-3 top-3 rounded-lg bg-purple-900/60 px-2 py-1 text-xs text-purple-300 hover:text-white"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !inputCode.trim()}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-purple-600/30 transition hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Memverifikasi..." : "Verifikasi & Check-In Sekarang →"}
                  </button>
                </div>
              </form>
            </div>

            {/* HASIL SCAN / FEEDBACK STATUS */}
            {scanResult && (
              <div
                className={`overflow-hidden rounded-3xl border-2 p-6 shadow-2xl transition-all ${
                  scanResult.status === "SUCCESS"
                    ? "border-emerald-500 bg-emerald-950/70"
                    : scanResult.status === "DATE_MISMATCH"
                    ? "border-rose-500 bg-rose-950/80"
                    : scanResult.status === "ALREADY_CHECKED_IN"
                    ? "border-amber-500 bg-amber-950/70"
                    : "border-red-500 bg-red-950/70"
                }`}
              >
                {/* Status 1: SUCCESS (Akses Diterima) */}
                {scanResult.status === "SUCCESS" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-emerald-300">
                          Akses Diterima • Check-In Berhasil
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          Selamat Datang!
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/30 p-4 space-y-2 text-sm">
                      <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                        <span className="text-emerald-200">Nama Peserta:</span>
                        <strong className="text-white text-base">{scanResult.participant?.full_name}</strong>
                      </div>
                      <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                        <span className="text-emerald-200">Nomor Registrasi:</span>
                        <strong className="text-emerald-300 font-mono">{scanResult.participant?.registration_number}</strong>
                      </div>
                      <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                        <span className="text-emerald-200">Hari Terdaftar:</span>
                        <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                          {scanResult.participant?.registered_day}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                        <span className="text-emerald-200">Asal Instansi:</span>
                        <span className="text-white">{scanResult.participant?.institution || "-"}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-emerald-200">Waktu Masuk:</span>
                        <span className="text-white font-mono">
                          {new Date(scanResult.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status 2: DATE_MISMATCH (Akses Ditolak karena Salah Hari) */}
                {scanResult.status === "DATE_MISMATCH" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/40">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <span className="inline-block rounded-full bg-rose-500/30 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-rose-300">
                          Akses Ditolak • Tanggal Tidak Sesuai
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-rose-100">
                          Jadwal Tiket Tidak Cocok
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-rose-500/40 bg-rose-900/40 p-4 space-y-3 text-sm">
                      <p className="text-rose-100 font-semibold leading-relaxed">
                        {scanResult.message}
                      </p>

                      <div className="rounded-xl bg-black/40 p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-rose-300">Nama:</span>
                          <strong className="text-white">{scanResult.participant?.full_name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-rose-300">No Registrasi:</span>
                          <strong className="text-rose-200 font-mono">{scanResult.participant?.registration_number}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-rose-300">Terdaftar Untuk:</span>
                          <span className="font-bold text-amber-300">{scanResult.participant?.registered_day}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-rose-300">Tanggal Scan Saat Ini:</span>
                          <span className="font-bold text-rose-200">{scanResult.scan_date}</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-rose-950/80 p-2.5 text-xs text-rose-200 flex items-start gap-2">
                        <svg className="h-4 w-4 shrink-0 text-amber-300 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <div>
                          <strong>Petunjuk Panitia:</strong> Informasikan kepada peserta bahwa tiket ini hanya berlaku pada tanggal yang terdaftar. Jika peserta ingin hadir hari ini, arahkan untuk melakukan registrasi ulang di formulir.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status 3: ALREADY_CHECKED_IN (Peringatan Tiket Sudah Terpakai Hari Ini) */}
                {scanResult.status === "ALREADY_CHECKED_IN" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/40">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <span className="inline-block rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-amber-300">
                          Peringatan • Sudah Check-In
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-amber-100">
                          Tiket Sudah Digunakan Hari Ini
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-500/30 bg-amber-900/30 p-4 space-y-2 text-sm text-amber-100">
                      <p className="leading-relaxed">{scanResult.message}</p>
                      
                      <div className="rounded-xl bg-black/40 p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-amber-300">Nama:</span>
                          <strong className="text-white">{scanResult.participant?.full_name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-300">No Registrasi:</span>
                          <strong className="text-amber-200 font-mono">{scanResult.participant?.registration_number}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-300">Waktu Pertama Kali Check-In:</span>
                          <strong className="text-white font-mono">
                            {new Date(scanResult.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Lain: NOT_FOUND atau ERROR */}
                {scanResult.status !== "SUCCESS" &&
                  scanResult.status !== "DATE_MISMATCH" &&
                  scanResult.status !== "ALREADY_CHECKED_IN" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl text-white">
                          !
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Pemeriksaan Gagal
                        </h3>
                      </div>
                      <p className="text-sm text-red-200">{scanResult.message}</p>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Statistik Hadir & Log Scan Terkini (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Kartu Ringkasan Statistik */}
            <div className="rounded-3xl border border-purple-800/40 bg-[#1A0C30] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Statistik Kehadiran CCE</span>
                </h2>
                <button
                  type="button"
                  onClick={fetchStats}
                  className="rounded-lg bg-purple-900/50 px-2.5 py-1 text-xs text-purple-300 hover:text-white transition flex items-center gap-1.5"
                  title="Refresh data"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Segarkan</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">
                    Day 1 (18 Nov)
                  </span>
                  <span className="mt-1 text-3xl font-black text-white block">
                    {stats.total_day1}
                  </span>
                  <span className="text-[10px] text-blue-200">Peserta Check-In</span>
                </div>

                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                    Day 2 (19 Nov)
                  </span>
                  <span className="mt-1 text-3xl font-black text-white block">
                    {stats.total_day2}
                  </span>
                  <span className="text-[10px] text-purple-200">Peserta Check-In</span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">Total Keseluruhan Masuk:</span>
                <span className="text-xl font-black text-white">{stats.total_overall} Peserta</span>
              </div>
            </div>

            {/* Log Scan Kehadiran Terkini */}
            <div className="rounded-3xl border border-purple-800/40 bg-[#1A0C30] p-6 shadow-xl">
              <h2 className="text-base font-black text-white mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Aktivitas Check-In Terbaru</span>
              </h2>

              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-purple-400">
                  Belum ada log kehadiran yang tercatat.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {recentLogs.map((log) => {
                    const time = new Date(log.checked_in_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={log.id}
                        className="rounded-xl border border-purple-800/30 bg-[#120824] p-3 text-xs transition hover:border-purple-600"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-white text-sm">
                            {log.participants?.full_name || "Peserta"}
                          </strong>
                          <span className="rounded bg-purple-900/60 px-2 py-0.5 font-mono text-[11px] text-purple-200">
                            {time} WIB
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-purple-300 text-[11px]">
                          <span>{log.participants?.registration_number}</span>
                          <span className="rounded bg-emerald-950 text-emerald-300 px-1.5 py-0.2">
                            {log.event_date === "2026-11-18" ? "Day 1" : "Day 2"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PanitiaScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F071D] flex items-center justify-center text-white">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto mb-3" />
            <p className="text-sm font-bold text-purple-200">Memuat Scanner Panitia CCE...</p>
          </div>
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}
