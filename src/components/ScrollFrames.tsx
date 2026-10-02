"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const frames = Array.from({ length: 8 }, (_, index) =>
  `/frames/frame-${String(index + 1).padStart(2, "0")}.svg`
);

export function ScrollFrames() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      setFrame(Math.min(frames.length - 1, Math.floor(progress * frames.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="frame-stage" aria-hidden="true">
      <Image
        src={frames[frame]}
        alt=""
        width={720}
        height={720}
        priority
        className="frame-image"
      />
      <div className="frame-caption">scroll to spin the night</div>
    </div>
  );
}
