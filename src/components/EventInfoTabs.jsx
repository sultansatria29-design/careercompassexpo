"use client";

import { useState } from "react";
import Link from "next/link";

const tabsData = [
  {
    id: "cce",
    badge: "Agenda Akbar",
    tabLabel: "Kegiatan CCE 2026",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Kegiatan Career Compas Expo (CCE) 2026",
    subtitle: "Auditorium Harun Nasution • 18–19 November 2026",
    desc: "Career Compas Expo (CCE) 2026 merupakan pameran bursa kerja dan karier tahunan terbesar yang diselenggarakan oleh Pusat Karier UIN Syarif Hidayatullah Jakarta. Kegiatan ini menghadirkan 28+ perusahaan mitra BUMN, multinasional, dan swasta terkemuka, membuka akses rekrutmen langsung bagi ribuan mahasiswa, alumni, serta masyarakat umum. Rangkaian acara meliputi Job Fair akbar, Walk-in Interview on-site, Career Preparation, dan sesi konsultasi karier terpadu.",
    highlights: [
      "28+ Perusahaan Mitra Ternama",
      "Walk-in Interview Langsung di Lokasi",
      "Akses Ribuan Lowongan Kerja & Magang",
      "Terbuka untuk Mahasiswa, Alumni & Umum",
    ],
    ctaText: "Daftar Peserta Sekarang",
    ctaLink: "/registrasi",
    image: "/images/docum/01.JPG",
    imageCaption: "Pameran Bursa Kerja & Antusiasme Pengunjung CCE",
  },
  {
    id: "profil",
    badge: "Profil Lembaga",
    tabLabel: "Profil",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-5.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-5.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    title: "Profil Pusat Karier",
    subtitle: "Pusat Pengembangan Karier UIN Syarif Hidayatullah Jakarta",
    desc: "Pusat Karier UIN Jakarta adalah lembaga yang berfokus pada pengembangan karier mahasiswa dan alumni melalui berbagai program bimbingan, pelatihan, serta fasilitasi rekrutmen. Pusat Karier berperan sebagai jembatan antara dunia akademik dan dunia kerja dengan tujuan meningkatkan kompetensi, kemandirian, dan daya saing lulusan UIN Jakarta di tingkat nasional maupun global.",
    highlights: [
      "Jembatan Dunia Akademik & Dunia Industri",
      "Peningkatan Kompetensi & Daya Saing Lulusan",
      "Bimbingan, Konseling & Pelatihan Karier Terpadu",
      "Fasilitasi Rekrutmen Terpercaya Sejak 2014",
    ],
    ctaText: "Selengkapnya",
    ctaLink: "https://karier.uinjkt.ac.id/id/profil-pusat-karier-uin-jakarta",
    image: "/images/puskar/pendidikan.jpg",
    imageCaption: "Wisudawan & Lulusan Berdaya Saing UIN Jakarta",
  },
  {
    id: "program",
    badge: "Program Unggulan",
    tabLabel: "Program",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Program",
    subtitle: "Rangkaian Program Karier & Kesiapan Kerja Lulusan",
    desc: "Pusat Karier UIN Jakarta menyelenggarakan berbagai program pengembangan karier seperti Tracer Study, Compas Hiring, Job Fair, dan Bursa Kerja Online. Selain itu, terdapat layanan Konseling Karier, Sosial, dan Akademik, serta pelatihan pengembangan diri melalui Training Soft Skills. Program lainnya meliputi Growth Buddy, PERSAMI, Pekan Konseling, Career Preparation, Kunjungan Industri (NGANTRI), dan Localpreneur Fest yang mendukung peningkatan kompetensi, kesiapan kerja, serta semangat kewirausahaan mahasiswa dan alumni.",
    highlights: [
      "Job Fair, Compas Hiring & Bursa Kerja Online",
      "Konseling Karier, Sosial & Akademik",
      "Training Soft Skills & Growth Buddy",
      "PERSAMI, Pekan Konseling & Localpreneur Fest",
    ],
    ctaText: "Selengkapnya",
    ctaLink: "https://karier.uinjkt.ac.id/id",
    image: "/images/puskar/pengabdian.jpeg",
    imageCaption: "Aktivitas Program Pengembangan Karier Mahasiswa",
  },
  {
    id: "pengurus",
    badge: "Struktur Organisasi",
    tabLabel: "Pengurus",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: "Executive Board",
    subtitle: "Struktur Kepengurusan & Perencanaan Strategis",
    desc: "Executive Board Pusat Karier UIN Jakarta yang bertanggung jawab mengelola seluruh program dan kegiatan pengembangan karier mahasiswa dan alumni. Executive Board berperan dalam perencanaan strategis, koordinasi antar divisi, serta pengambilan keputusan untuk memastikan tercapainya visi Pusat Karier dalam mempersiapkan lulusan UIN Jakarta yang kompeten, profesional, dan siap bersaing di dunia kerja.",
    highlights: [
      "Perencanaan Strategis Program Tahunan",
      "Koordinasi Kemitraan Antara Divisi & Industri",
      "Pengembangan Kapasitas & Layanan Karir Mahasiswa",
      "Monitoring & Evaluasi Kesiapan Kerja Lulusan",
    ],
    ctaText: "Selengkapnya",
    ctaLink: "https://karier.uinjkt.ac.id/id/executive-board",
    image: "/images/puskar/penelitian.jpeg",
    imageCaption: "Tim Executive Board Pusat Karier UIN Jakarta",
  },
];

