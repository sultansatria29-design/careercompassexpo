"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function FeatureCards({ items }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.35); // Nilai awal besar (1.35) untuk desktop scroll

  // Mobile slider state
  const [mobileIndex, setMobileIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // 1. Scroll-driven scaling effect for Desktop view
  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            const start = windowHeight;
            const end = windowHeight * 0.3;

            const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
            const currentScale = 1.35 - progress * 0.35;
            setScale(currentScale);
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Auto-looping slider for Mobile view (Looping setiap 3.2 detik)
  useEffect(() => {
    if (isPaused || !items || items.length === 0) return;

    const timer = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % items.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, items]);

  // Touch handlers for mobile swipe
  function handleTouchStart(e) {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        // Swipe left -> Next
        setMobileIndex((prev) => (prev + 1) % items.length);
      } else {
        // Swipe right -> Prev
        setMobileIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    }
    // Resume auto-looping after 4 seconds of inactivity
    setTimeout(() => setIsPaused(false), 4000);
  }

  function nextSlide() {
    setMobileIndex((prev) => (prev + 1) % items.length);
  }

  function prevSlide() {
    setMobileIndex((prev) => (prev - 1 + items.length) % items.length);
  }

  return (
    <div ref={containerRef} className="relative">
      
      {/* ========================================================
          TAMPILAN MOBILE: Slider Samping dengan Looping Otomatis (< md)
          ======================================================== */}
      <div className="block md:hidden">
        {/* Carousel Container */}
        <div
          className="relative overflow-hidden rounded-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
          >
            {items.map((item, idx) => (
              <div key={item.title} className="w-full shrink-0 px-1">
                <div
                  className={`group relative flex flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-b from-[#4B1E85]/70 to-[#2A1248]/80 p-7 backdrop-blur-md shadow-2xl transition-all duration-300 ${item.borderGlow}`}
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-[#EF17D8]/20 px-3 py-1 text-xs font-black tracking-widest text-[#EF17D8] border border-[#EF17D8]/40">
                        LANGKAH {item.badge}
                      </span>
                      <span className="text-xs text-white/50 font-medium">
                        Fitur {idx + 1} dari {items.length}
                      </span>
                    </div>

                    {/* Maskot Robot */}
                    <div className="relative mb-6 flex h-36 w-36 items-center justify-center mx-auto">
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.highlight} blur-xl animate-pulse`}
                      />
                      <img
                        src={item.icon}
                        alt={item.alt}
                        className="relative z-10 h-full w-full object-contain drop-shadow-2xl select-none"
                      />
                    </div>

                    <h3 className="mb-2 text-2xl font-bold text-white text-center">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/80 text-center">
                      {item.desc}
                    </p>
                  </div>

                  <Link
                    href={item.link || "#alur"}
                    className="mt-6 pt-4 border-t border-white/15 flex items-center justify-center gap-2 text-sm font-bold text-[#EF17D8] hover:text-white transition-colors"
                  >
                    <span>{item.cta || "Pelajari lebih lanjut"}</span>
                    <span className="text-lg">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Tombol Navigasi Kiri & Kanan (Floating di Mobile) */}
          <button
            onClick={prevSlide}
            aria-label="Slide Sebelumnya"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 active:scale-95 transition-transform shadow-lg"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide Berikutnya"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 active:scale-95 transition-transform shadow-lg"
          >
            ›
          </button>
        </div>

        {/* Indikator Titik (Dots) Looping */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {items.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setMobileIndex(dotIdx)}
              aria-label={`Buka slide ${dotIdx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                mobileIndex === dotIdx
                  ? "w-8 bg-gradient-to-r from-[#7226FF] to-[#EF17D8] shadow-[0_0_12px_rgba(239,23,216,0.6)]"
                  : "w-2.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ========================================================
          TAMPILAN DESKTOP & TABLET: Grid 4 Kolom dengan Scroll Scale (>= md)
          ======================================================== */}
      <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => (
          <div
            key={item.title}
            className={`group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#4B1E85]/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-[#4B1E85]/70 hover:shadow-2xl ${item.borderGlow}`}
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-white/40 group-hover:text-[#EF17D8] transition-colors">
                  {item.badge}
                </span>
              </div>

              {/* Container Maskot Robot dengan Animasi Dari Besar ke Kecil Saat Scroll */}
              <div className="relative mb-6 flex h-32 w-32 items-center justify-center mx-auto overflow-visible">
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.highlight} blur-xl`}
                  style={{
                    transform: `scale(${scale})`,
                    transition: "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                />
                <img
                  src={item.icon}
                  alt={item.alt}
                  className="relative z-10 h-full w-full object-contain drop-shadow-xl select-none"
                  style={{
                    transform: `scale(${scale})`,
                    transition: "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                />
              </div>

              <h3 className="mb-3 text-xl font-bold text-white group-hover:text-[#EF17D8] transition-colors">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/70">
                {item.desc}
              </p>
            </div>

            <Link
              href={item.link || "#alur"}
              className="mt-6 pt-4 border-t border-white/10 flex items-center text-xs font-semibold text-[#EF17D8] group-hover:translate-x-1 transition-transform"
            >
              <span>{item.cta || "Pelajari lebih lanjut"}</span>
              <span className="ml-1 text-base leading-none">→</span>
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
