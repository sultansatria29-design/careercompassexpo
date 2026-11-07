"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

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

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function MoreLowonganPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Semua");

  useEffect(() => {
    let isMounted = true;
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.jobs)) {
            setJobs(data.jobs);
          }
        }
      } catch (err) {
        console.error("Gagal memuat daftar lowongan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter lowongan publik & aktif
  const validJobs = useMemo(() => {
    return (jobs || []).filter((job) => {
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
  }, [jobs]);

  // Ekstrak tipe pekerjaan unik
  const employmentTypes = useMemo(() => {
    const types = new Set(["Semua"]);
    validJobs.forEach((job) => {
      if (job.employment_type) types.add(job.employment_type.trim());
    });
    return Array.from(types);
  }, [validJobs]);

  // Filter berdasarkan search & tipe
  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return validJobs.filter((job) => {
      const companyName = (job.company_name || job.companies?.name || "").toLowerCase();
      const title = (job.title || "").toLowerCase();
      const location = (job.location || "").toLowerCase();
      const industry = (job.company_industry || "").toLowerCase();

      const matchesSearch =
        !q ||
        title.includes(q) ||
        companyName.includes(q) ||
        location.includes(q) ||
        industry.includes(q);

      const matchesType =
        selectedType === "Semua" ||
        (job.employment_type || "").toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [validJobs, search, selectedType]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100 selection:text-purple-900 flex flex-col justify-between">
      {/* Navbar Global */}
      <Navbar />

      <main id="morelowongan" className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Tombol Kembali ke Beranda */}
        <div className="mb-6">
          <Link
            href="/#lowongan"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-purple-600 transition group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Kembali ke Beranda CCE 2026</span>
          </Link>
        </div>

        {/* Hero Section Halaman Lowongan */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-700 mb-3.5 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Peluang Karier &amp; Rekrutmen Kampus CCE 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Seluruh Lowongan Pekerjaan
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Jelajahi seluruh posisi yang dibuka oleh perusahaan mitra resmi Career Compass Expo 2026 UIN Syarif Hidayatullah Jakarta. Siapkan CV terbaikmu dan kirim lamaran atau ikuti proses walk-in interview langsung di venue.
            </p>
          </div>

          {/* Search Bar & Filter Chips */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:flex-1">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari berdasarkan posisi pekerjaan atau nama perusahaan..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Button: Daftar untuk Melamar */}
              <Link
                href="/pelamar"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/20 hover:opacity-95 hover:scale-105 active:scale-95 transition whitespace-nowrap"
              >
                <span>Daftar / Masuk Akun Pelamar</span>
              </Link>
            </div>

            {/* Filter Tipe Pekerjaan Chips */}
            {employmentTypes.length > 2 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-500 mr-1">Tipe:</span>
                {employmentTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedType === type
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {/* Counter Info */}
            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong>{filteredJobs.length}</strong> posisi dari total {validJobs.length} lowongan yang tersedia
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-3xl border border-slate-200 bg-white p-7 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-16 bg-slate-100 rounded-xl"></div>
                <div className="h-9 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Tidak ada lowongan yang cocok
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Tidak ditemukan posisi dengan kata kunci &quot;{search}&quot;. Silakan coba kata kunci lain atau reset filter pencarian.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedType("Semua");
              }}
              className="mt-5 rounded-full border border-purple-200 bg-purple-50 px-5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}

        {/* Full Jobs Grid */}
        {!loading && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
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
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10"
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
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
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

                    {/* Job Title */}
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

                  {/* Bottom Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>Mitra Terverifikasi CCE</span>
                    </span>
                    <Link
                      href={`/lowongan/${job.id}`}
                      className="rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-4 py-2 text-xs font-black text-white shadow-md shadow-purple-600/20 transition hover:scale-105 hover:opacity-95 flex items-center justify-center cursor-pointer"
                    >
                      <span>Lamar Posisi</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Mini */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          © 2026 Career Compass Expo — Pusat Pengembangan Karier UIN Syarif Hidayatullah Jakarta
        </div>
      </footer>
    </div>
  );
}
