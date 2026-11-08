import { byId } from "./dom.js";

export function initJ02Game() {
        const angle = byId("j02-angle");
        const distance = byId("j02-distance");
        const status = byId("j02-status");
        function update() {
          const degrees = Number(angle.value);
          const distanceStades = Number(distance.value);
          byId("j02-angle-label").textContent = `${degrees.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}°`;
          if (!Number.isFinite(distanceStades) || distanceStades <= 0 || distanceStades > 100000 || !Number.isFinite(degrees) || degrees <= 0) {
            byId("j02-result").textContent = "—";
            byId("j02-ratio").textContent = "—";
            byId("j02-shadow").textContent = "—";
            status.textContent = "Saisissez un angle non nul et une distance strictement positive, jusqu’à 100 000 stades.";
            return;
          }
          const circumference = 360 * distanceStades / degrees;
          const ratio = 360 / degrees;
          const shadowRatio = Math.tan(degrees * Math.PI / 180);
          const arcEndX = 70 + Math.sin(degrees * Math.PI / 180) * 32;
          const arcEndY = 80 + Math.cos(degrees * Math.PI / 180) * 32;
          const shadowEndX = 70 + shadowRatio * 64;
          byId("j02-ray").setAttribute("x2", shadowEndX.toFixed(2));
          byId("j02-shadow-line").setAttribute("x2", shadowEndX.toFixed(2));
          byId("j02-angle-arc").setAttribute("d", `M70 80 A32 32 0 0 1 ${arcEndX.toFixed(2)} ${arcEndY.toFixed(2)}`);
          byId("j02-result").textContent = Math.round(circumference).toLocaleString("fr-FR");
          byId("j02-ratio").textContent = `1 / ${ratio.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}`;
          byId("j02-shadow").textContent = shadowRatio.toLocaleString("fr-FR", { maximumFractionDigits: 3 });
          status.textContent = "Résultat déterministe du modèle affiché ; changez une hypothèse pour comparer.";
        }
        angle.addEventListener("input", update);
        distance.addEventListener("input", update);
        update();
      }
