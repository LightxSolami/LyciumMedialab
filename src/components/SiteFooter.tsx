import { socialLinks, type SocialPlatform } from "../data/socialLinks";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.6 7.1a7.1 7.1 0 0 1-4.4-1.5v9.1a6.3 6.3 0 1 1-5.4-6.2v3.5a2.8 2.8 0 1 0 2 2.7V2h3.4c.2 2.2 2 4 4.4 4.2z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2.2a3 3 0 0 0-3 3v9.6a3 3 0 0 0 3 3h9.6a3 3 0 0 0 3-3V7.2a3 3 0 0 0-3-3zm9.9 1.7a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 6.9a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Zm0 2.2a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21z" />
        </svg>
      );
  }
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© Lycium MediaLab · magazine indépendant.</span>
      <span>Vidéos et jeux partagés depuis Supabase · crédits à renseigner.</span>
      <nav className="social-links" aria-label="Réseaux sociaux">
        {socialLinks.map(({ platform, label, href }) =>
          href ? (
            <a key={platform} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
              <SocialIcon platform={platform} />
              <span>{label}</span>
            </a>
          ) : (
            <span className="social-link-pending" key={platform} title={`Lien ${label} à ajouter`} aria-label={`${label} — lien à ajouter`}>
              <SocialIcon platform={platform} />
              <span>{label}</span>
            </span>
          ),
        )}
      </nav>
      <details className="photo-credits">
        <summary>Sources des photographies</summary>
        <div className="photo-credit-list">
          <a href="https://unsplash.com/photo-1462331940025-496dfbfc7564" target="_blank" rel="noopener noreferrer">Nébuleuse des Passages · Unsplash ↗</a>
          <a href="https://unsplash.com/photo-1534796636912-3b95b3ab5986" target="_blank" rel="noopener noreferrer">Ciel étoilé d’Ératosthène · Unsplash ↗</a>
          <a href="https://unsplash.com/photo-1526778548025-fa2f459cd5c1" target="_blank" rel="noopener noreferrer">Carte du monde · Unsplash ↗</a>
          <a href="https://unsplash.com/photo-1511379938547-c1f69419868d" target="_blank" rel="noopener noreferrer">Studio de musique · Unsplash ↗</a>
          <a href="https://unsplash.com/photo-1416879595882-3373a0480b5b" target="_blank" rel="noopener noreferrer">Jardinage · Unsplash ↗</a>
          <a href="https://unsplash.com/photo-1532094349884-543bc11b234d" target="_blank" rel="noopener noreferrer">Laboratoire · Unsplash ↗</a>
          <a href="https://unsplash.com/photo-1493711662062-fa541adb3fc8" target="_blank" rel="noopener noreferrer">Jeu vidéo · Unsplash ↗</a>
        </div>
      </details>
      <a href="#haut">Retour en haut ↑</a>
    </footer>
  );
}
