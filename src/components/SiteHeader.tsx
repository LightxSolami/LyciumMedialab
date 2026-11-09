export function SiteHeader() {
  return (
    <header className="masthead" id="haut">
      <a className="brand" href="#couverture" aria-label="Lycium MediaLab, accueil">
        <span className="brand-mark" aria-hidden="true">✧</span>
        <span className="brand-name">
          LYCIUM
          <small>MEDIALAB</small>
        </span>
      </a>
      <span className="header-rule" aria-hidden="true" />
      <button className="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false">
        <span aria-hidden="true">☰</span> Menu
      </button>
      <nav className="main-nav" id="main-nav" aria-label="Navigation principale">
        <a href="#couverture" aria-current="page">Le Magazine</a>
        <a href="#sommaire">Rubriques</a>
        <a href="#oeuvre">Œuvre pilote</a>
        <a href="#videos">Vidéos</a>
        <a href="#arcade">Jeux</a>
        <a href="#login">Éditeurs</a>
        <a href="#communaute">Communauté</a>
      </nav>
    </header>
  );
}
