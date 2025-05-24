// *** Spiel-Daten und Variablen ***

// Kategorien mit Namenslisten (lokal gespeichert, keine externen Datenbanken notwendig)
const categories = {
  "Allgemein": [
    "Albert Einstein", "Lionel Messi", "Angelina Jolie", 
    "Bruce Lee", "Cleopatra", "Elon Musk", "Marie Curie"
  ],
  "Zeichentrick": [
    "Spongebob Schwammkopf", "Mickey Mouse", "Donald Duck", 
    "Bugs Bunny", "Scooby Doo", "Elsa (Frozen)"
  ],
  "Anime/Manga": [
    "Naruto Uzumaki", "Son Goku", "Monkey D. Ruffy", 
    "Sailor Moon", "Eren Jäger", "Light Yagami"
  ],
  "Sänger weltweit": [
    "Michael Jackson", "Madonna", "Elvis Presley", 
    "Freddie Mercury", "Beyoncé", "Ed Sheeran", "Mark Forster"
  ],
  "Sänger Türkei": [
    "Tarkan", "Aleyna Tilki", "Sezen Aksu", 
    "Mahmut Orhan", "Murat Boz", "Ajda Pekkan"
  ],
  "Schauspieler (international)": [
    "Brad Pitt", "Johnny Depp", "Emma Watson", 
    "Jackie Chan", "Morgan Freeman", "Leonardo DiCaprio"
  ],
  "Türkische Schauspieler": [
    "Kıvanç Tatlıtuğ", "Beren Saat", "Engin Akyürek", 
    "Haluk Bilginer", "Burak Özçivit", "Hande Erçel"
  ],
  "Deutsche Politiker": [
    "Angela Merkel", "Olaf Scholz", "Alice Weidel", 
    "Frank-Walter Steinmeier", "Markus Söder", "Karl Lauterbach"
  ],
  "Türkische Politiker": [
    "Recep Tayyip Erdoğan", "Kemal Atatürk", "Kemal Kılıçdaroğlu", 
    "Ekrem İmamoğlu", "İlhan Omar", "Mevlüt Çavuşoğlu"
  ],
  "Legenden": [
    "Muhammad Ali", "Bob Marley", "Martin Luther King", 
    "Marilyn Monroe", "Albert Einstein", "Bruce Lee", "Frida Kahlo"
  ]
};

// Globale Variablen für Spielzustand
let players = [];            // Array der Spielernamen
let scores = [];             // Parallel-Array für Punktestände der Spieler
let currentPlayerIndex = 0;  // Index des aktuellen Spielers im players-Array
let currentCategory = "";    // Aktuell gewählte Kategorie (Name als String)
let remainingNames = [];     // Liste der noch verfügbaren Namen in der aktuellen Kategorie (wird per Shuffle gemischt)
let timerEnabled = false;    // Ob mit Zeit gespielt wird
let timer = null;            // Timer-Interval-Variable
let timeLeft = 60;           // Verbleibende Zeit in Sekunden (Standard 60s pro Runde)

// DOM-Elemente holen
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const modeSingleRadio = document.getElementById("modeSingle");
const modeMultiRadio = document.getElementById("modeMulti");
const playerInputSingle = document.getElementById("playerInputSingle");
const playerInputMulti = document.getElementById("playerInputMulti");
const singlePlayerNameInput = document.getElementById("singlePlayerName");
const multiPlayerNameInput = document.getElementById("multiPlayerName");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const playersListEl = document.getElementById("playersList");
const categorySelect = document.getElementById("categorySelect");
const useTimerCheckbox = document.getElementById("useTimer");
const startGameBtn = document.getElementById("startGameBtn");

