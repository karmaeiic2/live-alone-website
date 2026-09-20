// Set this to the final public origin before the production build.
// Leave it unset locally rather than publishing a guessed canonical domain.
function getSiteUrl(): URL | undefined {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return undefined;

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a full http(s) URL.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a website origin without credentials, a path, query, or fragment.");
  }

  return url;
}

export const siteUrl = getSiteUrl();
