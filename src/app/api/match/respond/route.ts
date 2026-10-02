import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { matchResponseSchema } from "@/lib/validation";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const parsed = matchResponseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid response." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: me } = await supabase
    .from("participants")
    .select("id")
    .eq("claim_token_hash", hashToken(parsed.data.token))
    .single();

  if (!me) return NextResponse.json({ error: "Registration not found." }, { status: 404 });

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .or(`participant_a.eq.${me.id},participant_b.eq.${me.id}`)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ error: "No active match found." }, { status: 404 });
  }

  const mineIsA = match.participant_a === me.id;
  const partnerId = mineIsA ? match.participant_b : match.participant_a;
  const responseField = mineIsA ? "a_response" : "b_response";
  const action = parsed.data.action;

  if (action === "report" && !parsed.data.reason) {
    return NextResponse.json({ error: "Please include a short report reason." }, { status: 400 });
  }

  if (action === "accept") {
    const { error } = await supabase
      .from("matches")
      .update({ [responseField]: "accepted" })
      .eq("id", match.id);

    if (error) return NextResponse.json({ error: "Could not save response." }, { status: 500 });

    const { data: refreshed } = await supabase
      .from("matches")
      .select("a_response,b_response")
      .eq("id", match.id)
      .single();

    if (refreshed?.a_response === "accepted" && refreshed?.b_response === "accepted") {
      await supabase
        .from("matches")
        .update({
          status: "accepted",
          contact_revealed_at: new Date().toISOString()
        })
        .eq("id", match.id);
    }
  } else {
    const dbResponse = action === "report" ? "reported" : action === "block" ? "blocked" : "rejected";
    const matchStatus = action === "block" ? "blocked" : "rejected";

    await supabase
      .from("matches")
      .update({ [responseField]: dbResponse, status: matchStatus })
      .eq("id", match.id);

    await supabase
      .from("participants")
      .update({ status: "waiting" })
      .in("id", [me.id, partnerId]);

    if (action === "report") {
      await supabase.from("reports").insert({
        reporter_id: me.id,
        reported_participant_id: partnerId,
        match_id: match.id,
        reason: parsed.data.reason
      });
    }
  }

  return NextResponse.json({ ok: true });
}
