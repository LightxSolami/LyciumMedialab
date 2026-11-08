import { byId } from "./dom.js";

export function initJ06Game() {
        const cases = [
          {
            title: "01 · Les fioles bleues",
            claim: "Dossier fictif : « Dans quatre essais de démonstration, la solution A a changé de couleur lorsque la température a augmenté. »",
            proof: "Le carnet décrit quatre observations sur une seule préparation. La couleur observée est notée, mais aucun instrument de mesure indépendant n’a été utilisé.",
            credits: [
              ["Équipe de mesure", "a préparé les relevés et consigné les températures."],
              ["Technicienne de laboratoire", "a préparé la solution et vérifié le protocole."],
              ["Archiviste du protocole", "a conservé les versions du carnet."]
            ],
            requiredCredits: ["Équipe de mesure", "Technicienne de laboratoire"],
            limits: "Il manque des préparations indépendantes, une comparaison témoin et une mesure instrumentale de la couleur. La démonstration ne suffit pas à généraliser.",
            confidence: "limited"
          },
          {
            title: "02 · Les chemins du jardin",
            claim: "Dossier fictif : « Le parcours balisé a coïncidé avec davantage de passages dans ce jardin lors d’un essai organisé. »",
            proof: "Le dossier compte 40 créneaux répartis entre deux parcours, avec un comptage anonyme par créneau. La répartition a été tirée au sort ; l’écart est mesuré pendant la période d’essai.",
            credits: [
              ["Équipe de collecte", "a compté les passages selon le même protocole."],
              ["Technicienne de terrain", "a installé les balises et vérifié leur état."],
              ["Groupe de visiteurs volontaires", "a participé aux essais des parcours."],
              ["Équipe d’analyse", "a comparé les créneaux et documenté la méthode."]
            ],
            requiredCredits: ["Équipe de collecte", "Technicienne de terrain", "Groupe de visiteurs volontaires"],
            limits: "Une seule période, un seul jardin et des créneaux organisés : la saison, la météo ou la présence des observateurs peuvent encore compter.",
            confidence: "moderate"
          },
          {
            title: "03 · Les capteurs en relais",
            claim: "Dossier fictif : « Dans ce banc d’essai précis, la passerelle a transmis les relevés attendus à chaque cycle. »",
            proof: "Douze cycles prédéfinis ont été répétés avec un journal local indépendant. Les valeurs d’entrée et de sortie concordent, et le protocole inclut un test de déconnexion puis de reprise.",
            credits: [
              ["Laboratoire indépendant", "a défini et exécuté le protocole de vérification."],
              ["Équipe instrumentale", "a calibré les capteurs et documenté les versions."],
              ["Ingénieure réseau", "a conçu le journal de transmission et le test de reprise."],
              ["Responsable de maintenance", "a répété le cycle après reconnexion."]
            ],
            requiredCredits: ["Laboratoire indépendant", "Équipe instrumentale", "Ingénieure réseau"],
            limits: "La robustesse concerne ce banc d’essai, ces versions et ces cycles ; elle n’établit pas le comportement dans toutes les installations ou conditions réelles.",
            confidence: "strong"
          },
          {
            title: "04 · Les réponses en miroir",
            claim: "Dossier fictif : « Les réponses recueillies suggèrent que la formulation de la question a pu influencer les choix. »",
            proof: "Les notes montrent deux formulations et des réponses différentes, mais l’ordre de présentation n’a pas été conservé et les groupes ne sont pas comparables.",
            credits: [
              ["Volontaires interrogés", "ont donné les réponses qui figurent au dossier."],
              ["Équipe de rédaction", "a conçu les deux formulations comparées."],
              ["Équipe d’analyse", "a repéré l’écart et consigné les réponses."],
              ["Facilitatrice de séance", "a organisé la collecte dans chaque groupe."]
            ],
            requiredCredits: ["Volontaires interrogés", "Équipe de rédaction", "Équipe d’analyse"],
            limits: "Le petit dossier ne sépare pas l’effet de la formulation de l’ordre, des différences entre groupes ou du mode de collecte. Il faut un protocole comparatif mieux contrôlé.",
            confidence: "none"
          }
        ];
        let current = 0;
        const consulted = new Set();
        const selectedCredits = new Set();

        function resetCaseState() {
          consulted.clear();
          selectedCredits.clear();
          byId("j06-confidence").value = "";
          document.querySelectorAll("[data-j06-request]").forEach((button) => button.setAttribute("aria-pressed", "false"));
          byId("j06-evidence").replaceChildren(Object.assign(document.createElement("p"), {
            className: "prototype-copy",
            textContent: "Demandez à consulter les pièces du dossier."
          }));
          byId("j06-status").textContent = "Toutes les personnes, institutions et recherches décrites ici sont fictives.";
          renderCredits();
        }

        function renderCase() {
          const dossier = cases[current];
          byId("j06-claim").replaceChildren();
          const title = document.createElement("strong");
          title.textContent = dossier.title;
          const claim = document.createElement("p");
          claim.textContent = dossier.claim;
          const fiction = document.createElement("p");
          fiction.textContent = "Étude, institutions et personnes entièrement fictives.";
          byId("j06-claim").append(title, claim, fiction);
          document.querySelectorAll("[data-j06-case]").forEach((button, index) => {
            button.setAttribute("aria-pressed", String(index === current));
          });
          resetCaseState();
        }

        function renderCredits() {
          const container = byId("j06-credits");
          container.replaceChildren();
          for (const [name, role] of cases[current].credits) {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = selectedCredits.has(name);
            checkbox.addEventListener("change", () => {
              if (checkbox.checked) selectedCredits.add(name);
              else selectedCredits.delete(name);
            });
            const text = document.createElement("span");
            text.textContent = `${name} : ${role}`;
            label.append(checkbox, text);
            container.append(label);
          }
        }

        function showEvidence(kind) {
          const dossier = cases[current];
          consulted.add(kind);
          document.querySelectorAll("[data-j06-request]").forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.j06Request === kind));
          });
          const container = byId("j06-evidence");
          container.replaceChildren();
          const heading = document.createElement("strong");
          const paragraph = document.createElement("p");
          if (kind === "proof") {
            heading.textContent = "Trace de méthode";
            paragraph.textContent = dossier.proof;
          } else if (kind === "credits") {
            heading.textContent = "Contributions rapportées";
            paragraph.textContent = "Les rôles à reconnaître sont listés ci-dessous. Sélectionnez les contributions qui ont effectivement participé au dossier ; la liste ne désigne pas un héros unique.";
            renderCredits();
          } else {
            heading.textContent = "Limites documentées";
            paragraph.textContent = dossier.limits;
          }
          container.append(heading, paragraph);
          if (kind === "credits") {
            const note = document.createElement("p");
            note.className = "prototype-note";
            note.textContent = "Vous pouvez modifier votre attribution avant de présenter la conclusion.";
            container.append(note);
          }
          byId("j06-status").textContent = `Pièce consultée : ${kind === "proof" ? "preuve" : kind === "credits" ? "contributions" : "limites"}. Vous pouvez examiner les autres avant de conclure.`;
        }

        const tabs = byId("j06-tabs");
        cases.forEach((dossier, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.j06Case = String(index);
          button.textContent = dossier.title;
          button.setAttribute("aria-pressed", "false");
          button.addEventListener("click", () => {
            current = index;
            renderCase();
          });
          tabs.append(button);
        });
        document.querySelectorAll("[data-j06-request]").forEach((button) => {
          button.addEventListener("click", () => showEvidence(button.dataset.j06Request));
        });
        byId("j06-submit").addEventListener("click", () => {
          const dossier = cases[current];
          const confidence = byId("j06-confidence").value;
          const missing = ["proof", "credits", "limits"].filter((item) => !consulted.has(item));
          const missingCredits = dossier.requiredCredits.filter((name) => !selectedCredits.has(name));
          if (missing.length || missingCredits.length || !confidence) {
            const next = [];
            if (missing.length) next.push(`consultez encore : ${missing.map((item) => item === "proof" ? "la preuve" : item === "credits" ? "les contributions" : "les limites").join(", ")}`);
            if (missingCredits.length) next.push(`reconnaissez : ${missingCredits.join(", ")}`);
            if (!confidence) next.push("choisissez un niveau de confiance");
            byId("j06-status").textContent = `Dossier incomplet : ${next.join(" ; ")}. Vous pouvez reprendre sans pénalité.`;
            return;
          }
          if (confidence === dossier.confidence) {
            byId("j06-status").textContent = `Conclusion argumentée pour ce dossier : votre niveau de confiance correspond aux pièces et aux limites, et les contributions clés sont reconnues. Ce verdict ne vaut que pour cette étude fictive.`;
          } else if (confidence === "dismiss") {
            byId("j06-status").textContent = "Le soupçon seul n’est pas une preuve : le dossier invite à évaluer ses traces et ses limites, pas à déclarer automatiquement l’affirmation fausse.";
          } else {
            byId("j06-status").textContent = `Contrechamp : avec les pièces et limites de ce dossier, « ${confidence} » ne correspond pas au niveau de confiance étayé. Le verdict porte sur cette étude fictive, pas sur une autorité.`;
          }
        });
        renderCase();
      }
