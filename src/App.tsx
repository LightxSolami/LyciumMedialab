import { useEffect, useState } from "react";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { publicSupabaseConfig } from "./config";
import AdminPage from "./pages/AdminPage";
import ArcadePage from "./pages/ArcadePage";
import CommunityPage from "./pages/CommunityPage";
import MagazinePage from "./pages/MagazinePage";
import LoginPage from "./pages/LoginPage";
import PresentationPage from "./pages/PresentationPage";
import VideosPage from "./pages/VideosPage";
import "./styles/site.css";

export default function App() {
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    import("./legacy/initialize.js")
      .then(({ initializeLegacyApp }) => initializeLegacyApp(publicSupabaseConfig))
      .catch((error: unknown) => {
        console.error("Unable to initialize the magazine site.", error);
        if (active) {
          setStartupError(error instanceof Error ? error.message : "Impossible de démarrer le site.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {startupError && <p className="runtime-error" role="alert">{startupError}</p>}
      <a className="skip-link" href="#couverture">
        Aller à la couverture
      </a>
      <SiteHeader />
      <main>
        <MagazinePage />
        <VideosPage />
        <ArcadePage />
        <PresentationPage />
        <LoginPage />
        <AdminPage />
        <CommunityPage />
      </main>
      <SiteFooter />
    </>
  );
}
