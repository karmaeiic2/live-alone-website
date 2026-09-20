import type { MetadataRoute } from "next";
import { siteUrl } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  // Anchor sections are all part of this one page. No invented update dates.
  return [{ url: siteUrl.href }];
}
