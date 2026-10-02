import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { registrationSchema } from "@/lib/validation";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please review the form and required consents." },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();
  const { data: event, error: eventError } = await supabase
    .from("event_config")
    .select("registration_closes_at,status")
    .eq("id", 1)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Registration is temporarily unavailable." }, { status: 503 });
  }

  const closesAt = new Date(event.registration_closes_at);
  if (event.status !== "open" || Date.now() >= closesAt.getTime()) {
    return NextResponse.json({ error: "Registration has closed." }, { status: 409 });
  }

  const claimToken = randomUUID();
  const payload = parsed.data;

  const { error } = await supabase.from("participants").insert({
    full_name: payload.fullName,
    college: payload.college,
    study_year: payload.year,
    contact_private: payload.contact,
    social_private: payload.socialHandle || null,
    prn_private: payload.prn,
    preference: payload.preference,
    claim_token_hash: hashToken(claimToken),
    age_18_confirmed: payload.age18,
    matching_consent: payload.matchConsent,
    privacy_consent: payload.privacyConsent,
    non_affiliation_acknowledged: payload.nonAffiliationAcknowledged
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A registration for this college and PRN/roll number already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "We could not save your registration." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    claimToken,
    message: "Registration confirmed. Save your private match code on this device."
  });
}
