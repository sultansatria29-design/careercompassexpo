import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkGoogleDriveConfig,
  uploadToGoogleDrive,
  parseDataUrl,
} from "@/app/lib/googleDrive";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// GET: Cek status Google Drive & statistik bukti TactLink
export async function GET() {
  try {
    const config = await checkGoogleDriveConfig();
    const supabase = getSupabase();

    // Hitung statistik berkas bukti TactLink di database
    const { data: surveys, error: sErr } = await supabase
      .from("surveys")
      .select("id, participant_id, feedback");

    let totalUploaded = 0;
    let totalInDrive = 0;
    let pendingSync = 0;

    if (!sErr && surveys) {
      surveys.forEach((s) => {
        let feedback = {};
        if (s.feedback) {
          try {
            feedback = typeof s.feedback === "string" ? JSON.parse(s.feedback) : s.feedback;
          } catch {
            feedback = {};
          }
        }

        if (feedback.tactlink_proof) {
          totalUploaded++;
          if (feedback.tactlink_drive_id || feedback.tactlink_storage === "google_drive") {
            totalInDrive++;
          } else {
            pendingSync++;
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      config,
      stats: {
        totalUploaded,
        totalInDrive,
        pendingSync,
      },
    });
  } catch (err) {
    console.error("Error in /api/admin/drive GET:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// POST: Sinkronisasi bukti TactLink ke Google Drive
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "sync_all";
    const supabase = getSupabase();

    // 1. Sinkronisasi satu peserta spesifik
    if (action === "sync_single") {
      const participantId = body.participant_id;
      if (!participantId) {
        return NextResponse.json(
          { error: "participant_id wajib diisi." },
          { status: 400 }
        );
      }

      // Ambil data peserta dan survei
      const { data: participant } = await supabase
        .from("participants")
        .select("id, registration_number, full_name, email")
        .eq("id", participantId)
        .single();

      const { data: survey } = await supabase
        .from("surveys")
        .select("id, feedback")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!survey) {
        return NextResponse.json(
          { error: "Data survei pendaftar tidak ditemukan." },
          { status: 404 }
        );
      }

      let feedback = {};
      try {
        feedback = typeof survey.feedback === "string" ? JSON.parse(survey.feedback) : (survey.feedback || {});
      } catch {
        feedback = {};
      }

      if (!feedback.tactlink_proof) {
        return NextResponse.json(
          { error: "Peserta ini belum mengunggah bukti TactLink." },
          { status: 400 }
        );
      }

      // Dapatkan buffer gambar
      let buffer = null;
      let mimeType = "image/jpeg";
      const proofStr = feedback.tactlink_proof;

      if (proofStr.startsWith("data:")) {
        const parsed = parseDataUrl(proofStr);
        if (parsed) {
          buffer = parsed.buffer;
          mimeType = parsed.mimeType;
        }
      } else if (proofStr.startsWith("http://") || proofStr.startsWith("https://")) {
        const fetchRes = await fetch(proofStr);
        if (fetchRes.ok) {
          buffer = Buffer.from(await fetchRes.arrayBuffer());
          mimeType = fetchRes.headers.get("content-type") || "image/jpeg";
        }
      }

      if (!buffer) {
        return NextResponse.json(
          { error: "Format berkas bukti tidak dapat dibaca untuk diunggah." },
          { status: 400 }
        );
      }

      const driveRes = await uploadToGoogleDrive({
        buffer,
        fileName: feedback.tactlink_filename || "bukti_tactlink.jpg",
        mimeType,
        participantName: participant?.full_name || "Peserta CCE",
        registrationNumber: participant?.registration_number || "REG",
        email: participant?.email || "-",
      });

      // Update feedback dengan link Google Drive
      const updatedFeedback = {
        ...feedback,
        tactlink_proof: driveRes.webViewLink || feedback.tactlink_proof,
        tactlink_drive_url: driveRes.webViewLink,
        tactlink_drive_id: driveRes.fileId,
        tactlink_drive_thumb: driveRes.thumbnailLink,
        tactlink_storage: "google_drive",
        tactlink_synced_at: new Date().toISOString(),
      };

      await supabase
        .from("surveys")
        .update({ feedback: JSON.stringify(updatedFeedback) })
        .eq("id", survey.id);

      return NextResponse.json({
        success: true,
        message: "Bukti TactLink berhasil diunggah ke Google Drive!",
        drive: driveRes,
      });
    }

    // 2. Sinkronisasi masal (sync_all) seluruh bukti yang belum ada di Google Drive
    if (action === "sync_all") {
      const { data: surveys, error: sErr } = await supabase
        .from("surveys")
        .select("id, participant_id, feedback")
        .not("participant_id", "is", null);

      if (sErr) throw sErr;

      // Ambil map peserta
      const { data: participants } = await supabase
        .from("participants")
        .select("id, registration_number, full_name, email");

      const pMap = {};
      (participants || []).forEach((p) => {
        pMap[p.id] = p;
      });

      let syncedCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const survey of (surveys || [])) {
        let feedback = {};
        try {
          feedback = typeof survey.feedback === "string" ? JSON.parse(survey.feedback) : (survey.feedback || {});
        } catch {
          feedback = {};
        }

        // Jika ada bukti tapi belum di Google Drive
        if (
          feedback.tactlink_proof &&
          !feedback.tactlink_drive_id &&
          feedback.tactlink_storage !== "google_drive"
        ) {
          try {
            const p = pMap[survey.participant_id] || {};
            let buffer = null;
            let mimeType = "image/jpeg";
            const proofStr = feedback.tactlink_proof;

            if (proofStr.startsWith("data:")) {
              const parsed = parseDataUrl(proofStr);
              if (parsed) {
                buffer = parsed.buffer;
                mimeType = parsed.mimeType;
              }
            } else if (proofStr.startsWith("http://") || proofStr.startsWith("https://")) {
              const fetchRes = await fetch(proofStr);
              if (fetchRes.ok) {
                buffer = Buffer.from(await fetchRes.arrayBuffer());
                mimeType = fetchRes.headers.get("content-type") || "image/jpeg";
              }
            }

            if (buffer) {
              const driveRes = await uploadToGoogleDrive({
                buffer,
                fileName: feedback.tactlink_filename || "bukti_tactlink.jpg",
                mimeType,
                participantName: p.full_name || "Peserta CCE",
                registrationNumber: p.registration_number || "REG",
                email: p.email || "-",
              });

              const updatedFeedback = {
                ...feedback,
                tactlink_proof: driveRes.webViewLink || feedback.tactlink_proof,
                tactlink_drive_url: driveRes.webViewLink,
                tactlink_drive_id: driveRes.fileId,
                tactlink_drive_thumb: driveRes.thumbnailLink,
                tactlink_storage: "google_drive",
                tactlink_synced_at: new Date().toISOString(),
              };

              await supabase
                .from("surveys")
                .update({ feedback: JSON.stringify(updatedFeedback) })
                .eq("id", survey.id);

              syncedCount++;
            }
          } catch (err) {
            failedCount++;
            errors.push(`${survey.participant_id}: ${err.message}`);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Sinkronisasi selesai: ${syncedCount} berkas berhasil diunggah ke Google Drive.${
          failedCount > 0 ? ` (${failedCount} gagal)` : ""
        }`,
        syncedCount,
        failedCount,
        errors: errors.slice(0, 5),
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/admin/drive POST:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
