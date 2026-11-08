import { byId } from "./dom.js";

export function initJ03Game() {
        const rows = 5;
        const columns = 7;
        const rivers = new Set(["1,2", "2,2", "3,3", "4,3", "5,2"]);
        const ridges = new Set(["0,0", "1,0", "2,0", "5,0", "6,0", "0,4", "6,4"]);
        const settlements = new Set(["0,2", "3,2", "6,2"]);
        const market = "3,1";
        const builds = new Map();
        const tiles = new Map();
        const seasonNames = ["Printemps · ordinaire", "Été · sécheresse", "Automne · crue", "Hiver · ordinaire"];
        let season = 0;
        let budget = 4;
        let selected = null;
        let hiddenLayers = new Set();
        const costs = { canal: 2, road: 2, field: 1, reserve: 2 };
        const symbols = { canal: "〰", road: "╱", field: "▦", reserve: "◉" };
        const names = { canal: "Canal", road: "Passage", field: "Parcelle cultivée", reserve: "Réserve" };
        const map = byId("j03-map");

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < columns; col += 1) {
            const key = `${col},${row}`;
            const tile = document.createElement("button");
            tile.type = "button";
            tile.className = "valley-tile";
            const terrain = ridges.has(key) ? "ridge" : rivers.has(key) ? "river" : settlements.has(key) ? "settlement" : key === market ? "market" : "land";
            tile.dataset.terrain = terrain;
            tile.setAttribute("aria-pressed", "false");
            tiles.set(key, tile);
            map.append(tile);
            tile.addEventListener("click", () => {
              selected = key;
              for (const [tileKey, button] of tiles) button.setAttribute("aria-pressed", String(tileKey === key));
              byId("j03-selection").textContent = describeTile(key);
            });
          }
        }

        function describeTile(key) {
          const [col, row] = key.split(",").map(Number);
          const tile = tiles.get(key);
          const feature = tile.dataset.terrain === "ridge" ? "relief" :
            tile.dataset.terrain === "river" ? "cours d’eau" :
              tile.dataset.terrain === "settlement" ? "communauté" :
                tile.dataset.terrain === "market" ? "marché" : "sol disponible";
          const installed = builds.has(key) ? ` Aménagement : ${names[builds.get(key)]}.` : "";
          return `Case ${col + 1}, rive ${row < 2 ? "nord" : row > 2 ? "sud" : "centrale"} : ${feature}.${installed}`;
        }

        function neighbors(key) {
          const [col, row] = key.split(",").map(Number);
          return [[col - 1, row], [col + 1, row], [col, row - 1], [col, row + 1]]
            .filter(([nextCol, nextRow]) => nextCol >= 0 && nextCol < columns && nextRow >= 0 && nextRow < rows)
            .map(([nextCol, nextRow]) => `${nextCol},${nextRow}`);
        }

        function connectedCanals() {
          const connected = new Set();
          const queue = [];
          for (const [key, kind] of builds) {
            if (kind === "canal" && (tiles.get(key).dataset.terrain === "river" ||
              neighbors(key).some((next) => tiles.get(next).dataset.terrain === "river"))) {
              connected.add(key);
              queue.push(key);
            }
          }
          while (queue.length) {
            const current = queue.shift();
            for (const next of neighbors(current)) {
              if (builds.get(next) === "canal" && !connected.has(next)) {
                connected.add(next);
                queue.push(next);
              }
            }
          }
          return connected;
        }

        function communitiesConnectedToMarket() {
          const reachable = new Set([market]);
          const queue = [market];
          while (queue.length) {
            const current = queue.shift();
            for (const next of neighbors(current)) {
              const terrain = tiles.get(next).dataset.terrain;
              const bridgeOpen = terrain !== "river" || season !== 2;
              const traversable = terrain !== "ridge" && bridgeOpen &&
                (terrain === "market" || terrain === "settlement" || builds.get(next) === "road");
              if (traversable && !reachable.has(next)) {
                reachable.add(next);
                queue.push(next);
              }
            }
          }
          return Array.from(settlements).filter((key) => reachable.has(key)).length;
        }

        function drawMap() {
          for (const [key, tile] of tiles) {
            const terrain = tile.dataset.terrain;
            const visibleTerrain = !hiddenLayers.has("terrain");
            const visibleWater = !hiddenLayers.has("water");
            const visiblePaths = !hiddenLayers.has("paths");
            const visibleLand = !hiddenLayers.has("land");
            let icon = "";
            if (terrain === "ridge" && visibleTerrain) icon = "▧";
            if (terrain === "river" && visibleWater) icon = "〰";
            if (terrain === "settlement" && visibleLand) icon = "⌂";
            if (terrain === "market" && visiblePaths) icon = "◆";
            const build = builds.get(key);
            const showBuild = build && (
              (build === "canal" || build === "reserve") && visibleWater ||
              build === "road" && visiblePaths ||
              build === "field" && visibleLand
            );
            tile.textContent = `${icon}${showBuild ? symbols[build] : ""}`;
            tile.dataset.built = showBuild ? build : "";
            tile.setAttribute("aria-label", describeTile(key));
          }
        }

        function renderState(prefix) {
          const canalNetwork = connectedCanals();
          const fieldCount = Array.from(builds.values()).filter((value) => value === "field").length;
          const irrigatedFields = Array.from(builds).filter(([key, value]) => value === "field" &&
            neighbors(key).some((next) => canalNetwork.has(next))).length;
          const reserveCount = Array.from(builds.values()).filter((value) => value === "reserve").length;
          const baseWater = [7, 3, 10, 5][season];
          const waterSupply = baseWater + canalNetwork.size * 2 + (season === 1 ? reserveCount * 2 : reserveCount);
          const demand = 2 + fieldCount * 2;
          const reachableDemand = 2 + irrigatedFields * 2;
          const delivered = Math.min(waterSupply, reachableDemand);
          const trade = communitiesConnectedToMarket();
          const landCover = Math.max(0, 10 - fieldCount * 2 + reserveCount);
          const cells = Array.from(builds.keys()).map((key) => `${key.split(",")[0]}-${key.split(",")[1]} ${names[builds.get(key)]}`);
          byId("j03-readout").innerHTML =
            `<strong>${prefix || `Saison : ${seasonNames[season]}`}</strong>` +
            `<p>Eau disponible : ${waterSupply} unités de démonstration ; demande des parcelles : ${demand} ; demande satisfaite : ${delivered}/${demand}. Parcelles reliées à un canal alimenté : ${irrigatedFields}/${fieldCount}.</p>` +
            `<p>Communautés reliées au marché par un passage continu : ${trade}/3. Les chemins interrompus ne comptent pas ; le franchissement de rivière est fermé en période de crue. Les valeurs sont des paramètres du jeu, pas des mesures de terrain.</p>` +
            `<p>Indice ludique de couvert restant : ${landCover} unités fictives (10 − 2 par parcelle + 1 par réserve). Ce n’est pas une mesure de biodiversité.</p>` +
            `<p>Aménagements : ${cells.length ? cells.join(" · ") : "aucun"}.</p>` +
            `<p>Budget restant : ${budget} unités fictives.</p>`;
          drawMap();
        }

        byId("j03-build-button").addEventListener("click", () => {
          if (!selected) {
            byId("j03-status").textContent = "Choisissez une case avant de placer un aménagement.";
            return;
          }
          const tile = tiles.get(selected);
          const kind = byId("j03-build").value;
          if (["ridge", "settlement", "market"].includes(tile.dataset.terrain) ||
            tile.dataset.terrain === "river" && kind !== "road" && kind !== "canal") {
            byId("j03-status").textContent = "Cette case est occupée par le relief, le cours d’eau ou un lieu ; choisissez un sol disponible.";
            return;
          }
          if (builds.has(selected)) {
            byId("j03-status").textContent = "Cette case a déjà un aménagement. Choisissez une autre case.";
            return;
          }
          if (budget < costs[kind]) {
            byId("j03-status").textContent = `Budget insuffisant : ${names[kind]} coûte ${costs[kind]} unités fictives.`;
            return;
          }
          builds.set(selected, kind);
          budget -= costs[kind];
          byId("j03-status").textContent = `${names[kind]} placé en case ${selected.replace(",", " / ")}. Faites avancer la saison pour observer le nouvel état.`;
          renderState(`Aménagement posé · ${seasonNames[season]}`);
          byId("j03-selection").textContent = describeTile(selected);
        });

        byId("j03-season").addEventListener("click", () => {
          season = (season + 1) % seasonNames.length;
          byId("j03-status").textContent = `Avancée déterministe : ${seasonNames[season]}. Les résultats sont calculés à partir des aménagements affichés.`;
          renderState();
        });
        document.querySelectorAll("[data-j03-layer]").forEach((input) => {
          input.addEventListener("change", () => {
            if (input.checked) hiddenLayers.delete(input.dataset.j03Layer);
            else hiddenLayers.add(input.dataset.j03Layer);
            drawMap();
          });
        });
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "tile-button";
        reset.textContent = "Recommencer la vallée";
        reset.addEventListener("click", () => {
          builds.clear();
          budget = 4;
          season = 0;
          selected = null;
          for (const tile of tiles.values()) tile.setAttribute("aria-pressed", "false");
          byId("j03-selection").textContent = "Choisissez une case de la vallée pour l’inspecter.";
          byId("j03-status").textContent = "Nouvelle partie · printemps, conditions ordinaires.";
          renderState();
        });
        byId("j03-season").after(reset);
        renderState();
      }
