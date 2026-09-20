import { PromoReel } from "./promo-reel";

export function AboutSection() {
  return (
    <section className="band-story" id="about" aria-labelledby="about-title" tabIndex={-1}>
      <h2 id="about-title">ABOUT</h2>
      <div className="story-layout">
        <article>
          <p className="story-intro">
            Live Alone is a Portland post-hardcore band built on friendships that
            started long before the band itself.
          </p>
          <div className="story-copy">
            <p>
              Dan Beggs, Teryl Neal and Austin Johnson grew up together, playing
              in bands, making electronic & hip-hop beats and growing as musicians from childhood
              into adulthood. Beggs and Neal have known each other since
              kindergarten; years later, while several of them were living together,
              Neal and Johnson began writing the songs that would eventually pull
              Live Alone into focus in 2021. Longtime friend Daniel “DC” Christina
              completes the lineup on drums.
            </p>
            <p>
              Their 2024 EP In From the Cold found the band circling themes that had
              emerged naturally from those shared years: depression, growing older,
              looking back at who you used to be, and learning to believe that
              things can get better. Underneath that introspection is an equally
              persistent idea of friendship and community, the people who help carry
              you through it.
            </p>
            <p>
              Live Alone’s newer material pushes further into melody, technical
              songwriting and storytelling, while the writing itself has become
              increasingly collaborative. More than anything, the band remains what
              brought it together in the first place: four longtime friends who
              genuinely love making music with one another.
            </p>
          </div>
          <dl className="band-members" aria-label="Current band lineup">
            <div><dt>Austin Johnson</dt><dd>Guitar</dd></div>
            <div><dt>Teryl &quot;Pace&quot; Neal</dt><dd>Guitar, lead vocals</dd></div>
            <div><dt>Dan Beggs</dt><dd>Bass, backing vocals</dd></div>
            <div><dt>Daniel “DC” Christina</dt><dd>Drums</dd></div>
          </dl>
        </article>
        <PromoReel />
      </div>
    </section>
  );
}