const currentPlayerNameEl = document.getElementById("currentPlayerName");
const categoryNameEl = document.getElementById("categoryName");
const timerDisplayEl = document.getElementById("timerDisplay");
const nameDisplayEl = document.getElementById("nameDisplay");
const randomNameBtn = document.getElementById("randomNameBtn");
const manualNameInput = document.getElementById("manualNameInput");
const showNameBtn = document.getElementById("showNameBtn");
const notGuessedBtn = document.getElementById("notGuessedBtn");
const guessedBtn = document.getElementById("guessedBtn");
const nextPlayerBtn = document.getElementById("nextPlayerBtn");
const scoreboardEl = document.getElementById("scoreboard");

// *** Hilfsfunktionen ***

// Fisher-Yates Shuffle Algorithmus: mischt ein Array zufällig durch
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Wähle einen zufälligen Index von 0 bis i
    const j = Math.floor(Math.random() * (i + 1));
    // Tausche Element an Position i mit dem an Position j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Scoreboard im DOM aktualisieren: zeigt alle Spieler mit ihren Punkten an
function renderScoreboard() {
  // Inhalt leeren
  scoreboardEl.innerHTML = "";
  // Für jeden Spieler einen Listeneintrag erstellen
  players.forEach((playerName, index) => {
    const li = document.createElement("li");
    li.textContent = playerName + ": " + scores[index] + " Punkt" + (scores[index] !== 1 ? "e" : "");
    // aktuellen Spieler hervorheben
    if (index === currentPlayerIndex) {
      li.classList.add("current-player");
    }
    scoreboardEl.appendChild(li);
  });
}

// Nächsten Spieler auswählen (für Mehrspielermodus)
function goToNextPlayer() {
  // Aktuellen Spieler-Index erhöhen (zyklisch)
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  // Anzeige des aktuellen Spielers aktualisieren
  currentPlayerNameEl.textContent = players[currentPlayerIndex] ? "Spieler: " + players[currentPlayerIndex] : "";
  // Namensanzeige zurücksetzen
  nameDisplayEl.textContent = "Drücke \"Zufällig\" für einen Namen";
  // Ergebnis-Buttons deaktivieren bis neuer Name angezeigt wird
  guessedBtn.disabled = true;
  notGuessedBtn.disabled = true;
  // "Nächster Spieler" Button wieder deaktivieren
  nextPlayerBtn.disabled = true;
  // Timer zurücksetzen, falls aktiv
  if (timerEnabled) {
    stopTimer();
    timerDisplayEl.textContent = ""; // Timeranzeige löschen oder zurücksetzen
  }
  // Scoreboard aktualisieren (Highlight wechselt zum neuen aktuellen Spieler)
  renderScoreboard();
}

// Timer starten (Countdown von 60 Sekunden)
function startTimer() {
  timeLeft = 60;
  timerDisplayEl.textContent = timeLeft + "s";
  // Intervall jede Sekunde
  timer = setInterval(() => {
    timeLeft--;
    timerDisplayEl.textContent = timeLeft + "s";
    if (timeLeft <= 0) {
      // Timer abgelaufen
      timerDisplayEl.textContent = "0s";
      clearInterval(timer);
      timer = null;
      // Automatisch als nicht erraten werten und Möglichkeit zum Weitermachen geben
      alert("Zeit abgelaufen!");
      handleNotGuessed(); // Rundenergebnis: nicht erraten
      // Hinweis: Nach Zeitablauf muss der nächste Spieler manuell per Button gestartet werden
    }
  }, 1000);
}

