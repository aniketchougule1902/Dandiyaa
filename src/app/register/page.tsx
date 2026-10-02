"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COLLEGES, NON_AFFILIATION, PARTNER_PREFERENCES } from "@/lib/constants";

export default function RegisterPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [claimToken, setClaimToken] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get("fullName"),
      college: form.get("college"),
      year: Number(form.get("year")),
      contact: form.get("contact"),
      socialHandle: form.get("socialHandle"),
      prn: form.get("prn"),
      preference: form.get("preference"),
      age18: form.get("age18") === "on",
      matchConsent: form.get("matchConsent") === "on",
      privacyConsent: form.get("privacyConsent") === "on",
      nonAffiliationAcknowledged: form.get("nonAffiliationAcknowledged") === "on",
      website: form.get("website")
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration failed.");

      if (result.claimToken) {
        localStorage.setItem("dandiyaa_claim_token", result.claimToken);
        setClaimToken(result.claimToken);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="center-page shell">
        <div className="success-card">
          <div className="success-icon">✦</div>
          <div className="eyebrow gold">YOU&apos;RE IN</div>
          <h1>See you on the dance floor.</h1>
          <p>Your private match code is saved on this device. Keep it private—it is how Dandiyaa proves this registration is yours.</p>
          {claimToken ? (
            <div className="claim-code">
              <span>Private match code</span>
              <code>{claimToken}</code>
              <button className="pill ghost" type="button" onClick={() => navigator.clipboard.writeText(claimToken)}>Copy code</button>
            </div>
          ) : null}
          <Link className="pill primary" href="/match">Open my match page</Link>
          <Link className="text-link" href="/">Back to the countdown</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="form-page shell">
      <div className="form-intro">
        <Link className="back-link" href="/">← Dandiyaa</Link>
        <div className="eyebrow gold">VOLUNTARY • 18+ • SAME-COLLEGE PAIRING</div>
        <h1>Put your name in the circle.</h1>
        <p>We only reveal contact details after you and your match both accept. Social handles are optional.</p>
      </div>

      <form className="registration-form" onSubmit={submit}>
        <label>
          Your name
          <input name="fullName" minLength={2} maxLength={80} required autoComplete="name" placeholder="What should your match call you?" />
        </label>

        <div className="two-col">
          <label>
            College
            <select name="college" required defaultValue="">
              <option value="" disabled>Select college</option>
              {COLLEGES.map((college) => <option key={college.value} value={college.value}>{college.label}</option>)}
            </select>
          </label>
          <label>
            Current year
            <select name="year" required defaultValue="1">
              {[1,2,3,4,5,6].map((year) => <option key={year} value={year}>Year {year}</option>)}
            </select>
          </label>
        </div>

        <div className="two-col">
          <label>
            Contact
            <input name="contact" required minLength={6} maxLength={120} placeholder="Phone or email" />
            <small>Private until mutual acceptance.</small>
          </label>
          <label>
            Social handle <span className="optional">optional</span>
            <input name="socialHandle" maxLength={100} placeholder="@yourhandle" />
          </label>
        </div>

        <div className="two-col">
          <label>
            PRN / roll number
            <input name="prn" required minLength={3} maxLength={80} placeholder="Used to prevent duplicate registrations" />
            <small>Never shown to other participants. This is not official college verification.</small>
          </label>
          <label>
            Partner preference
            <select name="preference" required defaultValue="any">
              {PARTNER_PREFERENCES.map((preference) => <option key={preference.value} value={preference.value}>{preference.label}</option>)}
            </select>
            <small>A preference, not a guaranteed match condition.</small>
          </label>
        </div>

        <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <div className="consent-box">
          <label className="check">
            <input type="checkbox" name="age18" required />
            <span>I confirm I am 18 years of age or older.</span>
          </label>
          <label className="check">
            <input type="checkbox" name="matchConsent" required />
            <span>I voluntarily agree to participate in Dandiyaa partner matching and understand I can reject a match.</span>
          </label>
          <label className="check">
            <input type="checkbox" name="privacyConsent" required />
            <span>I agree to the <Link href="/privacy">privacy notice</Link> and the use of my details to operate this event.</span>
          </label>
          <label className="check">
            <input type="checkbox" name="nonAffiliationAcknowledged" required />
            <span>I understand that {NON_AFFILIATION}</span>
          </label>
        </div>

        {error ? <div className="error-banner" role="alert">{error}</div> : null}

        <button className="pill primary submit" disabled={busy}>
          {busy ? "Joining…" : "Join Dandiyaa"}
        </button>
        <p className="microcopy">By joining, you are not committing to meet anyone. A generated pair is an invitation, not an obligation.</p>
      </form>
    </main>
  );
}
