const STORAGE_KEY = "piano-pals-v1";

const TASKS = [
  { id: "piano", title: "Play piano without being asked", detail: "A little music magic, all on your own", icon: "🎹", tickets: 1, tone: "lavender" },
  { id: "room", title: "Clean your room", detail: "Make your space sparkle", icon: "🧸", tickets: 1, tone: "pink" },
  { id: "math", title: "Do math for 20 minutes", detail: "Give your brain a little workout", icon: "✏️", tickets: 2, tone: "peach" },
  { id: "french", title: "Do French for 20 minutes", detail: "Bonjour, clever you!", icon: "📖", tickets: 2, tone: "mint" },
  { id: "dishes", title: "Help wash dishes", detail: "Teamwork makes the kitchen shine", icon: "🫧", tickets: 2, tone: "blue" },
  { id: "clothes", title: "Fold clothes without being asked", detail: "A sweet surprise for everyone", icon: "🧺", tickets: 1, tone: "yellow" }
];

const ANIMALS = [
  ["Dolphin", "🐬"], ["Fish", "🐠"], ["Monkey", "🐵"], ["Cat", "🐱"], ["Dog", "🐶"],
  ["Fox", "🦊"], ["Wolf", "🐺"], ["Shark", "🦈"], ["Snake", "🐍"], ["Iguana", "🦎"],
  ["Hamster", "🐹"], ["Rabbit", "🐰"], ["Lizard", "🦎"], ["Seal", "🦭"], ["Walrus", "🦭"],
  ["Penguin", "🐧"], ["Puffin", "🐧"], ["Eagle", "🦅"], ["Flamingo", "🦩"], ["Unicorn", "🦄"],
  ["Dragon", "🐉"], ["Bear", "🐻"], ["Cow", "🐮"], ["Pig", "🐷"], ["Dinosaur", "🦕"],
  ["Owl", "🦉"], ["Snowy Owl", "🦉"], ["Raccoon", "🦝"], ["Badger", "🦡"], ["Mouse", "🐭"],
  ["Rat", "🐀"], ["Leopard", "🐆"], ["Lion", "🦁"], ["Jaguar", "🐆"], ["Tiger", "🐯"],
  ["Lynx", "🐈"], ["Axolotl", "🦎"], ["Horse", "🐴"], ["Donkey", "🐴"], ["Fennec Fox", "🦊"], ["Arctic Fox", "🦊"]
];

const PRIZES = [
  { id: "small-sticker", name: "Small sticker", tickets: 1, emoji: "⭐", note: "A tiny real sticker plus a digital star", tone: "yellow", category: "stickers" },
  { id: "normal-sticker", name: "Normal sticker", tickets: 2, emoji: "🌈", note: "A real sticker plus a digital rainbow", tone: "pink", category: "stickers" },
  { id: "big-sticker", name: "Big sticker", tickets: 3, emoji: "🦄", note: "A big real sticker plus a digital unicorn", tone: "lavender", category: "stickers" },
  { id: "music-sticker", name: "Music note", tickets: 1, emoji: "🎵", note: "A digital sticker for a music lover", tone: "lavender", category: "stickers", digitalOnly: true },
  { id: "heart-sticker", name: "Shiny heart", tickets: 1, emoji: "💖", note: "A digital sticker full of love", tone: "pink", category: "stickers", digitalOnly: true },
  { id: "strawberry-sticker", name: "Sweet strawberry", tickets: 1, emoji: "🍓", note: "A digital berry for your collection", tone: "peach", category: "stickers", digitalOnly: true },
  { id: "butterfly-sticker", name: "Butterfly", tickets: 2, emoji: "🦋", note: "A digital flutter of colour", tone: "blue", category: "stickers", digitalOnly: true },
  { id: "dolphin-sticker", name: "Dolphin buddy", tickets: 2, emoji: "🐬", note: "A digital pal from the sea", tone: "blue", category: "stickers", digitalOnly: true },
  { id: "kitten-sticker", name: "Little kitten", tickets: 2, emoji: "🐱", note: "A digital sleepy little friend", tone: "mint", category: "stickers", digitalOnly: true },
  { id: "moon-sticker", name: "Dreamy moon", tickets: 2, emoji: "🌙", note: "A digital moon for cosy nights", tone: "yellow", category: "stickers", digitalOnly: true },
  { id: "cupcake-sticker", name: "Cupcake", tickets: 3, emoji: "🧁", note: "A digital sweet treat", tone: "pink", category: "stickers", digitalOnly: true },
  { id: "planet-sticker", name: "Planet", tickets: 3, emoji: "🪐", note: "A digital sticker from outer space", tone: "lavender", category: "stickers", digitalOnly: true },
  { id: "indigo-book", name: "Trip to Indigo for a book", tickets: 30, emoji: "📚", note: "Pick out a brand new book to read together", tone: "peach", category: "books" },
  { id: "mini-space", name: "Trip to Mini Space Club", tickets: 50, emoji: "🚀", note: "An out-of-this-world adventure with your grown-up", tone: "mint", category: "outings", maxRedemptions: 1 }
];

