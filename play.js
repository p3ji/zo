/* School bag and colour-by-number studio. All progress shares Piano Pals' local save. */
(() => {
  const sheets = [...(window.COLORING_SHEETS || []), ...(window.COLORING_LARGE_SHEETS || []), ...(window.COLORING_KAWAII_SHEETS || [])];
  const stickerZone = document.getElementById("bagStickerZone");
  const stickerTray = document.getElementById("bagTray");
  const removeSticker = document.getElementById("bagRemove");
  const bagScene = document.getElementById("bagScene");
  const surfaceArt = document.getElementById("surfaceArt");
  const surfaces = [{ id: "school-bag", name: "School bag", emoji: "🎒", zone: { left: 25, top: 19, width: 50, height: 62 }, art: surfaceArt.innerHTML }, ...(window.EXTRA_STICKER_SURFACES || [])];
  let selectedSticker = null;
  let bagDrag = null;

  function stickerFor(item) { return PRIZES.find(prize => prize.id === item.prizeId); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function currentSurface() { return surfaces.find(surface => surface.id === state.activeSurface) || surfaces[0]; }
  function renderSurface() {
    const surface = currentSurface();
    if (bagScene.dataset.surface !== surface.id) {
      bagScene.dataset.surface = surface.id;
      surfaceArt.innerHTML = surface.art;
      for (const key of ["left", "top", "width", "height"]) stickerZone.style[key] = `${surface.zone[key]}%`;
      stickerZone.setAttribute("aria-label", `Decorated part of the ${surface.name.toLowerCase()}`);
    }
    const index = surfaces.indexOf(surface);
    const count = state.stickers.filter(item => item.placed && item.surface === surface.id).length;
    document.getElementById("surfaceLabel").textContent = `${surface.emoji} ${surface.name}`;
    document.getElementById("surfacePosition").textContent = `${index + 1} of ${surfaces.length} · ${count} ${count === 1 ? "sticker" : "stickers"}`;
    document.getElementById("surfaceChoices").innerHTML = surfaces.map(item => {
      const itemCount = state.stickers.filter(sticker => sticker.placed && sticker.surface === item.id).length;
      return `<button type="button" class="surface-choice ${item.id === surface.id ? "active" : ""}" data-surface="${item.id}" aria-pressed="${item.id === surface.id}"><span aria-hidden="true">${item.emoji}</span><strong>${item.name}</strong><small>${itemCount}</small></button>`;
    }).join("");
  }
  function chooseSurface(id) {
    if (!surfaces.some(surface => surface.id === id) || state.activeSurface === id) return;
    state.activeSurface = id;
    selectedSticker = null;
    save(); renderBag();
  }
  function positionFromPointer(event) {
    const bounds = stickerZone.getBoundingClientRect();
    return { x: clamp((event.clientX - bounds.left) / bounds.width * 100, 8, 92), y: clamp((event.clientY - bounds.top) / bounds.height * 100, 8, 92) };
  }
  function renderBag() {
    renderSurface();
    stickerZone.innerHTML = state.stickers.filter(item => item.placed && item.surface === state.activeSurface).map(item => `<button type="button" class="bag-sticker ${selectedSticker === item.uid ? "selected" : ""}" data-sticker="${item.uid}" style="left:${item.x}%;top:${item.y}%" aria-label="Move ${stickerFor(item)?.name || "sticker"}">${stickerFor(item)?.emoji || "⭐"}</button>`).join("");
    const pocket = state.stickers.filter(item => !item.placed);
    stickerTray.innerHTML = pocket.length ? pocket.map(item => `<button type="button" class="bag-sticker tray-sticker" data-sticker="${item.uid}" aria-label="Place ${stickerFor(item)?.name || "sticker"} on bag">${stickerFor(item)?.emoji || "⭐"}</button>`).join("") : '<p class="empty-history">Your sticker pocket is empty. The prize shop has more! ✨</p>';
    removeSticker.hidden = !state.stickers.some(item => item.uid === selectedSticker && item.placed && item.surface === state.activeSurface);
  }
  function autoPlace(item) {
    const count = state.stickers.filter(entry => entry.placed && entry.surface === state.activeSurface).length;
    const spots = [[24,22],[72,28],[46,45],[25,65],[74,67],[50,78],[52,21],[30,43],[69,50]];
    Object.assign(item, { placed: true, surface: state.activeSurface, x: spots[count % spots.length][0], y: spots[count % spots.length][1] });
    selectedSticker = item.uid;
    save(); renderBag(); showToast(`Sticker on your ${currentSurface().name.toLowerCase()}! Drag it to a new spot ✨`);
  }
  function startBagDrag(event) {
    const button = event.target.closest(".bag-sticker");
    if (!button || event.button !== 0) return;
    const item = state.stickers.find(entry => entry.uid === Number(button.dataset.sticker));
    if (!item) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    bagDrag = { item, button, startX: event.clientX, startY: event.clientY, moved: false, wasPlaced: item.placed };
    selectedSticker = item.uid;
    if (item.placed) button.classList.add("selected");
    removeSticker.hidden = !item.placed;
  }
  function moveBagDrag(event) {
    if (!bagDrag || !bagDrag.button.hasPointerCapture(event.pointerId)) return;
    if (Math.hypot(event.clientX - bagDrag.startX, event.clientY - bagDrag.startY) > 5) bagDrag.moved = true;
    if (!bagDrag.moved) return;
    if (bagDrag.wasPlaced) {
      const pos = positionFromPointer(event);
      Object.assign(bagDrag.item, pos);
      const visible = stickerZone.querySelector(`[data-sticker="${bagDrag.item.uid}"]`);
      if (visible) { visible.style.left = `${pos.x}%`; visible.style.top = `${pos.y}%`; }
    } else {
      let ghost = document.getElementById("stickerGhost");
      if (!ghost) {
        ghost = document.createElement("div"); ghost.id = "stickerGhost"; ghost.className = "sticker-ghost";
        ghost.textContent = stickerFor(bagDrag.item)?.emoji || "⭐"; document.body.append(ghost);
      }
      ghost.style.left = `${event.clientX}px`; ghost.style.top = `${event.clientY}px`;
    }
  }
  function endBagDrag(event) {
    if (!bagDrag) return;
    const { item, wasPlaced, moved } = bagDrag;
    document.getElementById("stickerGhost")?.remove();
    if (!wasPlaced) {
      const bounds = stickerZone.getBoundingClientRect();
      if (!moved) autoPlace(item);
      else if (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
        Object.assign(item, positionFromPointer(event)); item.placed = true; item.surface = state.activeSurface; save(); renderBag(); showToast(`Sticker on your ${currentSurface().name.toLowerCase()}! ✨`);
      }
    } else if (moved) { save(); renderBag(); }
    else renderBag();
    bagDrag = null;
  }
  [stickerZone, stickerTray].forEach(element => element.addEventListener("pointerdown", startBagDrag));
  document.getElementById("previousSurface").addEventListener("click", () => {
    const index = surfaces.indexOf(currentSurface());
    chooseSurface(surfaces[(index - 1 + surfaces.length) % surfaces.length].id);
  });
  document.getElementById("nextSurface").addEventListener("click", () => {
    const index = surfaces.indexOf(currentSurface());
    chooseSurface(surfaces[(index + 1) % surfaces.length].id);
  });
  document.getElementById("surfaceChoices").addEventListener("click", event => {
    const button = event.target.closest("[data-surface]");
    if (button) chooseSurface(button.dataset.surface);
  });
  document.addEventListener("pointermove", moveBagDrag);
  document.addEventListener("pointerup", endBagDrag);
  document.addEventListener("pointercancel", endBagDrag);
  document.addEventListener("click", event => {
    const button = event.target.closest(".bag-sticker");
    if (!button || event.detail !== 0) return;
    const item = state.stickers.find(entry => entry.uid === Number(button.dataset.sticker));
    if (item) { selectedSticker = item.uid; if (!item.placed) autoPlace(item); else renderBag(); }
  });
  removeSticker.addEventListener("click", () => {
    const item = state.stickers.find(entry => entry.uid === selectedSticker);
    if (!item) return;
    item.placed = false; item.surface = null; selectedSticker = null; save(); renderBag(); showToast("Back in your sticker pocket ♡");
  });

  const library = document.getElementById("sheetLibrary");
  const studio = document.getElementById("colourStudio");
  const canvas = document.getElementById("colourCanvas");
  const scrollBox = document.getElementById("canvasScroll");
  const palette = document.getElementById("colourPalette");
  const context = canvas.getContext("2d");
  let activeSheet = null;
  let filled = [];
  let selectedColor = 0;
  let cellSize = 22;
  let painting = false;
  let strokeChanged = false;
  let hintIndex = -1;
  let celebrated = false;
  let panning = false;
  let previousPoint = null;
  let cellNumbers = new Uint8Array(0);
  let remainingCounts = [];

  function validProgress(sheet) {
    const value = state.coloringProgress[sheet.id];
    return typeof value === "string" && value.length === sheet.cells.length && /^[01]+$/.test(value) ? value : "0".repeat(sheet.cells.length);
  }
  function countFilled(sheet) { return [...validProgress(sheet)].filter(value => value === "1").length; }
  function renderLibrary() {
    library.innerHTML = sheets.map((sheet, index) => {
      const owned = state.sheetsOwned.includes(sheet.id);
      const done = countFilled(sheet);
      const percent = Math.round(done / sheet.cells.length * 100);
      const title = sheet.width === 40 ? "Little pictures" : sheet.width === 100 ? "Big adventures" : "Kawaii dream pages";
      const group = !index || sheets[index - 1].width !== sheet.width ? `<h3 class="sheet-group-heading">${title} <span>${sheet.width} × ${sheet.height}</span></h3>` : "";
      return `${group}<article class="sheet-card"><img src="${sheet.preview}" alt="Completed ${sheet.title} pixel art" loading="lazy"><div class="sheet-card-copy"><h3>${sheet.title}</h3><p>${sheet.width} × ${sheet.height} squares · ${sheet.palette.length} colours</p><div class="sheet-mini-progress"><span style="width:${percent}%"></span></div><small>${owned ? `${percent}% coloured` : `✦ ${sheet.price} tickets`}</small><button type="button" data-sheet="${sheet.id}">${owned ? done === sheet.cells.length ? "View picture ✓" : "Colour this picture" : "Unlock sheet"}</button></div></article>`;
    }).join("");
  }
  function currentCount() { return filled.filter(value => value === "1").length; }
  function remainingFor(color) { return remainingCounts[color] || 0; }
  function renderPalette() {
    if (!activeSheet) return;
    palette.innerHTML = activeSheet.palette.map((color, index) => `<button type="button" class="colour-choice ${selectedColor === index ? "active" : ""}" data-colour="${index}" style="--swatch:${color}" aria-label="Colour ${index + 1}, ${remainingFor(index)} squares left" ${remainingFor(index) ? "" : "disabled"}><span>${index + 1}</span><small>${remainingFor(index)}</small></button>`).join("");
  }
  function updateStudioStatus() {
    const done = currentCount();
    const percent = Math.round(done / activeSheet.cells.length * 100);
    document.getElementById("studioProgressText").textContent = `${done} of ${activeSheet.cells.length} squares · ${percent}% complete`;
    document.getElementById("studioProgressFill").style.width = `${percent}%`;
    if (done === activeSheet.cells.length && !celebrated) { celebrated = true; showToast(`You finished ${activeSheet.title}! What a masterpiece! 🎉`); }
  }
  function drawCell(index) {
    const x = index % activeSheet.width * cellSize;
    const y = Math.floor(index / activeSheet.width) * cellSize;
    const number = cellNumbers[index];
    const isFilled = filled[index] === "1";
    context.fillStyle = isFilled ? activeSheet.palette[number] : number === selectedColor ? "#fff6df" : "#f8f7fb";
    context.fillRect(x, y, cellSize, cellSize);
    context.strokeStyle = index === hintIndex ? "#f5a940" : "#e5e1ee";
    context.lineWidth = index === hintIndex ? 2 : .7;
    context.strokeRect(x + .35, y + .35, cellSize - .7, cellSize - .7);
    if (!isFilled) {
      context.fillStyle = number === selectedColor ? "#7761b5" : "#8e8ba3";
      context.fillText(String(number + 1), x + cellSize / 2, y + cellSize / 2 + .5);
    }
  }
  function drawAll() {
    if (!activeSheet) return;
    const width = activeSheet.width * cellSize, height = activeSheet.height * cellSize;
    const ratio = Math.min(window.devicePixelRatio || 1, 2, 3200 / Math.max(width, height));
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.font = `800 ${Math.max(10, Math.min(15, cellSize * .52))}px system-ui`;
    context.textAlign = "center"; context.textBaseline = "middle";
    for (let i = 0; i < activeSheet.cells.length; i++) drawCell(i);
  }
  function openSheet(sheet) {
    activeSheet = sheet; filled = validProgress(sheet).split(""); celebrated = currentCount() === sheet.cells.length;
    cellNumbers = Uint8Array.from(sheet.cells, value => Number.parseInt(value, 36));
    remainingCounts = Array(sheet.palette.length).fill(0);
    for (let i = 0; i < cellNumbers.length; i++) if (filled[i] !== "1") remainingCounts[cellNumbers[i]]++;
    cellSize = sheet.width >= 100 ? 18 : 22;
    panning = false; canvas.classList.remove("pan-mode"); document.getElementById("panMode").setAttribute("aria-pressed", "false"); document.getElementById("panMode").textContent = "✋ Move picture";
    selectedColor = sheet.palette.findIndex((_, index) => remainingFor(index) > 0);
    if (selectedColor < 0) selectedColor = 0;
    library.hidden = true; studio.hidden = false;
    document.getElementById("studioTitle").textContent = sheet.title;
    renderPalette(); updateStudioStatus(); drawAll();
    requestAnimationFrame(() => {
      scrollBox.scrollLeft = Math.max(0, canvas.clientWidth / 2 - scrollBox.clientWidth / 2);
      scrollBox.scrollTop = Math.max(0, canvas.clientHeight * .4 - scrollBox.clientHeight / 2);
    });
    studio.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function chooseSheet(id) {
    const sheet = sheets.find(entry => entry.id === id);
    if (!sheet) return;
    if (state.sheetsOwned.includes(id)) { openSheet(sheet); return; }
    if (state.tickets < sheet.price) { showToast(`You need ${sheet.price - state.tickets} more tickets for this sheet ✦`); return; }
    const yes = await confirmAction({ emoji: "🎨", title: `Unlock ${sheet.title}?`, message: `This detailed picture costs ${sheet.price} tickets. You can colour it at your own pace.`, confirmText: "Unlock picture!" });
    if (!yes || state.tickets < sheet.price || state.sheetsOwned.includes(id)) return;
    state.tickets -= sheet.price; state.sheetsOwned.push(id); save(); render(); openSheet(sheet);
    showToast("New picture unlocked! Pick a colour to begin 🎨");
  }
  function cellFromEvent(event) {
    const bounds = canvas.getBoundingClientRect();
    const col = Math.floor((event.clientX - bounds.left) / cellSize);
    const row = Math.floor((event.clientY - bounds.top) / cellSize);
    if (col < 0 || row < 0 || col >= activeSheet.width || row >= activeSheet.height) return -1;
    return row * activeSheet.width + col;
  }
  function paintAt(event) {
    if (!activeSheet) return;
    const index = cellFromEvent(event);
    if (index < 0 || filled[index] === "1") return;
    if (cellNumbers[index] !== selectedColor) return;
    filled[index] = "1"; remainingCounts[selectedColor]--; strokeChanged = true; drawCell(index);
  }
  function paintAlong(event) {
    if (!previousPoint) { paintAt(event); previousPoint = { x: event.clientX, y: event.clientY }; return; }
    const distance = Math.hypot(event.clientX - previousPoint.x, event.clientY - previousPoint.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(4, cellSize / 3)));
    for (let step = 1; step <= steps; step++) {
      const part = step / steps;
      paintAt({ clientX: previousPoint.x + (event.clientX - previousPoint.x) * part, clientY: previousPoint.y + (event.clientY - previousPoint.y) * part });
    }
    previousPoint = { x: event.clientX, y: event.clientY };
  }
  function finishStroke() {
    if (!painting) return;
    painting = false;
    previousPoint = null;
    if (!strokeChanged) return;
    state.coloringProgress[activeSheet.id] = filled.join(""); save();
    if (!remainingFor(selectedColor)) {
      const next = activeSheet.palette.findIndex((_, index) => remainingFor(index) > 0);
      if (next >= 0) selectedColor = next;
      drawAll();
    }
    renderPalette(); updateStudioStatus(); renderLibrary();
  }
  canvas.addEventListener("pointerdown", event => {
    if (!activeSheet || panning || event.button !== 0) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId); painting = true; strokeChanged = false; previousPoint = null; paintAlong(event);
  });
  canvas.addEventListener("pointermove", event => { if (painting) paintAlong(event); });
  canvas.addEventListener("pointerup", finishStroke);
  canvas.addEventListener("pointercancel", finishStroke);
  document.addEventListener("click", event => {
    const sheetButton = event.target.closest("[data-sheet]");
    if (sheetButton) chooseSheet(sheetButton.dataset.sheet);
    const colourButton = event.target.closest("[data-colour]");
    if (colourButton && activeSheet) { selectedColor = Number(colourButton.dataset.colour); renderPalette(); drawAll(); }
  });
  document.getElementById("closeStudio").addEventListener("click", () => { finishStroke(); studio.hidden = true; library.hidden = false; activeSheet = null; renderLibrary(); });
  document.getElementById("zoomIn").addEventListener("click", () => { cellSize = clamp(cellSize + 4, 14, 38); drawAll(); });
  document.getElementById("zoomOut").addEventListener("click", () => { cellSize = clamp(cellSize - 4, 14, 38); drawAll(); });
  document.getElementById("panMode").addEventListener("click", event => {
    finishStroke(); panning = !panning; canvas.classList.toggle("pan-mode", panning);
    event.currentTarget.setAttribute("aria-pressed", String(panning));
    event.currentTarget.textContent = panning ? "🎨 Colour squares" : "✋ Move picture";
  });
  document.getElementById("studioHint").addEventListener("click", () => {
    if (!activeSheet) return;
    hintIndex = cellNumbers.findIndex((value, index) => value === selectedColor && filled[index] !== "1");
    if (hintIndex < 0) { showToast("This colour is finished! Pick another one ♡"); return; }
    const col = hintIndex % activeSheet.width, row = Math.floor(hintIndex / activeSheet.width);
    scrollBox.scrollTo({ left: Math.max(0, col * cellSize - scrollBox.clientWidth / 2), top: Math.max(0, row * cellSize - scrollBox.clientHeight / 2), behavior: "smooth" });
    drawCell(hintIndex);
    setTimeout(() => { const old = hintIndex; hintIndex = -1; if (activeSheet && old >= 0) drawCell(old); }, 2500);
  });
  window.renderExtras = () => { renderBag(); renderLibrary(); };
  window.refreshStudio = () => { if (activeSheet) drawAll(); };
  renderBag(); renderLibrary();
})();
