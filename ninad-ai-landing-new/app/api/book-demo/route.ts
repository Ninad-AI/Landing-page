import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          name?: string;
          email?: string;
          phone?: string;
          company?: string;
          message?: string;
        }
      | null;

    const name = (body?.name || "").trim().slice(0, 120);
    const email = (body?.email || "").trim().toLowerCase();
    const phone = (body?.phone || "").trim().slice(0, 40);
    const company = (body?.company || "").trim().slice(0, 160);
    const message = (body?.message || "").trim().slice(0, 2000);

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Please enter your name." },
        { status: 400 },
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Please enter a phone number." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("demo_requests").insert({
      name,
      email,
      phone,
      company: company || null,
      message: message || null,
    });

    if (error) {
      // If the DB schema doesn't have the `message` column yet, retry without it.
      if (typeof error.message === "string" && error.message.toLowerCase().includes("message")) {
        const retry = await supabase.from("demo_requests").insert({
          name,
          email,
          phone,
          company: company || null,
        });
        if (!retry.error) {
          return NextResponse.json({
            ok: true,
            message: "Thanks — we’ll email you to schedule a demo.",
          });
        }
      }
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Thanks — we’ll email you to schedule a demo.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unexpected error",
      },
      { status: 500 },
    );
  }
}