const PRIZE_CATEGORIES = [
  { id: "stickers", title: "Sticker collection", icon: "✨", description: "Decorate your school bag, skates, suitcase, or lunch bag. The first three also include a real sticker from your grown-up." },
  { id: "books", title: "Books", icon: "📚", description: "Save up for a new story to read together." },
  { id: "outings", title: "Outings", icon: "🚀", description: "Big adventures to plan with your grown-up." }
];

const STICKER_SURFACE_IDS = ["school-bag", "skates", "suitcase", "lunch-bag"];

function localDateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function freshState() {
  return { tickets: 0, earned: 0, completed: {}, practiceDays: [], owned: ["Dolphin"], selected: "Dolphin", redemptions: [], birthday: null, necklace: false, stickers: [], nextStickerId: 1, activeSurface: "school-bag", sheetsOwned: ["dolphin-dream"], coloringProgress: {} };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return freshState();
    const defaults = freshState();
    const state = { ...defaults, ...saved };
    state.tickets = Number.isFinite(state.tickets) ? Math.max(0, state.tickets) : 0;
    state.earned = Number.isFinite(state.earned) ? Math.max(0, state.earned) : 0;
    state.completed = state.completed && typeof state.completed === "object" ? state.completed : {};
    state.practiceDays = Array.isArray(state.practiceDays) ? [...new Set(state.practiceDays.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)))] : [];
    state.owned = Array.isArray(state.owned) ? [...new Set(["Dolphin", ...state.owned.filter(x => ANIMALS.some(a => a[0] === x))])] : ["Dolphin"];
    state.selected = state.owned.includes(state.selected) ? state.selected : "Dolphin";
    state.redemptions = Array.isArray(state.redemptions) ? state.redemptions : [];
    state.activeSurface = STICKER_SURFACE_IDS.includes(state.activeSurface) ? state.activeSurface : "school-bag";
    state.stickers = Array.isArray(state.stickers) ? state.stickers.filter(item => item && PRIZES.some(prize => prize.id === item.prizeId && prize.category === "stickers") && Number.isFinite(item.uid)).map(item => ({ uid: item.uid, prizeId: item.prizeId, placed: !!item.placed, surface: item.placed ? STICKER_SURFACE_IDS.includes(item.surface) ? item.surface : "school-bag" : null, x: Number.isFinite(item.x) ? Math.max(8, Math.min(92, item.x)) : 50, y: Number.isFinite(item.y) ? Math.max(8, Math.min(92, item.y)) : 50 })) : [];
    state.nextStickerId = Math.max(Number.isFinite(state.nextStickerId) ? state.nextStickerId : 1, ...state.stickers.map(item => item.uid + 1), 1);
    const stickerPurchases = state.redemptions.filter(entry => PRIZES.some(prize => prize.id === entry.id && prize.category === "stickers"));
    for (let i = state.stickers.length; i < stickerPurchases.length; i++) state.stickers.push({ uid: state.nextStickerId++, prizeId: stickerPurchases[i].id, placed: false, surface: null, x: 50, y: 50 });
    state.sheetsOwned = Array.isArray(state.sheetsOwned) ? [...new Set(["dolphin-dream", ...state.sheetsOwned.filter(id => typeof id === "string")])] : ["dolphin-dream"];
    state.coloringProgress = state.coloringProgress && typeof state.coloringProgress === "object" && !Array.isArray(state.coloringProgress) ? state.coloringProgress : {};
    return state;
  } catch { return freshState(); }
}

