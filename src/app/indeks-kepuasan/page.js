"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const QUESTIONS = [
  {
    id: "q1",
    num: 1,
    title: "Apakah fasilitas fisik pada acara Career Preparation memadai untuk kegiatan ini?",
    minLabel: "Sangat Tidak Memadai",
    maxLabel: "Sangat Memadai",
  },
  {
    id: "q2",
    num: 2,
    title: "Apakah informasi yang diberikan lengkap dan mudah dipahami?",
    minLabel: "Sangat Tidak Mudah Dipahami",
    maxLabel: "Sangat Mudah Dipahami",
  },
  {
    id: "q3",
    num: 3,
    title: "Bagaimana pendapat Anda mengenai kebersihan dan kerapihan lokasi Career Preparation?",
    minLabel: "Sangat Tidak Bersih",
    maxLabel: "Sangat Bersih",
  },
  {
    id: "q4",
    num: 4,
    title: "Apakah peserta mudah memahami peta lokasi pada acara Career Preparation?",
    minLabel: "Sangat Tidak Mudah Dipahami",
    maxLabel: "Sangat Mudah Dipahami",
  },
  {
    id: "q5",
    num: 5,
    title: "Apakah acara dimulai dan berlangsung sesuai jadwal yang telah diinformasikan?",
    minLabel: "Sangat Tidak Sesuai",
    maxLabel: "Sangat Sesuai",
  },
  {
    id: "q6",
    num: 6,
    title: "Apakah panitia dengan sigap membantu dan menjawab pertanyaan Anda selama acara berlangsung?",
    minLabel: "Sangat Tidak Membantu",
    maxLabel: "Sangat Membantu",
  },
  {
    id: "q7",
    num: 7,
    title: "Seberapa cepat Anda mendapatkan informasi yang Anda butuhkan selama acara berlangsung?",
    minLabel: "Sangat Lama",
    maxLabel: "Sangat Cepat",
  },
  {
    id: "q8",
    num: 8,
    title: "Apakah panitia memiliki pengetahuan yang baik tentang partner yang berpartisipasi?",
    minLabel: "Sangat Tidak Baik",
    maxLabel: "Sangat Baik",
  },
  {
    id: "q9",
    num: 9,
    title: "Seberapa yakin Anda dengan informasi yang disampaikan panitia terkait kegiatan Career Preparation ini?",
    minLabel: "Sangat Tidak Yakin",
    maxLabel: "Sangat Yakin",
  },
  {
    id: "q10",
    num: 10,
    title: "Seberapa peduli panitia terhadap kebutuhan Anda selama acara berlangsung?",
    minLabel: "Sangat Tidak Peduli",
    maxLabel: "Sangat Peduli",
  },
  {
    id: "q11",
    num: 11,
    title: "Apakah Anda merasa didengarkan dan diperhatikan oleh panitia acara?",
    minLabel: "Sangat Tidak Didengarkan",
    maxLabel: "Sangat Didengarkan",
  },
];

const FACULTY_CHOICES = [
  "FITK",
  "FU",
  "FDI",
  "FDIKOM",
  "FSH",
  "FST",
  "FEB",
  "FAH",
  "FISIP",
  "FK",
  "FIKES",
  "FPsi",
  "SPS",
  "Lainnya / Luar UIN",
];

