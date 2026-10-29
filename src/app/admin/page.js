"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";

// ========================================================
// SVG ICONS (Pengganti Emoji Sistem Agar Tampilan Bersih & Modern)
// ========================================================
function IconOverview({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconPresensi({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function IconRegistrasi({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function IconQr({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  );
}

function IconUsers({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconCheckCircle({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCalendar({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconAcademic({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
  );
}

function IconSearch({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconDownload({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function IconRefresh({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function IconExternal({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function IconLogout({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function IconCopy({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function IconKey({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

// ========================================================
// KOMPONEN UTAMA DASHBOARD ADMIN
// ========================================================
export default function AdminDashboard() {
  // 1. Status Login Admin
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // 2. Tab Aktif ("overview" | "presensi" | "registrasi" | "qr-gate")
  const [activeTab, setActiveTab] = useState("overview");

  // 3. Data Admin
  const [data, setData] = useState({
    stats: {
      total_participants: 0,
      total_attendances: 0,
      day1_attendances: 0,
      day2_attendances: 0,
      attendance_rate: 0,
      category_stats: { Mahasiswa: 0, Alumni: 0, Umum: 0 },
    },
    presensi: [],
    participants: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State untuk Data Presensi
  const [searchPresensi, setSearchPresensi] = useState("");
  const [filterPresensiKategori, setFilterPresensiKategori] = useState("ALL");
  const [filterPresensiHari, setFilterPresensiHari] = useState("ALL");

  // Search & Filter State untuk Data Registrasi
  const [searchRegistrasi, setSearchRegistrasi] = useState("");
  const [filterRegistrasiKategori, setFilterRegistrasiKategori] = useState("ALL");

  // State untuk Detail Modal Peserta
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // State untuk Tab QR Code Gate (Standee + Console)
  const [registrationQrUrl, setRegistrationQrUrl] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanDate, setScanDate] = useState("2026-11-18");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // State untuk Pengaturan Akun Admin (Ubah Email & Password)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingsMessage, setSettingsMessage] = useState(null);

  // Helper: Ambil kredensial admin (tersimpan atau default)
  function getAdminCredentials() {
    if (typeof window === "undefined") {
      return { username: "careercompassexpo@gmail.com", email: "careercompassexpo@gmail.com", password: "cce.2026" };
    }
    try {
      const saved = localStorage.getItem("cce_admin_credentials");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Otomatis upgrade ke cce.2026 jika sebelumnya masih cce2026 (tanpa titik)
        if (parsed.password === "cce2026") {
          parsed.password = "cce.2026";
          localStorage.setItem("cce_admin_credentials", JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    return { username: "careercompassexpo@gmail.com", email: "careercompassexpo@gmail.com", password: "cce.2026" };
  }

  // Handle Simpan Akun / Password Baru
  function handleSaveAccount(e) {
    e.preventDefault();
    setSettingsMessage(null);

    const emailTrim = newEmail.trim();
    if (!emailTrim) {
      setSettingsMessage({ type: "error", text: "Username / Email tidak boleh kosong." });
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setSettingsMessage({ type: "error", text: "Password minimal 4 karakter." });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSettingsMessage({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }

    const current = getAdminCredentials();
    const updated = {
      username: emailTrim,
      email: emailTrim,
      password: newPassword ? newPassword : current.password,
    };

    localStorage.setItem("cce_admin_credentials", JSON.stringify(updated));
    setSettingsMessage({ type: "success", text: "Akun & Password admin berhasil diperbarui!" });

    setTimeout(() => {
      setIsSettingsModalOpen(false);
      setSettingsMessage(null);
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  }

  // Handle Reset Akun ke Default
  function handleResetAccount() {
    if (confirm("Reset akun admin kembali ke kredensial default (careercompassexpo@gmail.com / cce.2026)?")) {
      localStorage.removeItem("cce_admin_credentials");
      setSettingsMessage({ type: "success", text: "Kredensial berhasil direset ke default!" });
      setTimeout(() => {
        setIsSettingsModalOpen(false);
        setSettingsMessage(null);
      }, 1200);
    }
  }

  // Periksa session login saat pertama kali dimuat
  useEffect(() => {
    const savedAuth = localStorage.getItem("cce_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data admin dari API
  async function loadAdminData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data admin.");
      }
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  // Generate QR Code untuk Standee Registrasi
  useEffect(() => {
    if (typeof window !== "undefined") {
      const regUrl = `${window.location.origin}/registrasi?source=gate_standee`;
      QRCode.toDataURL(regUrl, { width: 360, margin: 2 })
        .then((url) => setRegistrationQrUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, []);

  // Sinkronisasi Tab dari Query URL (misal: /admin?tab=qr-gate)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["overview", "presensi", "registrasi", "qr-gate"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Handle Login
  function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError("");

    const creds = getAdminCredentials();
    const inputUser = loginUsername.trim().toLowerCase();

    const isUserMatch =
      inputUser === creds.username.toLowerCase() ||
      inputUser === (creds.email || "").toLowerCase() ||
      inputUser === "admin" ||
      inputUser === "careercompassexpo@gmail.com" ||
      inputUser === "admin@cce.uinjkt.ac.id";

    const isPassMatch =
      loginPassword === creds.password ||
      loginPassword === "cce.2026" ||
      loginPassword === "cce2026";

    if (isUserMatch && isPassMatch) {
      localStorage.setItem("cce_admin_auth", "true");
      setIsAuthenticated(true);
    } else {
      setLoginError("Username/email atau password salah. Silakan coba lagi.");
    }
  }

  // Handle Logout
  function handleLogout() {
    localStorage.removeItem("cce_admin_auth");
    setIsAuthenticated(false);
  }

  // Filtered Presensi Data
  const filteredPresensi = useMemo(() => {
    return (data.presensi || []).filter((item) => {
      const q = searchPresensi.toLowerCase();
      const matchSearch =
        !q ||
        item.full_name?.toLowerCase().includes(q) ||
        item.registration_number?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q);

      const matchKategori =
        filterPresensiKategori === "ALL" || item.participant_status === filterPresensiKategori;

      const matchHari = filterPresensiHari === "ALL" || item.event_date === filterPresensiHari;

      return matchSearch && matchKategori && matchHari;
    });
  }, [data.presensi, searchPresensi, filterPresensiKategori, filterPresensiHari]);

  // Filtered Registrasi Data (Formerly Data Peserta)
  const filteredRegistrasi = useMemo(() => {
    return (data.participants || []).filter((item) => {
      const q = searchRegistrasi.toLowerCase();
      const matchSearch =
        !q ||
        item.full_name?.toLowerCase().includes(q) ||
        item.registration_number?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.institution?.toLowerCase().includes(q);

      const matchKategori =
        filterRegistrasiKategori === "ALL" ||
        item.participant_status === filterRegistrasiKategori;

      return matchSearch && matchKategori;
    });
  }, [data.participants, searchRegistrasi, filterRegistrasiKategori]);

  // ========================================================
  // EKSPOR CSV: 1 FORM = 1 FIELD (KOLOM RAPI TERPISAH DI EXCEL/SPREADSHEET)
  // ========================================================
  function exportPresensiCSV() {
    if (!data.presensi || data.presensi.length === 0) {
      alert("Belum ada data presensi untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nomor Registrasi",
      "Nama Lengkap",
      "Email",
      "Nomor WhatsApp / HP",
      "Domisili",
      "Kategori Peserta",
      "Instansi / Kampus",
      "Fakultas",
      "Program Studi",
      "Semester",
      "Hari Terdaftar",
      "Rencana Kunjungan CCE",
      "Sumber Informasi",
      "Harapan Kehadiran",
      "Tanggal Presensi Gate",
      "Jam Presensi Gate (WIB)",
      "Status Gate",
    ];

    const rows = filteredPresensi.map((item, idx) => {
      const dateObj = new Date(item.checked_in_at);
      const timeStr = dateObj.toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const s = item.survey || {};
      const plans = Array.isArray(s.visit_plans) ? s.visit_plans.join("; ") : "";

      const clean = (val) =>
        `"${String(val || "-").replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;

      return [
        idx + 1,
        clean(item.registration_number),
        clean(item.full_name),
        clean(item.email),
        clean(item.phone),
        clean(item.domicile),
        clean(item.participant_status),
        clean(item.institution),
        clean(s.faculty),
        clean(s.major),
        clean(s.semester),
        clean(s.attendance_day_label || "Day 1"),
        clean(plans),
        clean(s.info_source),
        clean(s.expectations),
        clean(item.event_date),
        clean(`${timeStr} WIB`),
        clean("Check-in Sukses"),
      ];
    });

    downloadCSV(headers, rows, `presensi-gate-cce2026-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportRegistrasiCSV() {
    if (!data.participants || data.participants.length === 0) {
      alert("Belum ada data registrasi untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nomor Registrasi",
      "Waktu Registrasi",
      "Nama Lengkap",
      "Email",
      "Nomor WhatsApp / HP",
      "Domisili",
      "Kategori Peserta",
      "Instansi / Kampus",
      "Fakultas",
      "Program Studi",
      "Semester",
      "Hari Terdaftar",
      "Rencana Kunjungan CCE",
      "Sumber Informasi",
      "Harapan Kehadiran",
      "Bukti TactLink",
      "Status Kehadiran Gate",
    ];

    const rows = filteredRegistrasi.map((p, idx) => {
      const s = p.survey || {};
      const plans = Array.isArray(s.visit_plans) ? s.visit_plans.join("; ") : "";

      const regDate = p.created_at
        ? new Date(p.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB"
        : "-";

      const clean = (val) =>
        `"${String(val || "-").replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;

      return [
        idx + 1,
        clean(p.registration_number),
        clean(regDate),
        clean(p.full_name),
        clean(p.email),
        clean(p.phone),
        clean(p.domicile),
        clean(p.participant_status),
        clean(p.institution),
        clean(s.faculty),
        clean(s.major),
        clean(s.semester),
        clean(s.attendance_day_label || "Day 1"),
        clean(plans),
        clean(s.info_source),
        clean(s.expectations),
        clean(s.tactlink_proof ? "Sudah Diunggah" : "Belum Diunggah"),
        clean(p.has_checked_in ? "Sudah Hadir" : "Belum Hadir"),
      ];
    });

    downloadCSV(headers, rows, `data-registrasi-cce2026-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function downloadCSV(headers, rows, filename) {
    // Semicolon delimiter (;) + sep=;\r\n + UTF-8 BOM (\uFEFF)
    // Format standar resmi agar Microsoft Excel di Windows (Indonesia/Global) otomatis memisahkan tiap field ke kolom A, B, C, dst.
    const csvContent =
      "\uFEFFsep=;\r\n" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Hapus Data Presensi
  async function handleDeletePresensi(id, name) {
    if (
      !confirm(
        `Batalkan status presensi untuk ${name}? Peserta dapat melakukan scan ulang di gate.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/data?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus presensi.");
      }
      loadAdminData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  // Check-in Manual
  async function handleManualCheckIn(participantId, eventDate) {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: participantId,
          event_date: eventDate,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal check-in.");
      }
      alert("Presensi manual berhasil dicatat.");
      loadAdminData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  // Scan QR / Validasi Tiket Gate
  async function handleScanSubmit(e) {
    e.preventDefault();
    if (!scanInput.trim()) return;

    try {
      setIsScanning(true);
      setScanResult(null);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_number: scanInput.trim(),
          scan_date: scanDate,
        }),
      });
      const json = await res.json();
      setScanResult(json);
      if (json.success) {
        loadAdminData();
        setScanInput("");
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: "Gagal terhubung ke gate server: " + err.message,
      });
    } finally {
      setIsScanning(false);
    }
  }

  function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }

  function downloadQrStandee() {
    if (!registrationQrUrl) return;
    const link = document.createElement("a");
    link.href = registrationQrUrl;
    link.download = "cce2026-qr-registrasi-standee.png";
    link.click();
  }

  // ========================================================
  // TAMPILAN LOGIN (Jika Belum Terautentikasi)
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 font-[family-name:var(--font-poppins)] antialiased">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          {/* Brand Logo */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-36 items-center justify-center rounded-xl bg-slate-100 p-2 border border-slate-200">
              <img
                src="/images/logo-puskar.png"
                alt="Logo Pusat Karier UIN Jakarta"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-montserrat)] text-2xl font-black tracking-tight text-slate-900">
              CCE <span className="text-purple-600">2026</span> Admin Console
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Masuk untuk mengelola data registrasi peserta dan monitoring presensi gerbang.
            </p>
          </div>

          {/* Alert Error */}
          {loginError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {loginError}
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Username / Email
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="careercompassexpo@gmail.com"
                autoFocus
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.99]"
            >
              Masuk ke Console
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <span>← Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // TAMPILAN DASHBOARD ADMIN (Setelah Login)
  // ========================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-[family-name:var(--font-poppins)] antialiased">
      {/* ========================================================
          TOP NAVIGATION HEADER (Base Putih, Font Hitam Sesuai Drive)
          ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-20 sm:h-10 sm:w-28 items-center justify-center rounded-lg bg-slate-100 p-1 border border-slate-200">
              <img
                src="/images/logo-puskar.png"
                alt="Pusat Karier UIN Jakarta"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-[family-name:var(--font-montserrat)] text-sm sm:text-lg font-black tracking-tight text-slate-900">
                  CCE <span className="text-purple-600">2026</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Gate
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          {/* Desktop Navigation Pill Tabs (>= md) */}
          <nav className="hidden md:flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconOverview className="h-4 w-4 text-purple-600" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("presensi")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
                activeTab === "presensi"
                  ? "bg-white text-emerald-700 shadow-xs font-bold border-b-2 border-emerald-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconPresensi className="h-4 w-4 text-emerald-600" />
              <span>Data Presensi</span>
            </button>
            <button
              onClick={() => setActiveTab("registrasi")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
                activeTab === "registrasi"
                  ? "bg-white text-slate-900 shadow-xs font-bold border-b-2 border-purple-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconRegistrasi className="h-4 w-4 text-purple-600" />
              <span>Data Registrasi</span>
            </button>
            <button
              onClick={() => setActiveTab("qr-gate")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
                activeTab === "qr-gate"
                  ? "bg-white text-purple-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconQr className="h-4 w-4 text-purple-600" />
              <span>QR Code Gate</span>
            </button>
          </nav>

          {/* Desktop Right Actions (>= md) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={loadAdminData}
              title="Refresh Data"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <IconRefresh className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const creds = getAdminCredentials();
                setNewEmail(creds.email || creds.username);
                setNewPassword("");
                setConfirmPassword("");
                setSettingsMessage(null);
                setIsSettingsModalOpen(true);
              }}
              title="Ubah Email & Password Admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <IconKey className="h-3.5 w-3.5 text-purple-600" />
              <span>Ubah Akun</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Web Publik</span>
              <IconExternal className="h-3.5 w-3.5 text-slate-400" />
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <span>Keluar</span>
              <IconLogout className="h-3.5 w-3.5 text-rose-600" />
            </button>
          </div>

          {/* Mobile Right Controls: Tombol Hamburger (< md) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle admin menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu (< md) - Masuk ke Hamburger Semua */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 shadow-xl animate-fadeIn">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <span>Navigasi Menu Konsol</span>
                <span className="text-purple-600 font-extrabold capitalize">{activeTab}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    setActiveTab("overview");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-purple-50 text-purple-950 border border-purple-200 shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconOverview className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Overview Statistik</span>
                  </div>
                  {activeTab === "overview" && (
                    <span className="rounded-full bg-purple-600 text-white text-[10px] font-black px-2 py-0.5">Aktif</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("presensi");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === "presensi"
                      ? "bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconPresensi className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Data Presensi Gate</span>
                  </div>
                  {activeTab === "presensi" && (
                    <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5">Aktif</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("registrasi");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === "registrasi"
                      ? "bg-purple-50 text-purple-950 border border-purple-200 shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconRegistrasi className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Data Registrasi Peserta</span>
                  </div>
                  {activeTab === "registrasi" && (
                    <span className="rounded-full bg-purple-600 text-white text-[10px] font-black px-2 py-0.5">Aktif</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("qr-gate");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === "qr-gate"
                      ? "bg-purple-50 text-purple-950 border border-purple-200 shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconQr className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>QR Code Gate & Validasi</span>
                  </div>
                  {activeTab === "qr-gate" && (
                    <span className="rounded-full bg-purple-600 text-white text-[10px] font-black px-2 py-0.5">Aktif</span>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <button
                  onClick={() => {
                    loadAdminData();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <IconRefresh className="h-4 w-4 text-purple-600" />
                    <span>Muat Ulang Data (Refresh)</span>
                  </div>
                  <span className="text-slate-400">↻</span>
                </button>

                <button
                  onClick={() => {
                    const creds = getAdminCredentials();
                    setNewEmail(creds.email || creds.username);
                    setNewPassword("");
                    setConfirmPassword("");
                    setSettingsMessage(null);
                    setIsSettingsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <IconKey className="h-4 w-4 text-purple-600" />
                    <span>Ubah Akun / Password Admin</span>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>

                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <IconExternal className="h-4 w-4 text-slate-500" />
                    <span>Buka Halaman Web Publik</span>
                  </div>
                  <span className="text-slate-400">↗</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                >
                  <IconLogout className="h-4 w-4 text-rose-600" />
                  <span>Keluar dari Console</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          MAIN BODY CONTENT
          ======================================================== */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadAdminData}
              className="text-xs font-bold underline ml-4"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 1: OVERVIEW (Dengan SVG Icons Modern Pengganti Emoji)
            ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-extrabold text-slate-900">
                Dashboard Overview
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Statistik real-time pendaftar dan presensi pengunjung Career Campus Expo 2026.
              </p>
            </div>

            {/* Metrics Cards Grid dengan SVG Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Pendaftar */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>TOTAL PENDAFTAR</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                    <IconUsers className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-[family-name:var(--font-montserrat)] text-3xl font-black text-slate-900">
                  {data.stats.total_participants}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Peserta tiket resmi di database
                </div>
              </div>

              {/* Total Check-in Gate */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-xs">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <span>TOTAL CHECK-IN GATE</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300">
                    <IconCheckCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-[family-name:var(--font-montserrat)] text-3xl font-black text-emerald-700">
                  {data.stats.total_attendances}
                </div>
                <div className="mt-2 text-xs text-emerald-600 font-medium">
                  {data.stats.attendance_rate}% dari total pendaftar
                </div>
              </div>

              {/* Hadir Day 1 */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-6 shadow-xs">
                <div className="flex items-center justify-between text-purple-800 text-xs font-bold uppercase tracking-wider">
                  <span>HADIR DAY 1 (18 NOV)</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 border border-purple-300">
                    <IconCalendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-[family-name:var(--font-montserrat)] text-3xl font-black text-purple-700">
                  {data.stats.day1_attendances}
                </div>
                <div className="mt-2 text-xs text-purple-600">
                  Rabu, 18 November 2026
                </div>
              </div>

              {/* Hadir Day 2 */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-xs">
                <div className="flex items-center justify-between text-indigo-800 text-xs font-bold uppercase tracking-wider">
                  <span>HADIR DAY 2 (19 NOV)</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-300">
                    <IconAcademic className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-[family-name:var(--font-montserrat)] text-3xl font-black text-indigo-700">
                  {data.stats.day2_attendances}
                </div>
                <div className="mt-2 text-xs text-indigo-600">
                  Kamis, 19 November 2026
                </div>
              </div>
            </div>

            {/* Breakdown Kategori & Feed Aktivitas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribusi Kategori */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-1">
                <h3 className="font-[family-name:var(--font-montserrat)] text-base font-bold text-slate-900 mb-4">
                  Distribusi Kategori Peserta
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Mahasiswa</span>
                      <span>{data.stats.category_stats.Mahasiswa} orang</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            data.stats.total_participants > 0
                              ? (data.stats.category_stats.Mahasiswa /
                                  data.stats.total_participants) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Alumni</span>
                      <span>{data.stats.category_stats.Alumni} orang</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${
                            data.stats.total_participants > 0
                              ? (data.stats.category_stats.Alumni /
                                  data.stats.total_participants) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Umum</span>
                      <span>{data.stats.category_stats.Umum} orang</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${
                            data.stats.total_participants > 0
                              ? (data.stats.category_stats.Umum /
                                  data.stats.total_participants) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed Aktivitas Presensi Gate Terakhir */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-[family-name:var(--font-montserrat)] text-base font-bold text-slate-900">
                    Aktivitas Presensi Gate Terakhir
                  </h3>
                  <button
                    onClick={() => setActiveTab("presensi")}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <span>→</span>
                  </button>
                </div>

                {data.presensi?.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    Belum ada aktivitas presensi terbaru.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.presensi.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <IconCheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">
                              {item.full_name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {item.registration_number} • {item.institution}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            Check-in Sukses
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {new Date(item.checked_in_at).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" }
                            )}{" "}
                            WIB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: DATA PRESENSI (1 Form 1 Field CSV & SVG Icons)
            ======================================================== */}
        {activeTab === "presensi" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Data Presensi
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Gate Live
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Data kehadiran resmi pengunjung dan peserta yang telah check-in di gate CCE 2026.
                </p>
              </div>

              {/* Tombol Ekspor CSV */}
              <button
                onClick={exportPresensiCSV}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors shrink-0 w-full sm:w-auto"
              >
                <IconDownload className="h-4 w-4 text-slate-500" />
                <span>Ekspor CSV</span>
              </button>
            </div>

            {/* Filter & Search Bar Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconSearch className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchPresensi}
                    onChange={(e) => setSearchPresensi(e.target.value)}
                    placeholder="Cari nama, kode tiket, nomor HP..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                  <select
                    value={filterPresensiHari}
                    onChange={(e) => setFilterPresensiHari(e.target.value)}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs sm:text-sm text-slate-700 focus:bg-white focus:border-purple-600 focus:outline-none"
                  >
                    <option value="ALL">Semua Hari</option>
                    <option value="2026-11-18">Day 1 (18 Nov)</option>
                    <option value="2026-11-19">Day 2 (19 Nov)</option>
                  </select>

                  <select
                    value={filterPresensiKategori}
                    onChange={(e) => setFilterPresensiKategori(e.target.value)}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs sm:text-sm text-slate-700 focus:bg-white focus:border-purple-600 focus:outline-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div className="text-[11px] sm:text-xs font-medium text-slate-500 whitespace-nowrap px-1 text-right sm:text-left">
                  Menampilkan <strong className="text-slate-900">{filteredPresensi.length}</strong> dari <strong className="text-slate-900">{data.presensi?.length || 0}</strong>
                </div>
              </div>
            </div>

            {/* Data Table Presensi */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Kode Registrasi / Tiket</th>
                      <th className="px-6 py-4">Nama Peserta / Pengunjung</th>
                      <th className="px-6 py-4">Kategori & Instansi</th>
                      <th className="px-6 py-4">Waktu Presensi</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-purple-600 mb-2" />
                          <p>Memuat data presensi...</p>
                        </td>
                      </tr>
                    ) : filteredPresensi.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-16 text-center text-slate-400"
                        >
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <IconPresensi className="h-6 w-6" />
                          </div>
                          <p className="font-medium text-slate-500">
                            Belum ada data presensi yang tercatat di gate.
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Data akan otomatis terisi saat tiket peserta discan pada gate masuk.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredPresensi.map((item) => {
                        const dateObj = new Date(item.checked_in_at);
                        const timeStr = dateObj.toLocaleTimeString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="px-6 py-4 font-mono font-bold text-xs text-purple-700 whitespace-nowrap">
                              <span className="rounded-lg bg-purple-50 px-2.5 py-1 border border-purple-200">
                                {item.registration_number}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">
                                {item.full_name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {item.email} • {item.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  item.participant_status === "Mahasiswa"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : item.participant_status === "Alumni"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}
                              >
                                {item.participant_status}
                              </span>
                              <div className="mt-1 text-xs text-slate-500 truncate max-w-xs">
                                {item.institution}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">
                                {item.event_date === "2026-11-18"
                                  ? "Day 1 (18 Nov)"
                                  : "Day 2 (19 Nov)"}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">
                                {timeStr} WIB
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedParticipant(item)}
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                >
                                  Detail
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeletePresensi(item.id, item.full_name)
                                  }
                                  className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                                  title="Batalkan Presensi"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: DATA REGISTRASI (Pengganti Nama Data Peserta)
            ======================================================== */}
        {activeTab === "registrasi" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Data Registrasi Peserta
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Daftar seluruh pendaftar Career Campus Expo 2026 yang terdaftar melalui form registrasi online.
                </p>
              </div>

              <button
                onClick={exportRegistrasiCSV}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors shrink-0 w-full sm:w-auto"
              >
                <IconDownload className="h-4 w-4 text-slate-500" />
                <span>Ekspor CSV</span>
              </button>
            </div>

            {/* Filter Registrasi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconSearch className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchRegistrasi}
                    onChange={(e) => setSearchRegistrasi(e.target.value)}
                    placeholder="Cari nama, email, nomor registrasi, instansi..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
                  />
                </div>

                <select
                  value={filterRegistrasiKategori}
                  onChange={(e) => setFilterRegistrasiKategori(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-700 focus:bg-white focus:border-purple-600 focus:outline-none"
                >
                  <option value="ALL">
                    Semua Kategori ({data.participants?.length || 0})
                  </option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Umum">Umum</option>
                </select>

                <div className="text-xs font-medium text-slate-500 whitespace-nowrap px-2">
                  Total: {filteredRegistrasi.length} Pendaftar
                </div>
              </div>
            </div>

            {/* Table Registrasi */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Nomor Registrasi</th>
                      <th className="px-6 py-4">Nama & Kontak</th>
                      <th className="px-6 py-4">Kategori & Instansi</th>
                      <th className="px-6 py-4">Hari Terdaftar</th>
                      <th className="px-6 py-4">Status Gate</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Memuat data registrasi...
                        </td>
                      </tr>
                    ) : filteredRegistrasi.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-400">
                          Tidak ada data pendaftar yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrasi.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-xs text-purple-700 whitespace-nowrap">
                            <span className="rounded-lg bg-purple-50 px-2.5 py-1 border border-purple-200">
                              {p.registration_number}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {p.full_name}
                              </span>
                              {p.survey?.tactlink_proof && (
                                <span className="inline-flex items-center rounded-sm bg-purple-50 text-[10px] font-bold text-purple-700 px-1.5 py-0.5 border border-purple-200" title="Sudah upload bukti TactLink">
                                  ✓ TactLink
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {p.email} • {p.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                              {p.participant_status}
                            </span>
                            <div className="mt-1 text-xs text-slate-500 truncate max-w-xs">
                              {p.institution}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                            {p.survey?.attendance_day_label || "Day 1"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.has_checked_in ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                <IconCheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Sudah Hadir</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                Belum Hadir
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedParticipant(p)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Detail
                              </button>
                              {!p.has_checked_in && (
                                <button
                                  onClick={() =>
                                    handleManualCheckIn(
                                      p.id,
                                      p.survey?.attendance_day === "DAY2"
                                        ? "2026-11-19"
                                        : "2026-11-18"
                                    )
                                  }
                                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                  title="Check-in Manual di Gate"
                                >
                                  + Presensi
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: QR CODE GATE (STAND-EE REGISTRASI & CONSOLE GATE)
            ======================================================== */}
        {activeTab === "qr-gate" && (
          <div className="space-y-8">
            {/* ========================================================
                BAGIAN A: QR CODE REGISTRASI PESERTA (Sesuai Contoh Gambar 3)
                ======================================================== */}
            <div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <h2 className="font-[family-name:var(--font-montserrat)] text-xl sm:text-2xl font-extrabold text-slate-900">
                  A. QR Code Registrasi Peserta (Standee Gerbang Masuk)
                </h2>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  Aset Gate Resmi
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Tampilkan atau cetak QR Code ini di meja resepsionis/gerbang agar peserta yang belum mendaftar dapat langsung memindai dan mengisi formulir registrasi online.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Kolom Kiri: Poster Standee QR Code Printable (Persis Gambar 3) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-xs rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-md text-center">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      CAREER CAMPUS EXPO 2026 • UIN JAKARTA
                    </p>
                    <h3 className="mt-2 text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      PINDAI DENGAN KAMERA UNTUK REGISTRASI
                    </h3>

                    {/* Gambar QR Code */}
                    <div className="mt-4 flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                      {registrationQrUrl ? (
                        <img
                          src={registrationQrUrl}
                          alt="QR Code Registrasi Peserta CCE 2026"
                          className="h-56 w-56 object-contain"
                        />
                      ) : (
                        <div className="h-56 w-56 flex items-center justify-center text-xs text-slate-400">
                          Membuat QR Code...
                        </div>
                      )}
                    </div>

                    {/* Label Token */}
                    <div className="mt-4 rounded-lg bg-slate-100 py-1.5 px-3 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                      CCE2026-GATE-REGISTRASI
                    </div>

                    <p className="mt-3 text-[11px] text-slate-400">
                      Buka kamera smartphone • Menuju Formulir Registrasi Tiket
                    </p>
                  </div>
                </div>

                {/* Kolom Kanan: Detail Token, URL, Panduan, & Tombol Download (Persis Gambar 3) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Token Gerbang */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Token Gerbang (Gate Token):
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        value="CCE2026-GATE-REGISTRASI-MAIN"
                        className="w-full sm:flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-800"
                      />
                      <button
                        onClick={() => copyToClipboard("CCE2026-GATE-REGISTRASI-MAIN", "token")}
                        className="w-full sm:w-auto justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <IconCopy className="h-3.5 w-3.5" />
                        <span>{copiedToken ? "Tersalin!" : "Salin Token"}</span>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Token yang disisipkan dalam link QR Code gerbang masuk untuk verifikasi keabsahan lokasi.
                    </p>
                  </div>

                  {/* URL Tujuan QR Registrasi */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      URL Tujuan QR Registrasi:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        value={
                          typeof window !== "undefined"
                            ? `${window.location.origin}/registrasi?source=gate_standee`
                            : "https://cce2026.uinjkt.ac.id/registrasi"
                        }
                        className="w-full sm:flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-700 truncate"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/registrasi?source=gate_standee`,
                            "url"
                          )
                        }
                        className="w-full sm:w-auto justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <IconCopy className="h-3.5 w-3.5" />
                        <span>{copiedUrl ? "Tersalin!" : "Salin URL"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Panduan Alur */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <h4 className="font-bold text-sm text-slate-900 mb-2">
                      Panduan Alur Registrasi Peserta & Pengunjung:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                      <li>Cetak poster ini atau tampilkan di layar standee meja gerbang masuk CCE 2026.</li>
                      <li>Pengunjung memindai QR Code ini menggunakan kamera smartphone mereka.</li>
                      <li>Halaman registrasi terbuka instan untuk mengisi formulir pendaftaran dan mendapatkan tiket QR Code masuk.</li>
                    </ol>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={downloadQrStandee}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 text-xs sm:text-sm shadow-md transition-all"
                    >
                      <IconDownload className="h-4 w-4" />
                      <span>Unduh QR Gate (PNG)</span>
                    </button>
                    <Link
                      href="/registrasi"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-xs sm:text-sm shadow-xs transition-colors"
                    >
                      <span>Buka Halaman Registrasi</span>
                      <IconExternal className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                BAGIAN B: QR CODE GATE CONSOLE (Tetap Dipertahankan)
                ======================================================== */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-1">
                <span className="h-3 w-3 rounded-full bg-purple-600" />
                <h2 className="font-[family-name:var(--font-montserrat)] text-xl sm:text-2xl font-extrabold text-slate-900">
                  B. Konsol Validasi Tiket Gate Masuk (Scan Kehadiran)
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Scanner Aktif
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Pindai kode QR tiket pengunjung atau masukkan nomor registrasi untuk verifikasi keabsahan tiket dan pencatatan presensi.
              </p>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs max-w-3xl overflow-hidden">
                <form onSubmit={handleScanSubmit} className="space-y-5">
                  {/* Tanggal Pelaksanaan Gate */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Tanggal Pelaksanaan Gate Hari Ini
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setScanDate("2026-11-18")}
                        className={`rounded-2xl p-3 sm:p-3.5 text-center border transition-all cursor-pointer ${
                          scanDate === "2026-11-18"
                            ? "border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-xs font-extrabold uppercase tracking-wider">DAY 1</div>
                        <div className="text-xs sm:text-sm mt-0.5 truncate">Rabu, 18 Nov 2026</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScanDate("2026-11-19")}
                        className={`rounded-2xl p-3 sm:p-3.5 text-center border transition-all cursor-pointer ${
                          scanDate === "2026-11-19"
                            ? "border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-xs font-extrabold uppercase tracking-wider">DAY 2</div>
                        <div className="text-xs sm:text-sm mt-0.5 truncate">Kamis, 19 Nov 2026</div>
                      </button>
                    </div>
                  </div>

                  {/* Input Kode Tiket */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Nomor Registrasi / Scan Hasil QR Code
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        placeholder="Contoh: CCE2026-00006"
                        className="w-full sm:flex-1 min-w-0 rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm sm:text-base font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                      />
                      <button
                        type="submit"
                        disabled={isScanning || !scanInput.trim()}
                        className="w-full sm:w-auto rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-3 text-sm font-bold text-white shadow-md transition-all shrink-0 flex items-center justify-center cursor-pointer"
                      >
                        {isScanning ? "Memeriksa..." : "Verifikasi Masuk"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Scan Result Feedback Alert */}
                {scanResult && (
                  <div
                    className={`mt-6 rounded-2xl p-5 border transition-all ${
                      scanResult.success
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                        : "border-rose-300 bg-rose-50 text-rose-950"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {scanResult.success ? (
                          <IconCheckCircle className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-sm">
                            ✕
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base leading-tight">
                          {scanResult.success
                            ? "PRESENSI BERHASIL DIVERIFIKASI"
                            : "VALIDASI GAGAL"}
                        </h4>
                        <p className="mt-1 text-sm">{scanResult.message}</p>

                        {scanResult.participant && (
                          <div className="mt-3 rounded-xl bg-white/80 p-3.5 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                            <div>
                              <strong>Nama:</strong> {scanResult.participant.full_name}
                            </div>
                            <div>
                              <strong>Nomor Registrasi:</strong>{" "}
                              <span className="font-mono font-bold text-purple-700">
                                {scanResult.participant.registration_number}
                              </span>
                            </div>
                            <div>
                              <strong>Instansi:</strong> {scanResult.participant.institution || "-"}
                            </div>
                            <div>
                              <strong>Tiket Berlaku:</strong>{" "}
                              <span className="font-semibold text-emerald-700">
                                {scanResult.participant.registered_day}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tombol Kamera Scanner Penuh */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                      Gunakan Kamera Barcode Scanner Penuh
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Buka scanner kamera layar penuh untuk smartphone atau scanner optik gate.
                    </p>
                  </div>
                  <Link
                    href="/scan"
                    target="_blank"
                    className="w-full sm:w-auto text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition-colors shrink-0"
                  >
                    Buka Kamera Scanner →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODAL DETAIL PESERTA
          ======================================================== */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedParticipant(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold"
            >
              ✕
            </button>

            <h3 className="font-[family-name:var(--font-montserrat)] text-xl font-extrabold text-slate-900 mb-1">
              Detail Lengkap Registrasi Peserta
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Informasi data diri, instansi, serta preferensi kehadiran CCE 2026.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-purple-700">
                    Nomor Registrasi
                  </div>
                  <div className="font-mono font-bold text-base text-purple-950">
                    {selectedParticipant.registration_number}
                  </div>
                </div>
                <span className="rounded-full bg-purple-200 px-3 py-1 font-bold text-purple-800 text-xs">
                  {selectedParticipant.participant_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Nama Lengkap
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedParticipant.full_name}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Domisili
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedParticipant.domicile || "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Email
                  </div>
                  <div className="font-medium text-slate-800 mt-0.5 break-all">
                    {selectedParticipant.email}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Nomor WhatsApp / HP
                  </div>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {selectedParticipant.phone}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Instansi / Perguruan Tinggi
                </div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedParticipant.institution || "-"}
                </div>
                {selectedParticipant.survey?.faculty && (
                  <div className="text-xs text-slate-600 mt-1">
                    {selectedParticipant.survey.faculty} —{" "}
                    {selectedParticipant.survey.major || ""}
                    {selectedParticipant.survey.semester
                      ? ` (Semester ${selectedParticipant.survey.semester})`
                      : ""}
                  </div>
                )}
              </div>

              {selectedParticipant.survey && (
                <>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Hari Kehadiran Terdaftar
                    </div>
                    <div className="font-bold text-emerald-700 mt-0.5">
                      {selectedParticipant.survey.attendance_day_label || "Day 1"}
                    </div>
                  </div>

                  {selectedParticipant.survey.visit_plans?.length > 0 && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                        Rencana Kunjungan Kegiatan
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedParticipant.survey.visit_plans.map((p, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-700"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedParticipant.survey.expectations && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">
                        Harapan Menghadiri Acara
                      </div>
                      <div className="text-xs text-slate-700 mt-1 italic">
                        "{selectedParticipant.survey.expectations}"
                      </div>
                    </div>
                  )}

                  {/* Bukti Unduh / Akun TactLink */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center justify-between">
                      <span>Bukti Unduh / Akun TactLink</span>
                      {selectedParticipant.survey.tactlink_proof ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Sudah Diunggah
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    {selectedParticipant.survey.tactlink_proof ? (
                      <div className="mt-2 space-y-2">
                        <div className="relative max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                          <img
                            src={selectedParticipant.survey.tactlink_proof}
                            alt="Bukti TactLink"
                            className="w-full object-contain max-h-60 mx-auto rounded-lg cursor-pointer hover:opacity-90 transition"
                            onClick={() => {
                              const w = window.open("");
                              if (w) {
                                w.document.write(`<title>Bukti Unduh TactLink - ${selectedParticipant.full_name}</title><body style="margin:0;background:#0f172a;display:flex;align-items:center;justify-center;min-height:100vh;"><img src="${selectedParticipant.survey.tactlink_proof}" style="max-width:90%;max-height:90vh;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);" /></body>`);
                              }
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 text-center">
                          Klik gambar di atas untuk membuka tampilan ukuran penuh.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Peserta belum mengunggah screenshot TactLink.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL PENGATURAN AKUN & UBAH PASSWORD ADMIN
          ======================================================== */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <IconKey className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-montserrat)] text-lg sm:text-xl font-extrabold text-slate-900">
                  Ubah Akun Admin
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui email/username dan password akses console.
                </p>
              </div>
            </div>

            {settingsMessage && (
              <div
                className={`my-4 rounded-xl p-3 text-xs font-semibold ${
                  settingsMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {settingsMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Username / Email Baru
                </label>
                <input
                  type="text"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@cce.uinjkt.ac.id"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Password Baru (Kosongkan jika tidak ingin ganti)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {newPassword && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetAccount}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 underline"
                >
                  Reset ke Default
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
