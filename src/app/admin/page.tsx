"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Dashboard = {
  event: {
    title: string;
    registration_closes_at: string;
    status: string;
  };
  stats: {
    total: number;
    pccoe: number;
    dyp: number;
    waiting: number;
  };
};

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch("/api/admin/event", { cache: "no-store" });
    if (response.ok) setDashboard(await response.json());
    else setDashboard(null);
  }

  useEffect(() => { void refresh(); }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    setBusy(false);
    if (!response.ok) {
      setMessage("Invalid admin credentials.");
      return;
    }
    setPassword("");
    await refresh();
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get("registrationClosesAt"));
    const iso = new Date(value).toISOString();
    setBusy(true);
    const response = await fetch("/api/admin/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        registrationClosesAt: iso
      })
    });
    const result = await response.json();
    setMessage(response.ok ? "Event settings updated." : result.error);
    setBusy(false);
    await refresh();
  }

  async function generate() {
    if (!window.confirm("Generate final college-separated partner pairs now?")) return;
    setBusy(true);
    const response = await fetch("/api/admin/generate", { method: "POST" });
    const result = await response.json();
    setMessage(
      response.ok
        ? `Created ${result.pairsCreated} pairs. ${result.unmatched} participant(s) remain unmatched.`
        : result.error
    );
    setBusy(false);
    await refresh();
  }

  if (!dashboard) {
    return (
      <main className="center-page shell">
        <form className="admin-login" onSubmit={login}>
          <Link className="back-link" href="/">← Dandiyaa</Link>
          <div className="eyebrow gold">ADMIN ONLY</div>
          <h1>Control the countdown.</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" required />
          <button className="pill primary" disabled={busy}>Unlock admin</button>
          {message ? <div className="error-banner">{message}</div> : null}
        </form>
      </main>
    );
  }

  const localClose = new Date(dashboard.event.registration_closes_at);
  localClose.setMinutes(localClose.getMinutes() - localClose.getTimezoneOffset());
  const defaultClose = localClose.toISOString().slice(0, 16);

  return (
    <main className="admin-page shell">
      <div className="admin-head">
        <div>
          <Link className="back-link" href="/">← Public site</Link>
          <div className="eyebrow gold">DANDIYAA CONTROL ROOM</div>
          <h1>Event command center.</h1>
        </div>
        <div className="status-chip">{dashboard.event.status}</div>
      </div>

      <section className="stat-grid">
        <div><span>Total</span><strong>{dashboard.stats.total}</strong></div>
        <div><span>PCCOE</span><strong>{dashboard.stats.pccoe}</strong></div>
        <div><span>DYP</span><strong>{dashboard.stats.dyp}</strong></div>
        <div><span>Waiting</span><strong>{dashboard.stats.waiting}</strong></div>
      </section>

      <section className="admin-grid">
        <form className="admin-panel" onSubmit={saveEvent}>
          <div className="eyebrow">EVENT SETTINGS</div>
          <label>Event title<input name="title" defaultValue={dashboard.event.title} required /></label>
          <label>Registration closes<input name="registrationClosesAt" type="datetime-local" defaultValue={defaultClose} required /></label>
          <button className="pill primary" disabled={busy}>Save countdown</button>
        </form>

        <div className="admin-panel danger-panel">
          <div className="eyebrow">PAIRING ENGINE</div>
          <h2>Scramble each college separately.</h2>
          <p>Generation is locked until the configured registration deadline has passed. Preferences influence the random pairing but do not prevent fallback matches.</p>
          <button className="pill primary" onClick={generate} disabled={busy || dashboard.stats.waiting < 2}>Generate / rematch waiting participants</button>
        </div>
      </section>

      {message ? <div className="notice-banner">{message}</div> : null}
    </main>
  );
}