// Timer stoppen (z.B. bei Rundenende vor Zeitablauf)
function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// Neuen Namen aus der Kategorie ziehen und anzeigen (zufällig)
function showRandomName() {
  // Wenn keine Namen mehr übrig sind, Liste neu mischen (alle Namen wieder verfügbar machen)
  if (remainingNames.length === 0) {
    remainingNames = shuffleArray([...categories[currentCategory]]); // Kopie des Original-Arrays mischen
  }
  // Ziehe den letzten Namen aus der Liste (Fisher-Yates sorgt für zufällige Reihenfolge)
  const name = remainingNames.pop();
  // Name groß anzeigen
  nameDisplayEl.textContent = name;
  // Ergebnis-Buttons aktivieren, da jetzt ein Name angezeigt wird
  guessedBtn.disabled = false;
  notGuessedBtn.disabled = false;
  // Random- und manuelle Eingabe-Buttons während laufender Runde deaktivieren
  randomNameBtn.disabled = true;
  showNameBtn.disabled = true;
  manualNameInput.disabled = true;
  // Wenn Timer aktiv ist, Timer für diese Runde starten
  if (timerEnabled) {
    startTimer();
  }
}

// Manuellen Namensvorschlag anzeigen
function showManualName() {
  const manualName = manualNameInput.value.trim();
  if (manualName === "") return; // wenn Eingabe leer, nichts tun
  // Name anzeigen
  nameDisplayEl.textContent = manualName;
  // Falls der manuell eingegebene Name auch in der Kategorie-Liste war, entfernen, damit er nicht nochmal kommt
  const idx = remainingNames.indexOf(manualName);
  if (idx !== -1) {
    remainingNames.splice(idx, 1);
  }
  // Ergebnis-Buttons aktivieren
  guessedBtn.disabled = false;
  notGuessedBtn.disabled = false;
  // Random- und manuelle Eingabe-Buttons deaktivieren bis Runde zu Ende
  randomNameBtn.disabled = true;
  showNameBtn.disabled = true;
  manualNameInput.disabled = true;
  // Timer starten, falls aktiv
  if (timerEnabled) {
    startTimer();
  }
}

// Rundenergebnis: NICHT ERRATEN
function handleNotGuessed() {
  // Kein Punkt für aktuellen Spieler (d.h. Scores bleibt unverändert)
  // (Optionale Erweiterung: man könnte Fehlschläge zählen, aber hier nicht gefordert)
  // Ergebnis-Buttons deaktivieren, da Runde vorbei
  guessedBtn.disabled = true;
  notGuessedBtn.disabled = true;
  // Random- und Eingabe-Buttons bleiben deaktiviert bis "Nächster Spieler" gedrückt wird (Mehrspieler)
  // Im Einzelspielermodus werden sie gleich wieder freigegeben (s.u.)
  // Timer stoppen, falls noch läuft
  if (timerEnabled) {
    stopTimer();
  }
  // "Nächster Spieler"-Button aktivieren (nur sinnvoll im Mehrspielermodus)
  if (players.length > 1) {
    nextPlayerBtn.disabled = false;
  } else {
    // Einzelspieler: direkt neue Runde ermöglichen
    randomNameBtn.disabled = false;
    showNameBtn.disabled = false;
    manualNameInput.disabled = false;
  }
}

// Rundenergebnis: ERRATEN (aktueller Spieler hat richtig geraten)
function handleGuessed() {
  // Punktestand des aktuellen Spielers erhöhen
  scores[currentPlayerIndex] += 1;
  // Scoreboard aktualisieren, um den neuen Punktestand zu zeigen
  renderScoreboard();
  // Ergebnis-Buttons deaktivieren
  guessedBtn.disabled = true;
  notGuessedBtn.disabled = true;
  // Timer stoppen, falls aktiv
  if (timerEnabled) {
    stopTimer();
  }
  // "Nächster Spieler" aktivieren (bei Mehrspieler)
  if (players.length > 1) {
    nextPlayerBtn.disabled = false;
  } else {
    // Einzelspieler: neue Runde ermöglichen
    randomNameBtn.disabled = false;
    showNameBtn.disabled = false;
    manualNameInput.disabled = false;
  }
}

// *** Event Listener für UI-Elemente ***

