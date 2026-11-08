import { byId } from "./dom.js";

export function initJ05Game() {
        const canvas = byId("j05-canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Impossible de créer la scène du Chantier vivant.");
        const parts = [
          { key: "pipe", x: 250, y: 180, label: "TUYAU", symbol: "↝" },
          { key: "sensor", x: 420, y: 140, label: "CAPTEUR", symbol: "◉" },
          { key: "gateway", x: 610, y: 184, label: "PASSERELLE", symbol: "⌁" }
        ];
        const platforms = [
          { x: 0, y: 250, width: 720 },
          { x: 180, y: 205, width: 150 },
          { x: 360, y: 165, width: 145 },
          { x: 535, y: 210, width: 165 }
        ];
        const collected = new Set();
        const keys = new Set();
        const player = { x: 30, y: 222, previousY: 222, width: 20, height: 28, velocityX: 0, velocityY: 0, grounded: false };
        let frame = 0;
        let lastTick = 0;
        let won = false;
        const gravity = 620;
        const speed = 180;
        const jump = 310;

        function draw() {
          context.clearRect(0, 0, canvas.width, canvas.height);
          const sky = context.createLinearGradient(0, 0, 0, canvas.height);
          sky.addColorStop(0, "#183a46");
          sky.addColorStop(1, "#0b2028");
          context.fillStyle = sky;
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "#d2b979";
          context.beginPath();
          context.arc(640, 45, 22, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#315047";
          context.fillRect(0, 234, canvas.width, 46);
          for (const platform of platforms.slice(1)) {
            context.fillStyle = "#8c704a";
            context.fillRect(platform.x, platform.y, platform.width, 8);
            context.fillStyle = "#5f8158";
            context.fillRect(platform.x, platform.y - 5, platform.width, 5);
          }
          context.fillStyle = "#87c9d0";
          context.fillRect(48, 225, 75, 4);
          context.fillStyle = "#e9d39f";
          context.font = "11px Arial";
          context.fillText("RÉSERVOIR", 42, 217);
          context.fillText("CHAMP", 630, 225);
          context.fillStyle = "#d1c9bd";
          context.font = "10px Arial";
          context.fillText("Ateliers — approchez et appuyez sur E / Interagir", 14, 18);

          for (const part of parts) {
            const found = collected.has(part.key);
            context.fillStyle = found ? "#6e8a61" : "#f0ca80";
            context.fillRect(part.x - 18, part.y - 19, 36, 27);
            context.strokeStyle = "#071b28";
            context.lineWidth = 2;
            context.strokeRect(part.x - 18, part.y - 19, 36, 27);
            context.fillStyle = "#10232b";
            context.font = "16px Arial";
            context.fillText(found ? "✓" : part.symbol, part.x - 8, part.y);
            context.fillStyle = "#fff2d6";
            context.font = "9px Arial";
            context.fillText(found ? "RÉCUPÉRÉ" : part.label, part.x - 25, part.y - 24);
          }
          context.fillStyle = "#e1c287";
          context.fillRect(674, 184, 20, 42);
          context.fillStyle = "#10232b";
          context.font = "9px Arial";
          context.fillText("TEST", 674, 178);
          context.fillStyle = "#d88763";
          context.fillRect(player.x, player.y, player.width, player.height);
          context.fillStyle = "#f1d8a8";
          context.fillRect(player.x + 12, player.y + 5, 4, 4);
          if (won) {
            context.fillStyle = "#bfe5bf";
            context.font = "bold 15px Arial";
            context.fillText("SYSTÈME EN SERVICE", 246, 60);
          }
        }

        function renderInventory() {
          byId("j05-inventory").innerHTML =
            `<strong>Pièces récupérées : ${collected.size}/3</strong><p>` +
            `${parts.map((part) => `${part.label} ${collected.has(part.key) ? "✓" : "—"}`).join(" · ")}</p>` +
            `<p>Inspectez vos trois chaînes : alimentation → pompe → tuyau → champ ; capteur → passerelle → serveur.</p>`;
        }

        function interact() {
          const centerX = player.x + player.width / 2;
          const centerY = player.y + player.height / 2;
          const nearby = parts.find((part) => Math.hypot(part.x - centerX, part.y - centerY) < 70 && !collected.has(part.key));
          if (nearby) {
            collected.add(nearby.key);
            byId("j05-status").textContent = `${nearby.label} récupéré. Inspectez votre inventaire et continuez vers un autre atelier.`;
            renderInventory();
            draw();
            return;
          }
          const nearTest = Math.abs(centerX - 684) < 54 && centerY > 155;
          if (nearTest) {
            byId("j05-test").click();
            return;
          }
          byId("j05-status").textContent = "Approchez d’un atelier ou du poste de test, puis interagissez.";
        }

        function tick(timestamp) {
          if (!lastTick) lastTick = timestamp;
          const delta = Math.min((timestamp - lastTick) / 1000, 0.04);
          lastTick = timestamp;
          player.previousY = player.y;
          player.velocityX = (keys.has("right") ? speed : 0) - (keys.has("left") ? speed : 0);
          player.x = Math.max(0, Math.min(canvas.width - player.width, player.x + player.velocityX * delta));
          if (keys.has("jump") && player.grounded) {
            player.velocityY = -jump;
            player.grounded = false;
          }
          player.velocityY += gravity * delta;
          player.y += player.velocityY * delta;
          player.grounded = false;
          for (const platform of platforms) {
            const crossed = player.previousY + player.height <= platform.y && player.y + player.height >= platform.y;
            const overlaps = player.x + player.width > platform.x && player.x < platform.x + platform.width;
            if (player.velocityY >= 0 && crossed && overlaps) {
              player.y = platform.y - player.height;
              player.velocityY = 0;
              player.grounded = true;
            }
          }
          if (player.y > canvas.height + 40) {
            player.x = 30;
            player.y = 220;
            player.velocityY = 0;
          }
          draw();
          frame = window.requestAnimationFrame(tick);
        }

        canvas.tabIndex = 0;
        canvas.addEventListener("keydown", (event) => {
          const keyMap = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "jump", " ": "jump" };
          if (keyMap[event.key]) {
            event.preventDefault();
            keys.add(keyMap[event.key]);
          } else if (event.key === "e" || event.key === "E" || event.key === "Enter") {
            event.preventDefault();
            interact();
          }
        });
        canvas.addEventListener("keyup", (event) => {
          const keyMap = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "jump", " ": "jump" };
          if (keyMap[event.key]) keys.delete(keyMap[event.key]);
        });
        canvas.addEventListener("blur", () => keys.clear());
        document.querySelectorAll("[data-j05-control]").forEach((button) => {
          const key = button.dataset.j05Control;
          button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            keys.add(key);
          });
          ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => button.addEventListener(type, () => keys.delete(key)));
        });
        document.querySelectorAll("[data-j05-part]").forEach((button) => {
          button.addEventListener("click", () => {
            const part = parts.find((item) => item.key === button.dataset.j05Part);
            if (!part) throw new Error(`Pièce J05 inconnue : ${button.dataset.j05Part}.`);
            collected.add(part.key);
            byId("j05-status").textContent = `${part.label} récupéré par la commande accessible. Les compatibilités restent à résoudre.`;
            renderInventory();
            draw();
          });
        });
        byId("j05-interact").addEventListener("click", interact);
        byId("j05-test").addEventListener("click", () => {
          won = false;
          if (collected.size !== parts.length) {
            draw();
            byId("j05-status").textContent = "Test refusé : récupérez d’abord le tuyau, le capteur et la passerelle dans le niveau.";
            return;
          }
          const water = byId("j05-water").value;
          const power = byId("j05-power").value;
          const data = byId("j05-data").value;
          const waterWorks = water === "gravity" || water === "pump-hose" && power === "panel";
          const powerWorks = water === "gravity" ? power === "battery" : power === "panel";
          const dataWorks = data === "sensor-gateway";
          if (waterWorks && powerWorks && dataWorks) {
            won = true;
            byId("j05-status").textContent = water === "gravity"
              ? "Mission réussie · conduite gravitaire fonctionnelle ; batterie affectée au signal ; capteur relié par la passerelle."
              : "Mission réussie · panneau alimentant la pompe ; tuyau raccordé au champ ; capteur relié par la passerelle.";
          } else {
            const issues = [];
            if (water === "loose") issues.push("le tuyau n’est pas raccordé");
            else if (water === "pump-hose" && power !== "panel") issues.push("la pompe choisie n’est pas alimentée par cette configuration");
            else if (water === "gravity" && power !== "battery") issues.push("dans cette stratégie, la batterie doit alimenter la chaîne de signal");
            if (!dataWorks) issues.push("le capteur n’atteint pas le serveur sans passerelle");
            byId("j05-status").textContent = `Chaîne à réparer : ${issues.join(" ; ")}. Chaque relation peut être inspectée avant un nouvel essai.`;
          }
          draw();
        });
        byId("j05-reset").addEventListener("click", () => {
          collected.clear();
          keys.clear();
          won = false;
          player.x = 30;
          player.y = 222;
          player.velocityX = 0;
          player.velocityY = 0;
          player.grounded = false;
          byId("j05-power").value = "panel";
          byId("j05-water").value = "pump-hose";
          byId("j05-data").value = "sensor-gateway";
          byId("j05-status").textContent = "Mission recommencée. Rejoignez les ateliers pour récupérer les pièces.";
          renderInventory();
          draw();
        });
        function syncAnimation() {
          const shouldRun = !document.hidden && document.body.dataset.view === "arcade" && document.body.dataset.arcadeGame === "j05-game";
          if (shouldRun && !frame) {
            lastTick = 0;
            frame = window.requestAnimationFrame(tick);
          } else if (!shouldRun && frame) {
            window.cancelAnimationFrame(frame);
            frame = 0;
            lastTick = 0;
            keys.clear();
          }
        }
        document.addEventListener("visibilitychange", syncAnimation);
        document.addEventListener("medialab:viewchange", syncAnimation);
        renderInventory();
        syncAnimation();
      }
