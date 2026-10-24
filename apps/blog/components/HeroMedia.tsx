"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HERO_POSTER, HERO_VIDEO } from "../lib/content";

/**
 * Renders the poster on the server and swaps in the video after mount, only on
 * wider screens and only when motion is welcome. Phones never download the file,
 * which matters when a hospital is on mobile data.
 */
export default function HeroMedia() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!HERO_VIDEO) return;

    const wide = window.matchMedia("(min-width: 768px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setShowVideo(wide.matches && !still.matches);

    decide();
    wide.addEventListener("change", decide);
    still.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      still.removeEventListener("change", decide);
    };
  }, []);

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--w-ink-gradient)" }}>
      {showVideo && HERO_VIDEO ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_POSTER}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      ) : (
        <Image src={HERO_POSTER} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} priority />
      )}

      <div
        className="w-hero-scrim"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(12,6,32,0.80) 0%, rgba(12,6,32,0.55) 45%, rgba(12,6,32,0.22) 100%)",
        }}
      />

      <style>{`
        @media (max-width: 860px) {
          .w-hero-scrim {
            background: linear-gradient(180deg, rgba(12,6,32,0.62) 0%, rgba(12,6,32,0.78) 100%) !important;
          }
        }
      `}</style>
    </div>
  );
}
