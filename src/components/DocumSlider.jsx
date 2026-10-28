"use client";

import { useState, useEffect, useRef } from "react";

const slides = [
  { src: "/images/docum/01.JPG", alt: "Dokumentasi CCE 1" },
  { src: "/images/docum/02.JPG", alt: "Dokumentasi CCE 2" },
  { src: "/images/docum/03.JPG", alt: "Dokumentasi CCE 3" },
  { src: "/images/docum/04.JPG", alt: "Dokumentasi CCE 4" },
  { src: "/images/docum/05.JPG", alt: "Dokumentasi CCE 5" },
  { src: "/images/docum/06.JPG", alt: "Dokumentasi CCE 6" },
];

export default function DocumSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Auto slide setiap 5 detik (5000ms)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  function goToSlide(index) {
    setCurrentIndex(index);
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }

  // Dukungan Swipe Layar Sentuh untuk Mobile
  function handleTouchStart(e) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (deltaX > 40) {
      prevSlide(); // Swipe kanan -> foto sebelumnya
    } else if (deltaX < -40) {
      nextSlide(); // Swipe kiri -> foto selanjutnya
    }
    touchStartXRef.current = null;
  }

  return (
    <div
      className="relative w-full max-w-xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Efek Ambient Glow Belakang Frame */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#7226FF] via-[#EF17D8] to-[#4B1E85] opacity-40 blur-xl transition duration-500 group-hover:opacity-60 pointer-events-none" />

      {/* Frame Slider Utama */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#160B29] shadow-2xl">
        {/* Progress Bar 5 Detik */}
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
          <div
            key={currentIndex}
            className={`h-full bg-gradient-to-r from-[#7226FF] to-[#EF17D8] ${
              !isPaused ? "animate-[progress_5s_linear]" : "w-full"
            }`}
            style={{
              animation: !isPaused ? "sliderProgress 5s linear forwards" : "none",
            }}
          />
        </div>

        {/* Badge Dokumentasi (Pojok Kiri Atas) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md border border-white/15">
          <span className="inline-block h-2 w-2 rounded-full bg-[#EF17D8] animate-pulse" />
          <span>Dokumentasi Acara</span>
        </div>

        {/* Counter Nomor Foto (Pojok Kanan Atas) */}
        <div className="absolute top-4 right-4 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-mono font-bold text-white/90 shadow-md backdrop-blur-md border border-white/15">
          {currentIndex + 1} / {slides.length}
        </div>

        {/* Container Carousel Track (1 Foto Tampil, Smooth Sliding) */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="relative w-full shrink-0 aspect-[4/3] sm:aspect-[16/11] bg-black/40 overflow-hidden"
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover select-none transition-transform duration-700"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Tombol Navigasi Kiri (Prev) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Foto Sebelumnya"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-md border border-white/20 transition-all hover:bg-black/75 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Tombol Navigasi Kanan (Next) */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Foto Selanjutnya"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-md border border-white/20 transition-all hover:bg-black/75 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Pagination Dots (Indikator Titik di Bawah) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Lihat foto ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-6 bg-[#EF17D8] shadow-sm shadow-[#EF17D8]"
                  : "w-2 bg-white/40 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes sliderProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
