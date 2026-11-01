"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Daftar 12 Fakultas UIN Syarif Hidayatullah Jakarta (Sesuai Gambar 2)
export const UIN_FACULTIES = [
  "Fakultas Ilmu Tarbiyah dan Keguruan (FITK)",
  "Fakultas Adab dan Humaniora (FAH)",
  "Fakultas Ushuluddin (FU)",
  "Fakultas Syariah dan Hukum (FSH)",
  "Fakultas Dakwah dan Ilmu Komunikasi (FDIKOM)",
  "Fakultas Dirasat Islamiyah (FDI)",
  "Fakultas Psikologi (FPsi)",
  "Fakultas Ekonomi dan Bisnis (FEB)",
  "Fakultas Ilmu Kesehatan (FIKES)",
  "Fakultas Sains dan Teknologi (FST)",
  "Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)",
  "Fakultas Kedokteran (FK)",
  "Yang lain / Luar UIN Syarif Hidayatullah Jakarta",
];

function PelamarAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const jobParam = searchParams.get("job") || "";
  const companyParam = searchParams.get("company") || "";

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Form State Login
  const [loginForm, setLoginForm] = useState({
    identifier: "", // email atau no. registrasi
    password: "",
  });

  // Form State Register
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    participant_status: "Mahasiswa",
    institution: "UIN Syarif Hidayatullah Jakarta",
    faculty: "Fakultas Sains dan Teknologi (FST)",
    custom_faculty: "",
    major: "",
    age: "",
    graduation_year: "",
    gpa: "",
    domicile: "DKI Jakarta",
    cce_regis_confirmed: "Sudah",
    cce_proof_url: "",
    cce_proof_name: "",
    is_uploading_proof: false,
  });

  // Cek apakah sudah login sebelumnya
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cce_pelamar_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            handleRedirectSuccess();
          }
        } catch {}
      }
    }
  }, []);

  function handleRedirectSuccess() {
    if (redirectParam) {
      router.push(redirectParam);
    } else if (jobParam) {
      router.push(`/pelamar/walk-in?job=${jobParam}&company=${companyParam}`);
    } else {
      router.push("/pelamar/dashboard");
    }
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  }

  // Handle Submit Login
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pelamar/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          identifier: loginForm.identifier,
          password: loginForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal masuk.");

      // Simpan session
      localStorage.setItem("cce_pelamar_session", JSON.stringify(data.pelamar));
      showToast(data.message || "Berhasil masuk!");
      setTimeout(() => {
        handleRedirectSuccess();
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle Upload Bukti Registrasi CCE 2026 (Gambar 4)
  async function handleUploadProof(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran berkas bukti registrasi melebihi 10MB.");
      return;
    }

    setRegisterForm((prev) => ({
      ...prev,
      is_uploading_proof: true,
      cce_proof_name: file.name,
    }));
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("participant_id", "reg_" + Date.now());

      const res = await fetch("/api/pelamar/upload-bukti", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah berkas bukti.");

      setRegisterForm((prev) => ({
        ...prev,
        cce_proof_url: data.url,
        cce_proof_name: file.name,
        is_uploading_proof: false,
      }));
      showToast("Bukti registrasi CCE 2026 berhasil diunggah!");
    } catch (err) {
      setError(`Gagal unggah bukti: ${err.message}`);
      setRegisterForm((prev) => ({
        ...prev,
        is_uploading_proof: false,
        cce_proof_name: "",
      }));
    }
  }

  function handleRemoveProof() {
    setRegisterForm((prev) => ({
      ...prev,
      cce_proof_url: "",
      cce_proof_name: "",
      is_uploading_proof: false,
    }));
  }

  // Handle Submit Register
  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (registerForm.password !== registerForm.confirm_password) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    if (registerForm.is_uploading_proof) {
      setError("Harap tunggu proses pengunggahan bukti registrasi selesai terlebih dahulu.");
      return;
    }

    setLoading(true);

    const finalFaculty =
      registerForm.faculty === "Yang lain / Luar UIN Syarif Hidayatullah Jakarta"
        ? registerForm.custom_faculty || "Luar UIN Syarif Hidayatullah Jakarta"
        : registerForm.faculty;

    try {
      const res = await fetch("/api/pelamar/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          full_name: registerForm.full_name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
          participant_status: registerForm.participant_status,
          institution: registerForm.institution,
          faculty: finalFaculty,
          major: registerForm.major,
          age: registerForm.age,
          graduation_year: registerForm.graduation_year,
          gpa: registerForm.gpa,
          domicile: registerForm.domicile,
          cce_regis_confirmed: registerForm.cce_regis_confirmed,
          cce_proof_url: registerForm.cce_proof_url,
          cce_proof_name: registerForm.cce_proof_name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar.");

      // Simpan session
      localStorage.setItem("cce_pelamar_session", JSON.stringify(data.pelamar));
      showToast(data.message || "Pendaftaran akun berhasil!");
      setTimeout(() => {
        handleRedirectSuccess();
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0E041A] text-white selection:bg-[#EF17D8] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Background Glow Orbs */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#7226FF]/20 blur-[130px]" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#EF17D8]/20 blur-[140px]" />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce rounded-2xl border border-white/20 bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-xl">
          {toastMsg}
        </div>
      )}

      {/* Header Mini */}
      <header className="border-b border-white/10 bg-[#170A2D]/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
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
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              className="text-purple-300/80 hover:text-white transition font-semibold"
            >
              ← Kembali ke Beranda
            </Link>
            <Link
              href="/mitra"
              className="hidden sm:inline-block rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-purple-200 hover:bg-white/10 transition"
            >
              Portal Mitra HR
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-xl w-full px-4 py-8 sm:py-12 z-10 flex-1 flex flex-col justify-center">
        {/* Card Form Utama */}
        <div className="rounded-3xl border border-white/15 bg-[#170A2D]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Badge & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border border-fuchsia-500/30 px-3 py-1 text-[11px] font-bold text-fuchsia-300">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>
              <span>Portal Khusus Pelamar &amp; Pencari Kerja</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {mode === "login" ? "Masuk ke Akun Pelamar" : "Daftar Akun Pelamar Baru"}
            </h1>
            <p className="text-xs text-purple-200/70 max-w-md mx-auto leading-relaxed">
              {jobParam ? (
                <span className="text-amber-300 font-semibold">
                  Silakan masuk atau daftar terlebih dahulu untuk mengirim berkas lamaran ke posisi pilihan Anda.
                </span>
              ) : (
                "Pantau tahapan seleksi rekrutmenmu secara real-time dan ikuti proses Walk-In Interview di Career Compass Expo 2026."
              )}
            </p>
          </div>

          {/* Tab Switcher: Masuk / Daftar */}
          <div className="grid grid-cols-2 rounded-2xl bg-white/5 p-1 mb-6 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-xl py-2.5 transition cursor-pointer ${
                mode === "login"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg"
                  : "text-purple-300/70 hover:text-white"
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`rounded-xl py-2.5 transition cursor-pointer ${
                mode === "register"
                  ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg"
                  : "text-purple-300/70 hover:text-white"
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {/* Alert Error */}
          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* FORM LOGIN                                                */}
          {/* ========================================================= */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-purple-200 mb-1.5">
                  Email atau Nomor Registrasi (CCE) <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                  placeholder="Contoh: nama@email.com atau CCE2026-00007"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-purple-200 mb-1.5">
                  Kata Sandi <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Masukkan kata sandi akun Anda"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
                <span className="text-[10px] text-purple-300/60 mt-1 block">
                  Bagi yang mendaftar via tiket umum sebelumnya, dapat memasukkan nomor WhatsApp terdaftar sebagai kata sandi awal.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-fuchsia-600/30 transition hover:scale-[1.02] hover:shadow-2xl disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* FORM REGISTER                                             */}
          {/* ========================================================= */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-purple-200 mb-1">
                  Nama Lengkap <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  placeholder="Nama sesuai KTP / KTM"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Alamat Email <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="email@anda.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    No. WhatsApp / HP <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Status Peserta <span className="text-fuchsia-400">*</span>
                  </label>
                  <select
                    value={registerForm.participant_status}
                    onChange={(e) => setRegisterForm({ ...registerForm, participant_status: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-3.5 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                  >
                    <option value="Mahasiswa">Mahasiswa Aktif</option>
                    <option value="Fresh Graduate">Fresh Graduate</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Umum">Umum / Profesional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Usia / Umur <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="16"
                    max="65"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                    placeholder="Contoh: 22"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Asal Kampus / Instansi <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.institution}
                    onChange={(e) => setRegisterForm({ ...registerForm, institution: e.target.value })}
                    placeholder="Misal: UIN Jakarta, UI, ITB, dll"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Kota Domisili <span className="text-fuchsia-400">*</span>
                  </label>
                  <select
                    value={registerForm.domicile}
                    onChange={(e) => setRegisterForm({ ...registerForm, domicile: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-3.5 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                  >
                    <option value="DKI Jakarta">DKI Jakarta</option>
                    <option value="Tangerang Selatan">Tangerang Selatan</option>
                    <option value="Kota Tangerang">Kota Tangerang</option>
                    <option value="Kabupaten Tangerang">Kabupaten Tangerang</option>
                    <option value="Depok">Depok</option>
                    <option value="Bogor">Bogor</option>
                    <option value="Bekasi">Bekasi</option>
                    <option value="Lainnya">Lainnya / Luar Jabodetabek</option>
                  </select>
                </div>
              </div>

              {/* FAKULTAS (Gambar 2) */}
              <div>
                <label className="block font-bold text-purple-200 mb-1">
                  Fakultas <span className="text-fuchsia-400">*</span>
                </label>
                <select
                  required
                  value={registerForm.faculty}
                  onChange={(e) => setRegisterForm({ ...registerForm, faculty: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-[#1E0C36] px-3.5 py-2.5 text-white focus:border-fuchsia-400 focus:outline-none"
                >
                  {UIN_FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>

                {registerForm.faculty === "Yang lain / Luar UIN Syarif Hidayatullah Jakarta" && (
                  <div className="mt-2 animate-fadeIn">
                    <input
                      type="text"
                      required
                      value={registerForm.custom_faculty}
                      onChange={(e) => setRegisterForm({ ...registerForm, custom_faculty: e.target.value })}
                      placeholder="Tuliskan nama fakultas Anda..."
                      className="w-full rounded-xl border border-fuchsia-500/40 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* PROGRAM STUDI / JURUSAN */}
              <div>
                <label className="block font-bold text-purple-200 mb-1">
                  Program Studi / Jurusan <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.major}
                  onChange={(e) => setRegisterForm({ ...registerForm, major: e.target.value })}
                  placeholder="Contoh: Teknik Informatika / Manajemen / Psikologi"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              {/* TAHUN KELULUSAN & GPA/IPK TERAKHIR (Gambar 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-purple-200">
                      Tahun Kelulusan <span className="text-fuchsia-400">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={registerForm.graduation_year}
                    onChange={(e) => setRegisterForm({ ...registerForm, graduation_year: e.target.value })}
                    placeholder="Misal: 2024 atau Semester 7"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-purple-300/60 mt-1 block italic">
                    * Jika belum lulus, tuliskan semester Anda saat ini
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    GPA / IPK Terakhir <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.gpa}
                    onChange={(e) => setRegisterForm({ ...registerForm, gpa: e.target.value })}
                    placeholder="Contoh: 3.75"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-purple-300/60 mt-1 block">
                    IPK Kumulatif terakhir (skala 4.00)
                  </span>
                </div>
              </div>

              {/* KONFIRMASI REGISTRASI CCE 2026 (Gambar 3) */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <label className="block font-bold text-purple-200">
                  Apakah sudah mengisi form registrasi Career Compas Expo (CCE) 2026? <span className="text-fuchsia-400">*</span>
                </label>
                <div className="text-[11px] text-purple-300/70">
                  Wajib mengisi form registrasi CCE 2026 (
                  <a
                    href="https://www.careercompassexpo.web.id/registrasi?source=gate_standee"
                    target="_blank"
                    rel="noreferrer"
                    className="text-fuchsia-400 underline hover:text-fuchsia-300 font-semibold"
                  >
                    Registrasi CCE 2026
                  </a>
                  )
                </div>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cce_regis_confirmed"
                      value="Sudah"
                      checked={registerForm.cce_regis_confirmed === "Sudah"}
                      onChange={(e) => setRegisterForm({ ...registerForm, cce_regis_confirmed: e.target.value })}
                      className="accent-fuchsia-500 h-4 w-4"
                    />
                    <span className="font-semibold text-white">Sudah</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cce_regis_confirmed"
                      value="Belum"
                      checked={registerForm.cce_regis_confirmed === "Belum"}
                      onChange={(e) => setRegisterForm({ ...registerForm, cce_regis_confirmed: e.target.value })}
                      className="accent-fuchsia-500 h-4 w-4"
                    />
                    <span className="font-semibold text-purple-200">Belum</span>
                  </label>
                </div>
              </div>

              {/* UPLOAD BUKTI REGISTRASI CCE 2026 (Gambar 4) */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-purple-200">
                    Upload Bukti Registrasi Career Compas Expo (CCE) 2026
                  </label>
                  <span className="text-[10px] text-fuchsia-300 bg-fuchsia-500/15 border border-fuchsia-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Maks 10 MB
                  </span>
                </div>
                <p className="text-[11px] text-purple-300/70">
                  Unggah tangkapan layar (screenshot) atau PDF bukti pengisian form registrasi / tiket masuk CCE 2026.
                </p>

                {registerForm.cce_proof_url ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <span className="block text-xs font-bold text-emerald-300 truncate">
                          {registerForm.cce_proof_name || "Bukti Registrasi CCE"}
                        </span>
                        <a
                          href={registerForm.cce_proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-purple-300 underline hover:text-white"
                        >
                          Lihat file terunggah ↗
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/30 transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 py-3.5 px-4 text-center cursor-pointer hover:border-fuchsia-400 hover:bg-white/10 transition">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleUploadProof}
                      disabled={registerForm.is_uploading_proof}
                      className="hidden"
                    />
                    {registerForm.is_uploading_proof ? (
                      <div className="flex items-center gap-2 text-xs text-fuchsia-300">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Mengunggah berkas bukti (maks 10MB)...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
                        <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Pilih File Bukti Registrasi</span>
                        <span className="text-[10px] text-purple-400">(PDF, JPG, PNG)</span>
                      </div>
                    )}
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Kata Sandi <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Ulangi Kata Sandi <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.confirm_password}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
                    placeholder="Ketik ulang kata sandi"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white placeholder-purple-300/40 focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-fuchsia-600/30 transition hover:scale-[1.02] hover:shadow-2xl disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun &amp; Lanjutkan</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Card Info */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center text-[11px] text-purple-300/60 leading-relaxed">
            Data pelamar dijaga kerahasiaannya dan hanya dibagikan kepada HR Perusahaan Rekanan Career Compass Expo 2026 yang Anda lamar.
          </div>
        </div>
      </main>

      {/* Footer Mini */}
      <footer className="border-t border-white/10 py-4 text-center text-xs text-purple-300/50">
        © 2026 Career Compass Expo — Pusat Pengembangan Karier UIN Syarif Hidayatullah Jakarta
      </footer>
    </div>
  );
}

export default function PelamarAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0E041A] flex items-center justify-center text-purple-300 text-sm">
          Memuat formulir akun...
        </div>
      }
    >
      <PelamarAuthContent />
    </Suspense>
  );
}
