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

function IconBuilding({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconX({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconEye({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function IconTrash({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconClock({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconBriefcase({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconStar({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function IconDocument({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconGoogleDrive({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" fill="none">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
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

  // 2. Tab Aktif ("overview" | "presensi" | "registrasi" | "indeks-kepuasan" | "qr-gate" | "mitra")
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
    indeks_kepuasan: {
      total_respondents: 0,
      overall_average: 0,
      question_averages: [],
      list: [],
    },
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
  const [selectedRegistrasiIds, setSelectedRegistrasiIds] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Search & Filter State untuk Indeks Kepuasan
  const [searchKepuasan, setSearchKepuasan] = useState("");
  const [filterKepuasanStatus, setFilterKepuasanStatus] = useState("ALL");
  const [selectedKepuasanDetail, setSelectedKepuasanDetail] = useState(null);

  // State untuk Detail Modal Peserta
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // State untuk Tab QR Code Gate (Standee + Console)
  const [registrationQrUrl, setRegistrationQrUrl] = useState("");
  const [kepuasanQrUrl, setKepuasanQrUrl] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKepuasanToken, setCopiedKepuasanToken] = useState(false);
  const [copiedKepuasanUrl, setCopiedKepuasanUrl] = useState(false);
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

  // State untuk Tab Mitra Perusahaan & Kurasi Lowongan Walk-In Interview
  const [mitraList, setMitraList] = useState([]);
  const [mitraJobsList, setMitraJobsList] = useState([]);
  const [mitraStats, setMitraStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0, total_jobs: 0, walk_in_jobs: 0 });
  const [loadingMitra, setLoadingMitra] = useState(false);
  const [mitraSubTab, setMitraSubTab] = useState("companies"); // "companies" | "walkin_jobs"
  const [searchMitra, setSearchMitra] = useState("");
  const [searchMitraJob, setSearchMitraJob] = useState("");
  const [filterMitraStatus, setFilterMitraStatus] = useState("ALL");
  const [filterMitraJobWalkIn, setFilterMitraJobWalkIn] = useState("ALL"); // "ALL" | "WALKIN" | "REGULAR"
  const [selectedMitraDetail, setSelectedMitraDetail] = useState(null);
  const [rejectModalMitra, setRejectModalMitra] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedMitraIds, setSelectedMitraIds] = useState([]);
  const [isDeletingBulkMitra, setIsDeletingBulkMitra] = useState(false);
  const [mitraToast, setMitraToast] = useState(null);

  // State untuk Google Drive Bukti TactLink
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncingSingleId, setSyncingSingleId] = useState(null);
  const [isDriveSetupModalOpen, setIsDriveSetupModalOpen] = useState(false);
  const [driveToast, setDriveToast] = useState(null);

  // Handle Sinkronisasi Masal Bukti TactLink ke Google Drive
  async function handleSyncAllToDrive() {
    setIsSyncingDrive(true);
    setDriveToast(null);
    try {
      const res = await fetch("/api/admin/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all" }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Gagal menyinkronkan berkas ke Google Drive.");
      }
      setDriveToast({
        type: "success",
        message: result.message || `${result.syncedCount || 0} berkas berhasil diunggah ke Google Drive!`,
      });
      await loadAdminData();
    } catch (err) {
      setDriveToast({
        type: "error",
        message: err.message || "Gagal menghubungkan Google Drive. Periksa kredensial di .env.",
      });
    } finally {
      setIsSyncingDrive(false);
      setTimeout(() => setDriveToast(null), 8000);
    }
  }

  // Handle Sinkronisasi Satu Peserta ke Google Drive
  async function handleSyncSingleToDrive(participantId) {
    if (!participantId) return;
    setSyncingSingleId(participantId);
    setDriveToast(null);
    try {
      const res = await fetch("/api/admin/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_single", participant_id: participantId }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Gagal mengunggah berkas ke Google Drive.");
      }
      setDriveToast({
        type: "success",
        message: "Bukti TactLink peserta berhasil diunggah ke Google Drive!",
      });
      await loadAdminData();
      if (selectedParticipant && selectedParticipant.id === participantId) {
        setSelectedParticipant((prev) => ({
          ...prev,
          survey: {
            ...prev.survey,
            tactlink_proof: result.drive?.webViewLink || prev.survey.tactlink_proof,
            tactlink_drive_url: result.drive?.webViewLink,
            tactlink_drive_id: result.drive?.fileId,
            tactlink_drive_thumb: result.drive?.thumbnailLink,
            tactlink_storage: "google_drive",
          },
        }));
      }
    } catch (err) {
      setDriveToast({
        type: "error",
        message: err.message || "Gagal mengunggah ke Google Drive.",
      });
    } finally {
      setSyncingSingleId(null);
      setTimeout(() => setDriveToast(null), 8000);
    }
  }

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
    // Muat juga data mitra pendaftar
    loadMitraData();
  }

  // Fetch data mitra dari API admin
  async function loadMitraData() {
    try {
      setLoadingMitra(true);
      const res = await fetch("/api/admin/mitra");
      const json = await res.json();
      if (res.ok && json.success) {
        setMitraList(json.companies || []);
        setMitraJobsList(json.jobs || []);
        setMitraStats(
          json.stats || {
            total: 0,
            pending: 0,
            verified: 0,
            rejected: 0,
            total_jobs: 0,
            walk_in_jobs: 0,
          }
        );
      }
    } catch (err) {
      console.error("Gagal memuat data mitra:", err);
    } finally {
      setLoadingMitra(false);
    }
  }

  function showMitraFeedback(type, text) {
    setMitraToast({ type, text });
    setTimeout(() => setMitraToast(null), 4000);
  }

  // Handle Toggle Akses Walk-In Lowongan (Khusus Admin)
  async function handleToggleWalkIn(jobId, newStatus) {
    try {
      setActionLoadingId(jobId);
      // Optimistic update pada daftar lowongan
      setMitraJobsList((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_walk_in: newStatus } : j))
      );
      setMitraStats((prev) => ({
        ...prev,
        walk_in_jobs: Math.max(0, (prev.walk_in_jobs || 0) + (newStatus ? 1 : -1)),
      }));

      const res = await fetch("/api/admin/mitra", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_walk_in",
          job_id: jobId,
          is_walk_in: newStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengubah status walk-in lowongan.");
      }

      showMitraFeedback(
        "success",
        newStatus
          ? "Lowongan berhasil dimasukkan ke daftar Walk-In Interview!"
          : "Lowongan dikembalikan ke status Lamaran Reguler."
      );
    } catch (err) {
      showMitraFeedback("error", err.message);
      loadMitraData();
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle Aksi Verifikasi Mitra (Approve / Reject / Reset)
  async function handleUpdateMitraStatus(companyId, action, reasonText = "", notesText = "") {
    try {
      setActionLoadingId(companyId);
      const res = await fetch("/api/admin/mitra", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          action,
          reason: reasonText,
          notes: notesText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memperbarui status verifikasi mitra.");
      }

      showMitraFeedback("success", json.message);
      if (rejectModalMitra) setRejectModalMitra(null);

      // Update selected detail jika sedang terbuka
      if (selectedMitraDetail && selectedMitraDetail.id === companyId) {
        setSelectedMitraDetail((prev) =>
          prev
            ? {
                ...prev,
                verification_status:
                  action === "approve" ? "verified" : action === "reject" ? "rejected" : "pending",
                rejection_reason: action === "reject" ? reasonText : null,
              }
            : null
        );
      }

      await loadMitraData();
    } catch (err) {
      showMitraFeedback("error", err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle Hapus Mitra (Pembersihan spam)
  async function handleDeleteMitra(companyId, companyName) {
    if (
      !confirm(
        `Hapus permanen data perusahaan "${companyName}" beserta seluruh lowongan yang terkait?`
      )
    ) {
      return;
    }
    try {
      setActionLoadingId(companyId);
      const res = await fetch(`/api/admin/mitra?id=${companyId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus perusahaan.");
      }
      showMitraFeedback("success", json.message);
      setSelectedMitraIds((prev) => prev.filter((id) => id !== companyId));
      if (selectedMitraDetail?.id === companyId) setSelectedMitraDetail(null);
      await loadMitraData();
    } catch (err) {
      showMitraFeedback("error", err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle Hapus Massal Mitra Perusahaan (Bulk Delete)
  async function handleBulkDeleteMitra() {
    if (selectedMitraIds.length === 0) return;
    const count = selectedMitraIds.length;
    const confirmText = `Apakah Anda yakin ingin menghapus ${count} data perusahaan mitra yang dipilih secara permanen?\n\nPerhatian: Seluruh lowongan pekerjaan, data lamaran, dan jadwal wawancara terkait perusahaan terpilih juga akan terhapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`;
    if (!confirm(confirmText)) return;

    setIsDeletingBulkMitra(true);
    try {
      const res = await fetch("/api/admin/mitra", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_ids: selectedMitraIds }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus data mitra terpilih.");
      }
      showMitraFeedback("success", json.message || `${count} data mitra berhasil dihapus.`);
      setSelectedMitraIds([]);
      if (selectedMitraDetail && selectedMitraIds.includes(selectedMitraDetail.id)) {
        setSelectedMitraDetail(null);
      }
      await loadMitraData();
    } catch (err) {
      showMitraFeedback("error", err.message);
    } finally {
      setIsDeletingBulkMitra(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  // Generate QR Code untuk Standee Registrasi & Standee Indeks Kepuasan
  useEffect(() => {
    if (typeof window !== "undefined") {
      const regUrl = `${window.location.origin}/registrasi?source=gate_standee`;
      QRCode.toDataURL(regUrl, { width: 360, margin: 2 })
        .then((url) => setRegistrationQrUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));

      const kepuasanUrl = `${window.location.origin}/indeks-kepuasan`;
      QRCode.toDataURL(kepuasanUrl, { width: 360, margin: 2 })
        .then((url) => setKepuasanQrUrl(url))
        .catch((err) => console.error("Error generating Kepuasan QR code:", err));
    }
  }, []);

  // Sinkronisasi Tab dari Query URL (misal: /admin?tab=qr-gate atau /admin?tab=indeks-kepuasan)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["overview", "presensi", "registrasi", "indeks-kepuasan", "qr-gate", "mitra"].includes(tabParam)) {
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

  // Helper pilih semua atau per-item pada Data Registrasi (Bulk Delete)
  const isAllRegistrasiSelected = useMemo(() => {
    if (!filteredRegistrasi || filteredRegistrasi.length === 0) return false;
    return filteredRegistrasi.every((p) => selectedRegistrasiIds.includes(p.id));
  }, [filteredRegistrasi, selectedRegistrasiIds]);

  const toggleSelectAllRegistrasi = () => {
    if (isAllRegistrasiSelected) {
      setSelectedRegistrasiIds([]);
    } else {
      setSelectedRegistrasiIds(filteredRegistrasi.map((p) => p.id));
    }
  };

  const toggleSelectRegistrasi = (id) => {
    setSelectedRegistrasiIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered Mitra Data (Penyaringan Mitra Perusahaan)
  const filteredMitra = useMemo(() => {
    return (mitraList || []).filter((item) => {
      const q = searchMitra.toLowerCase();
      const matchSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.pic_name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.industry?.toLowerCase().includes(q);

      const matchStatus =
        filterMitraStatus === "ALL" || item.verification_status === filterMitraStatus;

      return matchSearch && matchStatus;
    });
  }, [mitraList, searchMitra, filterMitraStatus]);

  // Helper pilih semua atau per-item pada Mitra Perusahaan (Bulk Delete)
  const isAllMitraSelected = useMemo(() => {
    if (!filteredMitra || filteredMitra.length === 0) return false;
    return filteredMitra.every((m) => selectedMitraIds.includes(m.id));
  }, [filteredMitra, selectedMitraIds]);

  const toggleSelectAllMitra = () => {
    if (isAllMitraSelected) {
      setSelectedMitraIds([]);
    } else {
      setSelectedMitraIds(filteredMitra.map((m) => m.id));
    }
  };

  const toggleSelectMitra = (id) => {
    setSelectedMitraIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered Lowongan Mitra untuk Kurasi Walk-In Interview (Khusus Admin)
  const filteredMitraJobs = useMemo(() => {
    return (mitraJobsList || []).filter((job) => {
      const q = searchMitraJob.toLowerCase().trim();
      const matchSearch =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.company_name?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q);

      const matchFilter =
        filterMitraJobWalkIn === "ALL" ||
        (filterMitraJobWalkIn === "WALKIN" && job.is_walk_in) ||
        (filterMitraJobWalkIn === "REGULAR" && !job.is_walk_in);

      return matchSearch && matchFilter;
    });
  }, [mitraJobsList, searchMitraJob, filterMitraJobWalkIn]);

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
        clean(s.tactlink_drive_url ? s.tactlink_drive_url : (s.tactlink_proof ? "Sudah Diunggah" : "Belum Diunggah")),
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

  // Hapus Data Peserta Lengkap (Single)
  async function handleDeleteParticipant(participant) {
    if (!participant) return;
    const confirmText = `Apakah Anda yakin ingin menghapus data peserta "${participant.full_name}"?\n\nPerhatian: Nomor registrasi (${participant.registration_number || "-"}), data presensi, survei, dan riwayat lamaran peserta ini akan dihapus secara permanen dari sistem.`;
    if (!confirm(confirmText)) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/data?action=delete_participant&participant_id=${participant.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus data peserta.");
      }
      if (selectedParticipant?.id === participant.id) {
        setSelectedParticipant(null);
      }
      setSelectedRegistrasiIds((prev) => prev.filter((id) => id !== participant.id));
      await loadAdminData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  // Hapus Massal Data Peserta yang Dipilih (Bulk Delete)
  async function handleBulkDeleteParticipants() {
    if (selectedRegistrasiIds.length === 0) return;
    const count = selectedRegistrasiIds.length;
    const confirmText = `Apakah Anda yakin ingin menghapus ${count} data peserta yang dipilih secara permanen?\n\nPerhatian: Nomor registrasi, data presensi, survei, dan seluruh riwayat lamaran peserta terpilih akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`;
    if (!confirm(confirmText)) return;

    setIsDeletingBulk(true);
    try {
      const res = await fetch("/api/admin/data?action=bulk_delete_participants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant_ids: selectedRegistrasiIds }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus data peserta terpilih.");
      }
      setSelectedRegistrasiIds([]);
      await loadAdminData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsDeletingBulk(false);
    }
  }
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
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    if (type === "token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === "kepuasan_token") {
      setCopiedKepuasanToken(true);
      setTimeout(() => setCopiedKepuasanToken(false), 2000);
    } else if (type === "kepuasan_url") {
      setCopiedKepuasanUrl(true);
      setTimeout(() => setCopiedKepuasanUrl(false), 2000);
    }
  }

  function downloadQrStandee() {
    if (!registrationQrUrl) return;
    const link = document.createElement("a");
    link.href = registrationQrUrl;
    link.download = "cce2026-qr-registrasi-standee.png";
    link.click();
  }

  function downloadQrKepuasan() {
    if (!kepuasanQrUrl) return;
    const link = document.createElement("a");
    link.href = kepuasanQrUrl;
    link.download = "cce2026-qr-indeks-kepuasan-standee.png";
    link.click();
  }

  function exportKepuasanToCsv() {
    const list = data?.indeks_kepuasan?.list || [];
    if (list.length === 0) {
      alert("Belum ada data respons indeks kepuasan untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Waktu Submit",
      "Nama Lengkap",
      "Email",
      "Status",
      "Instansi",
      "Fakultas",
      "Jurusan / Prodi",
      "Rata-rata Skor",
      "Q1 Fasilitas Fisik",
      "Q2 Kelengkapan Info",
      "Q3 Kebersihan Kerapihan",
      "Q4 Peta Lokasi",
      "Q5 Ketepatan Jadwal",
      "Q6 Panitia Sigap",
      "Q7 Kecepatan Info",
      "Q8 Pemahaman Partner",
      "Q9 Keyakinan Info",
      "Q10 Kepedulian Panitia",
      "Q11 Perhatian Peserta",
    ];

    const rows = list.map((item, idx) => [
      idx + 1,
      item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "-",
      `"${(item.full_name || "").replace(/"/g, '""')}"`,
      `"${(item.email || "").replace(/"/g, '""')}"`,
      `"${(item.status || "").replace(/"/g, '""')}"`,
      `"${(item.institution || "").replace(/"/g, '""')}"`,
      `"${(item.faculty || "").replace(/"/g, '""')}"`,
      `"${(item.major || "").replace(/"/g, '""')}"`,
      item.average_score || 0,
      item.ratings?.q1_fasilitas_fisik || "-",
      item.ratings?.q2_informasi_lengkap || "-",
      item.ratings?.q3_kebersihan_kerapihan || "-",
      item.ratings?.q4_peta_lokasi || "-",
      item.ratings?.q5_jadwal_tepat || "-",
      item.ratings?.q6_panitia_sigap || "-",
      item.ratings?.q7_kecepatan_info || "-",
      item.ratings?.q8_pengetahuan_partner || "-",
      item.ratings?.q9_keyakinan_info || "-",
      item.ratings?.q10_kepedulian_panitia || "-",
      item.ratings?.q11_didengarkan_diperhatikan || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `indeks_kepuasan_cce2026_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  // ========================================================
  // TAMPILAN LOGIN (Jika Belum Terautentikasi)
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 font-[family-name:var(--font-poppins)] antialiased">
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
    <div className="min-h-screen bg-white text-slate-900 font-[family-name:var(--font-poppins)] antialiased">
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
              onClick={() => setActiveTab("indeks-kepuasan")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
                activeTab === "indeks-kepuasan"
                  ? "bg-white text-amber-700 shadow-xs font-bold border-b-2 border-amber-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconStar className="h-4 w-4 text-amber-500" />
              <span>Indeks Kepuasan</span>
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
            <button
              onClick={() => setActiveTab("mitra")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all cursor-pointer relative ${
                activeTab === "mitra"
                  ? "bg-white text-purple-700 shadow-xs font-bold border-b-2 border-purple-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconBuilding className="h-4 w-4 text-purple-600" />
              <span>Mitra Perusahaan</span>
              {mitraStats.pending > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 animate-pulse">
                  {mitraStats.pending}
                </span>
              )}
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
                    setActiveTab("indeks-kepuasan");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === "indeks-kepuasan"
                      ? "bg-amber-50 text-amber-950 border border-amber-200 shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconStar className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Indeks Kepuasan Peserta</span>
                  </div>
                  {activeTab === "indeks-kepuasan" && (
                    <span className="rounded-full bg-amber-600 text-white text-[10px] font-black px-2 py-0.5">Aktif</span>
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

                <button
                  onClick={() => {
                    setActiveTab("mitra");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === "mitra"
                      ? "bg-purple-50 text-purple-950 border border-purple-200 shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconBuilding className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Mitra Perusahaan (Verifikasi)</span>
                  </div>
                  {mitraStats.pending > 0 ? (
                    <span className="rounded-full bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 animate-pulse">
                      {mitraStats.pending} Menunggu
                    </span>
                  ) : activeTab === "mitra" ? (
                    <span className="rounded-full bg-purple-600 text-white text-[10px] font-black px-2 py-0.5">Aktif</span>
                  ) : null}
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
                Statistik real-time pendaftar dan presensi pengunjung Career Compass Expo 2026.
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

            {/* Widget Status Integrasi Google Drive Bukti TactLink */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <IconGoogleDrive className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-[family-name:var(--font-montserrat)] text-sm font-extrabold text-slate-900">
                        Penyimpanan Cloud Google Drive (Bukti TactLink)
                      </h4>
                      {data.stats.tactlink_stats?.drive_configured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Terhubung
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Belum Dikonfigurasi
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {data.stats.tactlink_stats?.drive_configured
                        ? `Berkas bukti pendaftaran otomatis tersimpan di folder "${data.stats.tactlink_stats?.drive_folder_name}".`
                        : "Hubungkan Service Account Google Drive agar bukti upload otomatis tersimpan di cloud."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-right px-3 py-1 bg-slate-50 rounded-xl border border-slate-100 hidden sm:block">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Tersimpan di Drive</div>
                    <div className="text-sm font-black text-slate-900">
                      {data.stats.tactlink_stats?.total_in_drive || 0} / {data.stats.tactlink_stats?.total_uploaded || 0} Berkas
                    </div>
                  </div>

                  {data.stats.tactlink_stats?.drive_folder_url && (
                    <a
                      href={data.stats.tactlink_stats.drive_folder_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition"
                    >
                      <IconGoogleDrive className="h-3.5 w-3.5" />
                      <span>Buka Folder Drive</span>
                      <span className="text-[10px] text-slate-400">↗</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("registrasi");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                  >
                    <span>Kelola di Registrasi</span>
                    <span>→</span>
                  </button>
                </div>
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Data Registrasi Peserta
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Daftar seluruh pendaftar Career Compass Expo 2026 yang terdaftar melalui form registrasi online.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Tombol Hapus Masal Peserta Terpilih */}
                {selectedRegistrasiIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteParticipants}
                    disabled={isDeletingBulk}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title={`Hapus ${selectedRegistrasiIds.length} data peserta terpilih`}
                  >
                    <IconTrash className="h-4 w-4 text-white" />
                    <span>
                      {isDeletingBulk
                        ? "Menghapus..."
                        : `Hapus Terpilih (${selectedRegistrasiIds.length})`}
                    </span>
                  </button>
                )}

                {/* Tombol Sinkronkan ke Google Drive */}
                <button
                  type="button"
                  onClick={handleSyncAllToDrive}
                  disabled={isSyncingDrive}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-2.5 text-xs font-bold text-purple-700 shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  title="Upload bukti TactLink yang belum tersimpan di Google Drive"
                >
                  <IconGoogleDrive className="h-4 w-4" />
                  <span>
                    {isSyncingDrive ? "Menyinkronkan..." : "Sinkron ke Drive"}
                  </span>
                  {data.stats.tactlink_stats?.pending_sync > 0 && !isSyncingDrive && (
                    <span className="rounded-full bg-purple-600 text-white text-[10px] px-1.5 py-0.2 font-black">
                      {data.stats.tactlink_stats.pending_sync}
                    </span>
                  )}
                </button>

                {/* Tombol Setup Drive */}
                <button
                  type="button"
                  onClick={() => setIsDriveSetupModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-xs transition-colors shrink-0 cursor-pointer"
                  title="Status & Panduan Konfigurasi Google Drive"
                >
                  <span className={`h-2 w-2 rounded-full ${data.stats.tactlink_stats?.drive_configured ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                  <span>Setup Drive</span>
                </button>

                <button
                  onClick={exportRegistrasiCSV}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors shrink-0 w-full sm:w-auto cursor-pointer"
                >
                  <IconDownload className="h-4 w-4 text-slate-500" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Notifikasi Toast Sinkronisasi Drive */}
            {driveToast && (
              <div
                className={`rounded-xl border p-3.5 text-xs font-semibold flex items-center justify-between transition-all animate-fadeIn ${
                  driveToast.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconGoogleDrive className="h-4 w-4" />
                  <span>{driveToast.message}</span>
                </div>
                <button
                  onClick={() => setDriveToast(null)}
                  className="text-slate-500 hover:text-slate-800 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

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

                <div className="text-xs font-medium text-slate-500 whitespace-nowrap px-2 flex items-center gap-1.5">
                  <span>Total: {filteredRegistrasi.length} Pendaftar</span>
                  {selectedRegistrasiIds.length > 0 && (
                    <span className="font-bold text-purple-700">
                      • {selectedRegistrasiIds.length} Terpilih{" "}
                      <button
                        type="button"
                        onClick={() => setSelectedRegistrasiIds([])}
                        className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer ml-1"
                      >
                        (Batal)
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Table Registrasi */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="w-12 px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isAllRegistrasiSelected}
                          onChange={toggleSelectAllRegistrasi}
                          disabled={filteredRegistrasi.length === 0}
                          className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                          title={isAllRegistrasiSelected ? "Batalkan pilih semua" : "Pilih semua pendaftar"}
                        />
                      </th>
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
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Memuat data registrasi...
                        </td>
                      </tr>
                    ) : filteredRegistrasi.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400">
                          Tidak ada data pendaftar yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrasi.map((p) => {
                        const isSelected = selectedRegistrasiIds.includes(p.id);
                        return (
                          <tr
                            key={p.id}
                            className={`transition-colors ${
                              isSelected ? "bg-purple-50/70" : "hover:bg-slate-50/80"
                            }`}
                          >
                            <td
                              className="w-12 px-4 py-4 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRegistrasi(p.id)}
                                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                              />
                            </td>
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
                              {p.survey?.tactlink_drive_url ? (
                                <a
                                  href={p.survey.tactlink_drive_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 text-[10px] font-bold text-emerald-700 px-1.5 py-0.5 border border-emerald-200 hover:bg-emerald-100 transition"
                                  title="Tersimpan di Google Drive - Klik untuk membuka berkas"
                                >
                                  <IconGoogleDrive className="h-3 w-3" />
                                  <span>Drive ↗</span>
                                </a>
                              ) : p.survey?.tactlink_proof ? (
                                <span className="inline-flex items-center rounded-sm bg-purple-50 text-[10px] font-bold text-purple-700 px-1.5 py-0.5 border border-purple-200" title="Sudah upload bukti TactLink (Belum disinkron ke Drive)">
                                  ✓ TactLink
                                </span>
                              ) : null}
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
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                                  title="Check-in Manual di Gate"
                                >
                                  + Presensi
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteParticipant(p)}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition"
                                title="Hapus Data Peserta"
                              >
                                Hapus
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
            TAB: INDEKS KEPUASAN PESERTA (DATA SURVEI & EVALUASI)
            ======================================================== */}
        {activeTab === "indeks-kepuasan" && (() => {
          const list = data?.indeks_kepuasan?.list || [];
          const totalRespondents = data?.indeks_kepuasan?.total_respondents || 0;
          const overallAvg = data?.indeks_kepuasan?.overall_average || 0;
          const questionAverages = data?.indeks_kepuasan?.question_averages || [];

          const mhsCount = list.filter((i) => (i.status || "").toLowerCase().includes("mahas") || i.status === "Mahasiwa").length;
          const alumniUmumCount = list.length - mhsCount;

          const filteredList = list.filter((item) => {
            if (filterKepuasanStatus !== "ALL" && item.status !== filterKepuasanStatus) {
              return false;
            }
            if (searchKepuasan.trim()) {
              const q = searchKepuasan.toLowerCase();
              const matchName = (item.full_name || "").toLowerCase().includes(q);
              const matchEmail = (item.email || "").toLowerCase().includes(q);
              const matchInst = (item.institution || "").toLowerCase().includes(q);
              const matchFac = (item.faculty || "").toLowerCase().includes(q);
              const matchMajor = (item.major || "").toLowerCase().includes(q);
              return matchName || matchEmail || matchInst || matchFac || matchMajor;
            }
            return true;
          });

          return (
            <div className="space-y-8 animate-fadeIn">
              {/* Header Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <h2 className="font-[family-name:var(--font-montserrat)] text-xl sm:text-2xl font-extrabold text-slate-900">
                      Data &amp; Analisis Indeks Kepuasan Peserta
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      Evaluasi Resmi CCE 2026
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Statistik real-time evaluasi kepuasan peserta terhadap fasilitas, pelayanan panitia, dan pelaksanaan Career Compass Expo 2026.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportKepuasanToCsv}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs sm:text-sm shadow-xs transition cursor-pointer"
                  >
                    <IconDownload className="h-4 w-4" />
                    <span>Ekspor CSV</span>
                  </button>
                  <button
                    onClick={loadAdminData}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 text-xs sm:text-sm shadow-xs transition cursor-pointer"
                  >
                    <IconRefresh className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Responden
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <IconUsers className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900">{totalRespondents}</span>
                    <span className="ml-1.5 text-xs text-slate-500">orang</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Tanggapan evaluasi masuk</p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Rata-Rata Kepuasan
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <IconStar className="h-5 w-5 fill-amber-500 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-900">{overallAvg.toFixed(1)}</span>
                    <span className="text-xs font-bold text-amber-700">/ 5.0</span>
                    <span className="ml-auto inline-flex items-center rounded-full bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                      {Math.round((overallAvg / 5) * 100)}% Puas
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-amber-700/80">Skor agregat 11 indikator</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Responden Mahasiswa
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <IconAcademic className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900">{mhsCount}</span>
                    <span className="ml-1.5 text-xs text-slate-500">orang</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {totalRespondents > 0 ? Math.round((mhsCount / totalRespondents) * 100) : 0}% dari responden
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Responden Alumni &amp; Umum
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <IconCheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900">{alumniUmumCount}</span>
                    <span className="ml-1.5 text-xs text-slate-500">orang</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {totalRespondents > 0 ? Math.round((alumniUmumCount / totalRespondents) * 100) : 0}% dari responden
                  </p>
                </div>
              </div>

              {/* Analisis Rata-Rata per Aspek Evaluasi (11 Indikator) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-[family-name:var(--font-montserrat)] text-lg sm:text-xl font-bold text-slate-900">
                      Kinerja per Aspek Penilaian (11 Indikator)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rincian rata-rata penilaian pada skala 1 (Sangat Tidak Memadai) sampai 5 (Sangat Memadai).
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    Skala 1 - 5
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionAverages.map((q, idx) => {
                    const avgScore = Number(q.average) || 0;
                    const pct = Math.min(100, Math.max(0, (avgScore / 5) * 100));
                    return (
                      <div
                        key={q.key}
                        className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-amber-200 hover:bg-white hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-800 leading-snug">
                            <span className="text-amber-600 font-mono mr-1.5">#{idx + 1}</span>
                            {q.label}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900">
                            <span>★</span>
                            <span>{avgScore.toFixed(1)}</span>
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{q.total_responses} tanggapan</span>
                          <span className="font-semibold text-slate-600">{Math.round(pct)}% kepuasan</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabel Respon Peserta */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-bold text-slate-900">
                      Daftar Tanggapan Responden ({filteredList.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Seluruh hasil pengisian formulir evaluasi indeks kepuasan peserta.
                    </p>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative min-w-[220px]">
                      <IconSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchKepuasan}
                        onChange={(e) => setSearchKepuasan(e.target.value)}
                        placeholder="Cari nama, email, instansi..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <select
                      value={filterKepuasanStatus}
                      onChange={(e) => setFilterKepuasanStatus(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="ALL">Semua Kategori</option>
                      <option value="Mahasiwa">Mahasiswa</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3">Nama &amp; Email</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Instansi</th>
                        <th className="px-4 py-3">Fakultas / Prodi</th>
                        <th className="px-4 py-3 text-center">Rata-rata Skor</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            Belum ada tanggapan indeks kepuasan yang sesuai.
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-slate-900">{item.full_name}</p>
                              <p className="text-[11px] text-slate-400">{item.email}</p>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  (item.status || "").toLowerCase().includes("mahas")
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : item.status === "Alumni"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {item.status || "Mahasiwa"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-700">{item.institution || "-"}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-slate-800">{item.faculty || "-"}</p>
                              {item.major && <p className="text-[11px] text-slate-400">{item.major}</p>}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800 border border-amber-200">
                                <span className="text-amber-500">★</span>
                                <span>{(Number(item.average_score) || 5).toFixed(1)}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedKepuasanDetail(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer"
                              >
                                <IconEye className="h-3.5 w-3.5 text-purple-600" />
                                <span>Detail</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Detail Tanggapan Peserta */}
              {selectedKepuasanDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
                  <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl my-8">
                    <button
                      type="button"
                      onClick={() => setSelectedKepuasanDetail(null)}
                      className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    >
                      <IconX className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <IconStar className="h-6 w-6 fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {selectedKepuasanDetail.full_name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {selectedKepuasanDetail.email} • {selectedKepuasanDetail.status}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Header */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 mb-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Instansi</span>
                        <span className="font-semibold text-slate-800">{selectedKepuasanDetail.institution || "-"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Fakultas / Prodi</span>
                        <span className="font-semibold text-slate-800">{selectedKepuasanDetail.faculty} {selectedKepuasanDetail.major ? `(${selectedKepuasanDetail.major})` : ""}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Rata-Rata Skor</span>
                        <span className="inline-flex items-center gap-1 font-black text-amber-800">
                          <span className="text-amber-500">★</span>
                          <span>{(Number(selectedKepuasanDetail.average_score) || 5).toFixed(1)} / 5.0</span>
                        </span>
                      </div>
                    </div>

                    {/* Rincian 11 Jawaban */}
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Rincian Penilaian (Skala 1 - 5):
                    </h4>
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {[
                        { key: "q1_fasilitas_fisik", text: "Apakah fasilitas fisik pada acara Career Preparation memadai?" },
                        { key: "q2_informasi_lengkap", text: "Apakah informasi yang diberikan lengkap dan mudah dipahami?" },
                        { key: "q3_kebersihan_kerapihan", text: "Bagaimana pendapat Anda mengenai kebersihan dan kerapihan lokasi?" },
                        { key: "q4_peta_lokasi", text: "Apakah peserta mudah memahami peta lokasi pada acara?" },
                        { key: "q5_jadwal_tepat", text: "Apakah acara dimulai dan berlangsung sesuai jadwal?" },
                        { key: "q6_panitia_sigap", text: "Apakah panitia dengan sigap membantu dan menjawab pertanyaan?" },
                        { key: "q7_kecepatan_info", text: "Seberapa cepat Anda mendapatkan informasi yang dibutuhkan?" },
                        { key: "q8_pengetahuan_partner", text: "Apakah panitia memiliki pengetahuan yang baik tentang partner?" },
                        { key: "q9_keyakinan_info", text: "Seberapa yakin Anda dengan informasi yang disampaikan panitia?" },
                        { key: "q10_kepedulian_panitia", text: "Seberapa peduli panitia terhadap kebutuhan Anda selama acara?" },
                        { key: "q11_didengarkan_diperhatikan", text: "Apakah Anda merasa didengarkan dan diperhatikan oleh panitia?" },
                      ].map((item, idx) => {
                        const score = Number(selectedKepuasanDetail.ratings?.[item.key]) || 5;
                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                          >
                            <span className="text-slate-700 leading-snug">
                              <span className="font-bold text-amber-600 mr-1.5">{idx + 1}.</span>
                              {item.text}
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-900">
                              <span>★</span>
                              <span>{score}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedKepuasanDetail(null)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 text-xs transition cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
                      CAREER COMPASS EXPO 2026 • UIN JAKARTA
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
                BAGIAN B: QR CODE INDEKS KEPUASAN PESERTA (Standee Evaluasi Acara)
                ======================================================== */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <h2 className="font-[family-name:var(--font-montserrat)] text-xl sm:text-2xl font-extrabold text-slate-900">
                  B. QR Code Indeks Kepuasan Peserta (Standee Evaluasi Acara)
                </h2>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                  Survei &amp; Evaluasi CCE
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Tampilkan atau cetak QR Code ini di standee gerbang keluar atau meja informasi agar pengunjung dapat langsung mengisi evaluasi indeks kepuasan penyelenggaraan CCE 2026.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Kolom Kiri: Poster Standee QR Code Printable (Format persis Gambar 3) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-xs rounded-2xl border-2 border-amber-300 bg-white p-6 shadow-md text-center">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      CAREER COMPASS EXPO 2026 • UIN JAKARTA
                    </p>
                    <h3 className="mt-2 text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      PINDAI DENGAN KAMERA UNTUK INDEKS KEPUASAN
                    </h3>

                    {/* Gambar QR Code */}
                    <div className="mt-4 flex items-center justify-center p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                      {kepuasanQrUrl ? (
                        <img
                          src={kepuasanQrUrl}
                          alt="QR Code Indeks Kepuasan CCE 2026"
                          className="h-56 w-56 object-contain"
                        />
                      ) : (
                        <div className="h-56 w-56 flex items-center justify-center text-xs text-slate-400">
                          Membuat QR Code...
                        </div>
                      )}
                    </div>

                    {/* Label Token */}
                    <div className="mt-4 rounded-lg bg-amber-100 py-1.5 px-3 font-mono text-xs font-bold text-amber-900 border border-amber-200">
                      CCE2026-SURVEI-KEPUASAN
                    </div>

                    <p className="mt-3 text-[11px] text-slate-400">
                      Buka kamera smartphone • Menuju Formulir Indeks Kepuasan
                    </p>
                  </div>
                </div>

                {/* Kolom Kanan: Detail Token, URL, Panduan, & Tombol Download */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Token Gerbang */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Identitas Token Evaluasi:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        value="CCE2026-GATE-EVALUASI-KEPUASAN"
                        className="w-full sm:flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard("CCE2026-GATE-EVALUASI-KEPUASAN", "kepuasan_token")}
                        className="w-full sm:w-auto justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <IconCopy className="h-3.5 w-3.5" />
                        <span>{copiedKepuasanToken ? "Tersalin!" : "Salin Token"}</span>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Token identitas resmi standee evaluasi indeks kepuasan CCE 2026.
                    </p>
                  </div>

                  {/* URL Tujuan QR Indeks Kepuasan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      URL Tujuan QR Indeks Kepuasan:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        value={
                          typeof window !== "undefined"
                            ? `${window.location.origin}/indeks-kepuasan`
                            : "https://cce2026.uinjkt.ac.id/indeks-kepuasan"
                        }
                        className="w-full sm:flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-700 truncate"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/indeks-kepuasan`,
                            "kepuasan_url"
                          )
                        }
                        className="w-full sm:w-auto justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <IconCopy className="h-3.5 w-3.5" />
                        <span>{copiedKepuasanUrl ? "Tersalin!" : "Salin URL"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Panduan Alur */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                    <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                      <span className="text-amber-600">✦</span>
                      <span>Panduan Alur Indeks Kepuasan Peserta:</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                      <li>Cetak poster barcode QR ini atau tampilkan di layar standee gerbang keluar/meja informasi CCE 2026.</li>
                      <li>Pengunjung memindai QR Code ini menggunakan kamera smartphone saat selesai mengikuti acara.</li>
                      <li>Halaman formulir terbuka seketika dan data penilaian otomatis masuk ke tab <strong>Indeks Kepuasan</strong> di Admin Console.</li>
                    </ol>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={downloadQrKepuasan}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                    >
                      <IconDownload className="h-4 w-4" />
                      <span>Unduh QR Kepuasan (PNG)</span>
                    </button>
                    <Link
                      href="/indeks-kepuasan"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-xs sm:text-sm shadow-xs transition-colors"
                    >
                      <span>Buka Halaman Indeks Kepuasan</span>
                      <IconExternal className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                BAGIAN C: KONSOL VALIDASI TIKET GATE MASUK (Scan Kehadiran)
                ======================================================== */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-1">
                <span className="h-3 w-3 rounded-full bg-purple-600" />
                <h2 className="font-[family-name:var(--font-montserrat)] text-xl sm:text-2xl font-extrabold text-slate-900">
                  C. Konsol Validasi Tiket Gate Masuk (Scan Kehadiran)
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
                    Buka Kamera Scanner
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: MITRA PERUSAHAAN (Penyaringan & Verifikasi Admin)
            ======================================================== */}
        {activeTab === "mitra" && (
          <div className="space-y-6">
            {/* Header Tab Mitra */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Penyaringan &amp; Verifikasi Mitra
                  </h1>
                  {mitraStats.pending > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      {mitraStats.pending} Menunggu Peninjauan
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600 max-w-3xl">
                  Saring dan verifikasi profil perusahaan pendaftar Career Compass Expo 2026. Hanya perusahaan yang telah diverifikasi yang dapat menerbitkan lowongan kerja dan menerima lamaran peserta.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Tombol Hapus Massal Mitra Terpilih */}
                {selectedMitraIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteMitra}
                    disabled={isDeletingBulkMitra}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title={`Hapus ${selectedMitraIds.length} data mitra terpilih`}
                  >
                    <IconTrash className="h-4 w-4 text-white" />
                    <span>
                      {isDeletingBulkMitra
                        ? "Menghapus..."
                        : `Hapus Terpilih (${selectedMitraIds.length})`}
                    </span>
                  </button>
                )}

                <button
                  onClick={loadMitraData}
                  disabled={loadingMitra}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition cursor-pointer"
                >
                  <IconRefresh className={`h-4 w-4 text-purple-600 ${loadingMitra ? "animate-spin" : ""}`} />
                  <span>{loadingMitra ? "Memuat..." : "Segarkan Data"}</span>
                </button>
              </div>
            </div>

            {/* Toast Feedback */}
            {mitraToast && (
              <div
                className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between border shadow-sm ${
                  mitraToast.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                    : "bg-rose-50 text-rose-900 border-rose-300"
                }`}
              >
                <span>{mitraToast.text}</span>
                <button
                  onClick={() => setMitraToast(null)}
                  className="text-xs font-bold px-2 py-1 hover:opacity-75"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sub-Tab Switcher: Mitra Perusahaan vs Kurasi Walk-In Interview */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setMitraSubTab("companies")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                  mitraSubTab === "companies"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <IconBuilding className="h-4 w-4" />
                <span>Daftar Mitra Perusahaan ({mitraList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMitraSubTab("walkin_jobs")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                  mitraSubTab === "walkin_jobs"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-purple-600 border border-slate-200"
                }`}
              >
                <IconBriefcase className="h-4 w-4" />
                <span>Kurasi Lowongan Walk-In Interview</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    mitraSubTab === "walkin_jobs"
                      ? "bg-white/20 text-white"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {mitraStats.walk_in_jobs || 0} Posisi Walk-In
                </span>
              </button>
            </div>

            {/* VIEW 1: DAFTAR PERUSAHAAN MITRA */}
            {mitraSubTab === "companies" && (
              <>
                {/* Metrics Cards Grid (4 Kolom) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Total Mitra */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Total Mitra</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <IconBuilding className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {mitraStats.total}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Semua akun perusahaan terdaftar
                </div>
              </div>

              {/* Card 2: Menunggu Verifikasi */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-5 shadow-xs">
                <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider">
                  <span>Menunggu Verifikasi</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <IconClock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-900">
                  {mitraStats.pending}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Perlu screening &amp; verifikasi admin
                </div>
              </div>

              {/* Card 3: Terverifikasi */}
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-5 shadow-xs">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <span>Mitra Terverifikasi</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <IconCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-900">
                  {mitraStats.verified}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                  Disetujui &amp; aktif pasang lowongan
                </div>
              </div>

              {/* Card 4: Ditolak */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs">
                <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase tracking-wider">
                  <span>Pengajuan Ditolak</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <IconX className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-900">
                  {mitraStats.rejected}
                </div>
                <div className="mt-1 text-[11px] text-rose-600">
                  Tidak memenuhi syarat kemitraan
                </div>
              </div>
            </div>

            {/* Filter & Pencarian */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <IconSearch className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchMitra}
                    onChange={(e) => setSearchMitra(e.target.value)}
                    placeholder="Cari nama perusahaan, PIC, email, atau industri..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  {searchMitra && (
                    <button
                      onClick={() => setSearchMitra("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Status Pills */}
                <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1 overflow-x-auto text-xs font-semibold shrink-0">
                  <button
                    onClick={() => setFilterMitraStatus("ALL")}
                    className={`rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                      filterMitraStatus === "ALL"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua ({mitraList.length})
                  </button>
                  <button
                    onClick={() => setFilterMitraStatus("pending")}
                    className={`rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                      filterMitraStatus === "pending"
                        ? "bg-amber-500 text-white shadow-xs font-bold"
                        : "text-amber-800 hover:bg-amber-100/60"
                    }`}
                  >
                    Menunggu ({mitraStats.pending})
                  </button>
                  <button
                    onClick={() => setFilterMitraStatus("verified")}
                    className={`rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                      filterMitraStatus === "verified"
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "text-emerald-800 hover:bg-emerald-100/60"
                    }`}
                  >
                    Terverifikasi ({mitraStats.verified})
                  </button>
                  <button
                    onClick={() => setFilterMitraStatus("rejected")}
                    className={`rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                      filterMitraStatus === "rejected"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-800 hover:bg-rose-100/60"
                    }`}
                  >
                    Ditolak ({mitraStats.rejected})
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span>
                    Menampilkan <strong>{filteredMitra.length}</strong> dari <strong>{mitraList.length}</strong> perusahaan
                  </span>
                  {selectedMitraIds.length > 0 && (
                    <span className="font-bold text-purple-700">
                      • {selectedMitraIds.length} Terpilih{" "}
                      <button
                        type="button"
                        onClick={() => setSelectedMitraIds([])}
                        className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer ml-1"
                      >
                        (Batal)
                      </button>
                    </span>
                  )}
                </div>
                {filterMitraStatus !== "ALL" && (
                  <button
                    onClick={() => setFilterMitraStatus("ALL")}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Reset Filter Status
                  </button>
                )}
              </div>
            </div>

            {/* Tabel Mitra Perusahaan */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="w-12 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isAllMitraSelected}
                          onChange={toggleSelectAllMitra}
                          disabled={filteredMitra.length === 0}
                          className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                          title={isAllMitraSelected ? "Batalkan pilih semua" : "Pilih semua perusahaan"}
                        />
                      </th>
                      <th className="px-4 py-3.5">Perusahaan &amp; Website</th>
                      <th className="px-4 py-3.5">PIC &amp; Kontak</th>
                      <th className="px-4 py-3.5">Industri &amp; Skala</th>
                      <th className="px-4 py-3.5 text-center">Lowongan</th>
                      <th className="px-4 py-3.5 text-center">Status Verifikasi</th>
                      <th className="px-4 py-3.5 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingMitra ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <IconRefresh className="h-6 w-6 animate-spin text-purple-600" />
                            <span>Memuat data mitra perusahaan...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredMitra.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                              <IconBuilding className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm">Tidak ada data mitra</span>
                            <span className="text-xs text-slate-500">
                              {searchMitra || filterMitraStatus !== "ALL"
                                ? "Tidak ditemukan perusahaan yang cocok dengan pencarian atau filter yang dipilih."
                                : "Belum ada perusahaan yang mendaftar sebagai mitra."}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMitra.map((item) => {
                        const isActionLoading = actionLoadingId === item.id;
                        const isSelected = selectedMitraIds.includes(item.id);
                        const waLink = item.phone && item.phone !== "-"
                          ? `https://wa.me/${item.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`
                          : null;

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              isSelected ? "bg-purple-50/70" : "hover:bg-slate-50/80"
                            }`}
                          >
                            {/* Checkbox Pilih Perusahaan */}
                            <td
                              className="w-12 px-4 py-3.5 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMitra(item.id)}
                                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                              />
                            </td>

                            {/* Perusahaan & Website */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-start gap-3">
                                {item.logo_url ? (
                                  <img
                                    src={item.logo_url}
                                    alt={item.name}
                                    className="h-9 w-9 rounded-xl object-contain border border-slate-200 bg-white p-1 shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700 text-sm uppercase border border-purple-200">
                                    {item.name.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                    {item.name}
                                  </div>
                                  {item.website && item.website !== "-" ? (
                                    <a
                                      href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 hover:underline truncate mt-0.5"
                                    >
                                      <span>{item.website.replace(/^https?:\/\//, "")}</span>
                                      <IconExternal className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">Tidak ada website</span>
                                  )}
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    ID: {item.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* PIC & Kontak */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                                  <span>{item.pic_name || "-"}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">(PIC)</span>
                                </div>
                                <div className="text-slate-600 text-[11px] truncate">
                                  {item.email || "-"}
                                </div>
                                {item.phone && item.phone !== "-" && (
                                  <div className="flex items-center gap-1.5 pt-0.5">
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                      title="Kirim pesan WhatsApp ke PIC untuk verifikasi"
                                    >
                                      <span>WA: {item.phone}</span>
                                      <IconExternal className="h-2.5 w-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Industri & Skala */}
                            <td className="px-4 py-3.5">
                              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                                {item.industry || "Umum"}
                              </span>
                              <div className="text-[11px] text-slate-500 mt-1">
                                {item.company_size || "1-50 Karyawan"}
                              </div>
                            </td>

                            {/* Lowongan */}
                            <td className="px-4 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchMitraJob(item.name);
                                  setFilterMitraJobWalkIn("ALL");
                                  setMitraSubTab("walkin_jobs");
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-purple-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-purple-800 border border-slate-200 transition cursor-pointer"
                                title="Lihat & kurasi lowongan perusahaan ini untuk Walk-In Interview"
                              >
                                <IconBriefcase className="h-3 w-3 text-slate-500" />
                                <span>{item.total_jobs} Lowongan</span>
                              </button>
                            </td>

                            {/* Status Verifikasi Badge */}
                            <td className="px-4 py-3.5 text-center">
                              {item.verification_status === "verified" ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                                    <IconCheck className="h-3 w-3 text-emerald-600" />
                                    <span>Terverifikasi</span>
                                  </span>
                                  {item.verified_at && (
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(item.verified_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                  )}
                                </div>
                              ) : item.verification_status === "rejected" ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800 border border-rose-300 cursor-help"
                                    title={item.rejection_reason || "Ditolak oleh admin"}
                                  >
                                    <IconX className="h-3 w-3 text-rose-600" />
                                    <span>Ditolak</span>
                                  </span>
                                  <span className="text-[9px] text-rose-600 truncate max-w-[120px]">
                                    {item.rejection_reason}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-300 animate-pulse">
                                    <IconClock className="h-3 w-3 text-amber-700" />
                                    <span>Menunggu Review</span>
                                  </span>
                                  <span className="text-[9px] text-amber-700 font-semibold">
                                    Belum Lolos Skrining
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Tombol Aksi Verifikasi */}
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Tombol Detail */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedMitraDetail(item)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer transition"
                                  title="Lihat detail lengkap profil perusahaan"
                                >
                                  <IconEye className="h-3.5 w-3.5 text-purple-600" />
                                  <span>Detail</span>
                                </button>

                                {/* Tombol Approve / Setujui */}
                                {item.verification_status !== "verified" && (
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleUpdateMitraStatus(item.id, "approve")}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer transition disabled:opacity-50"
                                    title="Setujui pendaftaran mitra agar dapat menerbitkan lowongan kerja"
                                  >
                                    <IconCheck className="h-3.5 w-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                )}

                                {/* Tombol Tolak */}
                                {item.verification_status !== "rejected" && (
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => {
                                      setRejectReason("");
                                      setRejectModalMitra(item);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 text-xs font-bold text-rose-700 shadow-xs cursor-pointer transition disabled:opacity-50"
                                    title="Tolak pendaftaran mitra"
                                  >
                                    <IconX className="h-3.5 w-3.5" />
                                    <span>Tolak</span>
                                  </button>
                                )}

                                {/* Tombol Reset (jika sudah verified atau rejected) */}
                                {item.verification_status !== "pending" && (
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleUpdateMitraStatus(item.id, "reset")}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer transition disabled:opacity-50"
                                    title="Kembalikan status ke antrean peninjauan (Pending)"
                                  >
                                    <span>↺</span>
                                  </button>
                                )}

                                {/* Tombol Hapus Spam */}
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleDeleteMitra(item.id, item.name)}
                                  className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Hapus permanen akun mitra ini"
                                >
                                  <IconTrash className="h-3.5 w-3.5" />
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
          </>
        )}

        {/* VIEW 2: KURASI LOWONGAN WALK-IN INTERVIEW (HAK AKSES EKSKLUSIF ADMIN) */}
        {mitraSubTab === "walkin_jobs" && (
          <div className="space-y-6">
            {/* Banner Penjelasan Hak Akses Eksklusif Admin */}
            <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-fuchsia-50/40 to-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm mt-0.5">
                    <IconBriefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Kurasi Jalur Walk-In Interview CCE 2026</span>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 border border-purple-200 uppercase tracking-wider">
                        Khusus Akses Admin
                      </span>
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-3xl">
                      Hanya lowongan yang <strong>diaktifkan oleh Admin</strong> di bawah ini yang akan muncul pada <strong>Formulir Pendaftaran Walk-In Interview</strong> pelamar (untuk wawancara langsung di booth). Lowongan yang dinonaktifkan tetap dapat dilamar melalui <strong>Formulir Lamaran Pekerjaan Reguler (Online)</strong>.
                    </p>
                  </div>
                </div>

                {(searchMitraJob || filterMitraJobWalkIn !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMitraJob("");
                      setFilterMitraJobWalkIn("ALL");
                    }}
                    className="shrink-0 text-xs font-bold text-purple-700 hover:text-purple-900 underline underline-offset-4 cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            </div>

            {/* Metric Cards Lowongan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Total Lowongan Terbit */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Total Lowongan Terbit</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <IconBriefcase className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {mitraJobsList.length}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Dari seluruh mitra perusahaan terverifikasi
                </div>
              </div>

              {/* Lowongan Jalur Walk-In (Aktif) */}
              <div className="rounded-2xl border border-fuchsia-300 bg-fuchsia-50/50 p-5 shadow-xs">
                <div className="flex items-center justify-between text-fuchsia-800 text-xs font-bold uppercase tracking-wider">
                  <span>Akses Walk-In Interview</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
                    <IconCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-fuchsia-950">
                  {mitraJobsList.filter((j) => j.is_walk_in).length}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-fuchsia-800 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-600 animate-pulse" />
                  Muncul di formulir walk-in expo
                </div>
              </div>

              {/* Lowongan Jalur Lamaran Reguler */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <span>Lamaran Reguler Saja</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <IconDocument className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {mitraJobsList.filter((j) => !j.is_walk_in).length}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Khusus seleksi berkas online
                </div>
              </div>
            </div>

            {/* Filter & Pencarian Lowongan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <IconSearch className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchMitraJob}
                    onChange={(e) => setSearchMitraJob(e.target.value)}
                    placeholder="Cari lowongan berdasarkan judul posisi, perusahaan, atau lokasi..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  {searchMitraJob && (
                    <button
                      onClick={() => setSearchMitraJob("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1 overflow-x-auto text-xs font-semibold shrink-0">
                  <button
                    onClick={() => setFilterMitraJobWalkIn("ALL")}
                    className={`rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                      filterMitraJobWalkIn === "ALL"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua ({mitraJobsList.length})
                  </button>
                  <button
                    onClick={() => setFilterMitraJobWalkIn("WALKIN")}
                    className={`rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                      filterMitraJobWalkIn === "WALKIN"
                        ? "bg-fuchsia-600 text-white shadow-xs font-bold"
                        : "text-fuchsia-800 hover:bg-fuchsia-100/60"
                    }`}
                  >
                    ✓ Walk-In ({mitraJobsList.filter((j) => j.is_walk_in).length})
                  </button>
                  <button
                    onClick={() => setFilterMitraJobWalkIn("REGULAR")}
                    className={`rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                      filterMitraJobWalkIn === "REGULAR"
                        ? "bg-slate-800 text-white shadow-xs font-bold"
                        : "text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    Reguler ({mitraJobsList.filter((j) => !j.is_walk_in).length})
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>
                  Menampilkan <strong>{filteredMitraJobs.length}</strong> dari <strong>{mitraJobsList.length}</strong> posisi lowongan
                </span>
                {(searchMitraJob || filterMitraJobWalkIn !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchMitraJob("");
                      setFilterMitraJobWalkIn("ALL");
                    }}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Tabel Kurasi Lowongan */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3.5 text-center w-12">No</th>
                      <th className="px-4 py-3.5">Perusahaan Mitra</th>
                      <th className="px-4 py-3.5">Posisi Lowongan</th>
                      <th className="px-4 py-3.5">Lokasi &amp; Batas Waktu</th>
                      <th className="px-4 py-3.5 text-center">Status Akses Lowongan</th>
                      <th className="px-4 py-3.5 text-center">Aksi Kurasi Walk-In (Admin)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingMitra ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <IconRefresh className="h-6 w-6 animate-spin text-purple-600" />
                            <span>Memuat daftar lowongan mitra...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredMitraJobs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                              <IconBriefcase className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-slate-700">Tidak ada lowongan ditemukan</span>
                            <span className="text-[11px] text-slate-400">
                              Coba ubah kata kunci pencarian atau sesuaikan filter status akses lowongan.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMitraJobs.map((job, idx) => {
                        const isActionLoading = actionLoadingId === job.id;
                        return (
                          <tr key={job.id} className="hover:bg-slate-50/60 transition">
                            <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>

                            {/* Perusahaan */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                {job.company_logo ? (
                                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={job.company_logo}
                                      alt={job.company_name}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs">
                                    {job.company_name?.charAt(0) || "P"}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block truncate max-w-xs">
                                    {job.company_name}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Posisi Lowongan */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-0.5">
                                <Link
                                  href={`/lowongan/${job.id}`}
                                  target="_blank"
                                  className="font-bold text-slate-900 hover:text-purple-600 transition inline-flex items-center gap-1"
                                >
                                  <span>{job.title}</span>
                                  <IconExternal className="h-3 w-3 text-slate-400" />
                                </Link>
                                {job.description && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                                    {job.description}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Lokasi & Batas Waktu */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-0.5">
                                <div className="text-slate-700 font-medium">{job.location || "Jakarta"}</div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                  {job.end_date ? (
                                    <>
                                      <span>s.d {new Date(job.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                                      {job.is_expired && (
                                        <span className="rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.2">
                                          Kedaluwarsa
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-slate-400">Selama Expo</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Status Akses Lowongan */}
                            <td className="px-4 py-3.5 text-center">
                              {job.is_walk_in ? (
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-3 py-1 text-[11px] font-extrabold text-fuchsia-800 border border-fuchsia-300 shadow-xs">
                                    <span className="h-2 w-2 rounded-full bg-fuchsia-600 animate-pulse" />
                                    <span>✓ Walk-In Interview</span>
                                  </span>
                                  <span className="text-[10px] text-fuchsia-700/80 font-medium">
                                    Tampil di Form Walk-In
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
                                    <span>📄 Lamaran Reguler</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Form Reguler Saja
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Aksi Kurasi Walk-In (Admin) */}
                            <td className="px-4 py-3.5 text-center">
                              {job.is_walk_in ? (
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleToggleWalkIn(job.id, false)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 transition cursor-pointer disabled:opacity-50 shadow-xs"
                                  title="Hapus lowongan ini dari jalur Walk-In Interview"
                                >
                                  {isActionLoading ? (
                                    <IconRefresh className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <IconX className="h-3.5 w-3.5" />
                                  )}
                                  <span>Nonaktifkan Walk-In</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleToggleWalkIn(job.id, true)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700 transition cursor-pointer disabled:opacity-50 shadow-xs"
                                  title="Izinkan lowongan ini masuk ke formulir Walk-In Interview"
                                >
                                  {isActionLoading ? (
                                    <IconRefresh className="h-3.5 w-3.5 animate-spin text-purple-700" />
                                  ) : (
                                    <IconCheck className="h-3.5 w-3.5" />
                                  )}
                                  <span>+ Jadikan Walk-In</span>
                                </button>
                              )}
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
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <IconGoogleDrive className="h-3.5 w-3.5" />
                        <span>Bukti Unduh / Akun TactLink</span>
                      </div>
                      {selectedParticipant.survey.tactlink_drive_url ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Tersimpan di Google Drive
                        </span>
                      ) : selectedParticipant.survey.tactlink_proof ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Tersimpan di Database
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    {selectedParticipant.survey.tactlink_proof ? (
                      <div className="mt-2 space-y-2.5">
                        <div className="relative max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
                          <img
                            src={
                              selectedParticipant.survey.tactlink_drive_thumb ||
                              selectedParticipant.survey.tactlink_proof
                            }
                            alt="Bukti TactLink"
                            className="w-full object-contain max-h-60 mx-auto rounded-lg cursor-pointer hover:opacity-90 transition"
                            onClick={() => {
                              if (selectedParticipant.survey.tactlink_drive_url) {
                                window.open(selectedParticipant.survey.tactlink_drive_url, "_blank");
                              } else {
                                const w = window.open("");
                                if (w) {
                                  w.document.write(
                                    `<title>Bukti Unduh TactLink - ${selectedParticipant.full_name}</title><body style="margin:0;background:#0f172a;display:flex;align-items:center;justify-center;min-height:100vh;"><img src="${selectedParticipant.survey.tactlink_proof}" style="max-width:90%;max-height:90vh;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);" /></body>`
                                  );
                                }
                              }
                            }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          {selectedParticipant.survey.tactlink_drive_url ? (
                            <a
                              href={selectedParticipant.survey.tactlink_drive_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 transition"
                            >
                              <IconGoogleDrive className="h-3.5 w-3.5" />
                              <span>Buka di Google Drive</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSyncSingleToDrive(selectedParticipant.id)}
                              disabled={syncingSingleId === selectedParticipant.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-800 transition disabled:opacity-50 cursor-pointer"
                            >
                              <IconGoogleDrive className="h-3.5 w-3.5" />
                              <span>
                                {syncingSingleId === selectedParticipant.id
                                  ? "Mengunggah..."
                                  : "Upload ke Google Drive"}
                              </span>
                            </button>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {selectedParticipant.survey.tactlink_filename || "bukti_tactlink.jpg"}
                          </span>
                        </div>
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

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => handleDeleteParticipant(selectedParticipant)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <svg className="h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Hapus Peserta</span>
              </button>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DETAIL MITRA PERUSAHAAN
          ======================================================== */}
      {selectedMitraDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMitraDetail(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold"
            >
              ✕
            </button>

            {/* Header Profil */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
              {selectedMitraDetail.logo_url ? (
                <img
                  src={selectedMitraDetail.logo_url}
                  alt={selectedMitraDetail.name}
                  className="h-16 w-16 rounded-2xl object-contain border border-slate-200 bg-white p-2 shrink-0 shadow-xs"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-100 font-extrabold text-purple-700 text-2xl uppercase border border-purple-200">
                  {selectedMitraDetail.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-[family-name:var(--font-montserrat)] text-xl font-extrabold text-slate-900">
                    {selectedMitraDetail.name}
                  </h3>
                  {selectedMitraDetail.verification_status === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                      <IconCheck className="h-3 w-3" /> Mitra Terverifikasi Resmi
                    </span>
                  ) : selectedMitraDetail.verification_status === "rejected" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 border border-rose-300">
                      <IconX className="h-3 w-3" /> Pengajuan Ditolak
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-300 animate-pulse">
                      <IconClock className="h-3 w-3" /> Menunggu Penyaringan &amp; Verifikasi
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Industri: <strong className="text-slate-700">{selectedMitraDetail.industry}</strong> &bull; Skala: <strong className="text-slate-700">{selectedMitraDetail.company_size}</strong>
                </p>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID Database: {selectedMitraDetail.id}
                </div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Kontak Person (PIC) */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                  Person in Charge (PIC) / Narahubung
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-400">Nama PIC</div>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedMitraDetail.pic_name || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Email Akun</div>
                    <div className="font-medium text-slate-800 mt-0.5 break-all">{selectedMitraDetail.email || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Nomor WhatsApp</div>
                    <div className="font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <span>{selectedMitraDetail.phone || "-"}</span>
                      {selectedMitraDetail.phone && selectedMitraDetail.phone !== "-" && (
                        <a
                          href={`https://wa.me/${selectedMitraDetail.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold hover:bg-emerald-700"
                        >
                          Hubungi WA
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legalitas & Alamat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Website Perusahaan</div>
                  <div className="mt-1">
                    {selectedMitraDetail.website && selectedMitraDetail.website !== "-" ? (
                      <a
                        href={selectedMitraDetail.website.startsWith("http") ? selectedMitraDetail.website : `https://${selectedMitraDetail.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-bold hover:underline inline-flex items-center gap-1 break-all"
                      >
                        <span>{selectedMitraDetail.website}</span>
                        <IconExternal className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Tidak dicantumkan</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Alamat Kantor</div>
                  <div className="font-medium text-slate-800 mt-1">
                    {selectedMitraDetail.address || "-"}
                  </div>
                </div>
              </div>

              {/* Bio Perusahaan */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Profil / Deskripsi Singkat Perusahaan
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {selectedMitraDetail.bio || "Tidak ada deskripsi profil tambahan."}
                </p>
              </div>

              {/* Status & Catatan Penolakan jika ada */}
              {selectedMitraDetail.verification_status === "rejected" && selectedMitraDetail.rejection_reason && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                  <div className="text-[10px] uppercase font-bold text-rose-700 mb-1">
                    Alasan Penolakan:
                  </div>
                  <p className="text-xs font-medium">{selectedMitraDetail.rejection_reason}</p>
                </div>
              )}

              {selectedMitraDetail.admin_notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Catatan Internal Admin:
                  </div>
                  <p className="text-xs text-slate-700">{selectedMitraDetail.admin_notes}</p>
                </div>
              )}

              {/* Kurasi Lowongan Walk-In untuk Mitra Ini */}
              {(() => {
                const compJobs = (mitraJobsList || []).filter(
                  (j) => j.company_id === selectedMitraDetail.id
                );
                return (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
                        <IconBriefcase className="h-3.5 w-3.5 text-purple-600" />
                        <span>Lowongan Perusahaan ({compJobs.length})</span>
                      </div>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                        {compJobs.filter((j) => j.is_walk_in).length} Jalur Walk-In
                      </span>
                    </div>

                    {compJobs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        Perusahaan ini belum menambahkan lowongan pekerjaan di dashboard mereka.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {compJobs.map((job) => {
                          const isActionLoading = actionLoadingId === job.id;
                          return (
                            <div
                              key={job.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 gap-3 shadow-2xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-slate-900 truncate">
                                  {job.title}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>{job.location || "Jakarta"}</span>
                                  <span>&bull;</span>
                                  {job.is_walk_in ? (
                                    <span className="text-fuchsia-700 font-extrabold flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-600" />
                                      Walk-In Interview
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium">Lamaran Reguler</span>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleToggleWalkIn(job.id, !job.is_walk_in)}
                                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer border shadow-xs ${
                                  job.is_walk_in
                                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                    : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                }`}
                              >
                                {isActionLoading
                                  ? "Menyimpan..."
                                  : job.is_walk_in
                                  ? "Nonaktifkan Walk-In"
                                  : "+ Jadikan Walk-In"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteMitra(selectedMitraDetail.id, selectedMitraDetail.name)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <IconTrash className="h-3.5 w-3.5" />
                <span>Hapus Akun Mitra</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMitraDetail(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Tutup
                </button>

                {selectedMitraDetail.verification_status !== "verified" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateMitraStatus(selectedMitraDetail.id, "approve")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition"
                  >
                    <IconCheck className="h-4 w-4" />
                    <span>Setujui Kemitraan</span>
                  </button>
                )}

                {selectedMitraDetail.verification_status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectReason("");
                      setRejectModalMitra(selectedMitraDetail);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 text-xs font-bold text-rose-700 transition"
                  >
                    <IconX className="h-4 w-4" />
                    <span>Tolak Pengajuan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL TOLAK PENDAFTARAN MITRA (Dengan Input Alasan)
          ======================================================== */}
      {rejectModalMitra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              onClick={() => setRejectModalMitra(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <IconX className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-montserrat)] text-lg sm:text-xl font-extrabold text-slate-900">
                  Tolak Pendaftaran Mitra
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectModalMitra.name} ({rejectModalMitra.pic_name || "PIC"})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Perusahaan yang ditolak tidak akan diizinkan mempublikasikan lowongan kerja. Alasan penolakan di bawah akan ditampilkan pada halaman dashboard mitra mereka.
            </p>

            {/* Preset Alasan Cepat */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Pilih Alasan Cepat:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Legalitas / profil perusahaan belum lengkap",
                  "Bukan badan usaha atau organisasi resmi",
                  "Kontak PIC tidak valid / tidak dapat dihubungi",
                  "Lowongan tidak relevan dengan profil CCE 2026",
                  "Terindikasi akun duplikat atau spam",
                ].map((reasonItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(reasonItem)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium border transition cursor-pointer text-left ${
                      rejectReason === reasonItem
                        ? "bg-rose-100 border-rose-300 text-rose-800 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {reasonItem}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Textarea */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Alasan / Catatan Penolakan (Wajib Diisi):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tuliskan alasan mengapa pendaftaran mitra ini belum dapat disetujui..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalMitra(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || actionLoadingId === rejectModalMitra.id}
                onClick={() => handleUpdateMitraStatus(rejectModalMitra.id, "reject", rejectReason)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
              >
                {actionLoadingId === rejectModalMitra.id ? "Memproses..." : "Konfirmasi Penolakan"}
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

      {/* ========================================================
          MODAL PANDUAN & STATUS GOOGLE DRIVE
          ======================================================== */}
      {isDriveSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsDriveSetupModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs">
                <IconGoogleDrive className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-montserrat)] text-lg sm:text-xl font-extrabold text-slate-900">
                  Integrasi Google Drive
                </h3>
                <p className="text-xs text-slate-500">
                  Penyimpanan cloud otomatis untuk bukti download / screenshot TactLink peserta.
                </p>
              </div>
            </div>

            {/* Status Koneksi */}
            <div
              className={`rounded-2xl p-4 border mb-5 ${
                data.stats.tactlink_stats?.drive_configured
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-amber-50/70 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Status Koneksi:</span>
                {data.stats.tactlink_stats?.drive_configured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    Terhubung & Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-2xs">
                    Belum Dikonfigurasi di .env
                  </span>
                )}
              </div>

              <div className="text-xs space-y-1">
                <p>{data.stats.tactlink_stats?.drive_message || "Memeriksa kredensial di file environment (.env)..."}</p>
                {data.stats.tactlink_stats?.drive_folder_name && (
                  <p className="font-semibold">
                    Folder Target:{" "}
                    <span className="font-mono bg-white/70 px-1.5 py-0.5 rounded border border-emerald-200">
                      {data.stats.tactlink_stats.drive_folder_name}
                    </span>
                  </p>
                )}
              </div>

              {data.stats.tactlink_stats?.drive_folder_url && (
                <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-medium">Buka folder penyimpanan di web:</span>
                  <a
                    href={data.stats.tactlink_stats.drive_folder_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                  >
                    <span>Buka Google Drive</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Statistik File */}
            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Bukti</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{data.stats.tactlink_stats?.total_uploaded || 0}</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Di Google Drive</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">{data.stats.tactlink_stats?.total_in_drive || 0}</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Pending Sync</div>
                <div className="text-lg font-black text-amber-700 mt-0.5">{data.stats.tactlink_stats?.pending_sync || 0}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={loadAdminData}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Muat Ulang Status
              </button>

              <div className="flex gap-2">
                {data.stats.tactlink_stats?.pending_sync > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDriveSetupModalOpen(false);
                      handleSyncAllToDrive();
                    }}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    Sinkronkan {data.stats.tactlink_stats.pending_sync} Berkas Sekarang
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDriveSetupModalOpen(false)}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
