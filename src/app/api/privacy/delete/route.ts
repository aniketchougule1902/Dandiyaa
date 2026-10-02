import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { matchLookupSchema } from "@/lib/validation";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const parsed = matchLookupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid private match code." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("claim_token_hash", hashToken(parsed.data.token))
    .single();

  if (!participant) return NextResponse.json({ error: "Registration not found." }, { status: 404 });

  const { error } = await supabase
    .from("deletion_requests")
    .insert({ participant_id: participant.id });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not create deletion request." }, { status: 500 });
  }

  await supabase
    .from("participants")
    .update({ status: "withdrawn" })
    .eq("id", participant.id);

  return NextResponse.json({ ok: true });
}