let state = loadState();
let currentTab = "today";
let toastTimer;
let cookieStep = 0;

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { showToast("This browser could not save progress. Check your storage settings."); }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

function todayDone() {
  return Array.isArray(state.completed[localDateKey()]) ? state.completed[localDateKey()] : [];
}

function dayBefore(key) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function streak() {
  const practiced = new Set(state.practiceDays);
  let day = localDateKey();
  if (!practiced.has(day)) day = dayBefore(day);
  let count = 0;
  while (practiced.has(day)) { count += 1; day = dayBefore(day); }
  return count;
}

function season() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (state.birthday && state.birthday.month === month && state.birthday.day === day) return "birthday";
  if (month === 2 && day <= 14) return "valentine";
  if (month === 12 && day <= 25) return "christmas";
  return "everyday";
}

function dolphinSvg() {
  return `<svg class="dolphin-art" viewBox="0 0 300 240" role="img" aria-label="A smiling blue dolphin with a pointed beak, dorsal fin and two tail flukes"><defs><linearGradient id="dolphinGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8be1ed"/><stop offset="1" stop-color="#55a9d5"/></linearGradient></defs><path d="M79 137C55 134 45 117 27 105c6 20 13 30 27 37-14 7-23 18-30 37 22-9 37-22 55-28" fill="#66b9d8" stroke="#417da7" stroke-width="5" stroke-linejoin="round"/><path d="M73 139C89 99 129 76 171 79l-2-39c16 12 26 27 29 44 29 9 42 23 58 33l31 4c-8 13-21 18-43 19-26 34-62 55-101 51-34-3-59-22-70-52Z" fill="url(#dolphinGradient)" stroke="#417da7" stroke-width="5" stroke-linejoin="round"/><path d="M111 165c34 19 72 17 104-7-13 21-41 35-72 33-16-1-28-8-32-26Z" fill="#e9fbf9"/><path d="M157 158c-8 22-4 43 6 56 3-17 10-28 22-38" fill="#69b8d9" stroke="#417da7" stroke-width="4" stroke-linejoin="round"/><circle cx="225" cy="108" r="4.5" fill="#315575"/><ellipse cx="216" cy="122" rx="9" ry="5" fill="#ffaac2" opacity=".85"/><path d="M252 131q12 4 22-3" fill="none" stroke="#315575" stroke-width="3" stroke-linecap="round"/><path d="M30 101q8 5 15 13M18 179q14-5 25-16" fill="none" stroke="#d6f7ff" stroke-width="3" stroke-linecap="round"/></svg>`;
}

function renderPet() {
  const pet = ANIMALS.find(a => a[0] === state.selected) || ANIMALS[0];
  const stage = document.getElementById("petStage");
  stage.innerHTML = pet[0] === "Dolphin" ? dolphinSvg() : `<span class="pet-emoji" role="img" aria-label="${pet[0]}">${pet[1]}</span>`;
  document.getElementById("petName").textContent = pet[0];
  stage.setAttribute("aria-label", `${pet[0]} avatar`);
  document.getElementById("petMood").textContent = todayDone().includes("piano") ? "You made music today! ♡" : "Ready to cheer you on! ♡";
  document.getElementById("petBadge").textContent = state.necklace && season() === "valentine" ? "HEART NECKLACE UNLOCKED ♡" : "YOUR PRACTICE BUDDY";
  document.getElementById("petScene").classList.toggle("valentine-scene", season() === "valentine");
  document.getElementById("petScene").classList.toggle("christmas-scene", season() === "christmas");
  document.getElementById("petScene").classList.toggle("birthday-scene", season() === "birthday");
  stage.classList.toggle("wearing-heart", state.necklace && season() === "valentine");
}

