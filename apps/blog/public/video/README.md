# Hero video

Drop an mp4 here, e.g. `hero.mp4`, then set in `lib/content.ts`:

    export const HERO_VIDEO: string | null = "/video/hero.mp4";

Guidance:
- 1920x1080, H.264, no audio track (it plays muted anyway)
- Keep it under ~6MB or first paint suffers on hospital wifi
- 10-20 seconds, loops seamlessly

Until HERO_VIDEO is set the hero falls back to the poster image and gradient.
Users with prefers-reduced-motion always get the still, never the video.
