"use client";

import { useState } from "react";
import Link from "next/link";

const initialForm = {
  // Halaman 1: Data Diri & Akademik
  full_name: "",
  email: "",
  phone: "",
  domicile: "",
  domicile_other: "",
  participant_status: "",
  institution_type: "",
  institution: "",
  semester: "",
  faculty: "",
  major: "",

  // Halaman 2: Hari Kehadiran, Rencana Kunjungan & Survei
  attendance_day: "DAY1",
  visit_plans: [],
  info_source: "",
  info_source_other: "",
  expectations: "",

  // Halaman 3: Bukti Unduh TactLink
  tactlink_proof: "",
  tactlink_filename: "",

  // Honeypot
  website: "",
};

const faculties = [
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
];

const attendanceDays = [
  {
    id: "DAY1",
    title: "Day 1 — Rabu, 18 November 2026",
    dateText: "18 November 2026",
    badge: "Day 1 (18 Nov)",
    badgeColor: "bg-blue-600 text-white",
    desc: "Opening Ceremony, 28+ Booth Job Fair, Walk-In Interview & Career Seminar Day 1",
  },
  {
    id: "DAY2",
    title: "Day 2 — Kamis, 19 November 2026",
    dateText: "19 November 2026",
    badge: "Day 2 (19 Nov)",
    badgeColor: "bg-purple-600 text-white",
    desc: "28+ Booth Job Fair, Walk-In Interview, Tech Talk & Closing Career Expo",
  },
  {
    id: "BOTH",
    title: "Kedua Hari (18 & 19 November 2026)",
    dateText: "18 & 19 November 2026",
    badge: "2 Hari Penuh",
    badgeColor: "bg-emerald-600 text-white",
    desc: "Akses penuh selama 2 hari berturut-turut untuk seluruh agenda pameran & wawancara",
  },
];

const visitOptions = [
  { id: "Job Fair", label: "Job Fair", desc: "Kunjungi booth 28+ perusahaan terkemuka" },
  { id: "Career Preparation", label: "Career Preparation", desc: "Insight persiapan studi lanjut & karier global" },
  { id: "Walk In Interview", label: "Walk In Interview", desc: "Wawancara langsung bersama rekruter di lokasi" },
];

const infoSources = [
  "Teman",
  "Keluarga",
  "Instagram",
  "WhatsApp",
  "LinkedIn",
  "Brosur",
  "Medpart",
  "Yang lain",
];

