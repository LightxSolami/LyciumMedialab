export default function LoginPage() {
  return (
    <section className="login-page" data-app-page="login" aria-labelledby="login-title">
      <div className="login-content">
        <a className="login-back" href="#couverture">← Retour au magazine</a>
        <div className="login-card">
          <span className="section-kicker">Espace réservé à l’équipe</span>
          <h1 id="login-title">Connexion éditeur</h1>
          <p>
            Recevez un lien de connexion sécurisé par e-mail. Seules les adresses déjà autorisées comme comptes éditeurs peuvent accéder à la publication.
          </p>
          <form className="admin-form" id="login-form">
            <label htmlFor="editor-email">Adresse e-mail du compte éditeur
              <input id="editor-email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" required />
            </label>
            <button type="submit" id="login-button">M’envoyer un lien sécurisé</button>
          </form>
          <div className="login-session">
            <button className="library-action" type="button" id="logout-button" hidden>Se déconnecter</button>
          </div>
          <p className="admin-message" id="auth-status" role="status" aria-live="polite">
            Les éditeurs se connectent par lien e-mail.
          </p>
          <a className="login-admin-link" href="#videos">Retour à la médiathèque</a>
        </div>
      </div>
    </section>
  );
}
