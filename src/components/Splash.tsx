"use client";

import { useEffect, useState } from "react";

export function Splash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1350);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-orbit">
        <span className="stick stick-one" />
        <span className="stick stick-two" />
      </div>
      <div className="splash-word">DANDIYAA</div>
      <div className="splash-sub">match • meet • dance</div>
    </div>
  );
}
