import Image from "next/image";
import { HERO_POSTER, HERO_VIDEO } from "../lib/content";

/**
 * Video autoplays muted and looped. Users who ask for reduced motion get the
 * poster still instead, so the page never animates against that preference.
 */
export default function HeroMedia() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--w-ink-gradient)" }}>
      {HERO_VIDEO ? (
        <>
          <video
            className="w-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HERO_POSTER}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <Image
            className="w-hero-poster"
            src={HERO_POSTER}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", display: "none" }}
            priority
          />
        </>
      ) : (
        <Image
          src={HERO_POSTER}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.22 }}
          priority
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(43,22,115,0.92) 0%, rgba(26,13,69,0.88) 100%)",
        }}
      />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .w-hero-video { display: none !important; }
          .w-hero-poster { display: block !important; }
        }
      `}</style>
    </div>
  );
}