function renderTasks() {
  const done = todayDone();
  document.getElementById("completedCount").textContent = `${done.length} / ${TASKS.length} done`;
  const heroButton = document.getElementById("heroPractice");
  heroButton.disabled = done.includes("piano");
  heroButton.innerHTML = done.includes("piano") ? "✓ Piano done for today! <span aria-hidden=\"true\">♡</span>" : "♪ I played piano on my own <span aria-hidden=\"true\">+1 ✦</span>";
  document.getElementById("tasksList").innerHTML = TASKS.map(task => `
    <div class="task-row ${done.includes(task.id) ? "done" : ""}">
      <span class="task-icon ${task.tone}" aria-hidden="true">${task.icon}</span>
      <div class="task-copy"><strong>${task.title}</strong><span>${task.detail}</span></div>
      <span class="task-tickets" aria-label="${task.tickets} tickets">✦ ${task.tickets}</span>
      <button type="button" class="task-button ${done.includes(task.id) ? "claimed" : ""}" data-task="${task.id}" ${done.includes(task.id) ? "disabled" : ""} aria-label="${done.includes(task.id) ? "Completed" : `Complete ${task.title}`}">${done.includes(task.id) ? "✓" : "+"}</button>
    </div>`).join("");
}

function renderProgress() {
  const days = state.practiceDays.length;
  const next = [3, 7, 14, 30, 50, 100].find(n => days < n);
  document.getElementById("practiceCount").textContent = days;
  document.getElementById("streakCount").textContent = streak();
  document.getElementById("friendCount").textContent = state.owned.length;
  document.getElementById("milestoneText").textContent = next ? `${days} of ${next} practice days to your next star` : "100 practice days — what a superstar!";
  const previous = [0, 3, 7, 14, 30, 50, 100].filter(n => n <= days).pop();
  document.getElementById("milestoneFill").style.width = `${next ? ((days - previous) / (next - previous)) * 100 : 100}%`;
}

function renderFriends() {
  document.getElementById("friendsGrid").innerHTML = ANIMALS.map(([name, emoji], index) => {
    const owned = state.owned.includes(name);
    const selected = state.selected === name;
    return `<article class="friend-card ${selected ? "selected" : ""}"><div class="friend-art color-${index % 6}"><span role="img" aria-label="${name}">${emoji}</span>${selected ? '<span class="friend-heart">♥</span>' : ""}</div><h3>${name}</h3><button type="button" class="friend-button ${selected ? "selected-button" : ""}" data-friend="${name}" ${selected ? "disabled" : ""}>${selected ? "My pal ✓" : owned ? "Choose me" : "✦ 2 tickets"}</button></article>`;
  }).join("");
}

