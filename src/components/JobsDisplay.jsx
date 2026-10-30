"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function parseJobDescription(desc) {
  if (!desc) return { text: "", poster_url: "" };
  try {
    if (typeof desc === "string" && desc.trim().startsWith("{")) {
      const parsed = JSON.parse(desc);
      return {
        text: parsed.text || "",
        poster_url: parsed.poster_url || "",
      };
    }
  } catch {}
  return { text: desc, poster_url: "" };
}

export default function JobsDisplay({ initialJobs = [] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  if (!jobs || jobs.length === 0) {
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
      {jobs.map((job) => {
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

        return (
          <div
            key={job.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#1F0C3B]/70 p-6 sm:p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-[#EF17D8]/60 hover:bg-[#2A1152]/90 hover:shadow-2xl hover:shadow-purple-900/50"
          >
            <div>
              {/* Optional Poster Thumbnail Preview */}
              {posterUrl && (
                <Link
                  href={`/lowongan/${job.id}`}
                  className="block mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40 group/poster cursor-pointer"
                  title="Lihat detail & poster lowongan"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#160A2C]">
                    <img
                      src={posterUrl}
                      alt={`Poster lowongan ${job.title}`}
                      className="h-full w-full object-cover object-top transition duration-300 group-hover/poster:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F0C3B] via-transparent to-transparent opacity-50" />
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-purple-200 border border-white/15 flex items-center gap-1 shadow-sm">
                      <svg className="w-2.5 h-2.5 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                <span className="rounded-full bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 px-3 py-1 text-xs font-black tracking-wide text-[#EF17D8] border border-[#EF17D8]/30">
                  {job.employment_type || "Full-time"}
                </span>
                <span className="text-xs text-purple-200/70 flex items-center gap-1 font-medium">
                  <svg className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{job.location || "Jakarta (Hybrid)"}</span>
                </span>
              </div>

              {/* Job Title (Clickable to /lowongan/[id]) */}
              <Link href={`/lowongan/${job.id}`} className="block group-hover:underline">
                <h3 className="text-xl font-extrabold text-white group-hover:text-[#EF17D8] transition-colors leading-snug">
                  {job.title}
                </h3>
              </Link>

              {/* Company Info with Logo / Avatar */}
              <div className="mt-3 flex items-center gap-2.5">
                {hasLogo ? (
                  <div className="h-8 w-8 rounded-lg bg-white p-1 shrink-0 overflow-hidden shadow-xs">
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
                  <p className="text-sm font-bold text-white/90 truncate">
                    {companyName}
                  </p>
                  {companyIndustry && (
                    <p className="text-[11px] text-purple-300/60 truncate">
                      {companyIndustry}
                    </p>
                  )}
                </div>
              </div>

              {/* Quota Badge if available */}
              {job.quota && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-purple-200 border border-white/10">
                  <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Kuota: <strong>{job.quota} orang</strong></span>
                </div>
              )}

              {/* Description */}
              {cleanDescription && (
                <p className="mt-3 text-xs text-purple-100/70 line-clamp-2 leading-relaxed">
                  {cleanDescription}
                </p>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div className="mt-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5 text-[11px] text-purple-200/80">
                  <span className="font-bold text-purple-100 block mb-0.5">Kualifikasi:</span>
                  <p className="line-clamp-2 leading-relaxed">{job.requirements}</p>
                </div>
              )}
            </div>

            {/* Bottom Actions: Link to /lowongan/[id] */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-purple-300/50 flex items-center gap-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Mitra Terverifikasi CCE</span>
              </span>
              <Link
                href={`/lowongan/${job.id}`}
                className="rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-4 py-2 text-xs font-black text-white shadow-md shadow-purple-600/30 transition hover:scale-105 hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
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
  );
}
