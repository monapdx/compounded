let gameData = [];
let currentEntry = null;
let foundPartners = new Set();
let score = 0;
let round = 1;
let roundQueue = [];
let lastBaseUsed = null;
let isTransitioning = false;

const baseWordEl = document.getElementById("base-word");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round");
const foundCountEl = document.getElementById("found-count");
const remainingCountEl = document.getElementById("remaining-count");
const messageEl = document.getElementById("message");
const foundListEl = document.getElementById("found-list");
const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const hintBtn = document.getElementById("hint-btn");
const skipBtn = document.getElementById("skip-btn");
const newRoundBtn = document.getElementById("new-round-btn");

async function loadGameData() {
  const response = await fetch("./compounds-clean-edited.json");

  if (!response.ok) {
    throw new Error("Could not load compounds-clean-edited.json");
  }

  const data = await response.json();
  let droppedEntries = 0;

  gameData = Array.isArray(data)
    ? data
        .map((entry) => {
          if (!entry || typeof entry.base !== "string" || !Array.isArray(entry.matches)) {
            droppedEntries += 1;
            return null;
          }

          const base = normalize(entry.base);
          if (!base) {
            droppedEntries += 1;
            return null;
          }

          const validMatches = entry.matches
            .filter(
              (match) =>
                match &&
                typeof match.partner === "string" &&
                typeof match.compound === "string" &&
                normalize(match.partner) &&
                normalize(match.compound)
            )
            .map((match) => ({
              partner: normalize(match.partner),
              compound: normalize(match.compound)
            }));

          if (validMatches.length === 0) {
            droppedEntries += 1;
            return null;
          }

          return {
            base,
            matches: validMatches
          };
        })
        .filter(Boolean)
    : [];

  if (droppedEntries > 0) {
    console.warn(`Dropped ${droppedEntries} invalid entries from compounds-clean-edited.json`);
  }
}

function normalize(text) {
  return text.trim().toLowerCase();
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomEntry() {
  if (gameData.length === 0) {
    return null;
  }

  if (roundQueue.length === 0) {
    roundQueue = shuffle(gameData.map((entry) => entry.base));

    // Avoid immediate repeat across cycle boundaries when possible.
    if (roundQueue.length > 1 && roundQueue[0] === lastBaseUsed) {
      roundQueue.push(roundQueue.shift());
    }
  }

  const nextBase = roundQueue.shift();
  lastBaseUsed = nextBase;
  return gameData.find((entry) => entry.base === nextBase) || null;
}

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = "message";
  if (type) {
    messageEl.classList.add(type);
  }
}

function setControlsDisabled(disabled) {
  guessInput.disabled = disabled;
  hintBtn.disabled = disabled;
  skipBtn.disabled = disabled;
  newRoundBtn.disabled = disabled;
}

function updateStats() {
  scoreEl.textContent = score;
  roundEl.textContent = round;
  foundCountEl.textContent = foundPartners.size;

  if (!currentEntry) {
    remainingCountEl.textContent = "";
    return;
  }

  const total = currentEntry.matches.length;
  const remaining = total - foundPartners.size;
  remainingCountEl.textContent = `${remaining} remaining`;
}

function renderFoundList() {
  foundListEl.innerHTML = "";

  if (!currentEntry || foundPartners.size === 0) {
    return;
  }

  const foundMatches = currentEntry.matches.filter((match) =>
    foundPartners.has(normalize(match.partner))
  );

  for (const match of foundMatches) {
    const li = document.createElement("li");

    const compoundLine = document.createElement("div");
    compoundLine.className = "compound-line";
    compoundLine.textContent = match.compound;

    const partnerLine = document.createElement("div");
    partnerLine.className = "partner-line";
    partnerLine.textContent = `${currentEntry.base} + ${match.partner}`;

    li.appendChild(compoundLine);
    li.appendChild(partnerLine);

    foundListEl.appendChild(li);
  }
}

function startRound() {
  const selected = pickRandomEntry();
  foundPartners = new Set();

  if (!selected) {
    baseWordEl.textContent = "No data";
    setMessage("No playable entries were found in the JSON file.", "error");
    updateStats();
    renderFoundList();
    return;
  }

  currentEntry = {
    base: selected.base,
    matches: shuffle(selected.matches)
  };

  baseWordEl.textContent = currentEntry.base;
  guessInput.value = "";
  guessInput.focus();

  setMessage("Enter a word that forms a compound with the prompt word.");
  updateStats();
  renderFoundList();
}

function revealHint() {
  if (!currentEntry) return;

  const remaining = currentEntry.matches.filter(
    (match) => !foundPartners.has(normalize(match.partner))
  );

  if (remaining.length === 0) {
    setMessage("You already found all matches for this word.", "success");
    return;
  }

  const target = remaining[0];
  const firstLetter = target.partner.charAt(0).toUpperCase();
  const blanks = "_".repeat(Math.max(target.partner.length - 1, 0));

  setMessage(`Hint: ${firstLetter}${blanks}`, "success");
}

function findMatchingEntry(guess) {
  if (!currentEntry) return null;

  const normalizedGuess = normalize(guess);

  return currentEntry.matches.find((match) => {
    const partner = normalize(match.partner);
    const compound = normalize(match.compound);
    return normalizedGuess === partner || normalizedGuess === compound;
  });
}

function handleGuessSubmission(event) {
  event.preventDefault();

  if (!currentEntry || isTransitioning) return;

  const rawGuess = guessInput.value;
  const guess = normalize(rawGuess);

  if (!guess) {
    setMessage("Please enter a word first.", "error");
    return;
  }

  const matched = findMatchingEntry(guess);

  if (!matched) {
    setMessage(`"${rawGuess}" is not a correct match for ${currentEntry.base}.`, "error");
    guessInput.select();
    return;
  }

  const partnerKey = normalize(matched.partner);

  if (foundPartners.has(partnerKey)) {
    setMessage(`You already found ${matched.compound}.`, "error");
    guessInput.select();
    return;
  }

  foundPartners.add(partnerKey);
  score += 1;

  setMessage(`Correct! ${currentEntry.base} + ${matched.partner} = ${matched.compound}`, "success");
  updateStats();
  renderFoundList();
  guessInput.value = "";
  guessInput.focus();

  if (foundPartners.size === currentEntry.matches.length) {
    setMessage(`Nice — you found all matches for ${currentEntry.base}!`, "success");
  }
}

function skipRound() {
  if (!currentEntry || isTransitioning) return;
  isTransitioning = true;
  setControlsDisabled(true);

  const unseen = currentEntry.matches.filter(
    (match) => !foundPartners.has(normalize(match.partner))
  );

  if (unseen.length > 0) {
    const compounds = unseen.map((m) => m.compound).join(", ");
    setMessage(`Skipped. Unfound matches were: ${compounds}`, "error");
  }

  round += 1;
  updateStats();

  setTimeout(() => {
    startRound();
    isTransitioning = false;
    setControlsDisabled(false);
  }, 700);
}

function nextRound() {
  if (isTransitioning) return;
  isTransitioning = true;
  setControlsDisabled(true);
  round += 1;
  startRound();
  isTransitioning = false;
  setControlsDisabled(false);
}

guessForm.addEventListener("submit", handleGuessSubmission);
hintBtn.addEventListener("click", revealHint);
skipBtn.addEventListener("click", skipRound);
newRoundBtn.addEventListener("click", nextRound);

async function init() {
  try {
    await loadGameData();
    startRound();
  } catch (error) {
    console.error(error);
    baseWordEl.textContent = "Error";
    setMessage("The game data could not be loaded. Check that the JSON file is in the same folder.", "error");
  }
}

init();