function renderPrizes() {
  const card = prize => {
    const redeemedCount = state.redemptions.filter(entry => entry.id === prize.id).length;
    const hasLimit = typeof prize.maxRedemptions === "number";
    const remaining = hasLimit ? Math.max(0, prize.maxRedemptions - redeemedCount) : null;
    const isSoldOut = hasLimit && remaining <= 0;

    const limitBadge = hasLimit
      ? `<span class="prize-limit ${isSoldOut ? "sold-out" : ""}">${isSoldOut ? "All claimed! ✦" : `${remaining} left! ✦`}</span>`
      : "";

    const buttonLabel = isSoldOut
      ? "Claimed ✓"
      : `Get for <strong>✦ ${prize.tickets}</strong>`;

    return `
    <article class="prize-card ${isSoldOut ? "prize-claimed" : ""}">
      <div class="prize-art ${prize.tone}" aria-hidden="true">${prize.emoji}</div>
      <div class="prize-content">
        <h3>${prize.name}</h3>
        ${prize.category === "stickers" ? `<span class="prize-kind">${prize.digitalOnly ? "DIGITAL STICKER" : "REAL + DIGITAL"}</span>` : ""}
        ${limitBadge}
        <p>${prize.note}</p>
        <button type="button" class="prize-button ${isSoldOut ? "sold-out-button" : ""}" data-prize="${prize.id}" ${isSoldOut ? "disabled" : ""}>${buttonLabel}</button>
      </div>
    </article>`;
  };
  document.getElementById("prizesGrid").innerHTML = PRIZE_CATEGORIES.map(category => `
    <section class="prize-category" aria-labelledby="prize-${category.id}">
      <div class="prize-category-heading"><div><p class="card-kicker">${category.icon} ${category.id.toUpperCase()}</p><h3 id="prize-${category.id}">${category.title}</h3><p>${category.description}</p></div><span class="prize-category-count">${PRIZES.filter(prize => prize.category === category.id).length} rewards</span></div>
      <div class="prize-grid">${PRIZES.filter(prize => prize.category === category.id).map(card).join("")}</div>
    </section>`).join("");

  const history = document.getElementById("prizeHistory");
  if (!state.redemptions.length) { history.innerHTML = '<p class="empty-history">Your first prize memory will appear here. ✨</p>'; return; }
  history.innerHTML = `<ul>${state.redemptions.slice().reverse().slice(0, 10).map(entry => {
    const prize = PRIZES.find(p => p.id === entry.id);
    if (prize) return `<li><span>${prize.emoji} ${prize.name}</span><small>${entry.date}</small></li>`;
    if (entry.id === "play-place") return `<li><span>🎠 Trip to play place</span><small>${entry.date}</small></li>`;
    return `<li><span>🎁 Surprise prize</span><small>${entry.date}</small></li>`;
  }).join("")}</ul>`;
}

function renderSeasons() {
  const active = season();
  const cards = [
    { id: "valentine", icon: "💝", name: "Valentine's Day", when: "February 1–14", detail: "A pink heart world and a special heart necklace for your practice pal.", action: state.necklace ? "Necklace collected ♡" : "Collect necklace" },
    { id: "christmas", icon: "🍪", name: "Christmas", when: "December 1–25", detail: "A cosy gingerbread world and a little cookie baking game.", action: "Bake cookies" },
    { id: "birthday", icon: "🎂", name: "Your Birthday", when: "On your birthday", detail: "Tap your avatar for a birthday cake surprise and a little birthday tune.", action: "Tap your avatar" }
  ];
  document.getElementById("seasonsGrid").innerHTML = cards.map(card => `
    <article class="season-card ${card.id} ${active === card.id ? "season-active" : ""}"><div class="season-top"><span class="season-icon" aria-hidden="true">${card.icon}</span><span class="season-status">${active === card.id ? "HAPPENING NOW ✦" : card.when}</span></div><h3>${card.name}</h3><p>${card.detail}</p><button type="button" class="season-button" data-season="${card.id}" ${active !== card.id || card.id === "valentine" && state.necklace ? "disabled" : ""}>${active === card.id ? card.action : "Coming soon"}</button></article>`).join("");
}

function render() {
  document.getElementById("ticketCount").textContent = state.tickets;
  document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  renderPet(); renderTasks(); renderProgress(); renderFriends(); renderPrizes(); renderSeasons();
  window.renderExtras?.();
}

function completeTask(id) {
  const task = TASKS.find(item => item.id === id);
  if (!task || todayDone().includes(id)) return;
  const key = localDateKey();
  state.completed[key] = [...todayDone(), id];
  state.tickets += task.tickets;
  state.earned += task.tickets;
  if (id === "piano" && !state.practiceDays.includes(key)) state.practiceDays.push(key);
  save(); render();
  if (id === "piano") window.syncLeaderboard?.();
  showToast(id === "piano" ? "Beautiful! Your music earned a ticket ✦" : `Well done! +${task.tickets} ${task.tickets === 1 ? "ticket" : "tickets"} ✦`);
  const button = document.querySelector(`[data-task="${id}"]`);
  button?.closest(".task-row")?.classList.add("just-earned");
}

