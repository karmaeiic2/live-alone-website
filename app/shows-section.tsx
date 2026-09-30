"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Show = {
  date: string;
  displayDate: string;
  title: string;
  lineup: string[];
  details: { label: string; value: string }[];
  context?: string;
  host?: { label: string; url: string };
  address: string;
  flyer: {
    src: string;
    alt: string;
    width: number;
    height: number;
    linkLabel: string;
  };
};

const shows: Show[] = [
  {
    date: "2026-10-04",
    displayDate: "October 4",
    title: "Bug House PDX house show",
    lineup: ["Live Alone", "Lazer Beam (SF)", "IC Double", "Warped Lines"],
    details: [
      { label: "Doors", value: "6:00 PM" },
      { label: "Music", value: "7:00 PM" },
      { label: "Ages", value: "21+" },
      { label: "Price", value: "$10 PWYC" },
    ],
    context: "Lazer Beam is on tour from San Francisco.",
    host: {
      label: "@bughousepdx",
      url: "https://www.instagram.com/bughousepdx/",
    },
    address: "DM for address",
    flyer: {
      src: "/images/october4th2026show.png",
      alt: "October 4 Bug House show flyer featuring Live Alone, Lazer Beam, IC Double, and Warped Lines",
      width: 452,
      height: 601,
      linkLabel: "View the October 4 Bug House show flyer in full size",
    },
  },
  {
    date: "2026-11-01",
    displayDate: "November 1",
    title: "High Limit Room",
    lineup: ["Blisster", "Splinterhead", "Live Alone", "Blood Dust"],
    details: [
      { label: "Doors", value: "5:30 PM" },
      { label: "Music", value: "6:00 PM" },
      { label: "Ages", value: "All ages" },
      { label: "Price", value: "$10 door · $7 online" },
    ],
    address: "720 SE Hawthorne Blvd, Floor 2, Portland, OR 97214",
    flyer: {
      src: "/images/november1st_high_limit_room_white_background.png",
      alt: "November 1 High Limit Room show flyer featuring Blisster, Splinterhead, Live Alone, and Blood Dust",
      width: 2550,
      height: 3300,
      linkLabel: "View the November 1 High Limit Room show flyer in full size",
    },
  },
];

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ShowsSection() {
  // Render every show in the static HTML, then use the visitor's local date
  // after hydration so cached deployments still expire shows correctly.
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    let midnightTimer = 0;

    const updateDate = () => {
      const now = new Date();
      setToday(localDateKey(now));

      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      midnightTimer = window.setTimeout(
        updateDate,
        nextMidnight.getTime() - now.getTime() + 100,
      );
    };

    updateDate();
    return () => window.clearTimeout(midnightTimer);
  }, []);

  const upcomingShows = shows
    .filter((show) => today === null || show.date >= today)
    .sort((first, second) => first.date.localeCompare(second.date));

  return (
    <section id="shows" className="shows" aria-labelledby="shows-title" tabIndex={-1}>
      <h2 id="shows-title">Shows</h2>
      {upcomingShows.length > 0 ? (
        <div className="show-listings">
          {upcomingShows.map((show) => {
            const titleId = `show-${show.date}-name`;

            return (
              <article key={show.date} className="show-listing" aria-labelledby={titleId}>
                <div className="show-info">
                  <time className="show-date" dateTime={show.date}>{show.displayDate}</time>
                  <h3 id={titleId}>{show.title}</h3>
                  <ul className="show-lineup" aria-label="Show lineup">
                    {show.lineup.map((band) => <li key={band}>{band}</li>)}
                  </ul>
                  <dl className="show-details">
                    {show.details.map((detail) => (
                      <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>
                    ))}
                  </dl>
                  {show.context && <p className="show-context">{show.context}</p>}
                  {show.host && (
                    <p className="show-host">
                      Hosted by <a href={show.host.url} target="_blank" rel="noopener noreferrer">
                        {show.host.label} <span aria-hidden="true">↗</span>
                      </a>
                    </p>
                  )}
                  <p className="show-address">{show.address}</p>
                </div>
                <a
                  className="show-flyer"
                  href={show.flyer.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={show.flyer.linkLabel}
                >
                  <Image
                    src={show.flyer.src}
                    alt={show.flyer.alt}
                    width={show.flyer.width}
                    height={show.flyer.height}
                    sizes="(max-width: 700px) 82vw, (max-width: 1050px) 37vw, 360px"
                  />
                </a>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="shows-empty">No dates announced.</p>
      )}
    </section>
  );
}
