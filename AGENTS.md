<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

# AGENTS.md

# Live Alone Website — Codex Instructions

This repository contains the official website for Live Alone, a Portland, Oregon post-hardcore / shoegaze band.

## Primary Goal

Build a professional band website that feels distinctive, emotionally heavy, atmospheric, and visually connected to Live Alone's music and artwork.

The site should feel intentionally designed rather than like a generic musician template.

The creative direction is documented in:

`PROJECT_BRIEF.md`

Read that file before making significant visual or structural decisions.

---

## Working With the User

The user has previous coding experience but is relearning modern web development.

When making substantial changes:

1. Briefly explain what you intend to change before changing it.
2. Prefer understandable code over clever abstractions.
3. Explain unfamiliar patterns when introducing them.
4. After completing a substantial task, summarize:
   - which files changed
   - what changed
   - why the implementation was chosen
5. Do not make major redesign decisions without discussing them first.

The goal is not only to build the website, but to allow the user to understand the project while it is being built.

---

## Development Stack

The project uses:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

Prefer the existing stack instead of adding additional frameworks.

Do not install new dependencies unless they provide a meaningful benefit.

If you believe a new dependency is necessary, explain why before installing it.

---

## Code Style

Keep the code:

- readable
- modular
- maintainable
- reasonably simple
- well named

Avoid:

- unnecessary abstraction
- extremely large components
- excessive JavaScript
- duplicated markup
- deeply nested component structures
- libraries that duplicate functionality already available through CSS, React, or Next.js

Create reusable components when doing so makes the page easier to understand.

Do not create components purely for the sake of creating more files.

---

## Website Structure

The first version should primarily be a single scrolling homepage.

Expected sections include:

- Navigation
- Hero
- Current Release
- Music
- Music Video
- Shows
- About
- Photography / Visual Interlude
- Contact
- Footer

These sections may evolve as the website develops.

---

## Visual Direction

Follow the visual language described in `PROJECT_BRIEF.md`.

The central design principle is:

> Clean first. Damaged second.

Build a strong editorial layout first.

Then add selective visual degradation such as:

- grain
- photocopy texture
- subtle VHS effects
- slight distortion
- scratched textures
- imperfect typography
- controlled flicker
- subtle blur or bloom

Do not apply distortion everywhere.

The site must remain readable and usable.

---

## Animation

Animation should be restrained.

Good examples:

- slow image movement
- subtle opacity changes
- gentle text reveals
- very light flicker
- hover distortion
- grain movement

Avoid:

- excessive parallax
- constant large movement
- flashy transitions
- animations that distract from the music
- effects that significantly hurt performance

Respect the user's `prefers-reduced-motion` setting.

---

## Responsive Design

The website must work well on:

- desktop
- laptop
- tablet
- mobile

Mobile should be treated as a first-class layout rather than a scaled-down desktop page.

Check layouts at common narrow widths when making major changes.

---

## Accessibility

Maintain good accessibility.

Requirements include:

- semantic HTML
- sufficient text contrast
- descriptive image alt text
- keyboard-accessible navigation
- visible focus states
- accessible buttons and links
- reduced-motion support
- sensible heading hierarchy

Visual experimentation should never make important information difficult to access.

---

## Images

Use Next.js image optimization where appropriate.

The available band photography includes compressed Instagram images.

Do not attempt to make compressed photography look artificially pristine.

Instead, use intentional treatments such as:

- black and white
- grain
- dark overlays
- photocopy texture
- halftone
- controlled cropping

The imperfections can be part of the visual identity.

Avoid aggressive AI-style sharpening or treatments that distort faces.

---

## Video

Avoid loading large background video files unnecessarily.

If video is used in the hero:

- keep it muted
- optimize file size
- provide a static fallback image
- avoid loading an unnecessarily large source on mobile
- respect reduced-motion preferences

YouTube embeds should preferably load only when needed rather than significantly slowing the initial page.

---

## External Links

Streaming and social links may include:

- YouTube
- Spotify
- Instagram
- other music services

Do not invent URLs.

Use placeholders until real links are supplied.

When appropriate, external links should open safely using:

`target="_blank"`

and:

`rel="noopener noreferrer"`

---

## Current Release

The current release is:

**"But I Don't"**

At this stage, it is a video-first release.

It is not currently available on Spotify.

The primary call to action should therefore be:

**Watch on YouTube**

Do not display a Spotify button specifically for "But I Don't" until the release becomes available there.

The broader Live Alone catalog may still link to Spotify.

---

## Existing Release

Live Alone has an EP titled:

**In From the Cold** (2024)

Artwork is available for this release.

It should appear in the Music section.

---

## Content Integrity

Do not invent:

- tour dates
- venues
- band member names
- booking information
- song titles
- streaming URLs
- press quotes
- reviews
- release dates

If information has not been provided, use an obvious placeholder or ask the user.

---

## Performance

Prioritize good performance.

Avoid:

- enormous images
- unnecessary client-side components
- excessive custom fonts
- autoplaying high-resolution video
- large animation libraries unless clearly justified

Use server components where appropriate.

Only use `"use client"` when client-side behavior is actually required.

---

## Before Major Changes

Before implementing a large new section or redesign:

1. Review `PROJECT_BRIEF.md`.
2. Explain the intended approach.
3. Keep the existing visual identity consistent.
4. Preserve working functionality unless the requested change requires otherwise.

<!-- END:nextjs-agent-rules -->
