import { createPublicSupabaseClient } from "../features/supabase/client";
import { byId } from "../games/dom.js";
import { initJ01Game } from "../games/j01.js";
import { initJ02Game } from "../games/j02.js";
import { initJ03Game } from "../games/j03.js";
import { initJ04Game } from "../games/j04.js";
import { initJ05Game } from "../games/j05.js";
import { initJ06Game } from "../games/j06.js";
import { rubrics } from "../data/rubrics";
import { number } from "../utils/format";

let initialized = false;

export function initializeLegacyApp(publicProjectConfig) {
  if (initialized) return;
  initialized = true;
      const contents = byId("cover-contents-list");
      const cards = byId("rubric-grid");
      const menu = byId("main-nav");
      const menuToggle = document.querySelector(".menu-toggle");
      const state = { client: null, session: null, editor: false, subscription: null };
      const uploadLimit = 100 * 1024 * 1024;
      let activeIndex = 0;

      let artworkSerial = 0;

      const artPhotos = [
        "assets/passages.jpg",
        "assets/legendes.jpg",
        "assets/flux.jpg",
        "assets/formes.jpg",
        "assets/vivant.jpg",
        "assets/contrechamp.jpg",
        "assets/arcade.jpg"
      ];

      function createEditorialArtwork(rubricIndex, title) {
        const index = ((rubricIndex % rubrics.length) + rubrics.length) % rubrics.length;
        const image = document.createElement("img");
        image.className = "editorial-art";
        image.src = artPhotos[index];
        image.alt = title;
        image.decoding = "async";
        image.loading = "eager";
        image.draggable = false;
        if (index === 0 && artworkSerial === 0) image.fetchPriority = "high";
        artworkSerial++;
        return image;
      }

      function addArtwork(host, rubricIndex, title, label = "") {
        host.replaceChildren(createEditorialArtwork(rubricIndex, title));
        if (label) {
          const stamp = document.createElement("span");
          stamp.className = "art-stamp";
          stamp.textContent = label;
          host.append(stamp);
        }
        return host;
      }

      function rubricIndexFromSlug(slug) {
        const index = rubrics.findIndex((rubric) => rubric.slug === slug);
        return index >= 0 ? index : 0;
      }

      function selectRubric(index) {
        activeIndex = (index + rubrics.length) % rubrics.length;
        const rubric = rubrics[activeIndex];
        addArtwork(byId("cover-illustration"), activeIndex, `${rubric.name} — ${rubric.title}`);
        byId("visual-folio").textContent = `${number(activeIndex)} / 07`;
        byId("pager-label").textContent = `${number(activeIndex)} / 07`;
        byId("visual-category").textContent = rubric.name.toLocaleUpperCase("fr");
        byId("visual-title").textContent = rubric.title;
        byId("selection-open").setAttribute("aria-label", `Découvrir la rubrique sélectionnée : ${rubric.name}`);
        byId("selection-open").href = `#presentation/${rubric.slug}`;
        document.querySelectorAll(".chapter-button").forEach((button, buttonIndex) => {
          button.setAttribute("aria-pressed", String(buttonIndex === activeIndex));
        });
      }

      function renderPresentation(rubric) {
        const index = rubrics.indexOf(rubric);
        addArtwork(byId("presentation-art"), index, `${rubric.name} — ${rubric.title}`);
        byId("presentation-label").textContent = `${number(index)} / 07 · ${rubric.name}`;
        byId("presentation-title").textContent = rubric.title;
        byId("presentation-deck").textContent = rubric.deck;
        byId("presentation-intro").textContent = rubric.presentation.intro;
        byId("presentation-focus-title").textContent = rubric.presentation.focusTitle;
        byId("presentation-focus").textContent = rubric.presentation.focus;
        const questions = byId("presentation-questions");
        questions.replaceChildren();
        rubric.presentation.questions.forEach((question) => {
          const item = document.createElement("li");
          item.textContent = question;
          questions.append(item);
        });
        byId("presentation-status").textContent = `${rubric.status} Cette présentation éditoriale ne remplace pas le texte intégral ni une validation de production.`;
        const gameLink = byId("presentation-game-link");
        gameLink.href = rubric.presentation.gameTarget === "arcade"
          ? "#arcade"
          : `#arcade/${rubric.presentation.gameTarget}`;
        gameLink.textContent = `${rubric.presentation.gameLabel} ↗`;
        gameLink.hidden = false;
        document.title = `${rubric.title} — ${rubric.name} · Lycium MediaLab`;
      }

      function renderRoute() {
        const [route, destination] = decodeURIComponent(window.location.hash.slice(1)).split("/");
        const localGames = new Set(["j01-game", "j02-game", "j03-game", "j04-game", "j05-game", "j06-game"]);
        const rubric = route === "presentation"
          ? rubrics.find((item) => item.slug === destination)
          : null;
        let view = "magazine";
        if (route === "videos") view = "videos";
        else if (route === "arcade") view = "arcade";
        else if (route === "login") view = "login";
        else if (rubric) view = "presentation";
        document.body.dataset.view = view;
        if (view === "arcade" && localGames.has(destination)) {
          document.body.dataset.arcadeGame = destination;
        } else {
          delete document.body.dataset.arcadeGame;
        }

        const activeHref = view === "videos" ? "#videos"
          : view === "arcade" ? "#arcade"
            : view === "login" ? "#login"
              : view === "presentation" ? "#sommaire" : "#couverture";
        menu.querySelectorAll("a").forEach((link) => {
          if (link.getAttribute("href") === activeHref) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
        if (view === "presentation") renderPresentation(rubric);
        else if (view === "login") document.title = "Connexion éditeur · Lycium MediaLab";
        else if (view === "arcade" && document.body.dataset.arcadeGame) {
          const title = byId(`${document.body.dataset.arcadeGame.replace("-game", "")}-title`);
          document.title = `${title?.textContent || "Jeu"} — Arcade · Lycium MediaLab`;
        } else if (view === "arcade") document.title = "Menu des jeux — Arcade · Lycium MediaLab";
        else document.title = "Le Magazine — Lycium MediaLab · N° 01";

        if (view !== "magazine") {
          window.requestAnimationFrame(() => {
            if (view === "arcade" && document.body.dataset.arcadeGame) {
              byId(document.body.dataset.arcadeGame).scrollIntoView({ block: "start" });
            } else if (view === "arcade" && destination && byId(destination)) {
              byId(destination).scrollIntoView({ block: "start" });
            } else {
              window.scrollTo(0, 0);
            }
          });
        }
        window.dispatchEvent(new CustomEvent("medialab:viewchange", { detail: { view, game: document.body.dataset.arcadeGame || null } }));
      }

      function setMessage(id, message, kind = "") {
        const element = byId(id);
        element.textContent = message;
        if (kind) element.dataset.kind = kind;
        else delete element.dataset.kind;
      }

      function getPublicUrl(value, optional = false) {
        const text = String(value || "").trim();
        if (!text && optional) return null;
        let url;
        try {
          url = new URL(text);
        } catch {
          throw new Error("Saisissez une URL complète commençant par https://.");
        }
        if (url.protocol !== "https:" || url.username || url.password) {
          throw new Error("Seules les adresses HTTPS publiques sont acceptées.");
        }
        return url.href;
      }

      function readProjectConfig() {
        const url = byId("project-url").value.trim();
        const key = byId("public-key").value.trim();
        let parsed;
        try {
          parsed = new URL(url);
        } catch {
          throw new Error("L’URL du projet Supabase est invalide.");
        }
        if (parsed.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
          throw new Error("Utilisez l’URL HTTPS de votre projet Supabase.");
        }
        if (!key || key.startsWith("sb_secret_") || key.toLowerCase().includes("service_role")) {
          throw new Error("Utilisez uniquement une clé publique anon / publishable, jamais une clé secrète.");
        }
        if (key.split(".").length === 3) {
          try {
            const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            if (payload.role === "service_role") {
              throw new Error("Cette clé service_role est privée. Utilisez la clé anon / publishable.");
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes("service_role")) throw error;
          }
        }
        return { url: parsed.origin, key };
      }

      function clearLibrary() {
        byId("video-grid").replaceChildren();
        byId("game-grid").replaceChildren();
        const videoEmpty = document.createElement("p");
        videoEmpty.className = "library-empty";
        const videoArt = document.createElement("span");
        videoArt.className = "empty-art";
        addArtwork(videoArt, 0, "Illustration des frontières du savoir", "LYCIUM MEDIALAB");
        videoEmpty.append(videoArt, document.createTextNode("Connectez la base de données pour afficher les vidéos publiées."));
        const gameEmpty = document.createElement("p");
        gameEmpty.className = "library-empty";
        const gameArt = document.createElement("span");
        gameArt.className = "empty-art";
        addArtwork(gameArt, 6, "Illustration du laboratoire ludique", "LE LABORATOIRE LUDIQUE");
        gameEmpty.append(gameArt, document.createTextNode("Aucun jeu publié pour le moment. Choisissez un prototype dans le menu pour jouer."));
        byId("video-grid").append(videoEmpty);
        byId("game-grid").append(gameEmpty);
        byId("video-count").textContent = "Médiathèque non connectée";
      }

      function setEditorSession(session) {
        state.session = session;
        state.editor = session?.user?.app_metadata?.role === "editor";
        byId("editor-tools").hidden = !state.editor;
        byId("login-form").hidden = Boolean(session);
        byId("logout-button").hidden = !session;
        if (!session) {
          setMessage("auth-status", "Les éditeurs se connectent par lien e-mail.");
        } else if (state.editor) {
          setMessage("auth-status", `Accès éditeur confirmé : ${session.user.email || "compte connecté"}.`, "success");
        } else {
          setMessage("auth-status", `Connecté (${session.user.email || "compte"}), mais le rôle éditeur n’est pas attribué dans app_metadata.`, "error");
        }
      }

      function makeFrame(url, title, provider) {
        const frame = document.createElement("iframe");
        frame.src = url;
        frame.title = title;
        frame.loading = "lazy";
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        frame.allowFullscreen = true;
        if (provider === "game") frame.setAttribute("sandbox", "allow-scripts allow-forms allow-pointer-lock allow-presentation");
        return frame;
      }

      function getVideoEmbedUrl(rawUrl) {
        const url = new URL(rawUrl);
        const host = url.hostname.toLowerCase().replace(/^www\./, "");
        if (host === "youtu.be") {
          const videoId = url.pathname.split("/").filter(Boolean)[0];
          return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
        }
        if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
          const videoId = url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
          return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
        }
        if (host === "vimeo.com") {
          const videoId = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
          return videoId ? `https://player.vimeo.com/video/${encodeURIComponent(videoId)}` : null;
        }
        return null;
      }

      function renderVideos(rows) {
        const grid = byId("video-grid");
        grid.replaceChildren();
        byId("video-count").textContent = `${rows.length} ${rows.length > 1 ? "films" : "film"} publié${rows.length > 1 ? "s" : ""}`;
        if (!rows.length) {
          const empty = document.createElement("p");
          empty.className = "library-empty";
          const art = document.createElement("span");
          art.className = "empty-art";
          addArtwork(art, 0, "Les Passages — une lumière à la frontière du visible", "LES PASSAGES");
          empty.append(art, document.createTextNode("Aucun film publié pour le moment. Revenez bientôt pour découvrir les créations du MediaLab."));
          grid.append(empty);
          return;
        }

        rows.forEach((row) => {
          const card = document.createElement("article");
          card.className = "library-card";
          const stage = document.createElement("div");
          stage.className = "video-frame";
          const url = getPublicUrl(row.video_url);
          const embedUrl = row.source_type === "link" ? getVideoEmbedUrl(url) : null;
          const selectedRubric = rubricIndexFromSlug(row.rubric_slug);
          if (row.thumbnail_url) {
            const image = document.createElement("img");
            image.src = getPublicUrl(row.thumbnail_url);
            image.alt = "";
            image.loading = "lazy";
            stage.append(image);
          } else {
            addArtwork(stage, selectedRubric, `${row.title} — ${rubrics[selectedRubric].name}`, rubrics[selectedRubric].name);
          }
          if (embedUrl) {
            stage.append(makeFrame(embedUrl, `Lecteur vidéo : ${row.title}`, "video"));
          } else if (row.source_type === "upload" || /\.(mp4|webm|ogg|mov)(?:$|[?#])/i.test(url)) {
            const player = document.createElement("video");
            player.controls = true;
            player.preload = "metadata";
            player.playsInline = true;
            player.src = url;
            player.setAttribute("aria-label", row.title);
            stage.append(player);
          } else {
            const link = document.createElement("a");
            link.className = "library-action";
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Regarder la vidéo ↗";
            stage.append(link);
          }
          if (!embedUrl) {
            if (!embedUrl) {
              const play = document.createElement("span");
              play.className = "video-play-mark";
              play.setAttribute("aria-hidden", "true");
              play.textContent = "▶";
              stage.append(play);
            }
          }
          const body = document.createElement("div");
          body.className = "library-card-body";
          const title = document.createElement("h4");
          title.textContent = row.title;
          const description = document.createElement("p");
          description.textContent = row.description || "Une création Lycium MediaLab.";
          body.append(title, description);
          if (row.credits) {
            const credits = document.createElement("span");
            credits.className = "library-meta";
            credits.textContent = `Crédits · ${row.credits}`;
            body.append(credits);
          }
          card.append(stage, body);
          grid.append(card);
        });
      }

      function renderGames(rows) {
        const grid = byId("game-grid");
        const heading = byId("published-games-heading");
        grid.replaceChildren();
        if (!rows.length) {
          grid.hidden = true;
          heading.hidden = true;
          return;
        }

        grid.hidden = false;
        heading.hidden = false;
        rows.forEach((row) => {
          const card = document.createElement("article");
          card.className = "game-card";
          const stage = document.createElement("div");
          stage.className = "game-stage";
          const selectedRubric = rubricIndexFromSlug(row.rubric_slug);
          const coverUrl = row.cover_url ? getPublicUrl(row.cover_url) : null;
          if (coverUrl) {
            const image = document.createElement("img");
            image.src = coverUrl;
            image.alt = "";
            image.loading = "lazy";
            stage.append(image);
          } else {
            addArtwork(stage, selectedRubric, `${row.title} — ${rubrics[selectedRubric].name}`, rubrics[selectedRubric].name);
          }
          const url = getPublicUrl(row.game_url);
          const body = document.createElement("div");
          body.className = "game-card-body";
          const title = document.createElement("h3");
          title.textContent = row.title;
          const description = document.createElement("p");
          description.textContent = row.description || "Une expérience interactive du laboratoire ludique.";
          const launch = document.createElement("a");
          launch.className = "library-action";
          launch.href = url;
          launch.target = "_blank";
          launch.rel = "noopener noreferrer";
          launch.textContent = "Ouvrir le jeu dans un nouvel onglet ↗";
          body.append(title, description, launch);
          card.append(stage, body);
          grid.append(card);
        });
      }

      async function refreshLibrary() {
        if (!state.client) return;
        const [videos, games] = await Promise.all([
          state.client.from("media_videos").select("id,title,description,source_type,video_url,thumbnail_url,credits,rubric_slug,created_at").eq("is_published", true).eq("rights_verified", true).order("created_at", { ascending: false }).limit(24),
          state.client.from("arcade_games").select("id,title,description,game_url,cover_url,launch_mode,rubric_slug,created_at").eq("is_published", true).eq("rights_verified", true).order("created_at", { ascending: false }).limit(24)
        ]);
        if (videos.error) throw new Error(`Vidéos : ${videos.error.message}`);
        if (games.error) throw new Error(`Jeux : ${games.error.message}`);
        renderVideos(videos.data || []);
        renderGames(games.data || []);
      }

      async function connectProject() {
        const config = readProjectConfig();
        if (state.subscription) {
          state.subscription.unsubscribe();
          state.subscription = null;
        }
        state.client = createPublicSupabaseClient(config);
        setMessage("database-status", "Connexion à Supabase…");
        try {
          const { data, error } = await state.client.auth.getSession();
          if (error) throw error;
          setEditorSession(data.session);
          const auth = state.client.auth.onAuthStateChange((_event, session) => {
            setEditorSession(session);
            window.setTimeout(() => {
              refreshLibrary().catch((error) => setMessage("database-status", error.message, "error"));
            }, 0);
          });
          state.subscription = auth.data.subscription;
          await refreshLibrary();
          setMessage("database-status", "Base connectée. Vidéos et jeux synchronisés.", "success");
        } catch (error) {
          if (state.subscription) {
            state.subscription.unsubscribe();
            state.subscription = null;
          }
          state.client = null;
          setEditorSession(null);
          clearLibrary();
          throw error;
        }
      }

      function setBusy(buttonId, busy, label) {
        const button = byId(buttonId);
        if (busy) {
          button.dataset.originalLabel = button.textContent;
          button.textContent = label;
        } else if (button.dataset.originalLabel) {
          button.textContent = button.dataset.originalLabel;
          delete button.dataset.originalLabel;
        }
        button.disabled = busy;
      }

      async function publishVideo(event) {
        event.preventDefault();
        if (!state.client || !state.editor) {
          setMessage("video-message", "Connectez-vous avec un compte éditeur pour publier.", "error");
          return;
        }
        const form = event.currentTarget;
        const fields = new FormData(form);
        const sourceType = String(fields.get("sourceType"));
        let uploadedPath = null;
        setBusy("publish-video-button", true, "Publication…");
        setMessage("video-message", "Préparation de la publication…");
        try {
          if (!fields.has("rightsVerified")) throw new Error("Confirmez les droits de publication avant de continuer.");
          const thumbnailUrl = getPublicUrl(fields.get("thumbnailUrl"), true);
          let videoUrl;
          if (sourceType === "upload") {
            const file = byId("video-file").files[0];
            const acceptedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
            if (!file) throw new Error("Choisissez un fichier vidéo.");
            if (!acceptedTypes.includes(file.type)) throw new Error("Format refusé. Utilisez MP4, WebM, Ogg ou MOV.");
            if (file.size > uploadLimit) throw new Error("Le fichier dépasse la limite de 100 Mo. Utilisez un lien hébergé.");
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            uploadedPath = `${crypto.randomUUID()}-${safeName}`;
            const upload = await state.client.storage.from("lycium-videos").upload(uploadedPath, file, {
              cacheControl: "3600",
              contentType: file.type,
              upsert: false
            });
            if (upload.error) throw new Error(`Échec de l’envoi vidéo : ${upload.error.message}`);
            videoUrl = state.client.storage.from("lycium-videos").getPublicUrl(uploadedPath).data.publicUrl;
          } else {
            videoUrl = getPublicUrl(fields.get("videoUrl"));
          }
          const result = await state.client.from("media_videos").insert({
            title: String(fields.get("title")).trim(),
            description: String(fields.get("description") || "").trim(),
            source_type: sourceType,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            rubric_slug: String(fields.get("rubricSlug")),
            credits: String(fields.get("credits") || "").trim(),
            rights_verified: true,
            is_published: true
          });
          if (result.error) {
            if (uploadedPath) {
              const cleanup = await state.client.storage.from("lycium-videos").remove([uploadedPath]);
              if (cleanup.error) console.error("Could not remove the unreferenced upload:", cleanup.error.message);
            }
            throw new Error(`Échec de l’enregistrement : ${result.error.message}`);
          }
          form.reset();
          syncVideoSource();
          await refreshLibrary();
          setMessage("video-message", "Vidéo publiée et visible dans la médiathèque.", "success");
        } catch (error) {
          setMessage("video-message", error.message || "La vidéo n’a pas pu être publiée.", "error");
        } finally {
          setBusy("publish-video-button", false);
        }
      }

      async function publishGame(event) {
        event.preventDefault();
        if (!state.client || !state.editor) {
          setMessage("game-message", "Connectez-vous avec un compte éditeur pour publier.", "error");
          return;
        }
        const form = event.currentTarget;
        const fields = new FormData(form);
        setBusy("publish-game-button", true, "Publication…");
        setMessage("game-message", "Enregistrement du jeu…");
        try {
          if (!fields.has("rightsVerified")) throw new Error("Confirmez les droits de publication avant de continuer.");
          const result = await state.client.from("arcade_games").insert({
            title: String(fields.get("title")).trim(),
            description: String(fields.get("description") || "").trim(),
            rubric_slug: String(fields.get("rubricSlug")),
            game_url: getPublicUrl(fields.get("gameUrl")),
            cover_url: getPublicUrl(fields.get("coverUrl"), true),
            launch_mode: String(fields.get("launchMode")),
            rights_verified: true,
            is_published: true
          });
          if (result.error) throw new Error(`Échec de la publication : ${result.error.message}`);
          form.reset();
          await refreshLibrary();
          setMessage("game-message", "Jeu publié dans le laboratoire ludique.", "success");
        } catch (error) {
          setMessage("game-message", error.message || "Le jeu n’a pas pu être publié.", "error");
        } finally {
          setBusy("publish-game-button", false);
        }
      }

      function syncVideoSource() {
        const upload = byId("video-source").value === "upload";
        byId("video-url-label").hidden = upload;
        byId("video-url").required = !upload;
        byId("video-file-label").hidden = !upload;
        byId("video-file").required = upload;
      }

      document.querySelectorAll(".rubric-options").forEach((select) => {
        rubrics.forEach((rubric) => {
          const option = document.createElement("option");
          option.value = rubric.slug;
          option.textContent = rubric.name;
          select.append(option);
        });
      });

      byId("config-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          const config = readProjectConfig();
          localStorage.setItem("lycium-supabase-config", JSON.stringify(config));
          localStorage.removeItem("lycium-supabase-disconnected");
          await connectProject();
        } catch (error) {
          setMessage("database-status", error.message || "Impossible de connecter le projet.", "error");
        }
      });
      byId("disconnect-button").addEventListener("click", async () => {
        try {
          localStorage.removeItem("lycium-supabase-config");
          localStorage.setItem("lycium-supabase-disconnected", "true");
          if (state.client) {
            const { error } = await state.client.auth.signOut();
            if (error) throw error;
          }
          if (state.subscription) state.subscription.unsubscribe();
          state.client = null;
          state.subscription = null;
          setEditorSession(null);
          clearLibrary();
          setMessage("database-status", "Projet déconnecté de ce navigateur.");
        } catch (error) {
          setMessage("database-status", `Déconnexion impossible : ${error.message}`, "error");
        }
      });
      byId("login-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!state.client) {
          setMessage("auth-status", "Connectez d’abord votre projet Supabase.", "error");
          return;
        }
        setBusy("login-button", true, "Envoi du lien…");
        try {
          const email = byId("editor-email").value.trim();
          const redirectTo = window.location.href.split(/[?#]/)[0];
          const { error } = await state.client.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo, shouldCreateUser: false }
          });
          if (error) throw error;
          setMessage("auth-status", "Lien de connexion envoyé. Consultez votre boîte e-mail.", "success");
        } catch (error) {
          setMessage("auth-status", `Connexion impossible : ${error.message}`, "error");
        } finally {
          setBusy("login-button", false);
        }
      });
      byId("logout-button").addEventListener("click", async () => {
        try {
          const { error } = await state.client.auth.signOut();
          if (error) throw error;
          setEditorSession(null);
          setMessage("auth-status", "Vous êtes déconnecté.");
        } catch (error) {
          setMessage("auth-status", `Déconnexion impossible : ${error.message}`, "error");
        }
      });
      byId("video-source").addEventListener("change", syncVideoSource);
      byId("video-form").addEventListener("submit", publishVideo);
      byId("game-form").addEventListener("submit", publishGame);

      initJ01Game();
      initJ02Game();
      initJ03Game();
      initJ04Game();
      initJ05Game();
      initJ06Game();
      clearLibrary();
      try {
        const saved = JSON.parse(localStorage.getItem("lycium-supabase-config") || "null");
        const config = saved?.url && saved?.key ? saved : publicProjectConfig;
        if (!config?.url || !config?.key) {
          setMessage("database-status", "Projet Supabase non configuré. Ajoutez l’URL et la clé publishable dans .env.local.");
        } else {
          byId("project-url").value = config.url;
          byId("public-key").value = config.key;
        }
        if (config?.url && config?.key && localStorage.getItem("lycium-supabase-disconnected") !== "true") {
          connectProject().then(() => {
            setMessage("database-status", "Base connectée. Vidéos et jeux synchronisés.", "success");
          }).catch((error) => {
            setMessage("database-status", `Connexion Supabase impossible : ${error.message}`, "error");
          });
        }
      } catch (error) {
        setMessage("database-status", `Configuration locale inaccessible : ${error.message}`, "error");
      }
      syncVideoSource();

      rubrics.forEach((rubric, index) => {
        const button = document.createElement("button");
        button.className = "chapter-button";
        button.type = "button";
        button.setAttribute("aria-pressed", String(index === activeIndex));
        button.setAttribute("aria-label", `Sélectionner ${rubric.name} : ${rubric.title}`);
        button.innerHTML = `<span class="chapter-number">${number(index)}</span><span><span class="chapter-title"></span><span class="chapter-work"></span></span><span class="chapter-arrow" aria-hidden="true">↗</span>`;
        button.querySelector(".chapter-title").textContent = rubric.name;
        button.querySelector(".chapter-work").textContent = rubric.title;
        button.addEventListener("click", () => selectRubric(index));
        contents.append(button);

        const article = document.createElement("article");
        article.className = "rubric-card";
        const art = document.createElement("div");
        art.className = "card-art";
        art.setAttribute("aria-hidden", "true");
        addArtwork(art, index, `${rubric.name} — ${rubric.title}`, rubric.name);
        const body = document.createElement("div");
        body.className = "card-body";
        const folio = document.createElement("span");
        folio.className = "card-number";
        folio.textContent = `${number(index)} / ${rubric.name.toLocaleUpperCase("fr")}`;
        const title = document.createElement("h3");
        title.textContent = rubric.title;
        const description = document.createElement("p");
        description.textContent = rubric.description;
        const status = document.createElement("span");
        status.className = "status-line";
        status.textContent = rubric.status;
        const open = document.createElement("a");
        open.className = "card-open";
        open.href = `#presentation/${rubric.slug}`;
        open.textContent = "Voir la présentation ↗";
        open.setAttribute("aria-label", `Voir la présentation de ${rubric.name}`);
        body.append(folio, title, description, status, open);
        article.append(art, body);
        cards.append(article);
      });
      selectRubric(0);

      byId("previous-rubric").addEventListener("click", () => selectRubric(activeIndex - 1));
      byId("next-rubric").addEventListener("click", () => selectRubric(activeIndex + 1));
      byId("cover-art").addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          selectRubric(activeIndex - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          selectRubric(activeIndex + 1);
        }
      });
      menuToggle.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("menu-open", isOpen);
      });
      menu.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
          menu.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("menu-open");
        }
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menu.classList.contains("is-open")) {
          menu.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("menu-open");
          menuToggle.focus();
        }
      });
      window.addEventListener("hashchange", renderRoute);
      renderRoute();

}
