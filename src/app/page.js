import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DocumSlider from "@/components/DocumSlider";
import EventInfoBook from "@/components/EventInfoBook";
import FeatureCards from "@/components/FeatureCards";
import TactlinkSection from "@/components/TactlinkSection";
import Navbar from "@/components/Navbar";

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
    desc: "Kirim lamaran pekerjaan dan unggah berkas CV serta portofolio langsung via website.",
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
    <main className="min-h-screen bg-[#1E0C36] text-white">
      {/* Header Sticky / Navbar Responsif dengan Hamburger Mobile */}
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#4B1E85] via-[#7226FF] to-[#EF17D8] px-4 py-16 sm:px-6 sm:py-24 text-center">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {/* Baris Robot 5 (Kiri) - Teks Judul - Robot 1 (Kanan) */}
          <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8 lg:gap-12">
            {/* Robot 5 di sebelah kiri */}
            <div className="relative flex shrink-0 items-center justify-center">
              <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-pink-400/35 blur-2xl sm:h-48 sm:w-48 md:h-64 md:w-64" />
              <img
                src="/images/icons/robot%205.png"
                alt="Maskot Robot 5 (Kiri)"
                className="relative z-10 w-24 sm:w-36 md:w-56 lg:w-72 xl:w-80 object-contain drop-shadow-2xl animate-float-slow transition-transform hover:scale-105"
              />
            </div>

            {/* Tulisan Career Compass Expo 2026 di tengah */}
            <div className="min-w-0 flex-1 text-center">
              <p className="mb-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/90">
                UIN Syarif Hidayatullah Jakarta
              </p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase leading-[1.05] tracking-tight">
                Career<br />Compass Expo<br />2026
              </h1>
            </div>

            {/* Robot 1 di sebelah kanan */}
            <div className="relative flex shrink-0 items-center justify-center">
              <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-purple-400/35 blur-2xl sm:h-48 sm:w-48 md:h-64 md:w-64" />
              <img
                src="/images/icons/robot%201.png"
                alt="Maskot Robot 1 (Kanan)"
                className="relative z-10 w-24 sm:w-36 md:w-56 lg:w-72 xl:w-80 object-contain drop-shadow-2xl animate-float-reverse transition-transform hover:scale-105"
              />
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-base sm:text-lg text-white/90">
            Jelajahi peluang karier, temukan lowongan pekerjaan,
            dan ikuti walk-in interview bersama perusahaan peserta.
          </p>

          {/* Informasi Waktu & Lokasi Pelaksanaan */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Badge Waktu Pelaksanaan */}
            <div className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-300 hover:border-[#EF17D8]/60 hover:bg-white/15">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EF17D8] to-[#7226FF] shadow-md shadow-pink-500/30 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70">Waktu Pelaksanaan</span>
                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">18–19 November 2026</span>
              </div>
            </div>

            {/* Badge Lokasi Acara */}
            <div className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-300 hover:border-[#7226FF]/60 hover:bg-white/15">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#EF17D8] shadow-md shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70">Lokasi Acara</span>
                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">UIN Syarif Hidayatullah Jakarta</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tentang" className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Kolom Kiri: Teks Tentang Acara */}
          <div className="lg:col-span-6 space-y-5">
            <p className="font-bold text-[#EF17D8] tracking-widest uppercase text-xs sm:text-sm">
              TENTANG ACARA
            </p>
            <h2 className="text-3xl font-extrabold md:text-5xl leading-tight">
              Langkah Awal Menuju Karier Impian
            </h2>
            <p className="leading-relaxed text-white/80 text-base sm:text-lg">
              Career Compass Expo 2026 menghadirkan kesempatan bagi mahasiswa,
              alumni, dan masyarakat umum untuk mengenal perusahaan terkemuka,
              menemukan lowongan pekerjaan, serta mengikuti proses rekrutmen.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 text-xs sm:text-sm text-purple-200">
              <div className="flex items-center gap-2 rounded-xl bg-purple-900/40 px-3.5 py-2 border border-purple-500/20 backdrop-blur-sm">
                <svg className="h-4 w-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold text-white">28+ Perusahaan Ternama</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-purple-900/40 px-3.5 py-2 border border-purple-500/20 backdrop-blur-sm">
                <svg className="h-4 w-4 text-amber-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
                </svg>
                <span className="font-semibold text-white">Walk-in Interview Langsung</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-purple-900/40 px-3.5 py-2 border border-purple-500/20 backdrop-blur-sm">
                <svg className="h-4 w-4 text-[#EF17D8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                </svg>
                <span className="font-semibold text-white">Seminar & Career Talk</span>
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
      <section id="informasi" className="relative bg-[#2A1248] px-6 py-20 sm:py-24 overflow-hidden">
        {/* Ambient background blur */}
        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#7226FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-[#EF17D8]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <p className="mb-2 font-bold text-xs sm:text-sm uppercase tracking-widest text-[#EF17D8]">
              INFORMASI ACARA
            </p>
            <h2 className="text-3xl font-extrabold md:text-5xl tracking-tight">
              Informasi Kegiatan CCE 2026
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              Pusat Pengembangan Karier UIN Syarif Hidayatullah Jakarta & Agenda Pelaksanaan Career Compas Expo 2026
            </p>
          </div>

          <EventInfoBook />
        </div>
      </section>

      {/* SECTION: LOWONGAN PEKERJAAN (Tepat Setelah Informasi Acara) */}
      <section id="lowongan" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="mb-3 font-bold text-[#EF17D8]">PELUANG KARIER</p>
            <h2 className="text-3xl font-extrabold md:text-5xl">Lowongan Pekerjaan</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Jelajahi berbagai posisi yang dibuka oleh perusahaan peserta Career Compass Expo 2026. Siapkan CV terbaikmu dan ikuti walk-in interview langsung di lokasi!
            </p>
          </div>
          <Link
            href="/registrasi"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 border border-white/20 px-6 py-3 font-bold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
          >
            <span>Daftar untuk Melamar</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <Suspense fallback={<JobsFallback />}>
          <JobsSection />
        </Suspense>
      </section>

      {/* SECTION: PANDUAN & FITUR ACARA (Apa yang Bisa Kamu Lakukan?) */}
      <section id="fitur" className="relative bg-[#1E0C36] px-6 py-20 sm:py-24 overflow-hidden border-t border-purple-900/40">
        <div id="alur" />
        {/* Ambient background blur */}
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#7226FF]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#EF17D8]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 text-center md:text-left">
            <p className="mb-3 font-bold text-xs sm:text-sm uppercase tracking-widest text-[#EF17D8]">
              PANDUAN & FITUR ACARA
            </p>
            <h2 className="text-3xl font-extrabold md:text-5xl">
              Apa yang Bisa Kamu Lakukan?
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/70">
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
      <section id="mitra" className="relative overflow-hidden bg-gradient-to-b from-[#1E0C36] via-[#160728] to-[#0E041A] px-6 py-16 sm:py-20 border-t border-purple-500/20">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative rounded-3xl border border-white/15 bg-gradient-to-r from-purple-950/80 via-[#2E0854]/90 to-fuchsia-950/80 p-8 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#EF17D8]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#7226FF]/25 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-900/50 px-3.5 py-1 text-xs font-bold text-purple-200 mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Kemitraan Perusahaan &amp; Rekrutmen</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Buka Peluang Karir bersama <span className="bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] bg-clip-text text-transparent">Mahasiswa &amp; Alumni UIN Jakarta</span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-purple-200/80 leading-relaxed">
                  Daftarkan perusahaan Anda sebagai mitra resmi Career Compas Expo 2026. Dapatkan akses ke dashboard rekrutmen praktis untuk membuat lowongan pekerjaan, meninjau berkas CV pelamar, dan mencentang tahapan seleksi secara interaktif.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Akses 5.000+ Talenta
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Booth On-Site Interview
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Dashboard ATS Mandiri
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  href="/mitra"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7226FF] via-[#B838FD] to-[#EF17D8] px-8 py-4 text-center text-sm font-black text-white shadow-xl shadow-purple-600/40 transition hover:scale-105 hover:opacity-95"
                >
                  <svg className="h-4 w-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Gabung Menjadi Mitra Perusahaan</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link
                  href="/mitra/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-center text-xs font-bold text-purple-200 hover:bg-white/15 hover:text-white transition"
                >
                  <svg className="h-3.5 w-3.5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Buka Dashboard Mitra</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <span>© 2026 Career Compass Expo — UIN Syarif Hidayatullah Jakarta</span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-white/70">
            <Link
              href="/mitra"
              className="text-purple-300 hover:text-white transition-colors font-semibold flex items-center gap-1.5"
            >
    
            </Link>
            <div className="flex items-center">
              <span>Dev by&nbsp;</span>
              <a
                href="https://www.instagram.com/satriaalbantanii"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#EF17D8] hover:text-white hover:underline transition-colors"
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

async function JobsSection() {
  let jobs = [];
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*, companies(name, logo_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) jobs = data;
  } catch {
    jobs = [];
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#4B1E85]/30 p-12 text-center backdrop-blur-sm">
        {/* Icon Koper Tematik CCE (Gradien Neon & Glow) */}
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7226FF]/25 via-[#4B1E85]/35 to-[#EF17D8]/25 p-4 border border-[#EF17D8]/40 shadow-[0_0_35px_rgba(239,23,216,0.3)]">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#7226FF] to-[#EF17D8] opacity-25 blur-lg animate-pulse pointer-events-none" />
          <svg
            className="relative z-10 h-10 w-10 drop-shadow-[0_4px_14px_rgba(239,23,216,0.7)]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Badan Koper */}
            <rect
              x="2"
              y="7"
              width="20"
              height="14"
              rx="3"
              fill="url(#cce-briefcase-body)"
              stroke="url(#cce-briefcase-stroke)"
              strokeWidth="1.5"
            />
            {/* Gagang / Pegangan Koper */}
            <path
              d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Garis Tengah Lipatan Koper */}
            <path
              d="M2 13H22"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.5"
            />
            {/* Kancing / Kunci Tengah Koper */}
            <rect
              x="10.5"
              y="11.5"
              width="3"
              height="3"
              rx="0.75"
              fill="#FFFFFF"
              stroke="#EF17D8"
              strokeWidth="0.8"
            />
            {/* Definisi Gradien CCE */}
            <defs>
              <linearGradient id="cce-briefcase-body" x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7226FF" />
                <stop offset="0.5" stopColor="#9C27B0" />
                <stop offset="1" stopColor="#EF17D8" />
              </linearGradient>
              <linearGradient id="cce-briefcase-stroke" x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C338FF" />
                <stop offset="1" stopColor="#FF66EB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">
          Lowongan pekerjaan belum tersedia saat ini
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60 leading-relaxed">
          Daftar posisi lowongan pekerjaan dari perusahaan peserta akan segera dirilis menjelang hari H acara.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-[#4B1E85]/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#EF17D8]/50 hover:bg-[#4B1E85]/70 hover:shadow-2xl"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-[#EF17D8]">
                {job.employment_type || "Full-Time"}
              </span>
              <span className="text-xs text-white/60 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-[#EF17D8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{job.location || "Jakarta"}</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-[#EF17D8] transition-colors">
              {job.title}
            </h3>
            <p className="mt-1 text-sm font-semibold text-white/80">
              {job.companies?.name || "Perusahaan Rekanan"}
            </p>

            {job.requirements && (
              <p className="mt-4 text-xs text-white/60 line-clamp-2">
                {job.requirements}
              </p>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/50">CCE 2026 Partner</span>
            <Link
              href="/registrasi"
              className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-[#EF17D8] hover:text-white flex items-center gap-1.5"
            >
              <span>Lamar Posisi</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function JobsFallback() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#4B1E85]/20 p-12 text-center animate-pulse">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-white/10" />
      <div className="mx-auto h-4 w-48 rounded bg-white/10" />
    </div>
  );
}
