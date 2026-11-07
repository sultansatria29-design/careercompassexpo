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

  // State Logo Upload
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoFileName, setLogoFileName] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  async function handleLogoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Format file tidak didukung. Harap pilih gambar PNG, JPG, WEBP, atau SVG.");
      e.target.value = "";
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setErrorMsg("Ukuran file logo melebihi batas maksimal 5MB!");
      e.target.value = "";
      return;
    }

    setErrorMsg("");
    setLogoFileName(file.name);
    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
    setLogoUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("company_name", regForm.name || "mitra");

      const res = await fetch("/api/mitra/upload-logo", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah logo.");

      setRegForm((prev) => ({
        ...prev,
        logo_url: data.url,
      }));
      setLogoPreview(data.url);
    } catch (err) {
      setErrorMsg(`Gagal unggah logo: ${err.message}`);
      setLogoPreview(regForm.logo_url || "");
    } finally {
      setLogoUploading(false);
    }
  }

  function handleRemoveLogo() {
    setRegForm((prev) => ({
      ...prev,
      logo_url: "",
    }));
    setLogoPreview("");
    setLogoFileName("");
  }

  function handleQuickFillDemo() {
    const demoLogo = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop";
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
      logo_url: demoLogo,
    });
    setLogoPreview(demoLogo);
    setLogoFileName("demo-logo-nusantara.png");
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100 selection:text-purple-900 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-200/40 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-200/30 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-600 transition w-fit"
          >
            <span>← Kembali ke Beranda CCE 2026</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 rounded-lg bg-white border border-slate-200 p-1 shadow-xs">
              <img
                src="/images/logo-puskar.png"
                alt="Pusat Karier UIN Jakarta"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              Pusat Pengembangan Karier UIN Jakarta
            </span>
          </div>
        </div>

        {/* Hero Section (Tanpa Elemen Tech) */}
        <div className="relative mx-auto max-w-3xl mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-700 mb-4 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Kemitraan Perusahaan &amp; Rekrutmen Kampus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Gabung Menjadi{" "}
            <span className="bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] bg-clip-text text-transparent">
              Mitra Perusahaan
            </span>
          </h1>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Dapatkan akses langsung ke lebih dari 5.000 talenta mahasiswa dan alumni berprestasi UIN Syarif Hidayatullah Jakarta. Publikasikan lowongan, kelola pelamar, dan pantau tahapan seleksi dalam satu dashboard terpadu.
          </p>

          {/* Value Highlights with SVG Vector Icons */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-3xl mx-auto">
            {/* Card 1: Talenta Muda */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-purple-300 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 text-purple-600 mb-3 transition group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-900">5.000+ Talenta Muda</div>
              <div className="text-xs text-slate-500 mt-1">Multi-disiplin: IT, Ekonomi Bisnis, Komunikasi, Sains &amp; Syariah.</div>
            </div>

            {/* Card 2: Booth & On-Site Interview */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-fuchsia-300 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600 mb-3 transition group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-900">Booth &amp; On-Site Interview</div>
              <div className="text-xs text-slate-500 mt-1">Sesi interview tatap muka langsung di venue Expo Gedung Syahida Inn.</div>
            </div>

            {/* Card 3: Dashboard ATS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-cyan-300 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 mb-3 transition group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-900">Dashboard ATS Praktis</div>
              <div className="text-xs text-slate-500 mt-1">Buat lowongan, tinjau CV, dan centang tahap pelamar secara instan.</div>
            </div>
          </div>
        </div>

        {/* Main Card with Tabs */}
        <div className="relative mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl shadow-purple-500/5">
          {/* Tabs Switcher with SVG Icons */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-8 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-md shadow-purple-600/30"
                  : "text-slate-600 hover:text-slate-900"
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
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-md shadow-purple-600/30"
                  : "text-slate-600 hover:text-slate-900"
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
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
              <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-3">
              <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* TAB 1: FORM REGISTER PERUSAHAAN */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Formulir Profil Perusahaan</h2>
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition group"
                >
                  <svg className="h-3.5 w-3.5 text-purple-500 transition group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="underline">Contoh Demo Isian</span>
                </button>
              </div>

              {/* Nama Perusahaan & Industri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Nama Resmi Perusahaan / Instansi <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Contoh: PT Telkom Indonesia"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Kategori Industri <span className="text-purple-600">*</span>
                  </label>
                  <select
                    value={regForm.industry}
                    onChange={(e) => setRegForm({ ...regForm, industry: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
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
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Nama Lengkap PIC (HR) <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.pic_name}
                    onChange={(e) => setRegForm({ ...regForm, pic_name: e.target.value })}
                    placeholder="Nama Narahubung"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Email Akun Perusahaan <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="hr@perusahaan.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    No. WhatsApp PIC <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Password Akun <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Konfirmasi Password <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>
              </div>

              {/* Website Perusahaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Website Perusahaan
                </label>
                <input
                  type="url"
                  value={regForm.website}
                  onChange={(e) => setRegForm({ ...regForm, website: e.target.value })}
                  placeholder="https://perusahaan.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                />
              </div>

              {/* Upload Logo Perusahaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload Logo Perusahaan (Opsional)
                </label>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Disarankan format PNG transparan, JPG, WEBP, atau SVG persegi (rasio 1:1), maksimal 5MB. Logo akan ditampilkan pada kartu lowongan &amp; profil booth expo.
                </p>

                {regForm.logo_url || logoPreview ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreview || regForm.logo_url}
                          alt="Logo Perusahaan"
                          className="h-full w-full object-contain"
                        />
                        {logoUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[260px]">
                            {logoFileName || "Logo Terunggah"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            ✓ Siap Dipublikasikan
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {logoUploading ? "Sedang mengunggah ke server cloud..." : "Logo siap ditampilkan di landing page & booth expo"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                          onChange={handleLogoFileChange}
                          disabled={logoUploading}
                          className="hidden"
                        />
                        <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>Ganti File</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={logoUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={handleLogoFileChange}
                      disabled={logoUploading}
                      className="hidden"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 border border-purple-200 text-purple-600 group-hover:scale-110 transition-transform mb-3">
                      {logoUploading ? (
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-purple-700">
                      {logoUploading ? "Sedang Mengunggah Logo..." : "Klik atau Seret Logo ke Sini"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG, WEBP, atau SVG (Maksimal 5MB)
                    </span>
                  </label>
                )}
              </div>

              {/* Alamat & Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Alamat / Lokasi Kantor Utama
                </label>
                <input
                  type="text"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="Kota / Alamat Kantor (misal: Jakarta Selatan, BSD Tangerang)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Deskripsi / Tentang Perusahaan
                </label>
                <textarea
                  rows={3}
                  value={regForm.bio}
                  onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                  placeholder="Ceritakan gambaran singkat bidang bisnis, budaya kerja, atau visi perusahaan..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                />
              </div>

              {/* Info Proses Verifikasi & Skrining */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="text-amber-950 font-bold block mb-0.5">Ketentuan Proses Skrining &amp; Verifikasi:</strong>
                  Setiap mitra pendaftar baru akan melalui proses peninjauan kelayakan profil oleh tim kurasi Pusat Karier UIN Jakarta sebelum fitur publikasi lowongan kerja dapat digunakan.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] py-4 text-center text-sm font-black text-white shadow-xl shadow-purple-600/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    "Memproses Pendaftaran..."
                  ) : (
                    <span className="flex items-center justify-center">
                      <span>Daftarkan Perusahaan &amp; Buka Dashboard Mitra</span>
                    </span>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Dengan mendaftar, perusahaan Anda menyetujui ketentuan kemitraan rekrutmen Career Compass Expo 2026 UIN Jakarta.
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: FORM LOGIN PERUSAHAAN */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="pb-3 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Masuk ke Dashboard Rekrutmen Mitra</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan email dan password akun perusahaan Anda yang telah terdaftar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Email Akun Perusahaan <span className="text-purple-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="Contoh: recruitment@nusantaradigital.id"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Password <span className="text-purple-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Masukkan password Anda"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] py-4 text-center text-sm font-black text-white shadow-xl shadow-purple-600/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Memverifikasi Kredensial..." : "Masuk ke Dashboard Mitra"}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-600">
                  Belum punya akun perusahaan?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="font-bold text-purple-600 hover:underline"
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
