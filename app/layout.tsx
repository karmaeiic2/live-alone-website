import type { Metadata } from "next";
import { siteUrl } from "./site-config";
import "./globals.css";

const title = "Live Alone — Portland Post-Hardcore";
const socialDescription = "Live Alone is a Portland post-hardcore band. Watch “But I Don’t,” explore In From the Cold, and find upcoming shows.";
const socialImages = [{
  url: new URL("/images/socialmedia_preview.png", siteUrl),
  width: 1731,
  height: 909,
  type: "image/png",
  alt: "Live Alone performing live, with the band's white logo and Portland, Oregon lettering",
}];

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: title, template: "%s | Live Alone" },
  description: "Live Alone is a Portland post-hardcore band. Watch the official video for “But I Don’t,” explore the 2024 EP In From the Cold, and find upcoming shows.",
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description: socialDescription,
    url: siteUrl,
    type: "website",
    siteName: "Live Alone",
    locale: "en_US",
    images: socialImages,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: socialDescription,
    images: socialImages,
  },
  icons: {
    icon: { url: "/images/LiveAlone_favicon.png", type: "image/png", sizes: "1254x1254" },
    shortcut: "/images/LiveAlone_favicon.png",
    apple: { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
