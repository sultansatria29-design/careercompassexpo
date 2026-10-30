"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MitraAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("register"); // 'register' | 'login'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Guard Pembangunan: Sembunyikan untuk publik/mitra umum di production (localhost & dev mode selalu bisa akses)
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devPassword, setDevPassword] = useState("");
  const [devError, setDevError] = useState("");

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
      const hasCompanySession = !!localStorage.getItem("cce_mitra_session");

      if (isLocalhost || hasDevParam || hasDevStorage || hasCompanySession) {
        setIsDevUnlocked(true);
        if (hasDevParam) {
          localStorage.setItem("cce_mitra_dev_unlocked", "true");
        }
      } else {
        setIsDevUnlocked(false);
      }
      setCheckingAccess(false);
    }
  }, []);

  function handleUnlockDev(e) {
    e.preventDefault();
    if (devPassword === "cce.2026" || devPassword === "cce2026") {
      localStorage.setItem("cce_mitra_dev_unlocked", "true");
      setIsDevUnlocked(true);
      setShowDevModal(false);
      setDevError("");
    } else {
      setDevError("Password akses pengembang tidak valid.");
    }
  }

  // Form State Register
  const [regForm, setRegForm] = useState({
    name: "",
    industry: "Teknologi & Informasi (IT)",
    pic_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    website: "",
    company_size: "51-200 Karyawan",
    bio: "",
    logo_url: "",
  });

  // Form State Login
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  function handleQuickFillDemo() {
    setRegForm({
      name: "PT Nusantara Digital Solusindo",
      industry: "Teknologi & Informasi (IT)",
      pic_name: "Rian Hendrawan (HR Manager)",
      email: "recruitment@nusantaradigital.id",
      phone: "081299887766",
      password: "mitra.cce.2026",
      confirmPassword: "mitra.cce.2026",
      address: "Jl. TB Simatupang Kav. 88, Cilandak, Jakarta Selatan",
      website: "https://nusantaradigital.id",
      company_size: "51-200 Karyawan",
      bio: "Perusahaan penyedia solusi kecerdasan buatan, cloud computing, dan transformasi digital terkemuka di Asia Tenggara.",
      logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop",
    });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regForm.name || !regForm.email || !regForm.password) {
      setErrorMsg("Nama perusahaan, email, dan password wajib diisi.");
      return;
    }

    if (regForm.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/mitra/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          ...regForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftarkan perusahaan.");
      }

      setSuccessMsg(
        data.message ||
        "Pendaftaran berhasil! Akun Anda sedang dalam proses penyaringan & verifikasi admin Pusat Karier UIN Jakarta. Mengalihkan ke dashboard..."
      );
      // Simpan session mitra ke localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("cce_mitra_session", JSON.stringify(data.company));
      }

      setTimeout(() => {
        router.push("/mitra/dashboard");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginForm.email || !loginForm.password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/mitra/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login gagal.");
      }

      const isVerified = data.company?.verification_status === "verified";
      if (isVerified) {
        setSuccessMsg(`Login berhasil! Selamat datang kembali, ${data.company.name}`);
      } else if (data.company?.verification_status === "rejected") {
        setSuccessMsg(`Login berhasil. Status akun: Pengajuan kemitraan belum disetujui admin.`);
      } else {
        setSuccessMsg(`Login berhasil! Status akun: Menunggu proses penyaringan & verifikasi admin.`);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("cce_mitra_session", JSON.stringify(data.company));
      }

      setTimeout(() => {
        router.push("/mitra/dashboard");
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!checkingAccess && !isDevUnlocked) {
    return (
      <div className="min-h-screen bg-[#0F051D] text-white flex flex-col justify-between selection:bg-[#EF17D8] selection:text-white px-4 sm:px-6 py-8">
        {/* Ambient Glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[130px]" />
          <div className="absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/15 blur-[120px]" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-white transition"
          >
            <span>← Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 rounded-lg bg-white p-1">
              <img
                src="/images/logo-puskar.png"
                alt="Pusat Karier UIN Jakarta"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-purple-200/80 hidden sm:inline">
              Pusat Pengembangan Karier UIN Jakarta
            </span>
          </div>
        </div>

        {/* Center Maintenance Content */}
        <div className="relative z-10 max-w-2xl mx-auto my-auto text-center py-12 px-4">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/40 text-purple-300 shadow-[0_0_40px_rgba(114,38,255,0.4)]">
            <svg className="h-10 w-10 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/50 px-4 py-1.5 text-xs font-bold text-amber-300 mb-5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Dalam Proses Pembangunan &amp; Persiapan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Portal Kemitraan Perusahaan <br />
            <span className="bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] bg-clip-text text-transparent">
              Segera Hadir
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-purple-200/80 leading-relaxed max-w-xl mx-auto">
            Fitur portal kemitraan dan dashboard rekrutmen perusahaan saat ini sedang dalam proses pembangunan oleh tim <strong>Career Compass Expo 2026</strong>. Akses pendaftaran mitra resmi akan segera dibuka kepada publik.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:scale-105 transition"
            >
              Kembali ke Beranda Utama
            </Link>
            <button
              type="button"
              onClick={() => setShowDevModal(true)}
              className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-purple-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              Mode Pengembang (Dev Access)
            </button>
          </div>
        </div>

        {/* Modal Password Pengembang */}
        {showDevModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-[#170A2D] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white mb-1">Akses Mode Pengembang</h3>
              <p className="text-xs text-purple-300/70 mb-4">
                Masukkan password pengembang untuk membuka halaman pendaftaran dan dashboard mitra.
              </p>
              <form onSubmit={handleUnlockDev} className="space-y-3">
                <input
                  type="password"
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  placeholder="Password pengembang..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  autoFocus
                />
                {devError && <div className="text-[11px] text-red-400">{devError}</div>}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] py-2.5 text-xs font-bold text-white cursor-pointer"
                  >
                    Buka Akses
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDevModal(false);
                      setDevError("");
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-purple-300 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-white/40 pt-6 border-t border-white/10">
          © 2026 Career Compass Expo — UIN Syarif Hidayatullah Jakarta
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F051D] text-white selection:bg-[#EF17D8] selection:text-white">
      {/* Background glowing gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-white transition w-fit"
          >
            <span>← Kembali ke Beranda CCE 2026</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 rounded-lg bg-white p-1">
              <img
                src="/images/logo-puskar.png"
                alt="Pusat Karier UIN Jakarta"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-purple-200/80">
              Pusat Pengembangan Karier UIN Jakarta
            </span>
          </div>
        </div>

        {/* Hero Section with 3D Accessories */}
        <div className="relative mx-auto max-w-5xl mb-12">
          <div className="flex items-center justify-between gap-4 sm:gap-6 lg:gap-8">
            {/* Aksesoris 3D Tech Prism (Kiri) - Tampil rapi di sisi kiri tanpa menghalangi teks */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-20 sm:w-24 lg:w-32 pointer-events-none select-none animate-float-reverse">
              <img
                src="/images/icons/tech%202.png"
                alt="Aksesoris Tech Prism"
                className="w-full h-auto drop-shadow-[0_10px_25px_rgba(239,23,216,0.5)]"
              />
            </div>

            {/* Teks Hero Utama (Tengah) */}
            <div className="flex-1 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/60 px-4 py-1.5 text-xs font-bold text-purple-200 mb-4 backdrop-blur-md shadow-lg shadow-purple-900/30">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Kemitraan Perusahaan &amp; Rekrutmen Kampus</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Gabung Menjadi{" "}
                <span className="bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] bg-clip-text text-transparent">
                  Mitra Perusahaan
                </span>
              </h1>
              <p className="mt-4 text-xs sm:text-sm md:text-base text-purple-200/80 leading-relaxed max-w-xl mx-auto">
                Dapatkan akses langsung ke lebih dari 5.000 talenta mahasiswa dan alumni berprestasi UIN Syarif Hidayatullah Jakarta. Publikasikan lowongan, kelola pelamar, dan pantau tahapan seleksi dalam satu dashboard terpadu.
              </p>
            </div>

            {/* Aksesoris 3D Skyscraper Build 1 (Kanan) - Tampil rapi di sisi kanan tanpa menghalangi teks */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-20 sm:w-24 lg:w-32 pointer-events-none select-none animate-float-slow">
              <img
                src="/images/icons/build%201.png"
                alt="Aksesoris Gedung Mitra"
                className="w-full h-auto drop-shadow-[0_15px_30px_rgba(114,38,255,0.45)]"
              />
            </div>
          </div>

          {/* Value Highlights with SVG Vector Icons */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-3xl mx-auto">
            {/* Card 1: Talenta Muda */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-purple-500/40 hover:bg-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 mb-3 shadow-[0_0_15px_rgba(114,38,255,0.3)] transition group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                </svg>
              </div>
              <div className="text-sm font-bold text-white">5.000+ Talenta Muda</div>
              <div className="text-xs text-purple-300/70 mt-1">Multi-disiplin: IT, Ekonomi Bisnis, Komunikasi, Sains &amp; Syariah.</div>
            </div>

            {/* Card 2: Booth & On-Site Interview */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-fuchsia-500/40 hover:bg-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 mb-3 shadow-[0_0_15px_rgba(239,23,216,0.3)] transition group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-sm font-bold text-white">Booth &amp; On-Site Interview</div>
              <div className="text-xs text-purple-300/70 mt-1">Sesi interview tatap muka langsung di venue Expo Gedung Syahida Inn.</div>
            </div>

            {/* Card 3: Dashboard ATS */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-cyan-500/40 hover:bg-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-white">Dashboard ATS Praktis</div>
              <div className="text-xs text-purple-300/70 mt-1">Buat lowongan, tinjau CV, dan centang tahap pelamar secara instan.</div>
            </div>
          </div>
        </div>

        {/* Main Card with Tabs & 3D Accessories */}
        <div className="relative mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#160A2C]/90 p-6 sm:p-10 shadow-2xl shadow-purple-950/60 backdrop-blur-xl">
          {/* Aksesoris 3D Tech Orb (Subtle Ambient Glow di belakang kartu) */}
          <div className="hidden xl:block absolute -bottom-10 -right-12 w-28 pointer-events-none select-none -z-10 opacity-30 animate-pulse">
            <img
              src="/images/icons/tech%204.png"
              alt="Aksesoris Tech Orb"
              className="w-full h-auto drop-shadow-[0_10px_25px_rgba(56,189,248,0.45)]"
            />
          </div>

          {/* Tabs Switcher with SVG Icons */}
          <div className="flex rounded-2xl bg-white/5 p-1.5 mb-8 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg shadow-purple-700/40"
                  : "text-purple-300/80 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Daftar Akun Mitra Baru</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg shadow-purple-700/40"
                  : "text-purple-300/80 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Masuk ke Dashboard Mitra</span>
            </button>
          </div>

          {/* Error & Success Alerts with SVG */}
          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-950/50 p-4 text-sm text-red-200 flex items-start gap-3">
              <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4 text-sm text-emerald-200 flex items-start gap-3">
              <svg className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* TAB 1: FORM REGISTER PERUSAHAAN */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Formulir Profil Perusahaan</h2>
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-300 hover:text-white transition group"
                >
                  <svg className="h-3.5 w-3.5 text-fuchsia-400 transition group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="underline">Contoh Demo Isian</span>
                </button>
              </div>

              {/* Nama Perusahaan & Industri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Nama Resmi Perusahaan / Instansi <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Contoh: PT Telkom Indonesia"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Kategori Industri <span className="text-fuchsia-400">*</span>
                  </label>
                  <select
                    value={regForm.industry}
                    onChange={(e) => setRegForm({ ...regForm, industry: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  >
                    <option value="Teknologi & Informasi (IT)">Teknologi &amp; Informasi (IT / Software)</option>
                    <option value="Finansial, Bank & Fintech">Finansial, Perbankan &amp; Fintech</option>
                    <option value="FMCG & Ritel">FMCG &amp; Ritel / Konsumsi</option>
                    <option value="Konsultan & Layanan Bisnis">Konsultan &amp; Layanan Profesional</option>
                    <option value="BUMN & Pemerintahan">BUMN &amp; Badan Usaha Milik Negara</option>
                    <option value="Media, Kreatif & Agensi">Media, Kreatif &amp; Digital Agency</option>
                    <option value="Manufaktur, Logistik & Energi">Manufaktur, Logistik &amp; Energi</option>
                    <option value="Kesehatan & Farmasi">Kesehatan &amp; Farmasi</option>
                    <option value="Pendidikan & Riset">Pendidikan &amp; EdTech</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* PIC Name, Email & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Nama Lengkap PIC (HR) <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.pic_name}
                    onChange={(e) => setRegForm({ ...regForm, pic_name: e.target.value })}
                    placeholder="Nama Narahubung"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Email Akun Perusahaan <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="hr@perusahaan.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    No. WhatsApp PIC <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Password Akun <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Konfirmasi Password <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>
              </div>

              {/* Website, Logo URL, & Skala */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Website Perusahaan
                  </label>
                  <input
                    type="url"
                    value={regForm.website}
                    onChange={(e) => setRegForm({ ...regForm, website: e.target.value })}
                    placeholder="https://perusahaan.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    Skala Karyawan
                  </label>
                  <select
                    value={regForm.company_size}
                    onChange={(e) => setRegForm({ ...regForm, company_size: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  >
                    <option value="1-50 Karyawan">1 - 50 Karyawan (Startup / UKM)</option>
                    <option value="51-200 Karyawan">51 - 200 Karyawan (Menengah)</option>
                    <option value="201-1000 Karyawan">201 - 1.000 Karyawan (Korporasi)</option>
                    <option value="1000+ Karyawan">1.000+ Karyawan (Enterprise / Multinasional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-2">
                    URL Logo Perusahaan (Opsional)
                  </label>
                  <input
                    type="url"
                    value={regForm.logo_url}
                    onChange={(e) => setRegForm({ ...regForm, logo_url: e.target.value })}
                    placeholder="https://.../logo.png"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>
              </div>

              {/* Alamat & Bio */}
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-2">
                  Alamat / Lokasi Kantor Utama
                </label>
                <input
                  type="text"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="Kota / Alamat Kantor (misal: Jakarta Selatan, BSD Tangerang)"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-2">
                  Deskripsi / Tentang Perusahaan
                </label>
                <textarea
                  rows={3}
                  value={regForm.bio}
                  onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                  placeholder="Ceritakan gambaran singkat bidang bisnis, budaya kerja, atau visi perusahaan..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                />
              </div>

              {/* Info Proses Verifikasi & Skrining */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-100 font-bold block mb-0.5">Ketentuan Proses Skrining &amp; Verifikasi:</strong>
                  Setiap mitra pendaftar baru akan melalui proses peninjauan kelayakan profil oleh tim kurasi Pusat Karier UIN Jakarta sebelum fitur publikasi lowongan kerja dapat digunakan.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] py-4 text-center text-sm font-black text-white shadow-xl shadow-purple-600/40 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    "Memproses Pendaftaran..."
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Daftarkan Perusahaan &amp; Buka Dashboard Mitra</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-purple-300/60">
                  Dengan mendaftar, perusahaan Anda menyetujui ketentuan kemitraan rekrutmen Career Compas Expo 2026 UIN Jakarta.
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: FORM LOGIN PERUSAHAAN */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="pb-3 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Masuk ke Dashboard Rekrutmen Mitra</h2>
                <p className="text-xs text-purple-300/70 mt-1">
                  Masukkan email dan password akun perusahaan Anda yang telah terdaftar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-2">
                  Email Akun Perusahaan <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="Contoh: recruitment@nusantaradigital.id"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-2">
                  Password <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Masukkan password Anda"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] py-4 text-center text-sm font-black text-white shadow-xl shadow-purple-600/40 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Memverifikasi Kredensial..." : "Masuk ke Dashboard Mitra →"}
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-purple-200/70">
                  Belum punya akun perusahaan?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="font-bold text-fuchsia-400 hover:underline"
                  >
                    Daftar Kemitraan di Sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
