"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pelamarSession, setPelamarSession] = useState(null);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll);

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cce_pelamar_session");
        if (stored) setPelamarSession(JSON.parse(stored));
      } catch {}
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleNavClick() {
    setIsOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled || isOpen
          ? "border-white/10 bg-[#1E0C36]/95 backdrop-blur-md shadow-lg shadow-black/30"
          : "border-white/5 bg-[#1E0C36]/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-3.5">
        {/* Logo & Brand Title */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex h-10 w-24 sm:h-12 sm:w-28 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm transition hover:scale-105">
            <img
              src="/images/logo-puskar.png"
              alt="Logo Pusat Karier UIN Jakarta"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight whitespace-nowrap">
            CCE<span className="text-[#EF17D8]"> 2026</span>
          </span>
        </Link>

        {/* Desktop Navigation Links (>= md) */}
        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex lg:gap-7">
          <Link href="/" className="text-white/80 transition-colors hover:text-white">
            Beranda
          </Link>
          <Link href="/#tentang" className="text-white/80 transition-colors hover:text-white">
            Tentang
          </Link>
          <Link href="/#informasi" className="text-white/80 transition-colors hover:text-white">
            Informasi Acara
          </Link>
          <Link href="/#lowongan" className="text-white/80 transition-colors hover:text-white">
            Lowongan
          </Link>
          <Link href="/#fitur" className="text-white/80 transition-colors hover:text-white">
            Panduan
          </Link>
          <Link href="/#mitra" className="text-white/80 transition-colors hover:text-white">
            Mitra
          </Link>
        </nav>

        {/* Desktop Action Button (>= md) */}
        <div className="hidden md:flex items-center gap-2.5">
          {pelamarSession ? (
            <Link
              href="/pelamar/dashboard"
              className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/15 px-4 py-2 text-xs font-bold text-fuchsia-300 hover:bg-fuchsia-500/25 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Dashboard Pelamar</span>
            </Link>
          ) : (
            <Link
              href="/pelamar"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-purple-200 hover:bg-white/10 hover:text-white transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Masuk Pelamar</span>
            </Link>
          )}

          <Link
            href="/registrasi"
            className="rounded-full bg-gradient-to-r from-[#7226FF] to-[#EF17D8] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/30 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Registrasi Peserta
          </Link>
        </div>

        {/* Mobile Right Controls: Tombol Hamburger (< md) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            {isOpen ? (
              // Icon Close / X
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Icon Hamburger 3 bars
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-purple-500/20 bg-[#1E0C36]/98 px-5 py-6 backdrop-blur-xl animate-fadeIn">
          <div className="space-y-4">
            <nav className="flex flex-col space-y-2 text-base font-bold">
              <Link
                href="/"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Beranda</span>
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/#tentang"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Tentang Acara</span>
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/#informasi"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Informasi Acara</span>
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/#lowongan"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Lowongan Pekerjaan</span>
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/#fitur"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Panduan & Fitur</span>
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/#mitra"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Mitra Perusahaan</span>
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </nav>

            <div className="pt-2 border-t border-purple-800/40 space-y-2">
              {pelamarSession ? (
                <Link
                  href="/pelamar/dashboard"
                  onClick={handleNavClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/20 py-3 text-center text-xs font-bold text-fuchsia-300 transition hover:bg-fuchsia-500/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Dashboard Pelamar Saya</span>
                </Link>
              ) : (
                <Link
                  href="/pelamar"
                  onClick={handleNavClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 py-3 text-center text-xs font-bold text-purple-200 transition hover:bg-white/15"
                >
                  <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Masuk / Daftar Akun Pelamar</span>
                </Link>
              )}

              <Link
                href="/pelamar/walk-in"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 py-3 text-center text-xs font-bold text-cyan-300 transition hover:bg-cyan-900/40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Form Walk-In Interview</span>
              </Link>

              <Link
                href="/indeks-kepuasan"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 py-3 text-center text-xs font-bold text-amber-300 transition hover:bg-amber-900/40"
              >
                <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>Indeks Kepuasan Acara</span>
              </Link>

              <Link
                href="/registrasi"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] py-3.5 text-center text-sm font-black text-white shadow-lg shadow-purple-600/30 transition hover:opacity-95"
              >
                <span>Registrasi Peserta (E-Ticket)</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
