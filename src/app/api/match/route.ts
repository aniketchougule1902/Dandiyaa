import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { matchLookupSchema } from "@/lib/validation";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = matchLookupSchema.safeParse({ token: url.searchParams.get("token") });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid private match code." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: me, error: meError } = await supabase
    .from("participants")
    .select("id,full_name,college,study_year,status")
    .eq("claim_token_hash", hashToken(parsed.data.token))
    .single();

  if (meError || !me) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .or(`participant_a.eq.${me.id},participant_b.eq.${me.id}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!match || !["active", "accepted"].includes(match.status)) {
    return NextResponse.json({
      state: me.status === "waiting" ? "waiting" : "unmatched",
      participant: {
        name: me.full_name,
        college: me.college,
        year: me.study_year
      }
    });
  }

  const mineIsA = match.participant_a === me.id;
  const partnerId = mineIsA ? match.participant_b : match.participant_a;
  const myResponse = mineIsA ? match.a_response : match.b_response;
  const partnerResponse = mineIsA ? match.b_response : match.a_response;

  const { data: partner, error: partnerError } = await supabase
    .from("participants")
    .select("full_name,college,study_year,contact_private,social_private")
    .eq("id", partnerId)
    .single();

  if (partnerError || !partner) {
    return NextResponse.json({ error: "Match data is temporarily unavailable." }, { status: 503 });
  }

  const mutuallyAccepted = myResponse === "accepted" && partnerResponse === "accepted";

  return NextResponse.json({
    state: mutuallyAccepted ? "connected" : "matched",
    myResponse,
    partnerResponse,
    matchId: match.id,
    partner: {
      name: partner.full_name,
      college: partner.college,
      year: partner.study_year,
      contact: mutuallyAccepted ? partner.contact_private : null,
      social: mutuallyAccepted ? partner.social_private : null
    }
  });
}
