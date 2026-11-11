import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import DocumSlider from "@/components/DocumSlider";
import EventInfoBook from "@/components/EventInfoBook";
import FeatureCards from "@/components/FeatureCards";
import TactlinkSection from "@/components/TactlinkSection";
import Navbar from "@/components/Navbar";
import JobsDisplay from "@/components/JobsDisplay";

const features = [
  {
    icon: "/images/icons/robot%204.png",
    alt: "Robot Checklist Registrasi",
    badge: "01",
    title: "Registrasi Peserta",
    desc: "Daftar dan dapatkan tiket QR Code untuk menghadiri acara serta akses masuk pameran.",
    highlight: "from-[#EF17D8]/25 to-[#7226FF]/25",
    borderGlow: "group-hover:border-[#EF17D8]/60",
    link: "/registrasi",
    cta: "Daftar Sekarang",
  },
  {
    icon: "/images/icons/robot%207.png",
    alt: "Robot Ide Karier & Peluang",
    badge: "02",
    title: "Lowongan Kerja",
    desc: "Jelajahi peluang karier dari puluhan perusahaan ternama di berbagai sektor industri.",
    highlight: "from-[#7226FF]/25 to-indigo-500/25",
    borderGlow: "group-hover:border-[#7226FF]/60",
    link: "#tentang",
    cta: "Pelajari lebih lanjut",
  },
  {
    icon: "/images/icons/robot%206.png",
    alt: "Robot Berkas & Lamaran",
    badge: "03",
    title: "Lamaran Online",
    desc: "Daftar akun pelamar pekerjaan dan unggah berkas CV serta portofolio langsung via website.",
    highlight: "from-cyan-400/25 to-[#7226FF]/25",
    borderGlow: "group-hover:border-cyan-400/60",
    link: "#alur",
    cta: "Pelajari lebih lanjut",
  },
  {
    icon: "/images/icons/robot%209.png",
    alt: "Robot Jadwal Interview",
    badge: "04",
    title: "Walk-in Interview",
    desc: "Ikuti proses interview secara langsung di lokasi acara sesuai jadwal yang ditetapkan.",
    highlight: "from-amber-400/25 to-[#EF17D8]/25",
    borderGlow: "group-hover:border-amber-400/60",
    link: "#alur",
    cta: "Pelajari lebih lanjut",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Header Sticky / Navbar Responsif dengan Hamburger Mobile */}
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/70 via-white to-white px-4 py-16 sm:px-6 sm:py-24 text-center border-b border-slate-100">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

        {/* Ornamen Wave Halus (Clean Background Accents) */}
        <img
          src="/images/icons/wave%201.png"
          alt=""
          className="pointer-events-none absolute -left-16 -top-10 w-60 sm:w-80 md:w-96 lg:w-[28rem] opacity-45 select-none"
        />
        <img
          src="/images/icons/wave%204.png"
          alt=""
          className="pointer-events-none absolute -right-16 -top-10 w-60 sm:w-80 md:w-96 lg:w-[28rem] opacity-45 select-none"
        />
        <img
          src="/images/icons/wave%202.png"
          alt=""
          className="pointer-events-none absolute -right-12 bottom-6 w-48 sm:w-64 md:w-80 opacity-35 select-none"
        />

        <div className="relative mx-auto max-w-7xl">
          {/* Baris Robot 5 (Kiri) - Teks Judul - Robot 1 (Kanan) */}
          <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8 lg:gap-12">
            {/* Robot 5 di sebelah kiri */}
            <div className="relative flex shrink-0 items-center justify-center">
              <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-pink-300/30 blur-2xl sm:h-48 sm:w-48 md:h-64 md:w-64" />
              <img
                src="/images/icons/robot%205.png"
                alt="Maskot Robot 5 (Kiri)"
                className="relative z-10 w-24 sm:w-36 md:w-56 lg:w-72 xl:w-80 object-contain drop-shadow-xl animate-float-slow transition-transform hover:scale-105"
              />
            </div>

            {/* Tulisan Career Compass Expo 2026 di tengah */}
            <div className="min-w-0 flex-1 text-center">
              <p className="mb-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-purple-700">
                UIN Syarif Hidayatullah Jakarta
              </p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase leading-[1.05] tracking-tight text-slate-900">
                Career<br />Compass Expo<br />
                <span className="bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] bg-clip-text text-transparent">2026</span>
              </h1>
            </div>

            {/* Robot 1 di sebelah kanan */}
            <div className="relative flex shrink-0 items-center justify-center">
              <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-purple-300/30 blur-2xl sm:h-48 sm:w-48 md:h-64 md:w-64" />
              <img
                src="/images/icons/robot%201.png"
                alt="Maskot Robot 1 (Kanan)"
                className="relative z-10 w-24 sm:w-36 md:w-56 lg:w-72 xl:w-80 object-contain drop-shadow-xl animate-float-reverse transition-transform hover:scale-105"
              />
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-base sm:text-lg text-slate-600">
            Jelajahi peluang karier, temukan lowongan pekerjaan,
            dan ikuti walk-in interview bersama perusahaan peserta.
          </p>

          {/* Informasi Waktu & Lokasi Pelaksanaan */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Badge Waktu Pelaksanaan */}
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-[#EF17D8]/60 hover:shadow-md">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EF17D8] to-[#7226FF] shadow-md shadow-pink-500/20 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Waktu Pelaksanaan</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-wide">18–19 November 2026</span>
              </div>
            </div>

            {/* Badge Lokasi Acara */}
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-[#7226FF]/60 hover:shadow-md">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#EF17D8] shadow-md shadow-purple-500/20 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Lokasi Acara</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-wide">UIN Syarif Hidayatullah Jakarta</span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Hero CCE 2026 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/registrasi"
              className="rounded-full bg-gradient-to-r from-[#7226FF] via-[#9C27B0] to-[#EF17D8] px-7 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105 hover:opacity-95 flex items-center justify-center"
            >
              <span>Registrasi Peserta (E-Ticket)</span>
            </Link>
            <Link
              href="/pelamar/walk-in"
              className="rounded-full border border-purple-200 bg-white hover:bg-purple-50/70 shadow-sm px-6 py-3 text-xs sm:text-sm font-bold text-slate-800 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Form Walk-In Interview</span>
            </Link>
            <Link
              href="/indeks-kepuasan"
              className="rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100/80 shadow-sm px-5 py-3 text-xs sm:text-sm font-semibold text-amber-900 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>Indeks Kepuasan</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="tentang" className="relative overflow-hidden mx-auto max-w-7xl px-6 py-20 sm:py-24">
        {/* Ornamen Wave Halus di Tepi Section */}
        <img
          src="/images/icons/wave%205.png"
          alt=""
          className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 w-56 sm:w-72 md:w-88 opacity-30 select-none"
        />
        <img
          src="/images/icons/wave%203.png"
          alt=""
          className="pointer-events-none absolute -left-16 bottom-6 w-52 sm:w-68 md:w-80 opacity-25 select-none"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Kolom Kiri: Teks Tentang Acara */}
          <div className="lg:col-span-6 space-y-5">
            <p className="font-bold text-[#EF17D8] tracking-widest uppercase text-xs sm:text-sm">
              TENTANG ACARA
            </p>
            <h2 className="text-3xl font-extrabold md:text-5xl leading-tight text-slate-900">
              Langkah Awal Menuju Karier Impian
            </h2>
            <p className="leading-relaxed text-slate-600 text-base sm:text-lg">
              Career Compass Expo 2026 menghadirkan kesempatan bagi mahasiswa,
              alumni, dan masyarakat umum untuk mengenal perusahaan terkemuka,
              menemukan lowongan pekerjaan, serta mengikuti proses rekrutmen.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2 rounded-xl bg-purple-50/80 px-3.5 py-2 border border-purple-200/70 shadow-2xs">
                <svg className="h-4 w-4 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-bold text-slate-800">20 Perusahaan Ternama</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-purple-50/80 px-3.5 py-2 border border-purple-200/70 shadow-2xs">
                <svg className="h-4 w-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
                </svg>
                <span className="font-bold text-slate-800">Walk-in Interview Langsung</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-purple-50/80 px-3.5 py-2 border border-purple-200/70 shadow-2xs">
                <svg className="h-4 w-4 text-[#EF17D8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                </svg>
                <span className="font-bold text-slate-800">Seminar & Career Talk</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Slider Foto Dokumentasi */}
          <div className="lg:col-span-6 w-full">
            <DocumSlider />
          </div>
        </div>
      </section>
      {/* SECTION: INFORMASI ACARA (Informasi Kegiatan CCE 2026 & Profil Pusat Karier) */}
      <section id="informasi" className="relative bg-slate-50/80 px-6 py-20 sm:py-24 overflow-hidden border-y border-slate-200/80">
        {/* Ambient background blur */}
        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#7226FF]/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-[#EF17D8]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <p className="mb-2 font-bold text-xs sm:text-sm uppercase tracking-widest text-[#EF17D8]">
              INFORMASI ACARA
            </p>
            <h2 className="text-3xl font-extrabold md:text-5xl tracking-tight text-slate-900">
              Informasi Kegiatan CCE 2026
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Pusat Pengembangan Karier UIN Syarif Hidayatullah Jakarta &amp; Agenda Pelaksanaan Career Compass Expo 2026
            </p>
          </div>

          <EventInfoBook />
        </div>
      </section>

      {/* SECTION: LOWONGAN PEKERJAAN (Tepat Setelah Informasi Acara) */}
      <section id="lowongan" className="relative overflow-hidden mx-auto max-w-7xl px-6 py-24">
        {/* Ornamen Wave Halus */}
        <img
          src="/images/icons/wave%206.png"
          alt=""
          className="pointer-events-none absolute -left-16 top-10 w-56 sm:w-72 md:w-88 opacity-25 select-none"
        />
        <img
          src="/images/icons/wave%202.png"
          alt=""
          className="pointer-events-none absolute -right-14 bottom-10 w-52 sm:w-64 md:w-76 opacity-20 select-none rotate-45"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="mb-3 font-bold text-[#EF17D8]">PELUANG KARIER</p>
            <h2 className="text-3xl font-extrabold md:text-5xl text-slate-900">Lowongan Pekerjaan</h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              Jelajahi berbagai posisi yang dibuka oleh perusahaan peserta Career Compass Expo 2026. Siapkan CV terbaikmu dan ikuti walk-in interview langsung di lokasi!
            </p>
          </div>
          <Link
            href="/pelamar"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-purple-50 border border-purple-200 px-6 py-3 font-bold text-purple-700 shadow-xs transition hover:bg-purple-100 hover:scale-105"
          >
            <span>Daftar untuk Melamar</span>
          </Link>
        </div>

        <div className="relative z-10">
          <Suspense fallback={<JobsFallback />}>
            <JobsSection />
          </Suspense>
        </div>
      </section>

      {/* SECTION: PANDUAN & FITUR ACARA (Apa yang Bisa Kamu Lakukan?) */}
      <section id="fitur" className="relative bg-slate-50/80 px-6 py-20 sm:py-24 overflow-hidden border-t border-slate-200/80">
        <div id="alur" />
        {/* Ambient background blur */}
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#7226FF]/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#EF17D8]/5 blur-3xl" />

        {/* Ornamen Wave Halus */}
        <img
          src="/images/icons/wave%201.png"
          alt=""
          className="pointer-events-none absolute -right-16 top-12 w-60 sm:w-80 md:w-96 opacity-25 select-none"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 text-center md:text-left">
            <p className="mb-3 font-bold text-xs sm:text-sm uppercase tracking-widest text-[#EF17D8]">
              PANDUAN & FITUR ACARA
            </p>
            <h2 className="text-3xl font-extrabold md:text-5xl text-slate-900">
              Apa yang Bisa Kamu Lakukan?
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
              Maksimalkan kesempatan berkarier kamu dengan mengikuti seluruh alur kegiatan yang tersedia di CCE 2026.
            </p>
          </div>

          {/* Kartu Fitur Interaktif dengan Animasi Robot Dari Besar ke Kecil Saat Scroll */}
          <FeatureCards items={features} />
        </div>
      </section>

      {/* SECTION: TACTLINK (Partner & Dukungan Resmi CCE 2026) */}
      <TactlinkSection />

      {/* SECTION: GABUNG MENJADI MITRA PERUSAHAAN */}
      <section id="mitra" className="relative overflow-hidden bg-white px-6 py-16 sm:py-20 border-t border-slate-200/80">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative rounded-3xl border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/40 to-fuchsia-50/40 p-8 sm:p-12 shadow-xl overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#EF17D8]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#7226FF]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/70 px-3.5 py-1 text-xs font-bold text-purple-700 mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Kemitraan Perusahaan &amp; Rekrutmen</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Buka Peluang Karir bersama <span className="bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] bg-clip-text text-transparent">Mahasiswa &amp; Alumni UIN Jakarta</span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Daftarkan perusahaan Anda sebagai mitra resmi Career Compass Expo 2026. Dapatkan akses ke dashboard rekrutmen praktis untuk membuat lowongan pekerjaan, meninjau berkas CV pelamar, dan mencentang tahapan seleksi secara interaktif.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Akses 5.000+ Talenta
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Booth On-Site Interview
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Dashboard ATS Mandiri
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  href="/mitra"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] px-8 py-4 text-center text-sm font-black text-white shadow-xl shadow-purple-600/30 transition hover:scale-105 hover:opacity-95"
                >
                  <svg className="h-4 w-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Gabung Menjadi Mitra Perusahaan</span>
                </Link>
                <Link
                  href="/mitra/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition"
                >
                  <svg className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Buka Dashboard Mitra</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <span>© 2026 Career Compass Expo — UIN Syarif Hidayatullah Jakarta</span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600">
            <div className="flex items-center">
              <span>Dev by&nbsp;</span>
              <a
                href="https://www.instagram.com/satriaalbantanii"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#EF17D8] hover:text-purple-600 hover:underline transition-colors"
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

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function JobsSection() {
  let jobs = [];
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("jobs")
      .select("*, companies(name, logo_url, website, description)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat lowongan di landing page:", error);
    }
    if (data) {
      jobs = data.map((j) => {
        let meta = {};
        try {
          if (typeof j.companies?.description === "string" && j.companies.description.startsWith("{")) {
            meta = JSON.parse(j.companies.description);
          }
        } catch {
          meta = {};
        }

        let descText = j.description || "";
        let posterUrl = "";
        let startDate = "";
        let endDate = "";
        let isExpired = false;
        try {
          if (typeof j.description === "string" && j.description.trim().startsWith("{")) {
            const parsed = JSON.parse(j.description);
            descText = parsed.text || "";
            posterUrl = parsed.poster_url || "";
            startDate = parsed.start_date || "";
            endDate = parsed.end_date || "";
            if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              if (new Date() > end) {
                isExpired = true;
              }
            }
          }
        } catch {
          descText = j.description || "";
        }

        return {
          ...j,
          raw_description: j.description,
          description: descText,
          poster_url: posterUrl,
          start_date: startDate,
          end_date: endDate,
          is_expired: isExpired,
          company_name: j.companies?.name || "Perusahaan Rekanan",
          company_logo: j.companies?.logo_url || "",
          company_industry: meta.industry || "",
          company_address: meta.address || "",
        };
      }).filter((job) => {
        if (!job.is_active) return false;
        if (job.is_expired) return false;
        if (job.start_date) {
          const start = new Date(job.start_date);
          start.setHours(0, 0, 0, 0);
          if (new Date() < start) return false;
        }
        return true;
      });
    }
  } catch (err) {
    console.error("Error JobsSection server:", err);
    jobs = [];
  }

  return <JobsDisplay initialJobs={jobs} />;
}

function JobsFallback() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center animate-pulse">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-slate-200" />
      <div className="mx-auto h-4 w-48 rounded bg-slate-200" />
    </div>
  );
}
