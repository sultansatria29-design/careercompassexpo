import Image from "next/image";

export default function TactlinkSection() {
  return (
    <section id="partner" className="relative bg-[#160829] px-6 py-16 sm:py-24 overflow-hidden border-t border-purple-900/40">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#7226FF]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#EF17D8]/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 -top-20 -translate-x-1/2 h-64 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Main Card Container with CCE Cosmic Dark Cyber Glass Styling */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#4B1E85]/40 via-[#2A1248]/60 to-[#140827]/80 p-6 sm:p-10 md:p-12 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-purple-500/30">
          
          {/* Subtle inner top glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EF17D8]/40 to-transparent" />

          {/* Badge: SITUS WEB DIDUKUNG OLEH */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Situs Web Didukung Oleh
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
            
            {/* Left Content Area: Logo Box + Texts & Store Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 flex-1">
              
              {/* Tactlink Brand White Box */}
              <div className="shrink-0 flex items-center justify-center rounded-2xl bg-white px-5 py-4 shadow-xl border border-white/30 transition-transform duration-300 hover:scale-105">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/tactlink-logo.png"
                    alt="Tactlink Icon"
                    className="h-9 sm:h-11 w-auto object-contain"
                  />
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1A2B4C]">
                    TACTLINK
                  </span>
                </div>
              </div>

              {/* Text, Download Buttons & Stats */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Terhubung lebih cerdas dengan{" "}
                    <span className="bg-gradient-to-r from-[#FDB813] to-[#EFCB4A] bg-clip-text text-transparent">
                      Tactlink
                    </span>
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-white/75 leading-relaxed max-w-2xl">
                    Situs web resmi ini didukung oleh Tactlink. Unduh aplikasi untuk merasakan jaringan digital dan kartu nama bisnis digital yang lebih cerdas.
                  </p>
                </div>

                {/* App Store & Google Play Download Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Apple App Store */}
                  <a
                    href="https://apps.apple.com/id/app/tactlink/id1469516661"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-xl bg-black/60 hover:bg-black/90 border border-white/20 hover:border-white/40 px-4 py-2.5 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-[1.03]"
                  >
                    <svg
                      className="h-6 w-6 text-white fill-current shrink-0 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.66 1.38-.56.65-.99 1.7-0.88 2.73 1.02.08 2.05-.51 2.62-1.24z" />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium leading-none">
                        Download on the
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight mt-0.5">
                        App Store
                      </span>
                    </div>
                  </a>

                  {/* Google Play Store */}
                  <a
                    href="https://play.google.com/store/apps/details?id=com.tactlink.app&pli=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-xl bg-black/60 hover:bg-black/90 border border-white/20 hover:border-white/40 px-4 py-2.5 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-[1.03]"
                  >
                    <svg
                      className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3.609 1.814L13.793 12 3.61 22.186A2.215 2.215 0 0 1 3 20.615V3.385c0-.608.225-1.163.609-1.571z"
                        fill="#00D2FF"
                      />
                      <path
                        d="M17.186 8.607L13.793 12l3.393 3.393 3.847-2.197a1.41 1.41 0 0 0 0-2.392l-3.847-2.197z"
                        fill="#FFCE00"
                      />
                      <path
                        d="M3.609 1.814L13.793 12 17.186 8.607 5.617 1.996C5.006 1.647 4.256 1.575 3.609 1.814z"
                        fill="#00E676"
                      />
                      <path
                        d="M13.793 12L3.61 22.186c.646.239 1.396.167 2.007-.182l11.569-6.611L13.793 12z"
                        fill="#FF334C"
                      />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium leading-none">
                        GET IT ON
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight mt-0.5">
                        Google Play
                      </span>
                    </div>
                  </a>
                </div>

                {/* Social Proof Stats */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/60 font-medium pt-1">
                  <span className="text-white/80 font-semibold">10.000+ Kartu Dibagikan</span>
                  <span className="text-white/30">•</span>
                  <span className="flex items-center gap-1.5 text-white/80">
                    <span className="text-sm">🌐</span>
                    <span>Tersedia di 8 Negara</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action: Button Kunjungi Tactlink */}
            <div className="shrink-0 flex items-center pt-2 lg:pt-0">
              <a
                href="https://www.tactlink.com/en"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/50 px-7 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]"
              >
                <span>Kunjungi Tactlink</span>
                <span className="text-amber-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
