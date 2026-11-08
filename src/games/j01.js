import { byId } from "./dom.js";

const j01Entries = [
        { id: "instrument", number: 1, word: "INSTRUMENT", row: 0, col: 11, direction: "down", clue: "Ce qui mesure un phénomène… ou sert de moyen à une action.", nuance: "Un instrument peut être un objet de mesure ou un outil, au sens large." },
        { id: "carte", number: 2, word: "CARTE", row: 7, col: 7, direction: "across", clue: "Image conventionnelle d’un lieu… ou objet qu’on retourne en jouant.", nuance: "Une carte représente un territoire, mais le mot désigne aussi un support de jeu ou une liste de choix." },
        { id: "anomalie", number: 3, word: "ANOMALIE", row: 7, col: 8, direction: "down", clue: "Ce qui dévie d’une attente… ou d’une règle.", nuance: "Une anomalie est un écart observé ; son interprétation dépend de la règle et du contexte choisis." },
        { id: "prisme", number: 4, word: "PRISME", row: 9, col: 6, direction: "down", clue: "Solide qui décompose la lumière… ou angle d’interprétation.", nuance: "Le prisme optique est un objet ; le prisme d’analyse, une manière de regarder." },
        { id: "graal", number: 5, word: "GRAAL", row: 13, col: 1, direction: "down", clue: "Objet mythique convoité… ou but ultime d’une quête.", nuance: "Le Graal appartient à des récits légendaires ; par extension, il figure un objectif très recherché." },
        { id: "frontiere", number: 6, word: "FRONTIERE", row: 14, col: 0, direction: "across", clue: "Ligne séparant deux territoires… ou limite d’un domaine.", nuance: "Une frontière peut être tracée sur une carte ou marquer une limite mouvante du savoir." },
        { id: "trace", number: 7, word: "TRACE", row: 14, col: 4, direction: "down", clue: "Marque laissée par un passage… ou indice à suivre.", nuance: "Une trace est à la fois un signe matériel et un indice qui oriente une enquête." },
        { id: "question", number: 8, word: "QUESTION", row: 18, col: 2, direction: "across", clue: "Phrase qui appelle une réponse… ou problème qui ouvre une enquête.", nuance: "Une question peut demander une information ou formuler un problème à explorer." }
      ];
      const j01Rows = 19;
      const j01Columns = 12;
      const j01StorageKey = "lycium-j01-progress-v1";

      function normalizeJ01Letters(value) {
        return String(value || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase()
          .replace(/[^A-Z]/g, "");
      }

export function initJ01Game() {
        const grid = byId("j01-grid");
        const status = byId("j01-status");
        const cells = new Map();
        const inputs = new Map();
        const revealed = new Set();
        const clueButtons = new Map();
        let activeEntry = null;
        let hasChecked = false;

        for (const entry of j01Entries) {
          entry.cells = [];
          for (let index = 0; index < entry.word.length; index += 1) {
            const row = entry.row + (entry.direction === "down" ? index : 0);
            const col = entry.col + (entry.direction === "across" ? index : 0);
            if (row >= j01Rows || col >= j01Columns) {
              throw new Error(`Le mot ${entry.number} dépasse les limites de la grille J01.`);
            }
            const key = `${row},${col}`;
            const letter = entry.word[index];
            const cell = cells.get(key) || { row, col, letter, entries: [] };
            if (cell.letter !== letter) {
              throw new Error(`Le croisement de la grille J01 est incohérent en ligne ${row + 1}, colonne ${col + 1}.`);
            }
            cell.entries.push(entry);
            cells.set(key, cell);
            entry.cells.push(key);
          }
        }

        function setStatus(message) {
          status.textContent = message;
        }

        function saveProgress() {
          try {
            const letters = {};
            for (const [key, input] of inputs) {
              if (input.value) letters[key] = input.value;
            }
            localStorage.setItem(j01StorageKey, JSON.stringify({ version: 1, letters }));
          } catch (error) {
            setStatus(`La partie continue, mais la sauvegarde locale a échoué : ${error.message}`);
          }
        }

        function updateProgress() {
          let completed = 0;
          let filled = 0;
          let correct = 0;
          for (const [key, cell] of cells) {
            const input = inputs.get(key);
            const value = input.value;
            const isCorrect = value === cell.letter;
            if (value) filled += 1;
            if (isCorrect) correct += 1;
            const container = input.parentElement;
            container.classList.toggle("is-active", Boolean(activeEntry && activeEntry.cells.includes(key)));
            container.classList.toggle("is-correct", hasChecked && Boolean(value) && isCorrect);
            container.classList.toggle("is-wrong", hasChecked && Boolean(value) && !isCorrect);
            container.classList.toggle("is-revealed", revealed.has(key));
          }

          for (const entry of j01Entries) {
            const isComplete = entry.cells.every((key, index) => inputs.get(key).value === entry.word[index]);
            const button = clueButtons.get(entry.id);
            button.setAttribute("aria-pressed", String(activeEntry === entry));
            const nuance = button.querySelector(".clue-nuance");
            if (isComplete) {
              completed += 1;
              if (!nuance) {
                const note = document.createElement("span");
                note.className = "clue-nuance";
                note.textContent = entry.nuance;
                button.querySelector(".clue-text").append(note);
              }
            } else if (nuance) {
              nuance.remove();
            }
          }

          const finished = completed === j01Entries.length;
          byId("j01-reveal").hidden = !finished;
          if (finished) {
            setStatus("Grille complète : les huit mots sont justes. Une nuance vous attend sous la grille.");
          }
          return { completed, filled, correct, finished };
        }

        function focusCell(key) {
          const input = inputs.get(key);
          if (input) input.focus();
        }

        function selectEntry(entry, keyToFocus) {
          activeEntry = entry;
          updateProgress();
          focusCell(keyToFocus || entry.cells[0]);
        }

        function checkGrid() {
          hasChecked = true;
          const result = updateProgress();
          if (!result.finished) {
            setStatus(`${result.correct} case${result.correct === 1 ? "" : "s"} juste${result.correct === 1 ? "" : "s"} sur ${cells.size}. Les cases roses contiennent une lettre à revoir.`);
          }
        }

        function revealLetter() {
          if (!activeEntry) {
            setStatus("Choisissez d’abord une définition pour révéler une lettre.");
            return;
          }
          const key = activeEntry.cells.find((cellKey, index) => inputs.get(cellKey).value !== activeEntry.word[index]);
          if (!key) {
            setStatus(`Le mot ${activeEntry.number} est déjà correct.`);
            return;
          }
          const index = activeEntry.cells.indexOf(key);
          inputs.get(key).value = activeEntry.word[index];
          revealed.add(key);
          hasChecked = true;
          saveProgress();
          updateProgress();
          setStatus(`Lettre révélée pour la définition ${activeEntry.number}. Vous pouvez continuer à modifier la grille.`);
          focusCell(key);
        }

        for (let row = 0; row < j01Rows; row += 1) {
          for (let col = 0; col < j01Columns; col += 1) {
            const key = `${row},${col}`;
            const cell = cells.get(key);
            const container = document.createElement("div");
            container.className = "crossword-cell";
            if (!cell) {
              container.classList.add("is-block");
              container.setAttribute("aria-hidden", "true");
              grid.append(container);
              continue;
            }

            const start = j01Entries.find((entry) => entry.row === row && entry.col === col);
            if (start) {
              const cellNumber = document.createElement("span");
              cellNumber.className = "crossword-number";
              cellNumber.textContent = String(start.number);
              cellNumber.setAttribute("aria-hidden", "true");
              container.append(cellNumber);
            }

            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.inputMode = "text";
            input.autocomplete = "off";
            input.autocapitalize = "characters";
            input.spellcheck = false;
            input.setAttribute("aria-label", `Ligne ${row + 1}, colonne ${col + 1}. ${cell.entries.map((entry) => `${entry.direction === "across" ? "Horizontale" : "Verticale"} ${entry.number}`).join(", ")}`);
            input.dataset.cellKey = key;
            inputs.set(key, input);
            container.append(input);
            grid.append(container);

            input.addEventListener("focus", () => {
              input.select();
              if (!activeEntry || !activeEntry.cells.includes(key)) {
                const entry = cell.entries[0];
                activeEntry = entry;
                updateProgress();
              }
            });
            input.addEventListener("input", () => {
              input.value = normalizeJ01Letters(input.value).slice(-1);
              hasChecked = hasChecked || Array.from(inputs.values()).some((candidate) => candidate.parentElement.classList.contains("is-wrong"));
              saveProgress();
              updateProgress();
              if (input.value && activeEntry) {
                const index = activeEntry.cells.indexOf(key);
                if (index >= 0 && index < activeEntry.cells.length - 1) focusCell(activeEntry.cells[index + 1]);
              }
            });
            input.addEventListener("paste", (event) => {
              event.preventDefault();
              if (!activeEntry || !activeEntry.cells.includes(key)) return;
              const letters = normalizeJ01Letters(event.clipboardData.getData("text"));
              const startIndex = activeEntry.cells.indexOf(key);
              letters.split("").forEach((letter, offset) => {
                const targetKey = activeEntry.cells[startIndex + offset];
                if (targetKey) inputs.get(targetKey).value = letter;
              });
              hasChecked = true;
              saveProgress();
              updateProgress();
              const focusIndex = Math.min(startIndex + letters.length, activeEntry.cells.length - 1);
              focusCell(activeEntry.cells[focusIndex]);
            });
            input.addEventListener("keydown", (event) => {
              if (!activeEntry || !activeEntry.cells.includes(key)) return;
              const index = activeEntry.cells.indexOf(key);
              const nextKey = {
                ArrowRight: activeEntry.direction === "across" ? activeEntry.cells[index + 1] : null,
                ArrowDown: activeEntry.direction === "down" ? activeEntry.cells[index + 1] : null,
                ArrowLeft: activeEntry.direction === "across" ? activeEntry.cells[index - 1] : null,
                ArrowUp: activeEntry.direction === "down" ? activeEntry.cells[index - 1] : null
              }[event.key];
              if (nextKey) {
                event.preventDefault();
                focusCell(nextKey);
                return;
              }
              const perpendicular = event.key === "ArrowUp" || event.key === "ArrowDown" ? "down" : "across";
              if (event.key.startsWith("Arrow")) {
                const crossing = cell.entries.find((entry) => entry !== activeEntry && entry.direction === perpendicular);
                if (crossing) {
                  event.preventDefault();
                  selectEntry(crossing, key);
                  return;
                }
              }
              if (event.key === "Backspace" && !input.value && index > 0) {
                event.preventDefault();
                const previous = inputs.get(activeEntry.cells[index - 1]);
                previous.value = "";
                saveProgress();
                updateProgress();
                previous.focus();
              } else if (event.key === "Enter") {
                event.preventDefault();
                checkGrid();
              }
            });
          }
        }

        for (const entry of j01Entries) {
          const list = byId(entry.direction === "across" ? "j01-across" : "j01-down");
          const item = document.createElement("li");
          const button = document.createElement("button");
          button.type = "button";
          button.setAttribute("aria-pressed", "false");
          const entryNumber = document.createElement("span");
          entryNumber.className = "clue-number";
          entryNumber.textContent = `${entry.number}.`;
          const text = document.createElement("span");
          text.className = "clue-text";
          text.textContent = entry.clue;
          button.append(entryNumber, text);
          button.addEventListener("click", () => selectEntry(entry));
          item.append(button);
          list.append(item);
          clueButtons.set(entry.id, button);
        }

        try {
          const saved = JSON.parse(localStorage.getItem(j01StorageKey) || "null");
          if (saved && saved.version === 1 && saved.letters && typeof saved.letters === "object") {
            for (const [key, value] of Object.entries(saved.letters)) {
              if (inputs.has(key)) inputs.get(key).value = normalizeJ01Letters(value).slice(0, 1);
            }
          } else if (saved !== null) {
            setStatus("La sauvegarde locale n’a pas le format attendu ; commencez une nouvelle grille.");
          }
        } catch (error) {
          setStatus(`La sauvegarde locale n’a pas pu être lue : ${error.message}`);
        }

        byId("j01-check").addEventListener("click", checkGrid);
        byId("j01-hint").addEventListener("click", revealLetter);
        byId("j01-print").addEventListener("click", () => window.print());
        byId("j01-reset").addEventListener("click", () => {
          for (const input of inputs.values()) input.value = "";
          revealed.clear();
          hasChecked = false;
          activeEntry = null;
          try {
            localStorage.removeItem(j01StorageKey);
            setStatus("Grille réinitialisée. Rien n’est chronométré : vous pouvez recommencer.");
          } catch (error) {
            setStatus(`Grille réinitialisée, mais la sauvegarde locale n’a pas pu être supprimée : ${error.message}`);
          }
          updateProgress();
        });

        updateProgress();
        if (!status.textContent) setStatus("Sélectionnez une définition pour commencer. Votre progression est enregistrée sur cet appareil.");
      }
