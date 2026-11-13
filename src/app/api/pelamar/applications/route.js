import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

const STAGE_LABELS = {
  submitted: "1. Berkas Masuk",
  reviewed: "2. Seleksi Berkas",
  screening: "2. Seleksi Berkas",
  shortlisted: "3. Wawancara / Walk-in Booth",
  assessment: "3. Wawancara / Walk-in Booth",
  interview: "3. Wawancara / Walk-in Booth",
  accepted: "4. Diterima / Offering",
  rejected: "Belum Memenuhi Syarat",
};

// GET: Ambil semua riwayat lamaran milik pelamar tertentu
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const participant_id = searchParams.get("participant_id");

    if (!participant_id) {
      return NextResponse.json(
        { error: "Participant ID diperlukan." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 1. Ambil data aplikasi pelamar
    const { data: apps, error: aErr } = await supabase
      .from("applications")
      .select("*")
      .eq("participant_id", participant_id)
      .order("created_at", { ascending: false });

    if (aErr) throw aErr;

    if (!apps || apps.length === 0) {
      return NextResponse.json({
        success: true,
        applications: [],
      });
    }

    // 2. Ambil data jobs
    const jobIds = apps.map((a) => a.job_id).filter(Boolean);
    let jobMap = {};
    let companyIds = [];

    if (jobIds.length > 0) {
      const { data: jobs, error: jErr } = await supabase
        .from("jobs")
        .select("id, company_id, title, location, employment_type, quota")
        .in("id", jobIds);

      if (!jErr && jobs) {
        jobs.forEach((j) => {
          jobMap[j.id] = j;
          if (j.company_id && !companyIds.includes(j.company_id)) {
            companyIds.push(j.company_id);
          }
        });
      }
    }

    // 3. Ambil data companies
    let companyMap = {};
    if (companyIds.length > 0) {
      const { data: comps, error: cErr } = await supabase
        .from("companies")
        .select("id, name, logo_url, website")
        .in("id", companyIds);

      if (!cErr && comps) {
        comps.forEach((c) => {
          companyMap[c.id] = c;
        });
      }
    }

    // 4. Ambil data interviews jika ada
    const appIds = apps.map((a) => a.id);
    let interviewMap = {};
    if (appIds.length > 0) {
      const { data: ints } = await supabase
        .from("interviews")
        .select("*")
        .in("application_id", appIds);

      if (ints) {
        ints.forEach((item) => {
          interviewMap[item.application_id] = item;
        });
      }
    }

    // 5. Gabungkan data
    const enriched = apps.map((app) => {
      const job = jobMap[app.job_id] || {
        title: "Posisi Pekerjaan",
        location: "Jakarta",
        employment_type: "Full-time",
      };
      const company = companyMap[job.company_id] || {
        name: "Perusahaan Mitra CCE",
        logo_url: "",
        website: "",
      };
      const interview = interviewMap[app.id] || null;

      const status = app.status || "submitted";

      return {
        id: app.id,
        application_id: app.id,
        job_id: app.job_id,
        job_title: job.title,
        job_location: job.location,
        employment_type: job.employment_type,
        company_id: job.company_id,
        company_name: company.name,
        company_logo: company.logo_url || "",
        company_website: company.website || "",
        status,
        status_label: STAGE_LABELS[status] || status,
        applied_at: app.created_at,
        cv_path: app.cv_path || "",
        portfolio_url: app.portfolio_url || "",
        interview_date: interview?.interview_date || null,
        interview_notes: interview?.notes || null,
      };
    });

    return NextResponse.json({
      success: true,
      applications: enriched,
    });
  } catch (err) {
    console.error("Error in GET /api/pelamar/applications:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat riwayat lamaran." },
      { status: 500 }
    );
  }
}

// POST: Kirim lamaran posisi baru (Walk-In Interview)
export async function POST(request) {
  try {
    const body = await request.json();
    const { participant_id, job_id, cv_path, portfolio_url, interview_day } = body;

    if (!participant_id) {
      return NextResponse.json(
        { error: "Akun pelamar belum login. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    if (!job_id) {
      return NextResponse.json(
        { error: "Pilih posisi lowongan yang ingin Anda lamar." },
        { status: 400 }
      );
    }

    if (!cv_path) {
      return NextResponse.json(
        { error: "Berkas CV wajib diunggah untuk melamar posisi walk-in interview." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Verifikasi peserta ada
    const { data: participant, error: pErr } = await supabase
      .from("participants")
      .select("id, full_name, email")
      .eq("id", participant_id)
      .single();

    if (pErr || !participant) {
      return NextResponse.json(
        { error: "valid. Silakan login kembali." },
        { status: 404 }
      );
    }

    // Verifikasi lowongan ada
    const { data: job, error: jErr } = await supabase
      .from("jobs")
      .select("id, title, company_id, companies(name)")
      .eq("id", job_id)
      .single();

    if (jErr || !job) {
      return NextResponse.json(
        { error: "Posisi lowongan tidak ditemukan atau sudah ditutup." },
        { status: 404 }
      );
    }

    const interviewDate = interview_day === "Kamis" ? "2026-11-19" : "2026-11-18";
    const interviewNotes = `Jadwal Walk-In: ${interview_day === "Kamis" ? "Kamis, 19 Nov 2026" : "Rabu, 18 Nov 2026"}`;

    // Cek apakah pelamar sudah pernah melamar ke lowongan ini
    const { data: existingApp } = await supabase
      .from("applications")
      .select("id, status")
      .eq("participant_id", participant_id)
      .eq("job_id", job_id)
      .maybeSingle();

    if (existingApp) {
      // Perbarui berkas CV dan portfolio lamaran yang sudah ada
      const { data: updated, error: uErr } = await supabase
        .from("applications")
        .update({
          cv_path,
          portfolio_url: portfolio_url || null,
        })
        .eq("id", existingApp.id)
        .select()
        .single();

      if (uErr) throw uErr;

      // Update / insert penjadwalan interview jika ada
      if (interview_day) {
        const { data: existingInt } = await supabase
          .from("interviews")
          .select("id")
          .eq("application_id", existingApp.id)
          .maybeSingle();

        if (existingInt) {
          await supabase
            .from("interviews")
            .update({
              interview_date: interviewDate,
              notes: interviewNotes,
            })
            .eq("id", existingInt.id);
        } else {
          await supabase.from("interviews").insert({
            application_id: existingApp.id,
            participant_id,
            company_id: job.company_id,
            status: "waiting",
            interview_date: interviewDate,
            notes: interviewNotes,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Berkas lamaran untuk posisi "${job.title}" di ${job.companies?.name || "perusahaan"} berhasil diperbarui!`,
        application_id: updated.id,
      });
    }

    // Simpan lamaran baru
    const { data: newApp, error: insErr } = await supabase
      .from("applications")
      .insert({
        participant_id,
        job_id,
        status: "submitted",
        cv_path,
        portfolio_url: portfolio_url || null,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    // Simpan jadwal interview jika ada interview_day
    if (interview_day) {
      await supabase.from("interviews").insert({
        application_id: newApp.id,
        participant_id,
        company_id: job.company_id,
        status: "waiting",
        interview_date: interviewDate,
        notes: interviewNotes,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Lamaran posisi "${job.title}" di ${job.companies?.name || "perusahaan"} berhasil dikirim! Silakan pantau tahapan prosesnya di dashboard.`,
      application_id: newApp.id,
    });
  } catch (err) {
    console.error("Error in POST /api/pelamar/applications:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengirim formulir lamaran." },
      { status: 500 }
    );
  }
}
