import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();

  const [{ data: event, error: eventError }, { count, error: countError }] =
    await Promise.all([
      supabase.from("event_config").select("title,registration_closes_at,status").eq("id", 1).single(),
      supabase.from("participants").select("id", { count: "exact", head: true })
    ]);

  if (eventError || countError) {
    return NextResponse.json({ error: "Event configuration unavailable." }, { status: 503 });
  }

  return NextResponse.json({
    title: event.title,
    registrationClosesAt: event.registration_closes_at,
    status: event.status,
    registrations: count ?? 0
  });
}
