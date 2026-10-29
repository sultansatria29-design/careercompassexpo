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

// POST: Register, Login, Get Profile, Update Profile
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const supabase = getSupabase();

    // 1. REGISTER PERUSAHAAN BARU
    if (action === "register") {
      const {
        name,
        email,
        password,
        phone,
        pic_name,
        industry,
        website,
        address,
        company_size,
        bio,
        logo_url,
      } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "Nama perusahaan, email, dan password wajib diisi." },
          { status: 400 }
        );
      }

      // Cek apakah perusahaan dengan email ini sudah ada
      const { data: existingCompanies } = await supabase
        .from("companies")
        .select("id, name, description");

      const alreadyExists = (existingCompanies || []).some((c) => {
        try {
          const meta = typeof c.description === "string" ? JSON.parse(c.description) : c.description;
          return meta && meta.email && meta.email.toLowerCase() === email.toLowerCase();
        } catch {
          return false;
        }
      });

      if (alreadyExists) {
        return NextResponse.json(
          { error: "Email perusahaan ini sudah terdaftar. Silakan gunakan menu Masuk." },
          { status: 400 }
        );
      }

      // Simpan metadata lengkap ke dalam JSON description
      const metaPayload = {
        email: email.trim().toLowerCase(),
        password: password, // In production could be hashed
        phone: phone || "",
        pic_name: pic_name || "",
        industry: industry || "Teknologi & Informasi",
        address: address || "",
        company_size: company_size || "51-200 Karyawan",
        bio: bio || "",
        registered_at: new Date().toISOString(),
      };

      const { data: newCompany, error: insertErr } = await supabase
        .from("companies")
        .insert({
          name: name.trim(),
          description: JSON.stringify(metaPayload),
          website: website || "",
          logo_url: logo_url || "",
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      return NextResponse.json({
        success: true,
        message: "Pendaftaran kemitraan berhasil! Selamat datang di Career Campus Expo 2026.",
        company: {
          id: newCompany.id,
          name: newCompany.name,
          website: newCompany.website,
          logo_url: newCompany.logo_url,
          ...metaPayload,
        },
      });
    }

    // 2. LOGIN PERUSAHAAN
    if (action === "login") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email dan password wajib diisi." },
          { status: 400 }
        );
      }

      const { data: companies, error: fetchErr } = await supabase
        .from("companies")
        .select("id, name, description, website, logo_url, created_at");

      if (fetchErr) throw fetchErr;

      const matched = (companies || []).find((c) => {
        try {
          const meta = typeof c.description === "string" ? JSON.parse(c.description) : c.description;
          return (
            meta &&
            meta.email &&
            meta.email.toLowerCase() === email.toLowerCase().trim() &&
            meta.password === password
          );
        } catch {
          return false;
        }
      });

      if (!matched) {
        return NextResponse.json(
          { error: "Email atau password perusahaan tidak cocok. Pastikan data yang dimasukkan benar." },
          { status: 401 }
        );
      }

      let meta = {};
      try {
        meta = typeof matched.description === "string" ? JSON.parse(matched.description) : matched.description;
      } catch {
        meta = {};
      }

      return NextResponse.json({
        success: true,
        message: `Selamat datang kembali, ${matched.name}!`,
        company: {
          id: matched.id,
          name: matched.name,
          website: matched.website,
          logo_url: matched.logo_url,
          created_at: matched.created_at,
          ...meta,
        },
      });
    }

    // 3. GET COMPANY BY ID
    if (action === "get_profile") {
      const { company_id } = body;
      if (!company_id) {
        return NextResponse.json({ error: "Company ID diperlukan." }, { status: 400 });
      }

      const { data: company, error: cErr } = await supabase
        .from("companies")
        .select("id, name, description, website, logo_url, created_at")
        .eq("id", company_id)
        .single();

      if (cErr || !company) {
        return NextResponse.json({ error: "Perusahaan tidak ditemukan." }, { status: 404 });
      }

      let meta = {};
      try {
        meta = typeof company.description === "string" ? JSON.parse(company.description) : company.description;
      } catch {
        meta = {};
      }

      return NextResponse.json({
        success: true,
        company: {
          id: company.id,
          name: company.name,
          website: company.website,
          logo_url: company.logo_url,
          created_at: company.created_at,
          ...meta,
        },
      });
    }

    // 4. UPDATE COMPANY PROFILE
    if (action === "update_profile") {
      const { company_id, name, website, logo_url, industry, address, company_size, bio, pic_name, phone } = body;

      if (!company_id) {
        return NextResponse.json({ error: "Company ID diperlukan." }, { status: 400 });
      }

      const { data: existing, error: eErr } = await supabase
        .from("companies")
        .select("*")
        .eq("id", company_id)
        .single();

      if (eErr || !existing) {
        return NextResponse.json({ error: "Perusahaan tidak ditemukan." }, { status: 404 });
      }

      let prevMeta = {};
      try {
        prevMeta = typeof existing.description === "string" ? JSON.parse(existing.description) : existing.description;
      } catch {
        prevMeta = {};
      }

      const updatedMeta = {
        ...prevMeta,
        industry: industry !== undefined ? industry : prevMeta.industry,
        address: address !== undefined ? address : prevMeta.address,
        company_size: company_size !== undefined ? company_size : prevMeta.company_size,
        bio: bio !== undefined ? bio : prevMeta.bio,
        pic_name: pic_name !== undefined ? pic_name : prevMeta.pic_name,
        phone: phone !== undefined ? phone : prevMeta.phone,
      };

      const { data: updated, error: uErr } = await supabase
        .from("companies")
        .update({
          name: name ? name.trim() : existing.name,
          website: website !== undefined ? website : existing.website,
          logo_url: logo_url !== undefined ? logo_url : existing.logo_url,
          description: JSON.stringify(updatedMeta),
        })
        .eq("id", company_id)
        .select()
        .single();

      if (uErr) throw uErr;

      return NextResponse.json({
        success: true,
        message: "Profil perusahaan berhasil diperbarui.",
        company: {
          id: updated.id,
          name: updated.name,
          website: updated.website,
          logo_url: updated.logo_url,
          ...updatedMeta,
        },
      });
    }

    return NextResponse.json({ error: "Action tidak dikenali." }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/mitra/auth:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
