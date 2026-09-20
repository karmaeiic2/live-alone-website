const links = [
  { href: "#music", label: "MUSIC" },
  { href: "#shows", label: "SHOWS" },
  { href: "#about", label: "ABOUT" },
  { href: "#contact", label: "CONTACT" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav aria-label="Primary navigation">
        {links.map(({ href, label }) => (
          <a key={href} href={href}>{label}</a>
        ))}
      </nav>
    </header>
  );
}
