"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createReactionField, type ReactionPalette } from "./reaction-diffusion";

const maskSource = "/images/live-alone-logo-white.png";
const logoRatio = 1069 / 1548;
const fieldWidth = 256;
const fieldHeight = Math.round(fieldWidth * logoRatio);

type PointerSample = {
  x: number;
  y: number;
  time: number;
  speed: number;
  pointerId: number;
  stroke: number;
};

export function ReactiveLogo({ paletteRef }: { paletteRef: RefObject<ReactionPalette> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mask = new window.Image();
    const buffer = document.createElement("canvas");
    buffer.width = fieldWidth;
    buffer.height = fieldHeight;
    const bufferContext = buffer.getContext("2d");
    if (!bufferContext) return;
    const pixels = bufferContext.createImageData(fieldWidth, fieldHeight);
    let field: ReturnType<typeof createReactionField> | undefined;
    let visible = false;
    let disposed = false;
    let frame = 0;
    let lastFrame = 0;
    let warmupSteps = 100;
    let pausedAt: number | undefined;
    let stroke = 0;
    let pointer: PointerSample | undefined;
    let lastPointer: PointerSample | undefined;
    let lastInjected: PointerSample | undefined;

    const canAnimate = () => visible && !motion.matches && !document.hidden && !disposed;

    function resize() {
      if (!canvas || !container) return;
      const width = Math.min(720, Math.round(container.clientWidth * Math.min(window.devicePixelRatio, 1.5)));
      if (canvas.width !== width) {
        canvas.width = width;
        canvas.height = Math.round(width * logoRatio);
      }
    }

    function draw(time: number) {
      frame = 0;
      if (!canAnimate()) return;
      if (time - lastFrame >= 1000 / 30 && field && context && canvas && bufferContext) {
        lastFrame = time - ((time - lastFrame) % (1000 / 30));
        if (pointer) {
          const from = lastInjected && lastInjected.stroke === pointer.stroke
            && lastInjected.pointerId === pointer.pointerId && pointer.time - lastInjected.time < 180
            ? lastInjected : pointer;
          field.injectStroke(from.x, from.y, pointer.x, pointer.y, pointer.speed);
          lastInjected = pointer;
          pointer = undefined;
        }
        // Spread initial growth across frames so entering the section never
        // blocks scrolling. Two steps give tighter, more active propagation
        // without increasing the 30fps rendering cap or the simulation size.
        const steps = warmupSteps > 0 ? 4 : 2;
        for (let step = 0; step < steps; step++) field.step();
        warmupSteps = Math.max(0, warmupSteps - steps);
        if (warmupSteps > 0) {
          frame = requestAnimationFrame(draw);
          return;
        }
        field.paint(pixels.data, paletteRef.current);
        bufferContext.putImageData(pixels, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(buffer, 0, 0, canvas.width, canvas.height);
        // destination-in uses only the PNG's alpha, never its RGB or luminance.
        // Every transparent mask pixel removes the corresponding animation pixel.
        context.globalCompositeOperation = "destination-in";
        context.drawImage(mask, 0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "source-over";
        canvas.style.opacity = "1";
      }
      frame = requestAnimationFrame(draw);
    }

    function syncPlayback() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pointer = undefined;
      lastPointer = undefined;
      lastInjected = undefined;
      if (motion.matches && canvas) canvas.style.opacity = "0";
      if (!canAnimate()) {
        pausedAt ??= performance.now();
        return;
      }
      if (!mask.src) {
        mask.src = maskSource;
        return;
      }
      if (!mask.complete || !mask.naturalWidth) return;
      if (!field && bufferContext) {
        // Read the authoritative alpha once, at simulation resolution. The
        // original image remains responsible for the sharp final silhouette.
        bufferContext.drawImage(mask, 0, 0, fieldWidth, fieldHeight);
        const maskPixels = bufferContext.getImageData(0, 0, fieldWidth, fieldHeight).data;
        const alpha = new Uint8Array(fieldWidth * fieldHeight);
        for (let i = 0; i < alpha.length; i++) alpha[i] = maskPixels[i * 4 + 3];
        field = createReactionField(fieldWidth, fieldHeight, alpha);
      }
      // Age the touch highlight without running any simulation while paused.
      if (pausedAt !== undefined) field?.fadeMemory((performance.now() - pausedAt) / 1000);
      pausedAt = undefined;
      resize();
      lastFrame = 0;
      frame = requestAnimationFrame(draw);
    }

    function disturb(event: PointerEvent) {
      if (!canAnimate() || !container || !event.isPrimary) return;
      if (event.type === "pointerdown") endStroke();
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * fieldWidth;
      const y = ((event.clientY - rect.top) / rect.height) * fieldHeight;
      const time = performance.now();
      const elapsed = lastPointer ? time - lastPointer.time : Infinity;
      // Speed is measured in simulation cells/sec, so touch and mouse behave
      // consistently at different display sizes. Smoothing avoids jumpy wakes.
      let speed = 0;
      if (lastPointer && lastPointer.pointerId === event.pointerId && elapsed < 180) {
        const cellsPerSecond = Math.hypot(x - lastPointer.x, y - lastPointer.y) / Math.max(elapsed, 8) * 1000;
        speed = lastPointer.speed * .45 + Math.min(1, cellsPerSecond / 240) * .55;
      }
      pointer = {
        x, y, time, speed, pointerId: event.pointerId, stroke,
      };
      lastPointer = pointer;
    }

    function endStroke() {
      stroke++;
      lastPointer = undefined;
      lastInjected = undefined;
      // Keep a pending sample until the next frame, including very short taps.
      // The stroke ID prevents it from connecting to a later touch or re-entry.
    }

    mask.onload = syncPlayback;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .01 });
    observer.observe(container);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    container.addEventListener("pointermove", disturb, { passive: true });
    container.addEventListener("pointerdown", disturb, { passive: true });
    container.addEventListener("pointerleave", endStroke, { passive: true });
    container.addEventListener("pointerup", endStroke, { passive: true });
    container.addEventListener("pointercancel", endStroke, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      mask.onload = null;
      observer.disconnect();
      resizeObserver.disconnect();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      container.removeEventListener("pointermove", disturb);
      container.removeEventListener("pointerdown", disturb);
      container.removeEventListener("pointerleave", endStroke);
      container.removeEventListener("pointerup", endStroke);
      container.removeEventListener("pointercancel", endStroke);
    };
  }, [paletteRef]);

  return (
    <div className="reactive-logo" ref={containerRef} aria-hidden="true">
      <div className="logo-alpha-mask">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
