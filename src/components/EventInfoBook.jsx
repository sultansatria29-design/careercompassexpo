"use client";

import { useState, useRef } from "react";
import Link from "next/link";

function EventIcon({ name, className = "h-4 w-4" }) {
  switch (name) {
    case "building":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "lightning":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
        </svg>
      );
    case "target":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "academic":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
        </svg>
      );
    case "bridge":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16M4 12h16M7 12v5m10-5v5M4 17c2.5-3.5 5.5-5 8-5s5.5 1.5 8 5" />
        </svg>
      );
    case "trend":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "globe":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9m0-18a15.3 15.3 0 00-4 9 15.3 15.3 0 004 9" />
        </svg>
      );
    case "handshake":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "rocket":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.84 2.58m0 0a6 6 0 01-7.38-5.84h4.8m2.58 5.84a14.98 14.98 0 00-2.58-5.84" />
        </svg>
      );
    case "store":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "compass":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="12,8 15,12 12,16 9,12" fill="currentColor" opacity="0.3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m-9-9h2m14 0h2" />
        </svg>
      );
    case "link":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case "trophy":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14v4a7 7 0 01-14 0V3zM3 5a3 3 0 003 3h1M21 5a3 3 0 01-3 3h-1M12 14v4m-4 3h8" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

const bookPages = [
  {
    chapter: "BAB 01",
    tag: "AGENDA AKBAR 2026",
    tabLabel: "Kegiatan CCE 2026",
    title: "Kegiatan Career Compass Expo 2026",
    subtitle: "Pameran Bursa Kerja & Karier Terbesar UIN Jakarta",
    dateVenue: "18–19 November 2026 • Auditorium Harun Nasution",
    desc: "Career Compass Expo (CCE) 2026 merupakan pameran bursa kerja dan karier tahunan terbesar yang diselenggarakan oleh Pusat Karier UIN Syarif Hidayatullah Jakarta. Menghadirkan 20 perusahaan mitra terkemuka dari sektor BUMN, multinasional, dan swasta nasional untuk membuka peluang rekrutmen tatap muka bagi mahasiswa, alumni, dan pencari kerja umum.",
    keyPoints: [
      { icon: "building", color: "text-cyan-700 bg-cyan-50 border-cyan-200", label: "20 Perusahaan Mitra", desc: "Berbagai industri terkemuka" },
      { icon: "lightning", color: "text-amber-700 bg-amber-50 border-amber-200", label: "Walk-In Interview", desc: "Wawancara langsung on-site" },
      { icon: "target", color: "text-[#EF17D8] bg-fuchsia-50 border-fuchsia-200", label: "Bursa Lowongan Kerja", desc: "Akses ratusan posisi karir" },
      { icon: "academic", color: "text-purple-700 bg-purple-50 border-purple-200", label: "Career Talk & Seminar", desc: "Wawasan langsung dari HR praktisi" },
    ],
    ctaText: "Daftar Peserta CCE Sekarang",
    ctaLink: "/registrasi",
    leftImage: "/images/docum/01.JPG",
    leftCaption: "Suasana Pameran & Antusiasme Pengunjung CCE",
    sideNote: "Kegiatan dibuka mulai pukul 08.30 – 16.00 WIB setiap hari.",
  },
  {
    chapter: "BAB 02",
    tag: "PROFIL LEMBAGA",
    tabLabel: "Profil Pusat Karier",
    title: "Profil Pusat Karier UIN Jakarta",
    subtitle: "Lembaga Pengembangan Karier & Fasilitasi Rekrutmen",
    dateVenue: "Pusat Karier • UIN Syarif Hidayatullah Jakarta",
    desc: "Pusat Karier UIN Jakarta adalah lembaga yang berfokus pada pengembangan karier mahasiswa dan alumni melalui berbagai program bimbingan, pelatihan, serta fasilitasi rekrutmen. Pusat Karier berperan sebagai jembatan antara dunia akademik dan dunia kerja dengan tujuan meningkatkan kompetensi, kemandirian, dan daya saing lulusan UIN Jakarta di tingkat nasional maupun global.",
    keyPoints: [
      { icon: "bridge", color: "text-cyan-700 bg-cyan-50 border-cyan-200", label: "Jembatan Akademik & Industri", desc: "Menghubungkan kampus & dunia kerja" },
      { icon: "trend", color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "Kompetensi Lulusan", desc: "Pelatihan hard skills & soft skills" },
      { icon: "globe", color: "text-indigo-700 bg-indigo-50 border-indigo-200", label: "Daya Saing Global", desc: "Kesiapan menghadapi industri modern" },
      { icon: "handshake", color: "text-[#EF17D8] bg-fuchsia-50 border-fuchsia-200", label: "Fasilitasi Rekrutmen", desc: "Kemitraan strategis dunia usaha" },
    ],
    ctaText: "Kunjungi Profil Resmi",
    ctaLink: "https://karier.uinjkt.ac.id/id/profil-pusat-karier-uin-jakarta",
    leftImage: "/images/puskar/history.png",
    leftCaption: "Landmark Resmi Kampus UIN Syarif Hidayatullah Jakarta",
    sideNote: "Berdiri sebagai komitmen nyata mendukung masa depan lulusan.",
  },
  {
    chapter: "BAB 03",
    tag: "PROGRAM UNGGULAN",
    tabLabel: "Program Karier",
    title: "Program Pusat Karier",
    subtitle: "Ekosistem Bimbingan, Pelatihan & Kesiapan Kerja",
    dateVenue: "Inovasi Program Berkelanjutan Mahasiswa & Alumni",
    desc: "Pusat Karier UIN Jakarta menyelenggarakan berbagai program pengembangan karier seperti Tracer Study, Compass Hiring, Job Fair, dan Bursa Kerja Online. Selain itu, terdapat layanan Konseling Karier, Sosial, dan Akademik, serta pelatihan pengembangan diri melalui Training Soft Skills. Program lainnya meliputi Growth Buddy, PERSAMI, Pekan Konseling, Career Preparation, Kunjungan Industri (NGANTRI), dan Localpreneur Fest yang mendukung peningkatan kompetensi, kesiapan kerja, serta semangat kewirausahaan mahasiswa dan alumni.",
    keyPoints: [
      { icon: "target", color: "text-[#EF17D8] bg-fuchsia-50 border-fuchsia-200", label: "Job Fair & Compass Hiring", desc: "Peluang kerja on-compass rutin" },
      { icon: "sparkles", color: "text-amber-700 bg-amber-50 border-amber-200", label: "Konseling & Soft Skills", desc: "Bimbingan karier personal & grup" },
      { icon: "rocket", color: "text-cyan-700 bg-cyan-50 border-cyan-200", label: "Growth Buddy & PERSAMI", desc: "Pendampingan persiapan kerja" },
      { icon: "store", color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "NGANTRI & Localpreneur", desc: "Kunjungan industri & wirausaha" },
    ],
    ctaText: "Pelajari Seluruh Program",
    ctaLink: "https://karier.uinjkt.ac.id/id",
    leftImage: "/images/puskar/pengabdian.jpeg",
    leftCaption: "Aktivitas Program Pelatihan & Pengembangan Diri",
    sideNote: "Terbuka bagi seluruh mahasiswa aktif dan alumni lintas fakultas.",
  },
  {
    chapter: "BAB 04",
    tag: "MANAJEMEN & PENGURUS",
    tabLabel: "Executive Board",
    title: "Executive Board Pusat Karier",
    subtitle: "Perencanaan Strategis & Tata Kelola Organisasi",
    dateVenue: "Kepengurusan & Divisi Kerja Pusat Karier",
    desc: "Executive Board Pusat Karier UIN Jakarta yang bertanggung jawab mengelola seluruh program dan kegiatan pengembangan karier mahasiswa dan alumni. Executive Board berperan dalam perencanaan strategis, koordinasi antar divisi, serta pengambilan keputusan untuk memastikan tercapainya visi Pusat Karier dalam mempersiapkan lulusan UIN Jakarta yang kompeten, profesional, dan siap bersaing di dunia kerja.",
    keyPoints: [
      { icon: "compass", color: "text-cyan-700 bg-cyan-50 border-cyan-200", label: "Perencanaan Strategis", desc: "Penyusunan peta jalan program karier" },
      { icon: "link", color: "text-indigo-700 bg-indigo-50 border-indigo-200", label: "Koordinasi Antar Divisi", desc: "Sinergi layanan tracer & rekrutmen" },
      { icon: "trophy", color: "text-amber-700 bg-amber-50 border-amber-200", label: "Pencapaian Visi Unggul", desc: "Mencetak lulusan siap kerja & adaptif" },
      { icon: "shield", color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "Tata Kelola Profesional", desc: "Pelayanan transparan & akuntabel" },
    ],
    ctaText: "Struktur Kepengurusan",
    ctaLink: "https://karier.uinjkt.ac.id/id/executive-board",
    leftImage: "/images/puskar/penelitian.jpeg",
    leftCaption: "Jajaran Executive Board Pusat Karier UIN Jakarta",
    sideNote: "Bekerja sama erat dengan fakultas dan mitra industri nasional.",
  },
];

