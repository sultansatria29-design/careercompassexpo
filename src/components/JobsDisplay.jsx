"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";


function parseJobDescription(desc) {
  if (!desc) return { text: "", poster_url: "", start_date: "", end_date: "", is_expired: false };
  try {
    if (typeof desc === "string" && desc.trim().startsWith("{")) {
      const parsed = JSON.parse(desc);
      const start_date = parsed.start_date || "";
      const end_date = parsed.end_date || "";

      let is_expired = false;
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        if (new Date() > end) {
          is_expired = true;
        }
      }

      return {
        text: parsed.text || "",
        poster_url: parsed.poster_url || "",
        start_date,
        end_date,
        is_expired,
      };
    }
  } catch {}
  return { text: desc, poster_url: "", start_date: "", end_date: "", is_expired: false };
}

export default function JobsDisplay({ initialJobs = [] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const INITIAL_LIMIT = 6;
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Client-side auto fetch & sync dari /api/jobs agar lowongan baru selalu muncul secara real-time
  useEffect(() => {
    let isMounted = true;
    async function syncJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.jobs)) {
            setJobs(data.jobs);
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi lowongan client-side:", err);
      } finally {
        if (isMounted) setIsRefreshing(false);
      }
    }

    syncJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter lowongan publik: yang sudah lewat batas tanggal otomatis terhapus
  const displayJobs = (jobs || []).filter((job) => {
    if (!job.is_active) return false;
    const descObj = parseJobDescription(job.raw_description || job.description);
    const isExpired = job.is_expired !== undefined ? job.is_expired : descObj.is_expired;
    if (isExpired) return false;
    const startDate = job.start_date || descObj.start_date;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (new Date() < start) return false;
    }
    return true;
  });

  const visibleJobs = displayJobs.slice(0, INITIAL_LIMIT);
  const hasMore = displayJobs.length > INITIAL_LIMIT;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

    // Hitung active index untuk kartu terdekat
    const cardWidth = clientWidth * 0.85;
    if (cardWidth > 0) {
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(idx, visibleJobs.length - 1)));
    }
  };

  const scrollByDirection = (direction) => {
    if (!scrollRef.current) return;
    const distance = scrollRef.current.clientWidth * 0.82;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  if (!displayJobs || displayJobs.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        {/* Icon Koper Tematik CCE (Gradien Neon & Glow) */}
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7226FF]/15 via-purple-100 to-[#EF17D8]/15 p-4 border border-[#EF17D8]/30 shadow-sm">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#7226FF] to-[#EF17D8] opacity-15 blur-lg animate-pulse pointer-events-none" />
          <svg
            className="relative z-10 h-10 w-10 drop-shadow-md"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="7"
              width="20"
              height="14"
              rx="3"
              fill="url(#cce-briefcase-body-comp)"
              stroke="url(#cce-briefcase-stroke-comp)"
              strokeWidth="1.5"
            />
            <path
              d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M2 13H22"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.5"
            />
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
            <defs>
              <linearGradient id="cce-briefcase-body-comp" x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7226FF" />
                <stop offset="0.5" stopColor="#9C27B0" />
                <stop offset="1" stopColor="#EF17D8" />
              </linearGradient>
              <linearGradient id="cce-briefcase-stroke-comp" x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C338FF" />
                <stop offset="1" stopColor="#FF66EB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Lowongan pekerjaan belum tersedia saat ini
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
          Daftar posisi lowongan pekerjaan dari perusahaan peserta akan segera dirilis menjelang hari H acara.
        </p>
      </div>
    );
  }

  function formatShortDate(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="relative w-full">
      {/* Mobile Swipe Hint & Controls */}
      {visibleJobs.length > 1 && (
        <div className="flex md:hidden items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <svg className="w-3.5 h-3.5 text-purple-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>Geser ke samping</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByDirection("left")}
              disabled={!canScrollLeft}
              aria-label="Geser ke kiri"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 active:scale-95 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[11px] font-bold text-purple-700 min-w-8 text-center">
              {Math.min(activeIndex + 1, visibleJobs.length)} / {visibleJobs.length}
            </span>
            <button
              type="button"
              onClick={() => scrollByDirection("right")}
              disabled={!canScrollRight}
              aria-label="Geser ke kanan"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 active:scale-95 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Container: Horizontal slide scroll on mobile (< md), Clean Grid on desktop (>= md) */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 md:pt-0"
      >
        {visibleJobs.map((job) => {
          const companyName = job.company_name || job.companies?.name || "Perusahaan Rekanan";
          const companyLogo = job.company_logo || job.companies?.logo_url || "";
          const companyIndustry = job.company_industry || "";
          const companyInitial = companyName.charAt(0).toUpperCase();
          const hasLogo = Boolean(companyLogo);

          const descObj = parseJobDescription(job.raw_description || job.description);
          const cleanDescription =
            job.description && !job.description.startsWith("{")
              ? job.description
              : descObj.text;
          const posterUrl = job.poster_url || descObj.poster_url;
          const endDate = job.end_date || descObj.end_date;

          return (
            <div
              key={job.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 w-[84vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink"
            >
              <div>
                {/* Optional Poster Thumbnail Preview */}
                {posterUrl && (
                  <Link
                    href={`/lowongan/${job.id}`}
                    className="block mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 group/poster cursor-pointer"
                    title="Lihat detail & poster lowongan"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <img
                        src={posterUrl}
                        alt={`Poster lowongan ${job.title}`}
                        className="h-full w-full object-cover object-top transition duration-300 group-hover/poster:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-40" />
                      <span className="absolute bottom-2 right-2 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-slate-800 border border-slate-200 flex items-center gap-1 shadow-sm">
                        <svg className="w-2.5 h-2.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Lihat Brosur
                      </span>
                    </div>
                  </Link>
                )}

                {/* Header Badges: Employment Type & Location */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black tracking-wide text-purple-700 border border-purple-200">
                    {job.employment_type || "Full-time"}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <svg className="h-3.5 w-3.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{job.location || "Jakarta (Hybrid)"}</span>
                  </span>
                </div>

                {/* Job Title (Clickable to /lowongan/[id]) */}
                <Link href={`/lowongan/${job.id}`} className="block group-hover:underline">
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                    {job.title}
                  </h3>
                </Link>

                {/* Company Info with Logo / Avatar */}
                <div className="mt-3 flex items-center gap-2.5">
                  {hasLogo ? (
                    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden shadow-2xs">
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 text-xs font-black text-white shrink-0 shadow-sm">
                      {companyInitial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {companyName}
                    </p>
                    {companyIndustry && (
                      <p className="text-[11px] text-slate-500 truncate">
                        {companyIndustry}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quota & Deadline Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {job.quota && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                      <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Kuota: <strong>{job.quota} orang</strong></span>
                    </div>
                  )}
                  {endDate && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-fuchsia-50 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-700 border border-fuchsia-200">
                      <svg className="h-3 w-3 text-fuchsia-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Batas: <strong>{formatShortDate(endDate)}</strong></span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {cleanDescription && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {cleanDescription}
                  </p>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Kualifikasi:</span>
                    <p className="line-clamp-2 leading-relaxed">{job.requirements}</p>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Link to /lowongan/[id] */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Mitra Terverifikasi CCE</span>
                </span>
                <Link
                  href={`/lowongan/${job.id}`}
                  className="rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-4 py-2 text-xs font-black text-white shadow-md shadow-purple-600/20 transition hover:scale-105 hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Lamar Posisi</span>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Dot Indicators */}
      {visibleJobs.length > 1 && (
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-2">
          {visibleJobs.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.clientWidth * 0.85;
                  scrollRef.current.scrollTo({ left: i * cardWidth, behavior: "smooth" });
                }
              }}
              aria-label={`Lihat lowongan nomor ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-6 bg-gradient-to-r from-[#7226FF] to-[#EF17D8]"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Tombol See More / Arahkan ke page baru #morelowongan */}
      {hasMore && (
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2.5">
            <Link
              href="/morelowongan#morelowongan"
              className="group inline-flex items-center gap-2.5 rounded-full border border-purple-200 bg-white px-8 py-3.5 text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all duration-200 hover:border-purple-400 hover:bg-purple-50/70 hover:text-purple-700 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Lihat Lebih Banyak Lowongan</span>
              <svg className="h-4 w-4 text-purple-600 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <p className="text-[11px] text-slate-500">
              Menampilkan {INITIAL_LIMIT} dari total {displayJobs.length} posisi yang tersedia
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

