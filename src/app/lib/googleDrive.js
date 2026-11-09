import { google } from "googleapis";
import { Readable } from "stream";

/**
 * Parsing data URL base64 menjadi Buffer dan mimeType
 */
export function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      buffer: Buffer.from(match[2], "base64"),
    };
  }
  return null;
}

/**
 * Generate thumbnail / preview image URL dari Google Drive File ID
 */
export function getDriveThumbnailUrl(fileId) {
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * Generate view URL Google Drive
 */
export function getDriveViewUrl(fileId) {
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
}

/**
 * Dapatkan Google Drive client instance menggunakan Service Account
 */
export function getGoogleDriveClient() {
  let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      clientEmail = parsed.client_email || clientEmail;
      privateKey = parsed.private_key || privateKey;
    } catch (err) {
      console.error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON:", err);
    }
  }

  if (!clientEmail || !privateKey) {
    return null;
  }

  // Handle format private key newline jika di-escape (\n) dan hilangkan tanda kutip pembungkus
  const formattedPrivateKey = privateKey
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: formattedPrivateKey,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Periksa status konfigurasi Google Drive
 */
export async function checkGoogleDriveConfig() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL;
  const drive = getGoogleDriveClient();

  if (!drive && !webhookUrl) {
    return {
      configured: false,
      mode: "none",
      message: "Google Drive belum dikonfigurasi. Masukkan GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_PRIVATE_KEY di .env",
      folderId: folderId || null,
      folderUrl: folderId ? `https://drive.google.com/drive/folders/${folderId}` : null,
    };
  }

  // Jika menggunakan Webhook Apps Script
  if (webhookUrl && !drive) {
    return {
      configured: true,
      mode: "webhook",
      folderId: folderId || null,
      folderUrl: folderId ? `https://drive.google.com/drive/folders/${folderId}` : null,
      message: "Terhubung via Google Apps Script Webhook",
    };
  }

  // Jika menggunakan Service Account resmi
  try {
    let folderName = "Folder Bukti TactLink";
    if (folderId) {
      try {
        const folderRes = await drive.files.get({
          fileId: folderId,
          fields: "id, name, webViewLink",
          supportsAllDrives: true,
        });
        folderName = folderRes.data.name || folderName;
      } catch (fErr) {
        console.warn("Peringatan membaca folder Google Drive:", fErr.message);
      }
    }

    return {
      configured: true,
      mode: "service_account",
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      folderId: folderId || null,
      folderName,
      folderUrl: folderId ? `https://drive.google.com/drive/folders/${folderId}` : null,
      message: "Google Drive Service Account aktif dan siap menyimpan berkas",
    };
  } catch (err) {
    return {
      configured: false,
      mode: "error",
      message: `Gagal mengautentikasi Google Drive: ${err.message}`,
      folderId: folderId || null,
      folderUrl: folderId ? `https://drive.google.com/drive/folders/${folderId}` : null,
    };
  }
}

/**
 * Upload file buffer ke Google Drive
 */
export async function uploadToGoogleDrive({
  buffer,
  fileName,
  mimeType = "image/jpeg",
  participantName = "Peserta",
  registrationNumber = "REG",
  email = "-",
}) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL;
  const drive = getGoogleDriveClient();

  if (!drive && !webhookUrl) {
    throw new Error("Koneksi Google Drive belum dikonfigurasi pada .env");
  }

  // 1. Opsi Webhook Apps Script (Prioritas utama jika dipasang, cocok untuk akun personal Gmail)
  if (webhookUrl) {
    const base64Data = buffer.toString("base64");
    const cleanReg = (registrationNumber || "REG").replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanName = (participantName || "Peserta").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
    const ext = fileName ? fileName.split(".").pop() : (mimeType.includes("png") ? "png" : "jpg");
    const driveFileName = `[${cleanReg}] ${cleanName} - Bukti TactLink.${ext}`;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: driveFileName,
        mimeType: mimeType || "image/jpeg",
        base64: base64Data,
        folderId: folderId || undefined,
        participantName,
        registrationNumber,
        email,
      }),
      redirect: "follow",
    });

    const data = await res.json();
    if (!data.success && data.error) {
      throw new Error(data.error || "Gagal upload via Google Drive Webhook");
    }

    return {
      success: true,
      fileId: data.fileId || null,
      fileName: data.fileName || driveFileName,
      webViewLink: data.webViewLink || data.url || (data.fileId ? getDriveViewUrl(data.fileId) : null),
      thumbnailLink: data.fileId ? getDriveThumbnailUrl(data.fileId) : null,
      storage: "google_drive",
    };
  }

  // 2. Opsi Service Account Google Drive API (Cocok untuk Google Workspace Shared Drive)
  const cleanReg = (registrationNumber || "REG").replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanName = (participantName || "Peserta").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
  const ext = fileName ? fileName.split(".").pop() : (mimeType.includes("png") ? "png" : "jpg");
  const driveFileName = `[${cleanReg}] ${cleanName} - Bukti TactLink.${ext}`;

  const stream = Readable.from(buffer);

  const fileMetadata = {
    name: driveFileName,
    description: `Bukti Download TactLink Career Compass Expo 2026\nNama: ${participantName}\nNo. Registrasi: ${registrationNumber}\nEmail: ${email}\nDiunggah: ${new Date().toISOString()}`,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType: mimeType || "image/jpeg",
    body: stream,
  };

  try {
    const createRes = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink, webContentLink, thumbnailLink",
      supportsAllDrives: true,
    });

    const fileId = createRes.data.id;

    // Izinkan akses pembacaan tautan file (Anyone with link can view)
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true,
      });
    } catch (permErr) {
      console.warn("Info izin file Google Drive:", permErr.message);
    }

    const webViewLink = createRes.data.webViewLink || getDriveViewUrl(fileId);
    const thumbnailLink = getDriveThumbnailUrl(fileId);

    return {
      success: true,
      fileId: fileId,
      fileName: driveFileName,
      webViewLink: webViewLink,
      webContentLink: createRes.data.webContentLink,
      thumbnailLink: thumbnailLink,
      storage: "google_drive",
    };
  } catch (err) {
    if (err.message && err.message.includes("Service Accounts do not have storage quota")) {
      throw new Error(
        "Google Drive membatasi upload Service Account ke folder personal (My Drive). Pindahkan folder ke 'Shared Drive' (Drive Bersama) di Google Workspace, atau pasang URL Webhook Google Apps Script di GOOGLE_DRIVE_WEBHOOK_URL."
      );
    }
    throw err;
  }
}