function confirmAction({ emoji, title, message, confirmText }) {
  const dialog = document.getElementById("confirmDialog");
  document.getElementById("dialogEmoji").textContent = emoji;
  document.getElementById("dialogTitle").textContent = title;
  document.getElementById("dialogMessage").textContent = message;
  document.getElementById("dialogConfirm").textContent = confirmText;
  return new Promise(resolve => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "confirm"), { once: true });
    dialog.showModal();
  });
}

async function chooseFriend(name) {
  if (!ANIMALS.some(animal => animal[0] === name)) return;
  if (state.owned.includes(name)) { state.selected = name; save(); render(); showToast(`${name} is your new practice pal! ♡`); showTab("today"); return; }
  if (state.tickets < 2) { showToast("Keep collecting tickets — this friend needs 2 ✦"); return; }
  const yes = await confirmAction({ emoji: ANIMALS.find(a => a[0] === name)[1], title: `Bring home ${name}?`, message: "This new animal friend costs 2 tickets.", confirmText: "Yes, new friend!" });
  if (!yes || state.owned.includes(name) || state.tickets < 2) return;
  state.tickets -= 2; state.owned.push(name); state.selected = name;
  save(); render(); showToast(`${name} joined your animal friends! ♡`); showTab("today");
}

async function getPrize(id) {
  const prize = PRIZES.find(item => item.id === id);
  if (!prize) return;
  if (typeof prize.maxRedemptions === "number") {
    const redeemedCount = state.redemptions.filter(entry => entry.id === prize.id).length;
    if (redeemedCount >= prize.maxRedemptions) {
      showToast("This special prize has already been claimed! ✦");
      return;
    }
  }
  if (state.tickets < prize.tickets) { showToast(`You need ${prize.tickets - state.tickets} more tickets for this prize ✦`); return; }
  const isSticker = prize.category === "stickers";
  const rewardMessage = isSticker ? prize.digitalOnly ? "Your digital sticker will appear in your pocket. Choose an item to decorate!" : "A digital copy will appear in your sticker pocket. Ask your grown-up for your real sticker too." : "Ask your grown-up to help you receive your real prize.";
  const yes = await confirmAction({ emoji: prize.emoji, title: `Get ${prize.name}?`, message: `This uses ${prize.tickets} ${prize.tickets === 1 ? "ticket" : "tickets"}. ${rewardMessage}`, confirmText: "Get my prize!" });
  if (!yes || state.tickets < prize.tickets) return;
  if (typeof prize.maxRedemptions === "number") {
    const redeemedCount = state.redemptions.filter(entry => entry.id === prize.id).length;
    if (redeemedCount >= prize.maxRedemptions) return;
  }
  state.tickets -= prize.tickets;
  state.redemptions.push({ id, date: localDateKey() });
  if (isSticker) state.stickers.push({ uid: state.nextStickerId++, prizeId: id, placed: false, surface: null, x: 50, y: 50 });
  save(); render(); showToast(isSticker ? "Sticker added! Choose something to decorate ✨" : `${prize.name} added to your prize memories! 🎉`);
  if (isSticker) showTab("bag");
}

function showTab(id) {
  if (!["today", "bag", "coloring", "friends", "prizes", "leaderboard", "seasons"].includes(id)) return;
  currentTab = id;
  document.querySelector(".welcome").hidden = id !== "today";
  document.querySelectorAll(".tab").forEach(tab => { const active = tab.dataset.tab === id; tab.classList.toggle("active", active); if (active) tab.setAttribute("aria-current", "page"); else tab.removeAttribute("aria-current"); });
  document.querySelectorAll(".panel-page").forEach(page => { const active = page.id === id; page.hidden = !active; page.classList.toggle("active", active); });
  history.replaceState(null, "", `#${id}`);
  if (id === "coloring") window.refreshStudio?.();
  if (id === "leaderboard") window.refreshLeaderboard?.();
}

