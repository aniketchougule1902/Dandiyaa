import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase-admin";
import { eventUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const [{ data: event, error }, { data: participants }] = await Promise.all([
    supabase.from("event_config").select("*").eq("id", 1).single(),
    supabase.from("participants").select("college,status")
  ]);

  if (error) return NextResponse.json({ error: "Unable to load event." }, { status: 500 });

  const stats = (participants ?? []).reduce(
    (acc, p) => {
      acc.total += 1;
      if (p.college === "pccoe") acc.pccoe += 1;
      if (p.college === "dyp") acc.dyp += 1;
      if (p.status === "waiting") acc.waiting += 1;
      return acc;
    },
    { total: 0, pccoe: 0, dyp: 0, waiting: 0 }
  );

  return NextResponse.json({ event, stats });
}

export async function POST(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = eventUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event settings." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("event_config")
    .update({
      title: parsed.data.title,
      registration_closes_at: parsed.data.registrationClosesAt,
      status: new Date(parsed.data.registrationClosesAt).getTime() > Date.now() ? "open" : "closed",
      updated_at: new Date().toISOString()
    })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: "Could not update event." }, { status: 500 });

  await supabase.from("admin_audit").insert({
    action: "update_event",
    metadata: { registrationClosesAt: parsed.data.registrationClosesAt }
  });

  return NextResponse.json({ ok: true });
}
