"use client";

import { useEffect, useMemo, useState } from "react";

type EventState = {
  title: string;
  registrationClosesAt: string;
  status: "open" | "closed" | "matched";
  registrations: number;
};

function remaining(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60)
  };
}

export function Countdown() {
  const [event, setEvent] = useState<EventState | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    fetch("/api/event", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setEvent(data))
      .catch(() => undefined);

    const timer = window.setInterval(() => tick((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = useMemo(
    () => (event ? remaining(event.registrationClosesAt) : null),
    [event, event?.registrationClosesAt]
  );

  if (!event || !time) {
    return <div className="countdown-card skeleton-card">Loading the dance floor…</div>;
  }

  return (
    <div className="countdown-card">
      <div className="eyebrow">{event.status === "open" ? "REGISTRATION CLOSES IN" : "REGISTRATION CLOSED"}</div>
      <div className="count-grid" aria-label="Countdown">
        {[
          ["DAYS", time.days],
          ["HRS", time.hours],
          ["MIN", time.mins],
          ["SEC", time.secs]
        ].map(([label, value]) => (
          <div className="count-box" key={label}>
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="registration-count">{event.registrations} dancers already in the pool</div>
    </div>
  );
}
