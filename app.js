/* Sliding 3×3 puzzle (8-puzzle) with image upload + solvable shuffle. */

const N = 3; // fixed 3×3 per request
const TILE_COUNT = N * N;
const BLANK = 0; // blank tile id

const els = {
  fileInput: document.getElementById("fileInput"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  resetBtn: document.getElementById("resetBtn"),
  board: document.getElementById("board"),
  preview: document.getElementById("preview"),
  solved: document.getElementById("solved"),
};

/** @type {string | null} */
let imageUrl = null;
/** @type {number[]} */
let state = solvedState();

init();

function init() {
  els.board.style.setProperty("--n", String(N));
  render();

  els.fileInput.addEventListener("change", onPickFile);
  els.shuffleBtn.addEventListener("click", () => {
    if (!imageUrl) return;
    shuffle();
    render();
  });
  els.resetBtn.addEventListener("click", () => {
    if (!imageUrl) return;
    resetToSolved();
    render();
  });

  // Handle clipboard paste
  document.addEventListener("paste", async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await processImageFile(file);
        }
        break;
      }
    }
  });

  // Handle paste button click (programmatic clipboard access)
  els.fileBtn.addEventListener("click", async (e) => {
    // If clicking the button, try to read from clipboard
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            await processImageFile(file);
            return;
          }
        }
      }
    } catch (err) {
      // Clipboard API not available or user denied permission
      // Fall back to file input
    }
  });

  // keyboard accessibility: arrow keys move blank by sliding a neighboring tile into it
  window.addEventListener("keydown", (e) => {
    if (!imageUrl) return;
    const key = e.key;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) return;
    e.preventDefault();

    const blankIdx = state.indexOf(BLANK);
    const [r, c] = idxToRC(blankIdx);
    // Determine which neighbor tile should slide into blank (i.e., blank moves opposite direction)
    let fromR = r;
    let fromC = c;
    if (key === "ArrowUp") fromR = r + 1;
    if (key === "ArrowDown") fromR = r - 1;
    if (key === "ArrowLeft") fromC = c + 1;
    if (key === "ArrowRight") fromC = c - 1;
    if (!inBounds(fromR, fromC)) return;
    const fromIdx = rcToIdx(fromR, fromC);
    attemptMove(fromIdx);
  });
}

function solvedState() {
  // 0 is blank, then 1..8 in row-major order; blank is top-left visually like the reference.
  // If you prefer blank bottom-right, swap order accordingly.
  return Array.from({ length: TILE_COUNT }, (_, i) => i);
}

function resetToSolved() {
  state = solvedState();
  els.solved.hidden = true;
}

async function processImageFile(file) {
  if (!file) return;

  els.solved.hidden = true;

  try {
    const url = await fileToSquareDataUrl(file, 900);
    imageUrl = url;
    els.preview.style.backgroundImage = `url("${imageUrl}")`;
    els.shuffleBtn.disabled = false;
    els.resetBtn.disabled = false;
    resetToSolved();
    shuffle(); // start shuffled (most users want to play immediately)
    render();
  } catch (err) {
    console.error(err);
    imageUrl = null;
    els.shuffleBtn.disabled = true;
    els.resetBtn.disabled = true;
  }
}

async function onPickFile() {
  const file = els.fileInput.files?.[0];
  if (!file) return;
  await processImageFile(file);
}

function render() {
  els.board.innerHTML = "";
  els.board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;

  const blankIdx = state.indexOf(BLANK);
  const movable = new Set(neighborIndices(blankIdx));

  for (let pos = 0; pos < TILE_COUNT; pos++) {
    const tileId = state[pos];
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", tileId === BLANK ? "Empty tile" : `Tile ${tileId}`);

    if (tileId === BLANK) {
      tile.classList.add("blank");
      tile.disabled = true;
    } else {
      if (movable.has(pos)) tile.classList.add("movable");
      tile.addEventListener("click", () => attemptMove(pos));
      tile.style.backgroundImage = imageUrl ? `url("${imageUrl}")` : "none";

      // tileId corresponds to original position (row-major): tileId 1 is at (0,1), ... tileId 8 at (2,2)
      const [srcR, srcC] = idxToRC(tileId);
      const x = (srcC / (N - 1)) * 100;
      const y = (srcR / (N - 1)) * 100;
      tile.style.backgroundPosition = `${x}% ${y}%`;
      tile.style.backgroundSize = `${N * 100}% ${N * 100}%`;
    }

    els.board.appendChild(tile);
  }
}

function attemptMove(clickedPos) {
  const blankPos = state.indexOf(BLANK);
  if (!areAdjacent(clickedPos, blankPos)) return;

  const next = state.slice();
  [next[clickedPos], next[blankPos]] = [next[blankPos], next[clickedPos]];
  state = next;

  const done = isSolved(state);
  els.solved.hidden = !done;

  render();
}

function shuffle() {
  // Solvable shuffle: start from solved and do a bunch of random legal moves.
  // This guarantees solvability and avoids parity math.
  resetToSolved();

  let blankIdx = state.indexOf(BLANK);
  let prevBlank = -1;
  const steps = 180; // feels nicely mixed for 3×3

  for (let i = 0; i < steps; i++) {
    const options = neighborIndices(blankIdx).filter((idx) => idx !== prevBlank);
    const pick = options[Math.floor(Math.random() * options.length)];

    const next = state.slice();
    [next[pick], next[blankIdx]] = [next[blankIdx], next[pick]];
    state = next;
    prevBlank = blankIdx;
    blankIdx = pick;
  }

  els.solved.hidden = true;

  // Ensure we don't accidentally end up solved after shuffling
  if (isSolved(state)) shuffle();
}

function isSolved(arr) {
  for (let i = 0; i < arr.length; i++) if (arr[i] !== i) return false;
  return true;
}


function neighborIndices(idx) {
  const [r, c] = idxToRC(idx);
  const out = [];
  if (inBounds(r - 1, c)) out.push(rcToIdx(r - 1, c));
  if (inBounds(r + 1, c)) out.push(rcToIdx(r + 1, c));
  if (inBounds(r, c - 1)) out.push(rcToIdx(r, c - 1));
  if (inBounds(r, c + 1)) out.push(rcToIdx(r, c + 1));
  return out;
}

function areAdjacent(a, b) {
  const [ar, ac] = idxToRC(a);
  const [br, bc] = idxToRC(b);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

function idxToRC(idx) {
  return [Math.floor(idx / N), idx % N];
}

function rcToIdx(r, c) {
  return r * N + c;
}

function inBounds(r, c) {
  return r >= 0 && r < N && c >= 0 && c < N;
}

async function fileToSquareDataUrl(file, targetSizePx) {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const s = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const sx = Math.floor(((img.naturalWidth || img.width) - s) / 2);
  const sy = Math.floor(((img.naturalHeight || img.height) - s) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = targetSizePx;
  canvas.height = targetSizePx;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");

  // Draw a centered square crop, scaled to target.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, s, s, 0, 0, targetSizePx, targetSizePx);

  // Use JPEG to keep size reasonable.
  return canvas.toDataURL("image/jpeg", 0.92);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