// Wechsel zwischen Einzel- und Mehrspieler im Startmenü
modeSingleRadio.addEventListener("change", () => {
  if (modeSingleRadio.checked) {
    // Einzelspieler ausgewählt: Einzelspieler-Eingabe zeigen, Mehrspieler-Eingabe verbergen
    playerInputSingle.style.display = "block";
    playerInputMulti.style.display = "none";
  }
});
modeMultiRadio.addEventListener("change", () => {
  if (modeMultiRadio.checked) {
    // Mehrspieler ausgewählt: Mehrspieler-Eingabe zeigen, Einzelspieler-Eingabe verbergen
    playerInputSingle.style.display = "none";
    playerInputMulti.style.display = "block";
  }
});

// Spieler der Liste hinzufügen (Mehrspielermodus)
addPlayerBtn.addEventListener("click", () => {
  const name = multiPlayerNameInput.value.trim();
  if (name === "") return; // nichts tun, wenn Eingabefeld leer
  if (players.length >= 30) {
    alert("Es sind maximal 30 Spieler erlaubt.");
    return;
  }
  // Name zur Spieler-Liste hinzufügen
  players.push(name);
  scores.push(0); // initialer Punktestand 0
  // Im UI den Spieler als Listenelement anzeigen
  const li = document.createElement("li");
  li.textContent = name;
  playersListEl.appendChild(li);
  // Eingabefeld leeren für nächsten Namen
  multiPlayerNameInput.value = "";
});

// Spiel starten Button
startGameBtn.addEventListener("click", () => {
  // Modus festlegen
  if (modeSingleRadio.checked) {
    // Einzelspieler: Namen aus dem Feld nehmen oder Default setzen
    const singleName = singlePlayerNameInput.value.trim();
    players = [ singleName !== "" ? singleName : "Spieler 1" ];
    scores = [0];
  } else {
    // Mehrspieler: es sollten mindestens 2 Spieler in der Liste sein
    if (players.length < 2) {
      alert("Bitte mindestens 2 Spieler hinzufügen oder Einzelspieler-Modus wählen.");
      return;
    }
  }
  // Gewählte Kategorie speichern
  currentCategory = categorySelect.value;
  // Timer-Einstellung auslesen
  timerEnabled = useTimerCheckbox.checked;
  // Namenslisten für aktuelle Kategorie mischen (Kopie der Originalliste verwenden)
  remainingNames = shuffleArray([...categories[currentCategory]]);
  // Spielbildschirm anzeigen, Startbildschirm verbergen
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
  // Aktuellen Spieler Index zurücksetzen und anzeigen
  currentPlayerIndex = 0;
  currentPlayerNameEl.textContent = players.length > 1 ? "Spieler: " + players[currentPlayerIndex] : "Spieler: " + players[0];
  // Kategorie anzeigen
  categoryNameEl.textContent = "Kategorie: " + currentCategory;
  // Timer-Anzeige initial leeren
  timerDisplayEl.textContent = "";
  // Scoreboard initialisieren
  renderScoreboard();
  // Zu Beginn ist noch kein Name angezeigt, daher Ergebnis- und Next-Buttons deaktivieren
  guessedBtn.disabled = true;
  notGuessedBtn.disabled = true;
  nextPlayerBtn.disabled = true;
  // Zufalls- und Anzeige-Buttons sind bereit (aktiv) für die erste Runde
  randomNameBtn.disabled = false;
  showNameBtn.disabled = false;
  manualNameInput.disabled = false;
});

// Zufälligen Namen ziehen
randomNameBtn.addEventListener("click", () => {
  showRandomName();
});

// Manuellen Namen anzeigen
showNameBtn.addEventListener("click", () => {
  showManualName();
});

// Erraten-Button klick (Punkt geben)
guessedBtn.addEventListener("click", () => {
  handleGuessed();
});

// Nicht-erraten-Button klick (kein Punkt)
notGuessedBtn.addEventListener("click", () => {
  handleNotGuessed();
});

// Nächster Spieler Button (nur Mehrspieler relevant)
nextPlayerBtn.addEventListener("click", () => {
  goToNextPlayer();
});