export default function EventInfoTabs() {
  const [activeTab, setActiveTab] = useState(tabsData[0].id);

  const current = tabsData.find((t) => t.id === activeTab) || tabsData[0];

  return (
    <div className="w-full">
      {/* Box Kartu Interaktif Utama */}
      <div className="rounded-3xl border border-purple-500/30 bg-[#1F0E38]/90 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow Ambient di pojok */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#EF17D8]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#7226FF]/20 blur-3xl" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
          {/* KOLOM KIRI: Foto Landmark Kampus & Menu Tombol Tab Bertingkat */}
          <div className="lg:col-span-5 space-y-4">
            {/* Foto Landmark UIN Syarif Hidayatullah Jakarta */}
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-xl aspect-[16/10] group">
              <img
                src="/images/puskar/history.png"
                alt="Landmark UIN Syarif Hidayatullah Jakarta"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E0C36]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-xs font-semibold text-white drop-shadow-md">
                <span className="block text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                  Penyelenggara Resmi
                </span>
                <span className="text-sm font-extrabold text-white">
                  Pusat Karier UIN Jakarta
                </span>
              </div>
            </div>

            {/* Menu Navigasi Tab (Model Tombol Vertikal seperti Foto 2 & 3) */}
            <div className="space-y-2.5">
              {tabsData.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between rounded-2xl px-5 py-3.5 text-left font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#7226FF] to-[#EF17D8] text-white shadow-lg shadow-purple-600/30 scale-[1.02] border border-white/30"
                        : "bg-[#2A144E]/70 hover:bg-[#341B5E] text-white/80 hover:text-white border border-purple-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-purple-900/60 text-purple-300"
                        }`}
                      >
                        {tab.icon}
                      </div>
                      <div>
                        <span className="block text-sm font-extrabold leading-tight">
                          {tab.tabLabel}
                        </span>
                        <span
                          className={`block text-[10px] font-medium ${
                            isActive ? "text-white/80" : "text-purple-300/70"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-base font-bold transition-transform ${
                        isActive ? "translate-x-1 text-white" : "text-white/40"
                      }`}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KOLOM KANAN: Konten Detail Sesuai Tab Aktif (Foto 2 & 3) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Badge Kategori Tab */}
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-gradient-to-r from-[#EF17D8]/30 to-[#7226FF]/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#EF17D8] border border-[#EF17D8]/40">
                  {current.badge}
                </span>
                <span className="text-xs text-white/50">•</span>
                <span className="text-xs font-semibold text-purple-200">
                  {current.subtitle}
                </span>
              </div>

              {/* Judul Besar Tab */}
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {current.title}
              </h3>

              {/* Paragraf Deskripsi Resmi Sesuai Foto 2 & 3 */}
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/85 text-justify">
                {current.desc}
              </p>

              {/* Highlight Poin Keunggulan */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {current.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-purple-950/60 border border-purple-800/40 px-3 py-2 text-xs text-purple-100"
                  >
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian Bawah: Foto Ilustrasi Kegiatan + Tombol CTA Selengkapnya */}
            <div className="pt-2 border-t border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Foto Ilustrasi Tab di Sudut Kanan Bawah seperti Foto 2 & 3 */}
              <div className="w-full sm:w-auto flex items-center gap-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-md">
                  <img
                    src={current.image}
                    alt={current.imageCaption}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-xs text-white/70">
                  <span className="block font-bold text-white text-[11px]">
                    Dokumentasi:
                  </span>
                  <span className="line-clamp-1">{current.imageCaption}</span>
                </div>
              </div>

              {/* Tombol Aksi Selengkapnya */}
              {current.ctaLink.startsWith("http") ? (
                <a
                  href={current.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>{current.ctaText}</span>
                  <span>→</span>
                </a>
              ) : (
                <Link
                  href={current.ctaLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>{current.ctaText}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
