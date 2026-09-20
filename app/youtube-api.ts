// Only the small part of the IFrame API this player uses; no runtime dependency.
export type YouTubePlayer = {
  playVideo: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getIframe: () => HTMLIFrameElement;
  destroy: () => void;
};

type PlayerEvent = { target: YouTubePlayer };
type YouTubeApi = {
  Player: new (element: HTMLIFrameElement, options: {
    events: {
      onReady: (event: PlayerEvent) => void;
      onStateChange: (event: PlayerEvent & { data: number }) => void;
      onError: () => void;
      onAutoplayBlocked: () => void;
    };
  }) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let pendingApi: Promise<YouTubeApi> | undefined;

// Called on the first Play click, never during the initial page load.
export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pendingApi) return pendingApi;

  pendingApi = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement("script");
    const previousReady = window.onYouTubeIframeAPIReady;
    const fail = () => {
      window.clearTimeout(timeout);
      script.remove();
      window.onYouTubeIframeAPIReady = previousReady;
      reject(new Error("YouTube could not load."));
    };
    const timeout = window.setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      if (window.YT?.Player) resolve(window.YT);
      else fail();
      previousReady?.();
    };
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  }).catch((error) => {
    pendingApi = undefined;
    throw error;
  });

  return pendingApi;
}
