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

// GET: Ambil daftar pelamar untuk lowongan milik perusahaan
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get("company_id");
    const job_id = searchParams.get("job_id");

    if (!company_id) {
      return NextResponse.json(
        { error: "Company ID diperlukan." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 1. Ambil seluruh job id milik perusahaan ini
    let jobsQuery = supabase.from("jobs").select("id, title, employment_type, location").eq("company_id", company_id);
    if (job_id && job_id !== "all") {
      jobsQuery = jobsQuery.eq("id", job_id);
    }
    const { data: companyJobs, error: jErr } = await jobsQuery;
    if (jErr) throw jErr;

    const jobMap = {};
    (companyJobs || []).forEach((j) => {
      jobMap[j.id] = j;
    });

    const targetJobIds = Object.keys(jobMap);
    if (targetJobIds.length === 0) {
      return NextResponse.json({
        success: true,
        applicants: [],
      });
    }

    // 2. Ambil seluruh applications untuk lowongan-lowongan ini
    const { data: apps, error: aErr } = await supabase
      .from("applications")
      .select("*")
      .in("job_id", targetJobIds)
      .order("created_at", { ascending: false });

    if (aErr) throw aErr;

    // 3. Ambil data peserta (participants)
    const participantIds = Array.from(new Set((apps || []).map((a) => a.participant_id).filter(Boolean)));
    let participantMap = {};

    if (participantIds.length > 0) {
      const { data: parts, error: pErr } = await supabase
        .from("participants")
        .select("id, registration_number, full_name, email, phone, domicile, participant_status, institution, created_at")
        .in("id", participantIds);

      if (!pErr && parts) {
        parts.forEach((p) => {
          participantMap[p.id] = p;
        });
      }
    }

    // 4. Ambil data interview jika ada
    const appIds = (apps || []).map((a) => a.id);
    let interviewMap = {};
    if (appIds.length > 0) {
      const { data: ints, error: iErr } = await supabase
        .from("interviews")
        .select("*")
        .in("application_id", appIds);

      if (!iErr && ints) {
        ints.forEach((item) => {
          interviewMap[item.application_id] = item;
        });
      }
    }

    // Gabungkan data
    const enrichedApplicants = (apps || []).map((app) => {
      const participant = participantMap[app.participant_id] || {
        full_name: "Peserta CCE",
        email: "-",
        phone: "-",
        institution: "UIN Syarif Hidayatullah Jakarta",
        domicile: "Tangerang Selatan",
      };

      const job = jobMap[app.job_id] || {
        title: "Posisi Tidak Diketahui",
        employment_type: "Full-time",
      };

      const interview = interviewMap[app.id] || null;

      return {
        id: app.id,
        application_id: app.id,
        participant_id: app.participant_id,
        job_id: app.job_id,
        job_title: job.title,
        job_type: job.employment_type,
        full_name: participant.full_name,
        email: participant.email,
        phone: participant.phone,
        institution: participant.institution || "UIN Syarif Hidayatullah Jakarta",
        domicile: participant.domicile,
        registration_number: participant.registration_number,
        cv_path: app.cv_path,
        portfolio_url: app.portfolio_url,
        status: app.status || "submitted",
        applied_at: app.created_at,
        interview_date: interview?.interview_date || null,
        interview_notes: interview?.notes || null,
      };
    });

    return NextResponse.json({
      success: true,
      applicants: enrichedApplicants,
    });
  } catch (err) {
    console.error("Error in GET /api/mitra/applicants:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat data pelamar." },
      { status: 500 }
    );
  }
}