function updateDays() {
  const month = Number(document.getElementById("birthdayMonth").value);
  const daySelect = document.getElementById("birthdayDay");
  const previous = Number(daySelect.value) || state.birthday?.day || 1;
  const days = new Date(2024, month, 0).getDate();
  daySelect.innerHTML = Array.from({ length: days }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
  daySelect.value = String(Math.min(previous, days));
}

function setupBirthday() {
  const monthSelect = document.getElementById("birthdayMonth");
  monthSelect.innerHTML = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2024, i, 1))}</option>`).join("");
  monthSelect.value = String(state.birthday?.month || new Date().getMonth() + 1);
  updateDays();
  document.getElementById("birthdayDay").value = String(state.birthday?.day || 1);
  monthSelect.addEventListener("change", updateDays);
  document.getElementById("birthdayForm").addEventListener("submit", event => {
    event.preventDefault();
    state.birthday = { month: Number(monthSelect.value), day: Number(document.getElementById("birthdayDay").value) };
    save(); render(); showToast("Birthday saved! Your surprise will appear on your special day 🎂");
  });
}

function playBirthdayTune() {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [262, 262, 294, 262, 349, 330, 262, 262, 294, 262, 392, 349];
    let at = context.currentTime + 0.05;
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine"; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.12, at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at); oscillator.stop(at + 0.32);
      at += index === 5 ? 0.45 : 0.32;
    });
    setTimeout(() => context.close(), 5000);
  } catch { /* visual surprise still works if audio is unavailable */ }
}

function birthdaySurprise() {
  if (season() !== "birthday") return;
  const scene = document.getElementById("petScene");
  scene.classList.remove("birthday-party");
  void scene.offsetWidth;
  scene.classList.add("birthday-party");
  showToast("Happy birthday! Cake for your pal! 🎂");
  playBirthdayTune();
  setTimeout(() => scene.classList.remove("birthday-party"), 5000);
}

function startCookies() {
  cookieStep = 0;
  document.getElementById("cookieVisual").textContent = "🥣";
  document.getElementById("cookieMessage").textContent = "First, mix up your dough.";
  document.getElementById("cookieNext").textContent = "Mix the dough";
  document.getElementById("cookieDialog").showModal();
}

document.addEventListener("click", event => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.tab) showTab(target.dataset.tab);
  if (target.dataset.task) completeTask(target.dataset.task);
  if (target.dataset.friend) chooseFriend(target.dataset.friend);
  if (target.dataset.prize) getPrize(target.dataset.prize);
  if (target.dataset.season === "valentine" && season() === "valentine" && !state.necklace) { state.necklace = true; save(); render(); showToast("Your heart necklace is yours! ♡"); }
  if (target.dataset.season === "christmas" && season() === "christmas") startCookies();
  if (target.dataset.season === "birthday" && season() === "birthday") { showTab("today"); birthdaySurprise(); }
});

document.getElementById("petStage").addEventListener("click", birthdaySurprise);
document.querySelector(".brand").addEventListener("click", event => { event.preventDefault(); showTab("today"); window.scrollTo({ top: 0, behavior: "smooth" }); });
document.getElementById("cookieNext").addEventListener("click", () => {
  cookieStep += 1;
  const visual = document.getElementById("cookieVisual");
  const message = document.getElementById("cookieMessage");
  const button = document.getElementById("cookieNext");
  if (cookieStep === 1) { visual.textContent = "🍪"; message.textContent = "Now decorate your cookie with something sweet!"; button.textContent = "Add decorations"; }
  else if (cookieStep === 2) { visual.textContent = "🍪✨"; message.textContent = "Yum! You baked a magical Christmas cookie."; button.textContent = "Bake another"; }
  else { cookieStep = 0; visual.textContent = "🥣"; message.textContent = "First, mix up your dough."; button.textContent = "Mix the dough"; }
});
document.getElementById("cookieClose").addEventListener("click", () => document.getElementById("cookieDialog").close());
// Safari can ignore viewport zoom limits; cancel its page pinch gesture while
// the colouring studio keeps its own picture zoom controls.
document.addEventListener("gesturestart", event => { if (event.cancelable) event.preventDefault(); }, { passive: false });
setupBirthday();
render();
showTab(location.hash.replace("#", "") || "today");
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
