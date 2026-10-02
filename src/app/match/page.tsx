"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type MatchData = {
  state: "waiting" | "unmatched" | "matched" | "connected";
  myResponse?: string;
  partnerResponse?: string;
  partner?: {
    name: string;
    college: string;
    year: number;
    contact: string | null;
    social: string | null;
  };
};

export default function MatchPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<MatchData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dandiyaa_claim_token");
    if (saved) {
      setToken(saved);
      void load(saved);
    }
  }, []);

  async function load(code = token) {
    if (!code) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/match?token=${encodeURIComponent(code)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load match.");
      localStorage.setItem("dandiyaa_claim_token", code);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load match.");
    } finally {
      setBusy(false);
    }
  }

  async function respond(action: "accept" | "reject" | "block" | "report") {
    let reason: string | undefined;
    if (action === "report") {
      reason = window.prompt("Briefly tell the admin what happened:") || undefined;
      if (!reason) return;
    }

    setBusy(true);
    const response = await fetch("/api/match/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action, reason })
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Could not save response.");
    } else {
      await load(token);
    }
    setBusy(false);
  }

  function submitCode(event: FormEvent) {
    event.preventDefault();
    void load();
  }

  return (
    <main className="center-page shell">
      <section className="match-card">
        <Link className="back-link" href="/">← Dandiyaa</Link>
        <div className="eyebrow gold">PRIVATE MATCH REVEAL</div>
        <h1>Your dance-floor connection.</h1>

        {!data ? (
          <form className="claim-form" onSubmit={submitCode}>
            <p>Use the private code saved when you registered. On the same device, this usually loads automatically.</p>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Private match code" required />
            <button className="pill primary" disabled={busy}>{busy ? "Checking…" : "Check my match"}</button>
          </form>
        ) : null}

        {data?.state === "waiting" || data?.state === "unmatched" ? (
          <div className="waiting-state">
            <div className="pulse-ring">✦</div>
            <h2>No active partner yet.</h2>
            <p>You&apos;re still eligible for matching/rematching. Keep your private code safe and check again after the countdown.</p>
          </div>
        ) : null}

        {(data?.state === "matched" || data?.state === "connected") && data.partner ? (
          <div className="partner-reveal">
            <div className="match-burst">✦</div>
            <div className="eyebrow">YOUR MATCH</div>
            <h2>{data.partner.name}</h2>
            <p>{data.partner.college === "pccoe" ? "PCCOE Nigdi" : "D. Y. Patil Akurdi"} • Year {data.partner.year}</p>

            {data.state === "connected" ? (
              <div className="contact-unlocked">
                <div className="eyebrow gold">BOTH SAID YES — CONTACT UNLOCKED</div>
                <strong>{data.partner.contact}</strong>
                {data.partner.social ? <span>{data.partner.social}</span> : null}
              </div>
            ) : (
              <div className="consent-status">
                <p>Your response: <strong>{data.myResponse}</strong></p>
                <p>Their response: <strong>{data.partnerResponse}</strong></p>
                <small>Contact remains hidden until both of you accept.</small>
              </div>
            )}

            {data.state !== "connected" ? (
              <div className="match-actions">
                <button className="pill primary" disabled={busy} onClick={() => respond("accept")}>Accept partner</button>
                <button className="pill ghost" disabled={busy} onClick={() => respond("reject")}>Reject / rematch</button>
                <button className="danger-link" disabled={busy} onClick={() => respond("block")}>Block</button>
                <button className="danger-link" disabled={busy} onClick={() => respond("report")}>Report</button>
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? <div className="error-banner">{error}</div> : null}
        <p className="microcopy">A match never creates an obligation to meet, communicate, or share anything further.</p>
      </section>
    </main>
  );
}