export default function IndeksKepuasanPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    status: "Mahasiwa",
    institution: "UIN Syarif Hidayatullah Jakarta",
    facultyChoice: "FST",
    facultyMajorText: "",
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
    q6: 5,
    q7: 5,
    q8: 5,
    q9: 5,
    q10: 5,
    q11: 5,
  });

  // Pre-fill dari session pelamar atau peserta jika ada
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedPelamar = localStorage.getItem("cce_pelamar_session");
        if (storedPelamar) {
          const p = JSON.parse(storedPelamar);
          setFormData((prev) => ({
            ...prev,
            email: p.email || prev.email,
            fullName: p.name || prev.fullName,
            institution: "UIN Syarif Hidayatullah Jakarta",
            facultyMajorText: p.major ? `${p.faculty || ""} / ${p.major}` : prev.facultyMajorText,
          }));
        } else {
          const storedPart = localStorage.getItem("cce_participant");
          if (storedPart) {
            const pt = JSON.parse(storedPart);
            setFormData((prev) => ({
              ...prev,
              email: pt.email || prev.email,
              fullName: pt.full_name || prev.fullName,
              institution: pt.institution || prev.institution,
            }));
          }
        }
      } catch {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (qId, ratingValue) => {
    setFormData((prev) => ({ ...prev, [qId]: ratingValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.email.trim() || !formData.fullName.trim()) {
      setErrorMsg("Mohon lengkapi Email dan Nama Lengkap Anda.");
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/indeks-kepuasan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengirimkan formulir.");
      }

      setSuccess(true);
      window.scrollTo({ top: 200, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kendala saat mengirim data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 text-center border-b border-slate-200">
        <div className="pointer-events-none absolute -left-20 top-5 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-5 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-700 mb-4 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>EVALUASI ACARA • CAREER COMPASS EXPO 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            Indeks Kepuasan Peserta
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Berikan evaluasi objektif Anda terhadap fasilitas, pelayanan panitia, dan pelaksanaan rangkaian Career Preparation &amp; CCE 2026 guna peningkatan kualitas di masa mendatang.
          </p>
        </div>
      </section>

      {/* Form Content Container */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div>
          {success ? (
            <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 text-center shadow-xs animate-fadeIn">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Terima Kasih Atas Partisipasi Anda!
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-slate-600 leading-relaxed">
                Penilaian dan tanggapan Indeks Kepuasan Anda telah berhasil dikirimkan ke Google Forms dan tersimpan di sistem Pusat Karier UIN Syarif Hidayatullah Jakarta.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/"
                  className="rounded-full bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-7 py-3 text-sm font-bold text-white shadow-md shadow-purple-600/20 hover:scale-105 transition"
                >
                  Kembali ke Beranda
                </Link>
                <Link
                  href="/pelamar/dashboard"
                  className="rounded-full border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Buka Dashboard Pelamar
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMsg && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 flex items-center gap-3 shadow-xs">
                  <svg className="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Identitas Peserta */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#EF17D8] text-white font-black text-sm shadow-2xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Identitas Peserta
                    </h2>
                    <p className="text-xs text-slate-500">
                      Isikan data identitas diri Anda dengan benar.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="contoh: nama@domain.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition"
                    />
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Status Peserta <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Mahasiwa", "Alumni", "Umum"].map((st) => (
                        <label
                          key={st}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold cursor-pointer transition ${
                            formData.status === st
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow-xs ring-1 ring-purple-500/20"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={st}
                            checked={formData.status === st}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span>{st}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Asal Instansi */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Asal Instansi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      required
                      placeholder="Misal: UIN Syarif Hidayatullah Jakarta"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition"
                    />
                  </div>

                  {/* Fakultas (Dropdown) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Fakultas (Pilihan) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="facultyChoice"
                      value={formData.facultyChoice}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition"
                    >
                      {FACULTY_CHOICES.map((f) => (
                        <option key={f} value={f} className="text-slate-900">
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fakultas/Jurusan (Spesifik Teks) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Fakultas / Program Studi (Spesifik)
                    </label>
                    <span className="block text-[11px] text-slate-400 mb-2 italic">
                      Contoh: FST / Matematika atau FEB / Manajemen
                    </span>
                    <input
                      type="text"
                      name="facultyMajorText"
                      value={formData.facultyMajorText}
                      onChange={handleChange}
                      placeholder="Contoh: FST / Teknik Informatika"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pertanyaan Indeks Kepuasan */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#EF17D8] text-white font-black text-sm shadow-2xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Pertanyaan Indeks Kepuasan
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pilih skala penilaian dari 1 (Sangat Tidak Setuju / Kurang) sampai 5 (Sangat Setuju / Memadai).
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {QUESTIONS.map((q) => {
                    const currentVal = formData[q.id];
                    return (
                      <div
                        key={q.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-purple-300 hover:bg-slate-50"
                      >
                        <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug mb-3">
                          <span className="text-purple-600 font-bold mr-1.5">{q.num}.</span>
                          {q.title} <span className="text-rose-500">*</span>
                        </p>

                        {/* Linear Scale 1 - 5 Selector */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = currentVal === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleRatingChange(q.id, val)}
                                  className={`flex-1 flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-purple-600 bg-gradient-to-b from-[#7226FF] to-[#EF17D8] text-white shadow-md shadow-purple-600/30 scale-105"
                                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-2xs"
                                  }`}
                                >
                                  <span>{val}</span>
                                  {isSelected && (
                                    <span className="text-[10px] sm:text-xs">★</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Label Min & Max Scale */}
                          <div className="mt-2.5 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 px-1 font-medium">
                            <span className="flex items-center gap-1 text-rose-600">
                              <span>1 =</span> {q.minLabel}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 text-right">
                              <span>5 =</span> {q.maxLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Action Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs">
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mb-6">
                  Dengan menekan tombol di bawah, evaluasi Anda akan otomatis disinkronkan ke respons resmi Google Forms panitia dan database Pusat Karier UIN Jakarta.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#7226FF] via-[#A825FF] to-[#EF17D8] px-10 py-4 text-sm sm:text-base font-extrabold text-white shadow-md shadow-purple-600/20 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Mengirim Penilaian...</span>
                    </>
                  ) : (
                    <span>Kirim Indeks Kepuasan</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}
