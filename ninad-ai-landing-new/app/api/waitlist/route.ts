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
      | { email?: string; source?: string }
      | null;

    const email = (body?.email || "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("waitlist_subscribers").insert({
      email,
    });

    if (error) {
      // If you later add a UNIQUE(email) constraint, treat duplicates as success.
      // Postgres unique violation is 23505.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorCode = (error as any)?.code as string | undefined;
      if (errorCode === "23505") {
        return NextResponse.json({ ok: true, message: "You’re on the waitlist." });
      }
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, message: "You’re on the waitlist." });
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
