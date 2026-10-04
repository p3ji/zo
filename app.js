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
  { id: "small-sticker", name: "Small sticker", tickets: 1, emoji: "⭐", note: "A tiny sparkle for your collection", tone: "yellow" },
  { id: "normal-sticker", name: "Normal sticker", tickets: 2, emoji: "🌈", note: "A colourful little treat", tone: "pink" },
  { id: "big-sticker", name: "Big sticker", tickets: 3, emoji: "🦄", note: "A big, extra special sticker", tone: "lavender" },
  { id: "play-place", name: "Trip to any play place", tickets: 50, emoji: "🎠", note: "A big adventure with your grown-up", tone: "mint" }
];

function localDateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function freshState() {
  return { tickets: 0, earned: 0, completed: {}, practiceDays: [], owned: ["Dolphin"], selected: "Dolphin", redemptions: [], birthday: null, necklace: false };
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
  return `<svg class="dolphin-art" viewBox="0 0 300 240" role="img" aria-label="A smiling blue dolphin"><defs><linearGradient id="dolphinGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#92dbe9"/><stop offset="1" stop-color="#55a9cf"/></linearGradient></defs><path d="M90 137c-7-25 0-52 21-70-3-21-10-34-21-43 29-1 48 9 57 27 33-4 64 14 81 39 12 18 11 43-3 60l-18 21c-17 19-41 29-70 27-26-2-45-14-52-31-12 13-28 20-47 18 16-12 22-25 23-40-10-8-18-20-21-35 14 10 31 15 50 27Z" fill="url(#dolphinGradient)" stroke="#417da7" stroke-width="5" stroke-linejoin="round"/><path d="M145 125c21 12 42 12 64 3 4 25-17 49-45 51-20 2-37-8-46-22 14-6 23-17 27-32Z" fill="#e8f9f8" opacity=".95"/><path d="M207 91c18-7 37-7 57 3-15 7-28 16-38 28" fill="#83cfe0" stroke="#417da7" stroke-width="5" stroke-linejoin="round"/><path d="M97 140c-14-11-27-15-45-15 14 11 20 23 21 39" fill="#78c8dd" stroke="#417da7" stroke-width="5" stroke-linejoin="round"/><circle cx="182" cy="95" r="4.5" fill="#315575"/><ellipse cx="174" cy="110" rx="10" ry="5" fill="#ffa8b9" opacity=".8"/><path d="M211 106q8 7 18 0" fill="none" stroke="#315575" stroke-width="3" stroke-linecap="round"/><path d="M116 192q17 14 39 14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".65"/></svg>`;
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
  document.getElementById("prizesGrid").innerHTML = PRIZES.map(prize => `
    <article class="prize-card"><div class="prize-art ${prize.tone}" aria-hidden="true">${prize.emoji}</div><div class="prize-content"><h3>${prize.name}</h3><p>${prize.note}</p><button type="button" class="prize-button" data-prize="${prize.id}">Get for <strong>✦ ${prize.tickets}</strong></button></div></article>`).join("");
  const history = document.getElementById("prizeHistory");
  if (!state.redemptions.length) { history.innerHTML = '<p class="empty-history">Your first prize memory will appear here. ✨</p>'; return; }
  history.innerHTML = `<ul>${state.redemptions.slice().reverse().slice(0, 10).map(entry => {
    const prize = PRIZES.find(p => p.id === entry.id);
    return prize ? `<li><span>${prize.emoji} ${prize.name}</span><small>${entry.date}</small></li>` : "";
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
  if (state.tickets < prize.tickets) { showToast(`You need ${prize.tickets - state.tickets} more tickets for this prize ✦`); return; }
  const yes = await confirmAction({ emoji: prize.emoji, title: `Get ${prize.name}?`, message: `This uses ${prize.tickets} ${prize.tickets === 1 ? "ticket" : "tickets"}. Ask your grown-up to help you receive your real prize.`, confirmText: "Get my prize!" });
  if (!yes || state.tickets < prize.tickets) return;
  state.tickets -= prize.tickets;
  state.redemptions.push({ id, date: localDateKey() });
  save(); render(); showToast(`${prize.name} added to your prize memories! 🎉`);
}

function showTab(id) {
  if (!["today", "friends", "prizes", "seasons"].includes(id)) return;
  currentTab = id;
  document.querySelectorAll(".tab").forEach(tab => { const active = tab.dataset.tab === id; tab.classList.toggle("active", active); if (active) tab.setAttribute("aria-current", "page"); else tab.removeAttribute("aria-current"); });
  document.querySelectorAll(".panel-page").forEach(page => { const active = page.id === id; page.hidden = !active; page.classList.toggle("active", active); });
  history.replaceState(null, "", `#${id}`);
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
setupBirthday();
render();
showTab(location.hash.replace("#", "") || "today");
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