export default function EventInfoBook() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDirection, setFlipDirection] = useState("next"); // 'next' atau 'prev'
  const [openMobileIdx, setOpenMobileIdx] = useState(0); // Accordion aktif di tampilan mobile
  const touchStartXRef = useRef(null);

  const totalPages = bookPages.length;
  const page = bookPages[currentPage];

  function changePage(newIndex, direction = "next") {
    if (newIndex < 0 || newIndex >= totalPages || newIndex === currentPage) return;
    setFlipDirection(direction);
    setCurrentPage(newIndex);
  }

  function nextPage() {
    const nextIdx = (currentPage + 1) % totalPages;
    changePage(nextIdx, "next");
  }

  function prevPage() {
    const prevIdx = (currentPage - 1 + totalPages) % totalPages;
    changePage(prevIdx, "prev");
  }

  function handleTouchStart(e) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (deltaX > 45) {
      prevPage();
    } else if (deltaX < -45) {
      nextPage();
    }
    touchStartXRef.current = null;
  }

  const animationClass = flipDirection === "next" ? "page-turn-next" : "page-turn-prev";

  return (
    <div className="relative w-full py-4 select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* ============================================================ */}
      {/* ELEMEN DEKORATIF BLUR ICON (Ambient Glow di Sekitar Buku)     */}
      {/* ============================================================ */}
      <div className="pointer-events-none absolute -left-20 -top-16 z-0 h-80 w-80 opacity-25 animate-float-slow">
        <img
          src="/images/icons/blur%201.png"
          alt="Blur Ambient 1"
          className="h-full w-full object-contain filter drop-shadow-[0_0_50px_rgba(114,38,255,0.4)]"
        />
      </div>
      <div className="pointer-events-none absolute -right-20 -top-12 z-0 h-88 w-88 opacity-30 animate-float-reverse">
        <img
          src="/images/icons/blur%202.png"
          alt="Blur Ambient 2"
          className="h-full w-full object-contain filter drop-shadow-[0_0_60px_rgba(239,23,216,0.4)]"
        />
      </div>
      <div className="pointer-events-none absolute left-1/3 -bottom-20 z-0 h-72 w-72 opacity-20 animate-pulse">
        <img
          src="/images/icons/blur%203.png"
          alt="Blur Ambient 3"
          className="h-full w-full object-contain filter drop-shadow-[0_0_45px_rgba(75,30,133,0.4)]"
        />
      </div>
      <div className="pointer-events-none absolute -right-16 bottom-8 z-0 h-64 w-64 opacity-20">
        <img
          src="/images/icons/blur%204.png"
          alt="Blur Ambient 4"
          className="h-full w-full object-contain filter drop-shadow-[0_0_40px_rgba(195,56,255,0.3)]"
        />
      </div>
      <div className="pointer-events-none absolute -left-16 bottom-16 z-0 h-64 w-64 opacity-20">
        <img
          src="/images/icons/blur%205.png"
          alt="Blur Ambient 5"
          className="h-full w-full object-contain filter drop-shadow-[0_0_35px_rgba(114,38,255,0.3)]"
        />
      </div>

      {/* ============================================================ */}
      {/* TAMPILAN MOBILE (< lg): ACCORDION PERSIS SEPERTI GAMBAR 2    */}
      {/* ============================================================ */}
      <div className="lg:hidden space-y-3.5 relative z-20 mx-auto max-w-xl">
        {bookPages.map((item, idx) => {
          const isOpen = openMobileIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "border-purple-300 bg-white shadow-lg shadow-purple-500/10"
                  : "border-slate-200 bg-white hover:bg-slate-50/70 hover:border-purple-300"
              }`}
            >
              {/* Header Accordion: Klik untuk buka/tutup */}
              <button
                type="button"
                onClick={() => {
                  setOpenMobileIdx(isOpen ? null : idx);
                  setCurrentPage(idx);
                }}
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all ${
                      isOpen
                        ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-md shadow-purple-600/30"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {item.tabLabel}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {item.tag} • Hal. {idx * 2 + 1}-{idx * 2 + 2}
                    </p>
                  </div>
                </div>

                {/* Tombol Bulat Toggle Chevron */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 shadow-xs ${
                    isOpen
                      ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-md rotate-180"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Kolom Konten & Gambar yang Muncul di Bawah Saat di-Klik */}
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-slate-100 animate-accordion space-y-4">
                  {/* Kolom Gambar Dokumentasi / Landmark */}
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-md aspect-[16/10] bg-slate-900 group mt-2">
                    <img
                      src={item.leftImage}
                      alt={item.leftCaption}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-full bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-md">
                        {item.chapter}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-xs text-white">
                      <span className="block text-[10px] text-purple-200 uppercase font-semibold">Dokumentasi</span>
                      <strong className="block text-xs font-bold leading-tight mt-0.5">{item.leftCaption}</strong>
                    </div>
                  </div>

                  {/* Info Teks Detail */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs font-semibold text-[#EF17D8] mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {item.dateVenue}
                      </p>
                    </div>

                    {/* Paragraf Deskripsi */}
                    <p className="text-xs leading-relaxed text-slate-700 text-justify border-l-2 border-[#EF17D8] pl-3 py-1 bg-purple-50/60 rounded-r-lg">
                      {item.desc}
                    </p>

                    {/* Poin-Poin Kunci */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {item.keyPoints.map((pt, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-200"
                        >
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 border ${
                              pt.color || "text-[#EF17D8] bg-fuchsia-50 border-fuchsia-200"
                            }`}
                          >
                            <EventIcon name={pt.icon} className="h-4 w-4" />
                          </div>
                          <div>
                            <strong className="block text-xs font-bold text-slate-900 leading-tight">
                              {pt.label}
                            </strong>
                            <span className="block text-[11px] text-slate-600 leading-tight">
                              {pt.desc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="pt-2">
                      {item.ctaLink.startsWith("http") ? (
                        <a
                          href={item.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition hover:opacity-95"
                        >
                          <span>{item.ctaText}</span>
                          <span>→</span>
                        </a>
                      ) : (
                        <Link
                          href={item.ctaLink}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition hover:opacity-95"
                        >
                          <span>{item.ctaText}</span>
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB PEMBATAS BUKU (BOOKMARK TABS) DI ATAS BUKU (DESKTOP ONLY) */}
      {/* ============================================================ */}
      <div className="hidden lg:flex relative z-20 flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
        {bookPages.map((item, idx) => {
          const isActive = idx === currentPage;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => changePage(idx, idx > currentPage ? "next" : "prev")}
              className={`group flex items-center gap-2 rounded-t-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs border-t border-x ${
                isActive
                  ? "bg-white text-purple-700 border-t-2 border-t-[#EF17D8] border-x-slate-200 shadow-md -translate-y-1"
                  : "bg-slate-100/90 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900"
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isActive ? "bg-[#EF17D8] animate-ping" : "bg-slate-400 group-hover:bg-slate-600"
                }`}
              />
              <span>{item.tabLabel}</span>
              <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                Hal {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* BUKU TERBUKA (OPEN BOOK CONTAINER) (DESKTOP ONLY)             */}
      {/* ============================================================ */}
      <div className="hidden lg:block relative z-10 mx-auto max-w-6xl">
        {/* Sampul Luar Buku (Hardcover Leather Glow) */}
        <div className="relative rounded-[2.5rem] p-3 sm:p-4 bg-gradient-to-br from-purple-100/80 via-slate-100 to-fuchsia-100/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06),0_0_35px_rgba(114,38,255,0.05)] border-2 border-slate-200">
          
          {/* Efek Pinggiran Emas Kertas Buku (Book Gilded Edges) */}
          <div className="rounded-[2.1rem] bg-slate-200/80 p-1 shadow-inner relative overflow-hidden">
            
            {/* Permukaan Lembaran Buku (Book Spread) */}
            <div
              key={`${currentPage}-${flipDirection}`}
              className={`relative grid grid-cols-1 lg:grid-cols-12 min-h-[520px] rounded-[1.9rem] bg-white overflow-hidden border border-slate-200/80 shadow-xs ${animationClass}`}
            >
              {/* -------------------------------------------------------- */}
              {/* SISI KIRI BUKU (LEFT PAGE: Foto & Info Halaman)          */}
              {/* -------------------------------------------------------- */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-br from-slate-50/80 to-white border-r border-slate-200/70">
                {/* Header Sisi Kiri: Nomor Halaman & Nama Buku */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#EF17D8] font-bold">
                    BUKU PANDUAN CCE 2026
                  </span>
                  <span className="rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[11px] font-bold text-purple-700 border border-purple-200">
                    Hal. {currentPage * 2 + 1}
                  </span>
                </div>

                {/* Foto Dokumentasi / Landmark Halaman */}
                <div className="relative my-auto overflow-hidden rounded-2xl border border-slate-200 shadow-md aspect-[16/11] bg-slate-900 group">
                  <img
                    src={page.leftImage}
                    alt={page.leftCaption}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Badge Bab Buku */}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                      {page.chapter}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <span className="block text-[10px] text-purple-200 uppercase font-semibold">Dokumentasi</span>
                    <strong className="block text-xs font-bold leading-tight">{page.leftCaption}</strong>
                  </div>
                </div>

                {/* Catatan Kaki Halaman Kiri */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 italic">
                  <span>Pusat Karier UIN Jakarta</span>
                  <span>{page.sideNote}</span>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* SISI KANAN BUKU (RIGHT PAGE: Teks Bersih Sesuai Foto 2&3) */}
              {/* -------------------------------------------------------- */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-white">
                {/* Header Sisi Kanan: Kategori & Halaman Genap */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                      {page.tag}
                    </span>
                  </div>
                  <span className="rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[11px] font-bold text-purple-700 border border-purple-200">
                    Hal. {currentPage * 2 + 2}
                  </span>
                </div>

                {/* Konten Utama Lembaran Halaman */}
                <div className="space-y-4 my-auto">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                      {page.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-[#EF17D8]">
                      {page.subtitle}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {page.dateVenue}
                    </p>
                  </div>

                  {/* Paragraf Deskripsi Lembaran Kertas */}
                  <p className="text-sm sm:text-base leading-relaxed text-slate-700 text-justify border-l-2 border-[#EF17D8] pl-4 py-1 bg-purple-50/60 rounded-r-xl">
                    {page.desc}
                  </p>

                  {/* Grid 4 Poin Kunci Lembaran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {page.keyPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 shadow-2xs"
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 border shadow-2xs ${
                            pt.color || "text-[#EF17D8] bg-fuchsia-50 border-fuchsia-200"
                          }`}
                        >
                          <EventIcon name={pt.icon} className="h-4 w-4" />
                        </div>
                        <div>
                          <strong className="block text-xs font-bold text-slate-900 leading-tight">
                            {pt.label}
                          </strong>
                          <span className="block text-[11px] text-slate-600 leading-tight">
                            {pt.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Lembaran Kanan: Tombol Selengkapnya & Tombol Balik Halaman */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  {page.ctaLink.startsWith("http") ? (
                    <a
                      href={page.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-purple-600/25 transition hover:scale-105 active:scale-95"
                    >
                      <span>{page.ctaText}</span>
                      <span>→</span>
                    </a>
                  ) : (
                    <Link
                      href={page.ctaLink}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-purple-600/25 transition hover:scale-105 active:scale-95"
                    >
                      <span>{page.ctaText}</span>
                      <span>→</span>
                    </Link>
                  )}

                  {/* Tombol Balik Lembar Sudut Kanan */}
                  <button
                    type="button"
                    onClick={nextPage}
                    className="group relative flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-purple-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-purple-700 border border-slate-200 transition-all cursor-pointer"
                    title="Buka Lembar Selanjutnya"
                  >
                    <svg className="h-4 w-4 text-[#EF17D8] transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Balik Halaman</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KONTROL NAVIGASI BUKU (DESKTOP ONLY)                        */}
      {/* ============================================================ */}
      <div className="hidden lg:flex relative z-20 mt-6 flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto px-4">
        {/* Tombol Balik Mundur */}
        <button
          type="button"
          onClick={prevPage}
          className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 shadow-xs border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>←</span>
          <span>Lembar Sebelumnya</span>
        </button>

        {/* Indikator Halaman Buku */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
          <span className="text-xs font-mono font-bold text-slate-600">
            Halaman {currentPage + 1} dari {totalPages}
          </span>
          <div className="flex gap-1.5 ml-2">
            {bookPages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => changePage(i, i > currentPage ? "next" : "prev")}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentPage ? "w-6 bg-[#EF17D8] shadow-sm shadow-[#EF17D8]" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Buka Bab ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Tombol Balik Maju */}
        <button
          type="button"
          onClick={nextPage}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Lembar Selanjutnya</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
