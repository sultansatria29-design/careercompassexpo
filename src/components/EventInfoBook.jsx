"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const bookPages = [
  {
    chapter: "BAB 01",
    tag: "AGENDA AKBAR 2026",
    tabLabel: "Kegiatan CCE 2026",
    title: "Kegiatan Career Campus Expo 2026",
    subtitle: "Pameran Bursa Kerja & Karier Terbesar UIN Jakarta",
    dateVenue: "18–19 November 2026 • Auditorium Harun Nasution",
    desc: "Career Campus Expo (CCE) 2026 merupakan pameran bursa kerja dan karier tahunan terbesar yang diselenggarakan oleh Pusat Karier UIN Syarif Hidayatullah Jakarta. Menghadirkan 28+ perusahaan mitra terkemuka dari sektor BUMN, multinasional, dan swasta nasional untuk membuka peluang rekrutmen tatap muka bagi mahasiswa, alumni, dan pencari kerja umum.",
    keyPoints: [
      { icon: "🏢", label: "28+ Perusahaan Mitra", desc: "Berbagai industri terkemuka" },
      { icon: "⚡", label: "Walk-In Interview", desc: "Wawancara langsung on-site" },
      { icon: "🎯", label: "Bursa Lowongan Kerja", desc: "Akses ratusan posisi karir" },
      { icon: "🎓", label: "Career Talk & Seminar", desc: "Wawasan langsung dari HR praktisi" },
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
      { icon: "🌉", label: "Jembatan Akademik & Industri", desc: "Menghubungkan kampus & dunia kerja" },
      { icon: "📈", label: "Kompetensi Lulusan", desc: "Pelatihan hard skills & soft skills" },
      { icon: "🌍", label: "Daya Saing Global", desc: "Kesiapan menghadapi industri modern" },
      { icon: "🤝", label: "Fasilitasi Rekrutmen", desc: "Kemitraan strategis dunia usaha" },
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
    desc: "Pusat Karier UIN Jakarta menyelenggarakan berbagai program pengembangan karier seperti Tracer Study, Campus Hiring, Job Fair, dan Bursa Kerja Online. Selain itu, terdapat layanan Konseling Karier, Sosial, dan Akademik, serta pelatihan pengembangan diri melalui Training Soft Skills. Program lainnya meliputi Growth Buddy, PERSAMI, Pekan Konseling, Career Preparation, Kunjungan Industri (NGANTRI), dan Localpreneur Fest yang mendukung peningkatan kompetensi, kesiapan kerja, serta semangat kewirausahaan mahasiswa dan alumni.",
    keyPoints: [
      { icon: "🎯", label: "Job Fair & Campus Hiring", desc: "Peluang kerja on-campus rutin" },
      { icon: "🧠", label: "Konseling & Soft Skills", desc: "Bimbingan karier personal & grup" },
      { icon: "🚀", label: "Growth Buddy & PERSAMI", desc: "Pendampingan persiapan kerja" },
      { icon: "🏭", label: "NGANTRI & Localpreneur", desc: "Kunjungan industri & wirausaha" },
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
      { icon: "🧭", label: "Perencanaan Strategis", desc: "Penyusunan peta jalan program karier" },
      { icon: "🔗", label: "Koordinasi Antar Divisi", desc: "Sinergi layanan tracer & rekrutmen" },
      { icon: "🏆", label: "Pencapaian Visi Unggul", desc: "Mencetak lulusan siap kerja & adaptif" },
      { icon: "⚖️", label: "Tata Kelola Profesional", desc: "Pelayanan transparan & akuntabel" },
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
      <div className="pointer-events-none absolute -left-20 -top-16 z-0 h-80 w-80 opacity-70 animate-float-slow">
        <img
          src="/images/icons/blur%201.png"
          alt="Blur Ambient 1"
          className="h-full w-full object-contain filter drop-shadow-[0_0_50px_rgba(114,38,255,0.7)]"
        />
      </div>
      <div className="pointer-events-none absolute -right-20 -top-12 z-0 h-88 w-88 opacity-75 animate-float-reverse">
        <img
          src="/images/icons/blur%202.png"
          alt="Blur Ambient 2"
          className="h-full w-full object-contain filter drop-shadow-[0_0_60px_rgba(239,23,216,0.7)]"
        />
      </div>
      <div className="pointer-events-none absolute left-1/3 -bottom-20 z-0 h-72 w-72 opacity-60 animate-pulse">
        <img
          src="/images/icons/blur%203.png"
          alt="Blur Ambient 3"
          className="h-full w-full object-contain filter drop-shadow-[0_0_45px_rgba(75,30,133,0.8)]"
        />
      </div>
      <div className="pointer-events-none absolute -right-16 bottom-8 z-0 h-64 w-64 opacity-60">
        <img
          src="/images/icons/blur%204.png"
          alt="Blur Ambient 4"
          className="h-full w-full object-contain filter drop-shadow-[0_0_40px_rgba(195,56,255,0.6)]"
        />
      </div>
      <div className="pointer-events-none absolute -left-16 bottom-16 z-0 h-64 w-64 opacity-55">
        <img
          src="/images/icons/blur%205.png"
          alt="Blur Ambient 5"
          className="h-full w-full object-contain filter drop-shadow-[0_0_35px_rgba(114,38,255,0.6)]"
        />
      </div>

      {/* ============================================================ */}
      {/* TAB PEMBATAS BUKU (BOOKMARK TABS) DI ATAS BUKU              */}
      {/* ============================================================ */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
        {bookPages.map((item, idx) => {
          const isActive = idx === currentPage;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => changePage(idx, idx > currentPage ? "next" : "prev")}
              className={`group flex items-center gap-2 rounded-t-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer shadow-md border-t border-x ${
                isActive
                  ? "bg-[#251042] text-[#EF17D8] border-[#EF17D8]/60 shadow-[0_-5px_20px_rgba(239,23,216,0.35)] -translate-y-1"
                  : "bg-[#160A29]/80 text-white/70 border-white/10 hover:bg-[#200D3B] hover:text-white"
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isActive ? "bg-[#EF17D8] animate-ping" : "bg-white/40 group-hover:bg-white"
                }`}
              />
              <span>{item.tabLabel}</span>
              <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono opacity-70">
                Hal {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* BUKU TERBUKA (OPEN BOOK CONTAINER BERSIH TANPA GARIS TENGAH) */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Sampul Luar Buku (Hardcover Leather Glow) */}
        <div className="relative rounded-[2.5rem] p-3 sm:p-4 bg-gradient-to-br from-[#4B1E85] via-[#240D40] to-[#7226FF] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(114,38,255,0.35)] border-2 border-white/15">
          
          {/* Efek Pinggiran Emas Kertas Buku (Book Gilded Edges) */}
          <div className="rounded-[2.1rem] bg-[#140726] p-1 shadow-inner relative overflow-hidden">
            
            {/* Permukaan Lembaran Buku (Book Spread) - Bersih Tanpa Bayangan Hitam Tengah */}
            <div
              key={`${currentPage}-${flipDirection}`}
              className={`relative grid grid-cols-1 lg:grid-cols-12 min-h-[520px] rounded-[1.9rem] bg-gradient-to-r from-[#1C0B35] via-[#200D3D] to-[#1C0B35] overflow-hidden border border-white/10 ${animationClass}`}
            >
              {/* -------------------------------------------------------- */}
              {/* SISI KIRI BUKU (LEFT PAGE: Foto & Info Halaman)          */}
              {/* -------------------------------------------------------- */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-br from-[#1C0B35] to-[#17082C]">
                {/* Header Sisi Kiri: Nomor Halaman & Nama Buku */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#EF17D8] font-bold">
                    BUKU PANDUAN CCE 2026
                  </span>
                  <span className="rounded-md bg-purple-900/60 px-2 py-0.5 font-mono text-[11px] font-bold text-purple-200 border border-purple-700/40">
                    Hal. {currentPage * 2 + 1}
                  </span>
                </div>

                {/* Foto Dokumentasi / Landmark Halaman */}
                <div className="relative my-auto overflow-hidden rounded-2xl border border-purple-500/30 shadow-2xl aspect-[16/11] bg-black/50 group">
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
                    <span className="block text-[10px] text-purple-300 uppercase font-semibold">Dokumentasi</span>
                    <strong className="block text-xs font-bold leading-tight">{page.leftCaption}</strong>
                  </div>
                </div>

                {/* Catatan Kaki Halaman Kiri */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 italic">
                  <span>Pusat Karier UIN Jakarta</span>
                  <span>{page.sideNote}</span>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* SISI KANAN BUKU (RIGHT PAGE: Teks Bersih Sesuai Foto 2&3) */}
              {/* -------------------------------------------------------- */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-gradient-to-bl from-[#220E40] to-[#1C0B35]">
                {/* Header Sisi Kanan: Kategori & Halaman Genap */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                      {page.tag}
                    </span>
                  </div>
                  <span className="rounded-md bg-purple-900/60 px-2 py-0.5 font-mono text-[11px] font-bold text-purple-200 border border-purple-700/40">
                    Hal. {currentPage * 2 + 2}
                  </span>
                </div>

                {/* Konten Utama Lembaran Halaman */}
                <div className="space-y-4 my-auto">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                      {page.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-[#EF17D8]">
                      {page.subtitle}
                    </p>
                    <p className="text-[11px] font-mono text-white/50 mt-0.5">
                      {page.dateVenue}
                    </p>
                  </div>

                  {/* Paragraf Deskripsi Lembaran Kertas */}
                  <p className="text-sm sm:text-base leading-relaxed text-white/90 text-justify border-l-2 border-[#EF17D8] pl-4 py-1 bg-white/5 rounded-r-xl">
                    {page.desc}
                  </p>

                  {/* Grid 4 Poin Kunci Lembaran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {page.keyPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl bg-purple-950/50 p-2.5 border border-purple-700/30 backdrop-blur-sm"
                      >
                        <span className="text-lg leading-none shrink-0">{pt.icon}</span>
                        <div>
                          <strong className="block text-xs font-bold text-white leading-tight">
                            {pt.label}
                          </strong>
                          <span className="block text-[11px] text-purple-200/70 leading-tight">
                            {pt.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Lembaran Kanan: Tombol Selengkapnya & Tombol Balik Halaman */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  {page.ctaLink.startsWith("http") ? (
                    <a
                      href={page.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 active:scale-95"
                    >
                      <span>{page.ctaText}</span>
                      <span>→</span>
                    </a>
                  ) : (
                    <Link
                      href={page.ctaLink}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 active:scale-95"
                    >
                      <span>{page.ctaText}</span>
                      <span>→</span>
                    </Link>
                  )}

                  {/* Tombol Balik Lembar Sudut Kanan */}
                  <button
                    type="button"
                    onClick={nextPage}
                    className="group relative flex items-center gap-2 rounded-xl bg-purple-950/70 hover:bg-[#7226FF]/30 px-3.5 py-2 text-xs font-bold text-purple-200 hover:text-white border border-purple-500/30 transition-all cursor-pointer"
                    title="Buka Lembar Selanjutnya"
                  >
                    <span className="text-sm">📖</span>
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
      {/* KONTROL NAVIGASI BUKU (TOMBOL BALIK KERTAS DI BAWAH)        */}
      {/* ============================================================ */}
      <div className="relative z-20 mt-6 flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto px-4">
        {/* Tombol Balik Mundur */}
        <button
          type="button"
          onClick={prevPage}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1E0C36] to-[#2B104E] hover:from-[#2B104E] hover:to-[#3F1973] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md border border-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>←</span>
          <span>Lembar Sebelumnya</span>
        </button>

        {/* Indikator Halaman Buku */}
        <div className="flex items-center gap-2 bg-[#1A0A30]/90 px-4 py-2 rounded-full border border-purple-500/30 backdrop-blur-md shadow-lg">
          <span className="text-xs font-mono font-bold text-purple-300">
            Halaman {currentPage + 1} dari {totalPages}
          </span>
          <div className="flex gap-1.5 ml-2">
            {bookPages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => changePage(i, i > currentPage ? "next" : "prev")}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentPage ? "w-6 bg-[#EF17D8] shadow-sm shadow-[#EF17D8]" : "w-2 bg-white/30 hover:bg-white/60"
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
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Lembar Selanjutnya</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
