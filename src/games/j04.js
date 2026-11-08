import { byId } from "./dom.js";

export function initJ04Game() {
        const frequency = byId("j04-frequency");
        const canvas = byId("j04-signal");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Impossible de créer la visualisation de la station J04.");
        let audioContext = null;
        let activeNodes = [];
        let audioRun = 0;

        function drawSignal() {
          const hz = Number(frequency.value);
          byId("j04-frequency-label").textContent = `${hz} Hz`;
          const width = canvas.width;
          const height = canvas.height;
          context.clearRect(0, 0, width, height);
          context.strokeStyle = "#d5bd8a55";
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(0, height / 2);
          context.lineTo(width, height / 2);
          context.stroke();
          context.strokeStyle = "#86cfd1";
          context.lineWidth = 2;
          context.beginPath();
          const cycles = 1 + (hz - 110) / 82;
          for (let x = 0; x <= width; x += 2) {
            const y = height / 2 - Math.sin(x / width * cycles * Math.PI * 2) * height * 0.3;
            if (x === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.stroke();
          context.fillStyle = "#f1d8a8";
          context.font = "14px Arial";
          context.fillText(`Tracé schématique · tonalité choisie : ${hz} Hz`, 14, 22);
        }

        async function stopAudio(message, invalidate = true) {
          if (invalidate) audioRun += 1;
          const contextToClose = audioContext;
          const nodesToStop = activeNodes;
          audioContext = null;
          activeNodes = [];
          for (const node of nodesToStop) {
            try {
              node.stop();
            } catch (error) {
              if (!(error instanceof DOMException && error.name === "InvalidStateError")) throw error;
            }
          }
          if (contextToClose && contextToClose.state !== "closed") {
            await contextToClose.close();
          }
          if (message) byId("j04-sound-status").textContent = message;
        }

        async function playSound(tones, type, statusMessage) {
          const currentRun = ++audioRun;
          await stopAudio("", false);
          if (currentRun !== audioRun || document.hidden) return;
          const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextConstructor) {
            byId("j04-sound-status").textContent = "La lecture sonore n’est pas prise en charge par ce navigateur ; les indications textuelles restent disponibles.";
            return;
          }
          try {
            audioContext = new AudioContextConstructor();
            if (audioContext.state === "suspended") await audioContext.resume();
            const now = audioContext.currentTime;
            const volume = audioContext.createGain();
            volume.gain.setValueAtTime(0.0001, now);
            volume.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
            volume.gain.setValueAtTime(0.06, now + 0.9);
            volume.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
            volume.connect(audioContext.destination);
            activeNodes = tones.map((tone) => {
              const oscillator = audioContext.createOscillator();
              oscillator.type = type;
              oscillator.frequency.setValueAtTime(tone, now);
              oscillator.connect(volume);
              oscillator.start(now);
              oscillator.stop(now + 1.2);
              return oscillator;
            });
            byId("j04-sound-status").textContent = statusMessage;
            window.setTimeout(() => {
              if (currentRun === audioRun && audioContext && audioContext.state !== "closed") {
                stopAudio("Lecture terminée. Relancez uniquement si vous le souhaitez.").catch((error) => {
                  byId("j04-sound-status").textContent = `Impossible d’arrêter le son : ${error.message}`;
                });
              }
            }, 1250);
          } catch (error) {
            byId("j04-sound-status").textContent = `Lecture sonore indisponible : ${error.message}`;
            await stopAudio("");
          }
        }

        frequency.addEventListener("input", drawSignal);
        byId("j04-play").addEventListener("click", () => {
          const hz = Number(frequency.value);
          playSound([hz], "sine", `Tonalité originale de ${hz} Hz, déclenchée par vous.`).catch((error) => {
            byId("j04-sound-status").textContent = `Lecture sonore indisponible : ${error.message}`;
          });
        });
        byId("j04-stop").addEventListener("click", () => {
          stopAudio("Son arrêté à votre demande.").catch((error) => {
            byId("j04-sound-status").textContent = `Impossible d’arrêter le son : ${error.message}`;
          });
        });
        document.querySelectorAll("[data-j04-station]").forEach((button) => {
          button.addEventListener("click", () => {
            const selected = button.dataset.j04Station;
            document.querySelectorAll("[data-j04-station]").forEach((tab) => tab.setAttribute("aria-pressed", String(tab === button)));
            byId("j04-plate").hidden = selected !== "plate";
            byId("j04-perception").hidden = selected !== "perception";
            byId("j04-scene").hidden = selected !== "scene";
          });
        });
        document.querySelectorAll("[data-j04-association]").forEach((button) => {
          button.addEventListener("click", () => {
            document.querySelectorAll("[data-j04-association]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
            byId("j04-perception-status").textContent = `Association notée dans cette page : ${button.textContent}. Aucune réponse n’est correcte ou transmise.`;
          });
        });
        byId("j04-note").addEventListener("input", () => {
          byId("j04-perception-status").textContent = "Votre remarque reste dans ce champ et n’est ni envoyée ni publiée.";
        });
        document.querySelectorAll("[data-j04-scene]").forEach((button) => {
          button.addEventListener("click", () => {
            const calm = button.dataset.j04Scene === "calm";
            playSound(calm ? [220, 330] : [220, 233], calm ? "sine" : "triangle",
              "Accompagnement synthétique original. Votre perception de l’ambiance reste personnelle.")
              .catch((error) => {
                byId("j04-sound-status").textContent = `Lecture sonore indisponible : ${error.message}`;
              });
          });
        });
        document.querySelectorAll("[data-j04-mood]").forEach((button) => {
          button.addEventListener("click", () => {
            document.querySelectorAll("[data-j04-mood]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
            byId("j04-scene-status").textContent = `Impression notée : ${button.textContent}. Aucune ambiance n’est universelle.`;
          });
        });
        document.addEventListener("visibilitychange", () => {
          if (document.hidden && audioContext && audioContext.state !== "closed") {
            stopAudio("Son arrêté lorsque la page est masquée.").catch((error) => {
              byId("j04-sound-status").textContent = `Impossible d’arrêter le son : ${error.message}`;
            });
          }
        });
        document.addEventListener("medialab:viewchange", (event) => {
          if ((event.detail.view !== "arcade" || event.detail.game !== "j04-game") && audioContext && audioContext.state !== "closed") {
            stopAudio("Son arrêté lorsque vous quittez l’Arcade.").catch((error) => {
              byId("j04-sound-status").textContent = `Impossible d’arrêter le son : ${error.message}`;
            });
          }
        });
        drawSignal();
      }
