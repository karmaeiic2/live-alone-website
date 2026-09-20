"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { loadYouTubeApi, type YouTubePlayer } from "./youtube-api";

const videoId = "Dv1cypUiLAk";
const pauseDelayMs = 320;

export function VideoPlayer() {
  const [requested, setRequested] = useState(false);
  const [stage, setStage] = useState<"resting" | "loading" | "player">("resting");
  const [error, setError] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const pausedTime = useRef(0);
  const ended = useRef(false);
  const restoreTimer = useRef<number | undefined>(undefined);
  const nextFocus = useRef<"poster" | "player" | null>(null);

  useEffect(() => {
    if (nextFocus.current === "poster") triggerRef.current?.focus({ preventScroll: true });
    if (nextFocus.current === "player") playerRef.current?.getIframe().focus({ preventScroll: true });
    nextFocus.current = null;
  }, [stage]);

  useEffect(() => {
    if (!requested || !hostRef.current) return;
    const host = hostRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let player: YouTubePlayer | undefined;

    const cancelRestore = () => {
      window.clearTimeout(restoreTimer.current);
      restoreTimer.current = undefined;
    };

    const restorePoster = () => {
      // Return focus only if the visitor is still using the video.
      if (host.contains(document.activeElement)) nextFocus.current = "poster";
      if (document.fullscreenElement && host.contains(document.fullscreenElement)) {
        void document.exitFullscreen().catch(() => {});
      }
      setStage("resting");
    };
    const scheduleRestore = () => {
      cancelRestore();
      if (motion.matches) {
        restorePoster();
        return;
      }
      // Leave the paused frame on screen briefly; CSS then fades in the poster.
      restoreTimer.current = window.setTimeout(() => {
        restoreTimer.current = undefined;
        restorePoster();
      }, pauseDelayMs);
    };
    const handleMotionChange = () => {
      if (motion.matches && restoreTimer.current !== undefined) {
        cancelRestore();
        restorePoster();
      }
    };
    motion.addEventListener("change", handleMotionChange);
    const fail = () => {
      if (cancelled) return;
      cancelRestore();
      restorePoster();
      setError(true);
      setRequested(false);
    };
    // Also recover if the API loads but the embedded player is blocked.
    const readyTimeout = window.setTimeout(fail, 20000);

    loadYouTubeApi().then((api) => {
      if (cancelled) return;
      const iframe = document.createElement("iframe");
      iframe.title = "Live Alone — But I Don't official music video";
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      host.append(iframe);
      player = new api.Player(iframe, {
        events: {
          onReady: ({ target }) => {
            if (cancelled) return;
            window.clearTimeout(readyTimeout);
            playerRef.current = target;
            if (document.activeElement === triggerRef.current) nextFocus.current = "player";
            setStage("player");
            if (pausedTime.current > 0) target.seekTo(pausedTime.current, true);
            target.playVideo();
          },
          onStateChange: ({ data, target }) => {
            if (cancelled) return;
            // Resuming or seeking during the pause delay cancels the return.
            if (data === 1 || data === 3) cancelRestore();
            if (data === 1) setStage("player"); // PLAYING
            if (data === 2 && !ended.current) { // PAUSED
              pausedTime.current = target.getCurrentTime();
              scheduleRestore();
            }
            if (data === 0) { // ENDED
              pausedTime.current = 0;
              ended.current = true;
              scheduleRestore();
            }
          },
          onAutoplayBlocked: () => {
            // Keep YouTube's native Play control available on restrictive browsers.
            if (!cancelled) {
              cancelRestore();
              setStage("player");
            }
          },
          onError: fail,
        },
      });
    }).catch(fail);

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimeout);
      cancelRestore();
      motion.removeEventListener("change", handleMotionChange);
      playerRef.current = null;
      player?.destroy();
      host.replaceChildren();
    };
  }, [requested]);

  function play() {
    if (stage === "loading") return;
    window.clearTimeout(restoreTimer.current);
    restoreTimer.current = undefined;
    setError(false);
    if (playerRef.current) {
      nextFocus.current = "player";
      setStage("player");
      // Paused players retain their precise position. Seek only after completion.
      if (ended.current) {
        ended.current = false;
        playerRef.current.seekTo(0, true);
      }
      playerRef.current.playVideo();
    } else {
      setStage("loading");
      setRequested(true);
    }
  }

  const showingPlayer = stage === "player";

  return (
    <>
      <div className={showingPlayer ? "video-frame is-playing" : "video-frame"}>
        <div
          ref={hostRef}
          className="video-player-host"
          aria-hidden={!showingPlayer}
          inert={!showingPlayer}
        />
        <button
          ref={triggerRef}
          className="video-trigger"
          type="button"
          onClick={play}
          aria-disabled={stage === "loading"}
          aria-busy={stage === "loading"}
          aria-hidden={showingPlayer}
          inert={showingPlayer}
          aria-label="Play But I Don't, the new official music video by Live Alone"
        >
          <span className="video-poster">
            <Image
              src="/images/but-i-dont-video.jpg"
              alt=""
              fill
              preload
              sizes="100vw"
            />
          </span>
          <Image
            className="opening-logo"
            src="/images/Live-Alone-Logo-White-Transparent.png"
            alt=""
            width={1548}
            height={1069}
            loading="eager"
            sizes="(max-width: 700px) 150px, 240px"
          />
          <span className="video-overlay">
            <span className="video-name">
              <span className="video-status">NEW OFFICIAL VIDEO</span>
              <span className="video-name-text">BUT I DON’T</span>
            </span>
            <span className="video-play"><span aria-hidden="true">▶</span> PLAY VIDEO</span>
          </span>
        </button>
      </div>
      {error && <p className="video-error" role="alert">The video couldn’t load. Try Play again or open it on YouTube below.</p>}
    </>
  );
}
