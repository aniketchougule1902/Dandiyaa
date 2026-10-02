import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase-admin";
import { generatePairs, type ParticipantForMatching } from "@/lib/matching";

export async function POST() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: event, error: eventError } = await supabase
    .from("event_config")
    .select("status,registration_closes_at")
    .eq("id", 1)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event state unavailable." }, { status: 500 });
  }

  if (event.status === "matched") {
    return NextResponse.json({ error: "Matches have already been generated." }, { status: 409 });
  }

  if (Date.now() < new Date(event.registration_closes_at).getTime()) {
    return NextResponse.json(
      { error: "Registration is still open. Close it before generating matches." },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id,college,study_year,preference")
    .eq("status", "waiting");

  if (error) return NextResponse.json({ error: "Unable to load participants." }, { status: 500 });

  const participants: ParticipantForMatching[] = (data ?? []).map((p) => ({
    id: p.id,
    college: p.college as ParticipantForMatching["college"],
    year: p.study_year,
    preference: p.preference as ParticipantForMatching["preference"]
  }));

  const result = generatePairs(participants);

  const { data: created, error: rpcError } = await supabase.rpc("apply_match_batch", {
    payload: result.pairs
  });

  if (rpcError) {
    return NextResponse.json({ error: "Match generation failed safely; no partial batch was accepted." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    pairsCreated: created ?? result.pairs.length,
    unmatched: result.unmatched.length,
    unmatchedByCollege: {
      pccoe: result.unmatched.filter((p) => p.college === "pccoe").length,
      dyp: result.unmatched.filter((p) => p.college === "dyp").length
    }
  });
}
