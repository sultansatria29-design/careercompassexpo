"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
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
          <a href="#tentang" className="text-white/80 transition-colors hover:text-white">
            Tentang
          </a>
          <a href="#informasi" className="text-white/80 transition-colors hover:text-white">
            Informasi Acara
          </a>
          <a href="#lowongan" className="text-white/80 transition-colors hover:text-white">
            Lowongan
          </a>
          <a href="#fitur" className="text-white/80 transition-colors hover:text-white">
            Panduan
          </a>
        </nav>

        {/* Desktop Action Button (>= md) */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/mitra"
            className="flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-950/50 px-3.5 py-2 text-xs font-bold text-purple-200 transition hover:border-fuchsia-400/60 hover:bg-purple-900/60 hover:text-white"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gabung Mitra</span>
          </Link>
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
                <span className="text-xs text-purple-400">→</span>
              </Link>
              <a
                href="#tentang"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Tentang Acara</span>
                <span className="text-xs text-purple-400">→</span>
              </a>
              <a
                href="#informasi"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Informasi Acara</span>
                <span className="text-xs text-purple-400">→</span>
              </a>
              <a
                href="#lowongan"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Lowongan Pekerjaan</span>
                <span className="text-xs text-purple-400">→</span>
              </a>
              <a
                href="#fitur"
                onClick={handleNavClick}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-white/90 hover:bg-purple-950/60 hover:text-white transition"
              >
                <span>Panduan & Fitur</span>
                <span className="text-xs text-purple-400">→</span>
              </a>
            </nav>

            <div className="pt-2 border-t border-purple-800/40 space-y-3">
              <Link
                href="/registrasi"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#EF17D8] py-3.5 text-center text-sm font-black text-white shadow-lg shadow-purple-600/30 transition hover:opacity-95"
              >
                <span>Registrasi Peserta (E-Ticket)</span>
                <span>→</span>
              </Link>

              <Link
                href="/mitra"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-purple-900/40 py-3 text-center text-xs sm:text-sm font-bold text-purple-200 hover:bg-purple-850/60 hover:text-white transition"
              >
                <svg className="h-4 w-4 text-fuchsia-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Gabung Menjadi Mitra Perusahaan</span>
                <span>→</span>
              </Link>

              <Link
                href="/admin"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-1.5 text-xs text-purple-300/80 hover:text-white py-1 transition"
              >
                <svg className="h-3.5 w-3.5 text-[#EF17D8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Portal Admin Gate Console</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
