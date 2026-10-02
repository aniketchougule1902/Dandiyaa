import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  generatePairs,
  pairKey,
  type ParticipantForMatching
} from "@/lib/matching";

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

  if (Date.now() < new Date(event.registration_closes_at).getTime()) {
    return NextResponse.json(
      { error: "Registration is still open. Close it before generating matches." },
      { status: 409 }
    );
  }

  const [
    { data: waiting, error: participantsError },
    { data: historicalMatches, error: matchesError },
    { data: blocks, error: blocksError }
  ] = await Promise.all([
    supabase
      .from("participants")
      .select("id,college,study_year,preference")
      .eq("status", "waiting"),
    supabase
      .from("matches")
      .select("participant_a,participant_b")
      .in("status", ["rejected", "blocked", "superseded"]),
    supabase
      .from("blocks")
      .select("blocker_id,blocked_id")
  ]);

  if (participantsError || matchesError || blocksError) {
    return NextResponse.json({ error: "Unable to prepare the matching pool." }, { status: 500 });
  }

  const participants: ParticipantForMatching[] = (waiting ?? []).map((p) => ({
    id: p.id,
    college: p.college as ParticipantForMatching["college"],
    year: p.study_year,
    preference: p.preference as ParticipantForMatching["preference"]
  }));

  const excludedPairs = new Set<string>();
  for (const match of historicalMatches ?? []) {
    excludedPairs.add(pairKey(match.participant_a, match.participant_b));
  }
  for (const block of blocks ?? []) {
    excludedPairs.add(pairKey(block.blocker_id, block.blocked_id));
  }

  const result = generatePairs(participants, excludedPairs);

  if (!result.pairs.length) {
    return NextResponse.json({
      ok: true,
      pairsCreated: 0,
      unmatched: result.unmatched.length,
      unmatchedByCollege: {
        pccoe: result.unmatched.filter((p) => p.college === "pccoe").length,
        dyp: result.unmatched.filter((p) => p.college === "dyp").length
      },
      message: "No safe new pairings are currently available."
    });
  }

  const { data: created, error: rpcError } = await supabase.rpc("apply_match_batch", {
    payload: result.pairs
  });

  if (rpcError) {
    return NextResponse.json(
      { error: "Match generation failed safely; no partial batch was accepted." },
      { status: 500 }
    );
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