export default function RegistrasiPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [fileSize, setFileSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleInputChange(e) {
    updateField(e.target.name, e.target.value);
  }

  function handleCheckboxChange(planId) {
    setForm((prev) => {
      const exists = prev.visit_plans.includes(planId);
      const updated = exists
        ? prev.visit_plans.filter((item) => item !== planId)
        : [...prev.visit_plans, planId];
      return { ...prev, visit_plans: updated };
    });
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Format berkas harus berupa gambar (JPG, PNG, atau WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar terlalu besar (maksimal 5MB).");
      return;
    }

    setError("");
    setFileSize((file.size / 1024).toFixed(0) + " KB");

    // Kompres gambar ringan menggunakan canvas agar upload cepat & ukuran efisien
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        updateField("tactlink_proof", compressedDataUrl);
        updateField("tactlink_filename", file.name);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveFile() {
    updateField("tactlink_proof", "");
    updateField("tactlink_filename", "");
    setFileSize(null);
  }

  function validateStep1() {
    setError("");
    if (!form.full_name || form.full_name.trim().length < 3) {
      setError("Nama Lengkap minimal 3 karakter.");
      return false;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Alamat email tidak valid.");
      return false;
    }
    if (!form.phone || form.phone.trim().length < 9) {
      setError("Nomor WhatsApp wajib diisi (minimal 9 digit).");
      return false;
    }
    if (!form.domicile) {
      setError("Pilih salah satu domisili kamu.");
      return false;
    }
    if (form.domicile === "Lainnya" && !form.domicile_other.trim()) {
      setError("Harap sebutkan domisili kamu.");
      return false;
    }
    if (!form.participant_status) {
      setError("Pilih status peserta kamu.");
      return false;
    }
    if (!form.institution_type) {
      setError("Pilih asal instansi kamu.");
      return false;
    }
    if (form.institution_type === "Umum" && !form.institution.trim()) {
      setError("Harap isi nama asal instansi atau universitas kamu.");
      return false;
    }
    return true;
  }

  function validateStep2() {
    setError("");
    if (!form.attendance_day || !["DAY1", "DAY2", "BOTH"].includes(form.attendance_day)) {
      setError("Pilih salah satu hari kehadiran CCE 2026.");
      return false;
    }
    if (form.visit_plans.length === 0) {
      setError("Rencana Kunjungan CCE wajib dipilih minimal satu.");
      return false;
    }
    if (!form.info_source) {
      setError("Pilih dari mana kamu mengetahui kegiatan ini.");
      return false;
    }
    if (form.info_source === "Yang lain" && !form.info_source_other.trim()) {
      setError("Harap sebutkan sumber informasi lainnya.");
      return false;
    }
    if (!form.expectations || form.expectations.trim().length < 2) {
      setError("Harap isi harapan kamu dalam menghadiri acara ini.");
      return false;
    }
    return true;
  }

  function handleNextStep1(e) {
    e.preventDefault();
    if (validateStep1()) {
      setError("");
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleNextStep2(e) {
    e.preventDefault();
    if (validateStep2()) {
      setError("");
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrevStep() {
    setError("");
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    if (window.confirm("Apakah kamu yakin ingin mengosongkan seluruh formulir?")) {
      setForm(initialForm);
      setFileSize(null);
      setStep(1);
      setError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validateStep2()) {
      setStep(2);
      return;
    }

    if (!form.tactlink_proof) {
      setError("Harap unggah bukti screenshot aplikasi / akun TactLink kamu terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal.");
      }

      setResult(data.participant);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle =
    "w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-[#1E0C36] outline-none transition focus:border-[#7226FF] focus:ring-2 focus:ring-[#7226FF]/20";

  // Tampilan Halaman Sukses
  if (result) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const scanUrl = `${origin}/scan?reg=${encodeURIComponent(result.registration_number)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
      scanUrl
    )}`;

    const dayBadgeStyle =
      result.attendance_day === "DAY2"
        ? "from-purple-600 to-pink-600 text-white"
        : result.attendance_day === "BOTH"
        ? "from-emerald-600 to-teal-600 text-white"
        : "from-blue-600 to-indigo-600 text-white";

    const dayTitle =
      result.attendance_day_label ||
      (result.attendance_day === "DAY2"
        ? "Day 2 — Kamis, 19 November 2026"
        : result.attendance_day === "BOTH"
        ? "Kedua Hari (18 & 19 November 2026)"
        : "Day 1 — Rabu, 18 November 2026");

    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1E0C36] via-[#4B1E85] to-[#7226FF] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 text-center text-[#1E0C36] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#7226FF] via-[#EF17D8] to-[#7226FF]" />
          
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-50 p-2">
            <img
              src="/images/icons/robot%204.png"
              alt="Robot Sukses Registrasi"
              className="h-full w-full object-contain"
            />
          </div>

          <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            Pendaftaran Berhasil Diterima
          </span>

          <h1 className="mt-3 text-2xl font-black text-[#1E0C36]">
            Official E-Ticket CCE 2026
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Selamat, <strong className="text-[#7226FF]">{result.full_name}</strong>! E-Ticket kamu sudah siap.
          </p>

          {/* Kartu E-Ticket */}
          <div className="mt-6 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/70 p-5 sm:p-6 text-center relative">
            {/* Badge Hari Kehadiran */}
            <div className="mb-3 inline-block">
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${dayBadgeStyle} px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-md`}>
                <span>📅</span>
                <span>{dayTitle}</span>
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-purple-800">
              QR Code Kehadiran & Akses Masuk
            </p>
            
            {/* Box QR Code */}
            <div className="mx-auto my-4 flex h-56 w-56 items-center justify-center rounded-2xl bg-white p-3 shadow-md border-2 border-purple-100">
              <img
                src={qrUrl}
                alt={`QR Code ${result.registration_number}`}
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomor Registrasi Resmi</p>
            <div className="mt-1 text-2xl sm:text-3xl font-black tracking-wider text-[#7226FF] font-mono">
              {result.registration_number}
            </div>

            {/* Peringatan Hari Scan */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
              <div className="flex items-start gap-2 text-amber-800">
                <span className="text-base shrink-0">⚠️</span>
                <p className="text-xs leading-relaxed font-medium">
                  <strong>PENTING:</strong> Tiket ini <strong>hanya valid dan hanya bisa masuk ketika discan pada tanggal yang sesuai ({dayTitle})</strong>. Sistem scanner panitia akan otomatis menolak jika dipindai di luar jadwal terdaftar.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            Tunjukkan kode QR ini kepada panitia meja registrasi di{" "}
            <strong>Auditorium Harun Nasution UIN Syarif Hidayatullah Jakarta</strong>.
          </p>

          {/* Tombol Aksi */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Cetak / Simpan E-Ticket</span>
            </button>
            <Link
              href="/"
              className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 px-5 py-3.5 text-sm font-bold text-gray-700 transition flex items-center justify-center gap-1.5"
            >
              <span>←</span>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isUIN = form.institution_type === "UIN Syarif Hidayatullah Jakarta";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1E0C36] via-[#4B1E85] to-[#7226FF] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-white/90 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header Kartu */}
          <div className="bg-gradient-to-r from-[#7226FF] to-[#EF17D8] p-8 text-white relative">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                CAREER CAMPUS EXPO 2026
              </p>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold backdrop-blur-sm">
                Langkah {step} dari 3
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              {step === 1
                ? "Registrasi Peserta"
                : step === 2
                ? "Career Campus Expo"
                : "Siapkan TactLink"}
            </h1>
            <p className="mt-2 text-sm text-white/90">
              {step === 1
                ? "Isi data diri dan instansi kamu untuk mendapatkan tiket masuk acara."
                : step === 2
                ? "Tentukan rencana kunjungan dan preferensi agenda kamu selama acara."
                : "Langkah terakhir sebelum klaim tiket Anda! Ikuti panduan video di bawah ini."}
            </p>

            {/* Progress Bar */}
            <div className="mt-6 h-1.5 w-full rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{
                  width: step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%",
                }}
              />
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={
              step === 1
                ? handleNextStep1
                : step === 2
                ? handleNextStep2
                : handleSubmit
            }
            className="p-6 sm:p-8 text-[#1E0C36]"
          >
            {/* HALAMAN 1: Data Diri & Instansi */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="mb-2 block font-bold text-sm text-gray-800">
                    Email <span className="text-[#EF17D8]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={fieldStyle}
                    placeholder="nama@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="full_name" className="mb-2 block font-bold text-sm text-gray-800">
                    Nama Lengkap <span className="text-[#EF17D8]">*</span>
                    <span className="ml-2 font-normal text-xs text-gray-500 italic">(contoh: Sultan Satria)</span>
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleInputChange}
                    className={fieldStyle}
                    placeholder="Masukkan nama lengkap"
                    minLength={3}
                    maxLength={150}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block font-bold text-sm text-gray-800">
                    Nomor WhatsApp <span className="text-[#EF17D8]">*</span>
                    <span className="ml-2 font-normal text-xs text-gray-500 italic">(contoh: +628XXXXXXXXXX)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className={fieldStyle}
                    placeholder="+628xxxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-sm text-gray-800">
                    Domisili <span className="text-[#EF17D8]">*</span>
                  </label>
                  <div className="space-y-2 rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                    {["Tangerang Selatan", "DKI Jakarta", "Depok", "Kota Tangerang"].map((item) => (
                      <label key={item} className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                        <input
                          type="radio"
                          name="domicile"
                          value={item}
                          checked={form.domicile === item}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-[#7226FF]"
                          required
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="domicile"
                        value="Lainnya"
                        checked={form.domicile === "Lainnya"}
                        onChange={handleInputChange}
                        className="h-4 w-4 accent-[#7226FF]"
                      />
                      <span>Lainnya:</span>
                    </label>
                    {form.domicile === "Lainnya" && (
                      <input
                        name="domicile_other"
                        value={form.domicile_other}
                        onChange={handleInputChange}
                        className={`${fieldStyle} mt-2 text-sm`}
                        placeholder="Sebutkan domisili kamu"
                        required
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-bold text-sm text-gray-800">
                    Status <span className="text-[#EF17D8]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Mahasiswa", "Alumni", "Umum"].map((item) => (
                      <label
                        key={item}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 cursor-pointer text-center transition-all ${
                          form.participant_status === item
                            ? "border-[#7226FF] bg-purple-50 text-[#7226FF] font-bold shadow-sm"
                            : "border-gray-200 text-gray-700 hover:border-purple-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="participant_status"
                          value={item}
                          checked={form.participant_status === item}
                          onChange={handleInputChange}
                          className="sr-only"
                          required
                        />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-bold text-sm text-gray-800">
                    Asal Instansi <span className="text-[#EF17D8]">*</span>
                  </label>
                  <div className="space-y-2 rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="institution_type"
                        value="UIN Syarif Hidayatullah Jakarta"
                        checked={form.institution_type === "UIN Syarif Hidayatullah Jakarta"}
                        onChange={handleInputChange}
                        className="h-4 w-4 accent-[#7226FF]"
                        required
                      />
                      <span>UIN Syarif Hidayatullah Jakarta</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="institution_type"
                        value="Umum"
                        checked={form.institution_type === "Umum"}
                        onChange={handleInputChange}
                        className="h-4 w-4 accent-[#7226FF]"
                      />
                      <span>Umum / Instansi Lain</span>
                    </label>
                    {form.institution_type === "Umum" && (
                      <input
                        name="institution"
                        value={form.institution}
                        onChange={handleInputChange}
                        className={`${fieldStyle} mt-2 text-sm`}
                        placeholder="Nama universitas / institusi / perusahaan"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Bagian Khusus Mahasiswa / Alumni UIN */}
                {isUIN && (
                  <div className="space-y-4 rounded-2xl border border-purple-200 bg-purple-50/60 p-5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#7226FF]">
                      Data Mahasiswa / Alumni UIN Jakarta
                    </p>

                    <div>
                      <label htmlFor="semester" className="mb-2 block font-bold text-sm text-gray-800">
                        Semester
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={form.semester}
                        onChange={handleInputChange}
                        className={fieldStyle}
                      >
                        <option value="">Pilih semester</option>
                        {["2", "4", "6", "8", "10", "12", "14", "Alumni"].map((sem) => (
                          <option key={sem} value={sem}>
                            {sem === "Alumni" ? "Alumni" : `Semester ${sem}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="faculty" className="mb-2 block font-bold text-sm text-gray-800">
                        Fakultas
                        <span className="ml-2 font-normal text-xs text-gray-500 italic">*Khusus UIN Jakarta</span>
                      </label>
                      <select
                        id="faculty"
                        name="faculty"
                        value={form.faculty}
                        onChange={handleInputChange}
                        className={fieldStyle}
                      >
                        <option value="">Pilih fakultas</option>
                        {faculties.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="major" className="mb-2 block font-bold text-sm text-gray-800">
                        Program Studi
                      </label>
                      <input
                        id="major"
                        name="major"
                        value={form.major}
                        onChange={handleInputChange}
                        className={fieldStyle}
                        placeholder="Contoh: Teknik Informatika, Manajemen"
                      />
                    </div>
                  </div>
                )}

                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-6 py-4 font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-[1.01]"
                >
                  <span>Berikutnya</span>
                  <span className="text-lg">→</span>
                </button>
              </div>
            )}

            {/* HALAMAN 2: Career Company Expo (CCE) Kunjungan & Survei */}
            {step === 2 && (
              <div className="space-y-6">
                {/* 1. Pilihan Hari Kehadiran */}
                <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-base text-gray-900">
                      Pilihan Hari Kehadiran <span className="text-[#EF17D8]">*</span>
                    </label>
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-[#7226FF]">
                      Wajib Dipilih
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Pilih hari rencana kedatangan kamu. <strong className="text-purple-700">Perhatian:</strong> QR Code tiket hanya dapat dipindai dan berlaku masuk pada hari yang kamu pilih.
                  </p>
                  <div className="space-y-3">
                    {attendanceDays.map((day) => {
                      const isSelected = form.attendance_day === day.id;
                      return (
                        <label
                          key={day.id}
                          className={`flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#7226FF] bg-purple-50/80 shadow-md ring-2 ring-[#7226FF]/20"
                              : "border-gray-200 hover:border-purple-200 bg-white hover:bg-gray-50/60"
                          }`}
                        >
                          <input
                            type="radio"
                            name="attendance_day"
                            value={day.id}
                            checked={isSelected}
                            onChange={handleInputChange}
                            className="mt-1 h-5 w-5 accent-[#7226FF] cursor-pointer"
                            required
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-sm text-gray-900">{day.title}</span>
                              <span className={`rounded-md ${day.badgeColor} px-2.5 py-0.5 text-[11px] font-bold shadow-sm`}>
                                {day.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-600 leading-relaxed">{day.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Rencana Kunjungan CCE */}
                <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                  <label className="mb-1 block font-bold text-base text-gray-900">
                    Rencana Kunjungan CCE <span className="text-[#EF17D8]">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Pilih satu atau beberapa agenda yang ingin kamu ikuti selama pameran
                  </p>
                  <div className="space-y-3">
                    {visitOptions.map((opt) => {
                      const checked = form.visit_plans.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                            checked
                              ? "border-[#7226FF] bg-purple-50/70"
                              : "border-gray-200 hover:border-purple-200 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxChange(opt.id)}
                            className="mt-1 h-5 w-5 rounded border-gray-300 accent-[#7226FF]"
                          />
                          <div>
                            <span className="block font-bold text-sm text-gray-800">{opt.label}</span>
                            <span className="block text-xs text-gray-500">{opt.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Dari Mana Kamu Mengetahui Kegiatan ini */}
                <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                  <label className="mb-3 block font-bold text-base text-gray-900">
                    Dari Mana Kamu Mengetahui Kegiatan ini <span className="text-[#EF17D8]">*</span>
                  </label>
                  <div className="space-y-2.5">
                    {infoSources.map((source) => (
                      <label key={source} className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                        <input
                          type="radio"
                          name="info_source"
                          value={source}
                          checked={form.info_source === source}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-[#7226FF]"
                          required
                        />
                        <span>{source === "Yang lain" ? "Yang lain:" : source}</span>
                      </label>
                    ))}
                    {form.info_source === "Yang lain" && (
                      <input
                        name="info_source_other"
                        value={form.info_source_other}
                        onChange={handleInputChange}
                        className={`${fieldStyle} mt-2 text-sm`}
                        placeholder="Sebutkan sumber lainnya"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* 4. Harapan dalam menghadiri acara ini */}
                <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                  <label htmlFor="expectations" className="mb-2 block font-bold text-base text-gray-900">
                    Harapan dalam menghadiri acara ini <span className="text-[#EF17D8]">*</span>
                  </label>
                  <textarea
                    id="expectations"
                    name="expectations"
                    rows={4}
                    value={form.expectations}
                    onChange={handleInputChange}
                    className={fieldStyle}
                    placeholder="Jawaban Anda"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Tombol Aksi Bawah Step 2 */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="rounded-xl border border-purple-300 bg-white px-6 py-3.5 text-sm font-bold text-[#7226FF] transition hover:bg-purple-50 disabled:opacity-50"
                  >
                    ← Kembali
                  </button>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="text-xs text-gray-500 underline hover:text-gray-700 transition"
                    >
                      Kosongkan formulir
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-[1.02] disabled:opacity-50"
                    >
                      <span>Lanjut ke Langkah 3</span>
                      <span className="text-lg">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* HALAMAN 3: Tutorial TactLink & Unggah Bukti */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Badge Header Tutorial */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-600">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    TUTORIAL VIDEO
                  </span>
                </div>

                {/* Video 1: Download dan Buat Akun */}
                <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7226FF] text-white text-xs font-black shrink-0">
                      1
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      Download dan buat akun TactLink
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Tonton video panduan di bawah ini untuk mengunduh aplikasi TactLink dan membuat akun baru.
                  </p>
                  <div className="w-full max-w-[280px] sm:max-w-[300px] aspect-[9/16] mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-purple-100 bg-black">
                    <iframe
                      src="https://www.youtube.com/embed/v7jOZ2_Igu8"
                      title="Tutorial 1: Download dan buat akun TactLink"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Video 2: Check-in Acara di TactLink */}
                <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7226FF] text-white text-xs font-black shrink-0">
                      2
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      Check-in acara di TactLink
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Simak cara check-in acara melalui aplikasi TactLink yang akan dipakai panitia untuk akses di lokasi acara.
                  </p>
                  <div className="w-full max-w-[280px] sm:max-w-[300px] aspect-[9/16] mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-purple-100 bg-black">
                    <iframe
                      src="https://www.youtube.com/embed/JuYtU3TVvYo"
                      title="Tutorial 2: Check-in acara di TactLink"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Form Unggah Bukti Screenshot Download TactLink */}
                <div className="rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/40 p-5 sm:p-6 transition">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-bold text-sm sm:text-base text-gray-900">
                      Unggah Bukti Screenshot Download TactLink <span className="text-[#EF17D8]">*</span>
                    </label>
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                      Wajib
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Unggah screenshot bukti bahwa kamu sudah mengunduh aplikasi TactLink di HP kamu atau screenshot akun TactLink yang sudah terdaftar.
                  </p>

                  {!form.tactlink_proof ? (
                    <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-white p-6 cursor-pointer hover:bg-purple-50/60 hover:border-[#7226FF] transition group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileSelect}
                        className="sr-only"
                        required
                      />
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#7226FF] group-hover:scale-110 transition shadow-sm mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <span className="font-bold text-sm text-[#7226FF]">
                        Pilih Berkas Screenshot
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Format JPG, PNG, atau WEBP (Maksimal 5MB)
                      </span>
                    </label>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-300 bg-white shadow-sm">
                          <img
                            src={form.tactlink_proof}
                            alt="Preview Bukti Screenshot TactLink"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 mb-1">
                            ✓ Berkas Siap Diunggah
                          </span>
                          <p className="font-bold text-sm text-gray-800 truncate max-w-xs sm:max-w-md">
                            {form.tactlink_filename || "bukti-tactlink.jpg"}
                          </p>
                          {fileSize && (
                            <p className="text-xs text-gray-500 mt-0.5">Ukuran: {fileSize}</p>
                          )}
                          <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                            <label className="cursor-pointer rounded-lg bg-white border border-purple-200 px-3 py-1.5 text-xs font-bold text-[#7226FF] hover:bg-purple-50 transition shadow-xs">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={handleFileSelect}
                                className="sr-only"
                              />
                              Ganti Foto
                            </label>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="rounded-lg bg-white border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition shadow-xs"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Tombol Aksi Bawah Step 3 */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="rounded-xl border border-purple-300 bg-white px-6 py-3.5 text-sm font-bold text-[#7226FF] transition hover:bg-purple-50 disabled:opacity-50"
                  >
                    ← Kembali
                  </button>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="text-xs text-gray-500 underline hover:text-gray-700 transition"
                    >
                      Kosongkan formulir
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-[1.02] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Registrasi & Klaim Tiket</span>
                          <span className="text-lg">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
