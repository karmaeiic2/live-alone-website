"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { interludePhotos } from "./interlude-photos";
import { ReactiveLogo } from "./reactive-logo";
import type { ReactionPalette } from "./reaction-diffusion";

const holdDuration = 6000; // Six seconds still + two-second fade = an eight-second cadence.
const fadeDuration = 2000;
const firstPalette = interludePhotos[0].palette;
const colorKeys = ["primary", "secondary", "shadow"] as const;

type Controls = {
  navigate: (direction: number) => void;
  togglePause: () => void;
  focus: (focused: boolean) => void;
  loaded: (index: number, image: HTMLImageElement) => void;
  failed: (index: number) => void;
};

export function PhotoInterlude({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef(new Map<number, HTMLDivElement>());
  const controlsRef = useRef<Controls | null>(null);
  // A mutable palette lets the canvas read the shared fade without causing
  // React to re-render the images on every animation frame.
  const paletteRef = useRef<ReactionPalette>({
    primary: [...firstPalette.primary], secondary: [...firstPalette.secondary], shadow: [...firstPalette.shadow],
  });
  const [slides, setSlides] = useState<{ current: number; next: number | null }>({ current: 0, next: null });
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const instructionsId = useId();

  useEffect(() => {
    const section = sectionRef.current;
    const photo = photoRef.current;
    if (!section || !photo) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let next: number | null = null;
    let phase: "idle" | "loading" | "fading" = "idle";
    let visible = false, focused = false, stopped = false, disposed = false;
    let currentReady = false, manual = false;
    let timer = 0, frame = 0, elapsed = 0, startedAt = 0;
    let wheelDistance = 0, lastWheel = 0;
    let gesture: { x: number; y: number; id: number } | undefined;

    function stopClock() {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      timer = frame = 0;
    }

    function paintTransition(progress: number) {
      if (next === null) return;
      const from = interludePhotos[current].palette;
      const to = interludePhotos[next].palette;
      for (const key of colorKeys) {
        for (let channel = 0; channel < 3; channel++) {
          paletteRef.current[key][channel] = from[key][channel] + (to[key][channel] - from[key][channel]) * progress;
        }
      }
      section!.style.setProperty("--logo-color", `rgb(${paletteRef.current.primary.join(" ")})`);
      const incoming = layersRef.current.get(next);
      // Keep the outgoing image opaque underneath: this gives A*(1-t)+B*t,
      // avoiding the dark dip produced by fading both layers against black.
      if (incoming) incoming.style.opacity = String(progress);
    }

    function finish() {
      if (next === null) return;
      paintTransition(1);
      current = next;
      next = null;
      phase = "idle";
      elapsed = 0;
      setSlides({ current, next: null });
      if (manual) setAnnouncement(`Photo ${current + 1} of ${interludePhotos.length}. ${interludePhotos[current].alt}`);
      schedule();
    }

    function fade(time: number) {
      frame = 0;
      elapsed = Math.min(fadeDuration, time - startedAt);
      const fraction = elapsed / fadeDuration;
      // The image, fallback logo, and live chemistry share this eased progress.
      paintTransition(fraction * fraction * (3 - 2 * fraction));
      if (fraction === 1) finish();
      else frame = requestAnimationFrame(fade);
    }

    function schedule() {
      stopClock();
      if (disposed || !visible || document.hidden) return;
      if (phase === "fading") {
        if (motion.matches) finish();
        else {
          startedAt = performance.now() - elapsed;
          frame = requestAnimationFrame(fade);
        }
      } else if (phase === "idle" && currentReady && !motion.matches && !stopped && !focused) {
        timer = window.setTimeout(() => navigate(1, false), holdDuration);
      }
    }

    function navigate(direction: number, byHand = true) {
      if (disposed || next !== null) return;
      stopClock();
      next = (current + direction + interludePhotos.length) % interludePhotos.length;
      phase = "loading";
      manual = byHand;
      elapsed = 0;
      setSlides({ current, next });
    }

    function failed(index: number) {
      if (disposed || index !== next) return;
      next = null;
      phase = "idle";
      stopped = true;
      setPaused(true);
      setSlides({ current, next: null });
      setAnnouncement("That photograph could not load. You can try another photograph.");
    }

    async function loaded(index: number, image: HTMLImageElement) {
      try { await image.decode(); } catch { failed(index); return; }
      if (disposed) return;
      if (index === current) {
        currentReady = true;
        schedule();
      } else if (index === next && phase === "loading") {
        phase = "fading";
        schedule();
      }
    }

    controlsRef.current = {
      navigate,
      loaded,
      failed,
      togglePause() { stopped = !stopped; setPaused(stopped); schedule(); },
      focus(value) { focused = value; schedule(); },
    };

    // Horizontal gestures browse photos. Ordinary vertical wheel input is
    // untouched, including while a crossfade is already running.
    function wheel(event: WheelEvent) {
      if (event.ctrlKey) return;
      const delta = event.shiftKey ? event.deltaY || event.deltaX : event.deltaX;
      if (!event.shiftKey && Math.abs(delta) <= Math.abs(event.deltaY)) return;
      const now = performance.now();
      if (now - lastWheel > 220) wheelDistance = 0;
      lastWheel = now;
      wheelDistance += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? photo!.clientWidth : 1);
      if (Math.abs(wheelDistance) >= 70) {
        navigate(wheelDistance > 0 ? 1 : -1);
        wheelDistance = 0;
      }
    }

    function pointerDown(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0) return;
      gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
      photo!.setPointerCapture(event.pointerId);
    }
    function pointerMove(event: PointerEvent) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) gesture = undefined;
      else if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        navigate(dx < 0 ? 1 : -1);
        gesture = undefined;
      }
    }
    function pointerEnd() { gesture = undefined; }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: .05 });
    observer.observe(section);
    motion.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", schedule);
    section.addEventListener("wheel", wheel, { passive: true });
    photo.addEventListener("pointerdown", pointerDown, { passive: true });
    photo.addEventListener("pointermove", pointerMove, { passive: true });
    photo.addEventListener("pointerup", pointerEnd, { passive: true });
    photo.addEventListener("pointercancel", pointerEnd, { passive: true });
    const initialImage = photo.querySelector("img");
    if (initialImage?.complete && initialImage.naturalWidth) void loaded(0, initialImage);

    return () => {
      disposed = true;
      stopClock();
      controlsRef.current = null;
      observer.disconnect();
      motion.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", schedule);
      section.removeEventListener("wheel", wheel);
      photo.removeEventListener("pointerdown", pointerDown);
      photo.removeEventListener("pointermove", pointerMove);
      photo.removeEventListener("pointerup", pointerEnd);
      photo.removeEventListener("pointercancel", pointerEnd);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="live-interruption"
      aria-label="Live Alone performance photographs"
      aria-roledescription="carousel"
      aria-describedby={instructionsId}
      tabIndex={0}
      style={{ "--logo-color": `rgb(${firstPalette.primary.join(" ")})` } as CSSProperties}
      onFocusCapture={() => controlsRef.current?.focus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) controlsRef.current?.focus(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          controlsRef.current?.navigate(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <p className="sr-only" id={instructionsId}>Use the left and right arrow keys to browse photographs. Automatic changes pause while this section has keyboard focus.</p>
      <div className="interlude-photograph">
        <div className="interlude-frames" ref={photoRef}>
          {[slides.current, slides.next].map((index) => index === null ? null : (
            <div
              key={index}
              ref={(node) => { if (node) layersRef.current.set(index, node); else layersRef.current.delete(index); }}
              className="interlude-slide"
              data-photo={index}
              aria-hidden={index !== slides.current}
              style={{ opacity: index === slides.current ? 1 : 0 }}
            >
              <Image
                src={interludePhotos[index].src}
                alt={interludePhotos[index].alt}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1600px) 58vw, 930px"
                style={{ objectPosition: interludePhotos[index].position }}
                draggable={false}
                loading={index === slides.next ? "eager" : "lazy"}
                onLoad={(event) => controlsRef.current?.loaded(index, event.currentTarget)}
                onError={() => controlsRef.current?.failed(index)}
              />
            </div>
          ))}
        </div>
        <div className="interlude-controls">
          <button type="button" aria-label="Previous photograph" aria-disabled={slides.next !== null} onClick={() => controlsRef.current?.navigate(-1)}><span aria-hidden="true">←</span></button>
          <button type="button" className="interlude-pause" aria-label={paused ? "Resume automatic photo changes" : "Pause automatic photo changes"} aria-pressed={paused} onClick={() => controlsRef.current?.togglePause()}><span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>
          <button type="button" aria-label="Next photograph" aria-disabled={slides.next !== null} onClick={() => controlsRef.current?.navigate(1)}><span aria-hidden="true">→</span></button>
        </div>
      </div>
      <ReactiveLogo paletteRef={paletteRef} />
      {children}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  );
}