// PUT / PATCH: Update tahap seleksi si pelamar
export async function PUT(request) {
  try {
    const body = await request.json();
    const { application_id, status, interview_date, interview_notes, company_id } = body;

    if (!application_id || !status) {
      return NextResponse.json(
        { error: "Application ID dan Status/Tahap wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 1. Update status pada tabel applications
    const { data: updatedApp, error: uErr } = await supabase
      .from("applications")
      .update({ status: status })
      .eq("id", application_id)
      .select()
      .single();

    if (uErr) throw uErr;

    // 2. Jika tahap wawancara atau ada catatan interview, simpan ke tabel interviews
    if (status === "interview" || interview_date || interview_notes) {
      // Cek apakah sudah ada record di interviews
      const { data: existingInt } = await supabase
        .from("interviews")
        .select("id")
        .eq("application_id", application_id)
        .maybeSingle();

      if (existingInt) {
        await supabase
          .from("interviews")
          .update({
            status: status === "interview" ? "scheduled" : status,
            interview_date: interview_date || undefined,
            notes: interview_notes || undefined,
          })
          .eq("id", existingInt.id);
      } else if (company_id && updatedApp.participant_id) {
        await supabase.from("interviews").insert({
          application_id: application_id,
          participant_id: updatedApp.participant_id,
          company_id: company_id,
          status: "scheduled",
          interview_date: interview_date || new Date().toISOString().split("T")[0],
          notes: interview_notes || "Dijadwalkan untuk wawancara di Booth CCE 2026",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tahap seleksi berhasil diubah menjadi "${status.toUpperCase()}".`,
      application: updatedApp,
    });
  } catch (err) {
    console.error("Error in PUT /api/mitra/applicants:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui tahap pelamar." },
      { status: 500 }
    );
  }
}

// POST: Simulasi / Seed Pelamar Mahasiswa UIN Jakarta untuk Demo Langsung
export async function POST(request) {
  try {
    const body = await request.json();
    const { job_id, company_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: "Pilih lowongan untuk membuat simulasi pelamar." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const sampleCandidates = [
      {
        full_name: "Muhammad Fadhil Ramadhan",
        email: "fadhil.ramadhan@uinjkt.ac.id",
        phone: "081289123456",
        domicile: "Ciputat, Tangerang Selatan",
        institution: "UIN Syarif Hidayatullah Jakarta (Teknik Informatika)",
        participant_status: "ALUMNI",
        cv_path: "https://drive.google.com/file/d/cv-fadhil-uin/view",
        portfolio_url: "https://github.com/fadhil-uin",
        initial_status: "submitted",
      },
      {
        full_name: "Aisyah Nur Salsabila",
        email: "aisyah.salsabila@mhs.uinjkt.ac.id",
        phone: "081377889900",
        domicile: "Jakarta Selatan",
        institution: "UIN Syarif Hidayatullah Jakarta (Sistem Informasi)",
        participant_status: "MAHASISWA_UIN",
        cv_path: "https://drive.google.com/file/d/cv-aisyah-uin/view",
        portfolio_url: "https://linkedin.com/in/aisyah-salsa",
        initial_status: "screening",
      },
      {
        full_name: "Rizky Aditya Pratama",
        email: "rizky.aditya@mhs.uinjkt.ac.id",
        phone: "085712349876",
        domicile: "Depok, Jawa Barat",
        institution: "UIN Syarif Hidayatullah Jakarta (Manajemen Bisnis)",
        participant_status: "MAHASISWA_UIN",
        cv_path: "https://drive.google.com/file/d/cv-rizky-uin/view",
        portfolio_url: "https://behance.net/rizky-pratama",
        initial_status: "assessment",
      },
      {
        full_name: "Nabila Zahra Putri",
        email: "nabila.zahra@mhs.uinjkt.ac.id",
        phone: "082199881122",
        domicile: "Tangerang Kota",
        institution: "UIN Syarif Hidayatullah Jakarta (Ilmu Komunikasi)",
        participant_status: "MAHASISWA_UIN",
        cv_path: "https://drive.google.com/file/d/cv-nabila-uin/view",
        portfolio_url: "https://instagram.com/nabila.creative",
        initial_status: "interview",
      },
      {
        full_name: "Dimas Arya Wicaksana",
        email: "dimas.arya@mhs.uinjkt.ac.id",
        phone: "081822334455",
        domicile: "Jakarta Barat",
        institution: "UIN Syarif Hidayatullah Jakarta (Perbankan Syariah)",
        participant_status: "ALUMNI",
        cv_path: "https://drive.google.com/file/d/cv-dimas-uin/view",
        portfolio_url: "https://linkedin.com/in/dimas-arya",
        initial_status: "accepted",
      },
    ];

    let createdCount = 0;

    for (const cand of sampleCandidates) {
      // 1. Buat peserta jika belum ada
      let partId = null;
      const { data: existingPart } = await supabase
        .from("participants")
        .select("id")
        .eq("email", cand.email)
        .maybeSingle();

      if (existingPart) {
        partId = existingPart.id;
      } else {
        const { data: newPart, error: npErr } = await supabase
          .from("participants")
          .insert({
            full_name: cand.full_name,
            email: cand.email,
            phone: cand.phone,
            domicile: cand.domicile,
            institution: cand.institution,
            participant_status: cand.participant_status,
          })
          .select("id")
          .single();

        if (!npErr && newPart) {
          partId = newPart.id;
        }
      }

      if (partId) {
        // 2. Buat application jika belum ada
        const { data: existingApp } = await supabase
          .from("applications")
          .select("id")
          .eq("participant_id", partId)
          .eq("job_id", job_id)
          .maybeSingle();

        if (!existingApp) {
          await supabase.from("applications").insert({
            participant_id: partId,
            job_id: job_id,
            status: cand.initial_status,
            cv_path: cand.cv_path,
            portfolio_url: cand.portfolio_url,
          });
          createdCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${createdCount} profil pelamar simulasi mahasiswa UIN Jakarta. Anda sekarang dapat mencoba mencentang tahapan seleksinya!`,
    });
  } catch (err) {
    console.error("Error in POST /api/mitra/applicants:", err);
    return NextResponse.json(
      { error: err.message || "Gagal membuat pelamar simulasi." },
      { status: 500 }
    );
  }
}
