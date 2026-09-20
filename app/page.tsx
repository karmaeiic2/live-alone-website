import Image from "next/image";
import { AboutSection } from "./about-section";
import { SiteHeader } from "./site-header";
import { VideoPlayer } from "./video-player";
import { PhotoInterlude } from "./photo-interlude";
import { siteUrl } from "./site-config";

const youtubeUrl = "https://youtu.be/Dv1cypUiLAk";
const spotifyAlbumUrl = "https://open.spotify.com/album/3pRTRGUoTPmeQRcoW6BTR8";
const instagramUrl = "https://www.instagram.com/livealonenw/";

const bandStructuredData = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Live Alone",
  url: siteUrl.href,
  genre: "Post-hardcore",
  location: {
    "@type": "Place",
    name: "Portland, Oregon",
  },
  member: ["Austin Johnson", "Teryl Neal", "Daniel Beggs", "Daniel “DC” Christina"]
    .map((name) => ({ "@type": "Person", name })),
  // Album and video links describe releases, not the band's social identity.
  sameAs: [instagramUrl],
};

export default function Home() {
  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bandStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <h1 className="sr-only">Live Alone</h1>

        <section id="music" className="current-video" aria-labelledby="video-title" tabIndex={-1}>
          <h2 id="video-title" className="sr-only">But I Don’t — new official video</h2>
          <div id="current-release" className="video-anchor" tabIndex={-1}>
            <VideoPlayer />
          </div>
          <div className="video-underneath">
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="external-link">
              OPEN ON YOUTUBE <span aria-hidden="true">↗</span>
            </a>
            <details className="video-story">
              <summary>About the video</summary>
              <div>
                <p>
                  The idea started with a conversation between Dan Beggs and Dave Solares
                  at Cascade Equinox, a music festival in Oregon. Dave needed to make a music
                  video for a school culmination project. Dan suggested Live Alone.
                </p>
                <p>
                  The band worked out a concept around Dan collecting, and then
                  shedding, physical baggage. The idea was partly inspired by
                  <cite> Labyrinth</cite>: objects from the past becoming a weight
                  you carry around.
                </p>
              </div>
            </details>
          </div>
        </section>

        <section id="shows" className="shows" aria-labelledby="shows-title" tabIndex={-1}>
          <h2 id="shows-title">Shows</h2>
          <article className="show-listing" aria-labelledby="show-name">
            <div className="show-info">
              <time className="show-date" dateTime="2026-10-04">October 4</time>
              <h3 id="show-name">Bug House PDX house show</h3>
              <ul className="show-lineup" aria-label="Show lineup">
                <li>Live Alone</li>
                <li>Lazer Beam (SF)</li>
                <li>IC Double</li>
                <li>Warped Lines</li>
              </ul>
              <dl className="show-details">
                <div><dt>Doors</dt><dd>6:00 PM</dd></div>
                <div><dt>Music</dt><dd>7:00 PM</dd></div>
                <div><dt>Ages</dt><dd>21+</dd></div>
                <div><dt>Price</dt><dd>$10 PWYC</dd></div>
              </dl>
              <p className="show-context">Lazer Beam is on tour from San Francisco.</p>
              <p className="show-host">
                Hosted by <a href="https://www.instagram.com/bughousepdx/" target="_blank" rel="noopener noreferrer">@bughousepdx <span aria-hidden="true">↗</span></a>
              </p>
              <p className="show-address">DM for address</p>
            </div>
            <a
              className="show-flyer"
              href="/images/october4th2026show.png"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the October 4 Bug House show flyer in full size"
            >
              <Image
                src="/images/october4th2026show.png"
                alt="October 4 Bug House show flyer featuring Live Alone, Lazer Beam, IC Double, and Warped Lines"
                width={452}
                height={601}
                sizes="(max-width: 491px) calc(100vw - 2.5rem), (max-width: 700px) 452px, (max-width: 1050px) 37vw, 360px"
              />
            </a>
          </article>
        </section>

        <section className="record" aria-labelledby="record-title">
          <div className="record-painting" aria-hidden="true">
            <Image
              src="/images/in-from-the-cold.png"
              alt=""
              fill
              sizes="100vw"
            />
          </div>
          <div className="record-content">
            <a
              className="record-cover"
              href={spotifyAlbumUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Listen to In From the Cold on Spotify"
            >
              <Image
                src="/images/in-from-the-cold.png"
                alt="Cover artwork for In From the Cold by Live Alone: blue, gray, white, and black brushstrokes"
                width={1254}
                height={1254}
                sizes="(max-width: 700px) 80vw, 46vw"
              />
            </a>
            <div className="record-caption">
              <p>2024 · EP</p>
              <h2 id="record-title">IN FROM<br />THE COLD</h2>
              <a href={spotifyAlbumUrl} target="_blank" rel="noopener noreferrer" className="external-link">
                LISTEN ON SPOTIFY <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <PhotoInterlude>
          <p className="photo-credit">
            <span>PHOTOGRAPHY BY KATE —</span>
            <a href="https://www.instagram.com/katetakesphotos/" target="_blank" rel="noopener noreferrer">
              @KATETAKESPHOTOS <span aria-hidden="true">↗</span>
            </a>
          </p>
        </PhotoInterlude>

        <AboutSection />

        <section id="contact" className="contact" aria-labelledby="contact-title" tabIndex={-1}>
          <h2 id="contact-title">Contact</h2>
          <div className="contact-details">
            <div className="contact-instagram">
              <p>Instagram</p>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">@livealonenw <span aria-hidden="true">↗</span></a>
              <p className="contact-note">Follow for show updates.</p>
            </div>
            <div className="contact-links">
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">But I Don’t on YouTube <span aria-hidden="true">↗</span></a>
              <a href={spotifyAlbumUrl} target="_blank" rel="noopener noreferrer">In From the Cold on Spotify <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>Live Alone · Portland, Oregon</span>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
        <span>© {new Date().getFullYear()} Live Alone</span>
      </footer>
    </div>
  );
}
