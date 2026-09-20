"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

const photos = [
  { src: "/images/live-alone-promo-group-red.jpg", alt: "Live Alone together beneath red light outside a building at night", position: "50% 50%" },
  { src: "/images/live-alone-promo-group-night.jpg", alt: "The four members of Live Alone standing on a wet sidewalk at night", position: "50% 50%" },
  { src: "/images/live-alone-promo-group-wide.jpg", alt: "Live Alone outside a concrete building, reflected in the wet pavement", position: "50% 50%" },
  { src: "/images/live-alone-promo-portrait-orange.jpg", alt: "A member of Live Alone standing against a wall under orange light", position: "50% 45%" },
  { src: "/images/live-alone-promo-portrait-motion.jpg", alt: "A smiling member of Live Alone framed by blurred light and motion", position: "50% 40%" },
  { src: "/images/live-alone-promo-portrait-center.jpg", alt: "A member of Live Alone wearing a bandana and a dark jacket in front of a graffiti-covered wall", position: "50% 42%" },
];

const fadeDuration = 180;
const holdDuration = 420; // 420ms still + 180ms fade = one photograph every 600ms.
const resumeDelay = 650;
const sizes = "(max-width: 700px) 280px, (max-width: 1050px) 24vw, 288px";

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

type ReelControls = {
  hover: (value: boolean) => void;
  focus: (value: boolean) => void;
  toggle: () => void;
  loaded: (index: number, image: HTMLImageElement) => void;
  failed: (index: number) => void;
};

function AnimatedPromoReel() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const layersRef = useRef(new Map<number, HTMLSpanElement>());
  const controlsRef = useRef<ReelControls | null>(null);
  const [slides, setSlides] = useState<{ current: number; next: number | null }>({ current: 0, next: null });
  const [paused, setPaused] = useState(false);
  const hintId = useId();

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    let current = 0, next: number | null = null;
    let currentReady = false, nextReady = false;
    let visible = false, hovered = false, focused = false, pinned = false, disposed = false;
    let phase: "holding" | "fading" = "holding";
    let timer = 0, frame = 0, elapsed = 0, fadeStartedAt = 0;
    let nextStartAt = 0, resumeAt = 0;

    function stopClock() {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      timer = frame = 0;
    }

    function prepareNext() {
      if (next !== null || !currentReady || !visible || document.hidden) return;
      next = (current + 1) % photos.length;
      nextReady = false;
      nextStartAt = performance.now() + holdDuration;
      setSlides({ current, next });
    }

    function fade(time: number) {
      frame = 0;
      if (next === null || disposed) return;
      elapsed = Math.min(fadeDuration, time - fadeStartedAt);
      const fraction = elapsed / fadeDuration;
      const incoming = layersRef.current.get(next);
      // Keep the outgoing image opaque beneath the incoming one: no dark dip.
      if (incoming) incoming.style.opacity = String(fraction * fraction * (3 - 2 * fraction));
      if (elapsed < fadeDuration) {
        frame = requestAnimationFrame(fade);
      } else {
        current = next;
        next = null;
        phase = "holding";
        elapsed = 0;
        prepareNext();
      }
    }

    function schedule() {
      stopClock();
      if (disposed || !visible || document.hidden || hovered || focused || pinned) return;
      prepareNext();
      if (!nextReady) return;
      const now = performance.now();
      const due = phase === "fading" ? resumeAt : Math.max(resumeAt, nextStartAt);
      if (now < due) {
        timer = window.setTimeout(schedule, due - now);
      } else {
        phase = "fading";
        fadeStartedAt = now - elapsed;
        frame = requestAnimationFrame(fade);
      }
    }

    function release(delay: number) {
      resumeAt = performance.now() + delay;
      nextStartAt = resumeAt;
      schedule();
    }

    async function loaded(index: number, image: HTMLImageElement) {
      try { await image.decode(); } catch { failed(index); return; }
      if (disposed) return;
      if (index === current) currentReady = true;
      else if (index === next) nextReady = true;
      else return;
      schedule();
    }

    function failed(index: number) {
      if (disposed || index !== next) return;
      stopClock();
      // Keep the caught photograph if a request fails. A later resume retries
      // the incoming photo instead of ever fading to an empty image.
      next = null;
      nextReady = false;
      pinned = true;
      setPaused(true);
      setSlides({ current, next: null });
    }

    controlsRef.current = {
      loaded,
      failed,
      hover(value) {
        hovered = value;
        if (value) stopClock();
        else release(resumeDelay);
      },
      focus(value) {
        focused = value;
        if (value) stopClock();
        else release(resumeDelay);
      },
      toggle() {
        pinned = !pinned;
        focused = false; // An explicit keyboard resume can run while still focused.
        setPaused(pinned);
        if (pinned) stopClock();
        else release(0);
      },
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: .01 });
    observer.observe(button);
    document.addEventListener("visibilitychange", schedule);
    const initialImage = button.querySelector("img");
    if (initialImage?.complete && initialImage.naturalWidth) void loaded(0, initialImage);

    return () => {
      disposed = true;
      stopClock();
      controlsRef.current = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="promo-reel-control"
      aria-label={paused ? "Resume portrait reel" : "Pause portrait reel"}
      aria-pressed={paused}
      aria-describedby={hintId}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") controlsRef.current?.hover(true); }}
      onPointerLeave={(event) => { if (event.pointerType !== "touch") controlsRef.current?.hover(false); }}
      onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) controlsRef.current?.focus(true); }}
      onBlur={() => controlsRef.current?.focus(false)}
      onClick={() => controlsRef.current?.toggle()}
    >
      {[slides.current, slides.next].map((index) => index === null ? null : (
        <span
          key={index}
          className="promo-reel-image"
          ref={(node) => { if (node) layersRef.current.set(index, node); else layersRef.current.delete(index); }}
          data-portrait={index}
          aria-hidden={index !== slides.current}
          style={{ opacity: index === slides.current ? 1 : 0 }}
        >
          <Image
            src={photos[index].src}
            alt={photos[index].alt}
            fill
            sizes={sizes}
            style={{ objectPosition: photos[index].position }}
            loading={index === slides.next ? "eager" : "lazy"}
            draggable={false}
            onLoad={(event) => controlsRef.current?.loaded(index, event.currentTarget)}
            onError={() => controlsRef.current?.failed(index)}
          />
        </span>
      ))}
      <span className="sr-only" id={hintId}>Hover to freeze. Tap or press Enter or Space to pause or resume.</span>
    </button>
  );
}

export function PromoReel() {
  // The server and reduced-motion visitors get the same strong static image.
  // Changing the preference unmounts the animated reel and clears its clocks.
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);

  return (
    <figure className="story-portrait promo-reel">
      {reduced ? (
        <Image src={photos[0].src} alt={photos[0].alt} fill sizes={sizes} style={{ objectPosition: photos[0].position }} />
      ) : <AnimatedPromoReel />}
    </figure>
  );
}
