/* The shared board keeps only a nickname and score online. Practice details stay local. */
(() => {
  const KEY = "piano-pals-leaderboard-v1";
  const URL = "/.netlify/functions/leaderboard";
  const list = document.getElementById("boardList");
  const boardStatus = document.getElementById("boardStatus");
  const formStatus = document.getElementById("boardFormStatus");
  const form = document.getElementById("leaderboardForm");
  const nicknameInput = document.getElementById("boardNickname");
  const saveButton = document.getElementById("boardSave");
  const leaveButton = document.getElementById("leaveBoard");
  const myScore = document.getElementById("myBoardScore");
  let profile = null;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved.id === "string" && typeof saved.secret === "string" && typeof saved.nickname === "string") profile = saved;
  } catch { /* A damaged local pass can be replaced with a new one. */ }

  function accountView(score) {
    saveButton.textContent = profile ? "Save nickname & score" : "Join the board";
    leaveButton.hidden = !profile;
    if (profile) nicknameInput.value = profile.nickname;
    myScore.hidden = !profile;
    if (profile) myScore.textContent = `${state.practiceDays.length} practice ${state.practiceDays.length === 1 ? "day" : "days"} on this device${Number.isInteger(score) ? ` · ${score} on the board` : ""} ✨`;
  }

  async function post(input) {
    const response = await fetch(URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The board is unavailable right now.");
    return data;
  }

  function showRows(entries) {
    list.replaceChildren();
    for (const [index, entry] of entries.entries()) {
      const row = document.createElement("li");
      row.className = `board-row${profile?.id === entry.id ? " mine" : ""}`;
      const rank = document.createElement("span"); rank.className = "board-rank"; rank.textContent = index < 3 ? ["🥇", "🥈", "🥉"][index] : String(index + 1);
      const name = document.createElement("span"); name.className = "board-name"; name.textContent = entry.nickname;
      const points = document.createElement("span"); points.className = "board-points"; points.textContent = `${entry.score} ${entry.score === 1 ? "day" : "days"}`;
      row.append(rank, name, points);
      list.append(row);
    }
    boardStatus.textContent = entries.length ? "A little practice adds up! ✨" : "No stars yet. Be the first to join! ✨";
  }

  async function sync(nickname = profile?.nickname) {
    if (!profile) return;
    const data = await post({ action: "sync", id: profile.id, secret: profile.secret, nickname, days: state.practiceDays });
    profile.nickname = data.player.nickname;
    localStorage.setItem(KEY, JSON.stringify(profile));
    accountView(data.player.score);
    return data.player;
  }

  window.syncLeaderboard = async () => {
    if (!profile) return;
    try {
      await sync();
      if (currentTab === "leaderboard") await window.refreshLeaderboard();
    } catch { /* Offline practice syncs when the board is opened again. */ }
  };

  window.refreshLeaderboard = async () => {
    if (location.hostname.endsWith(".github.io")) {
      boardStatus.innerHTML = 'The shared board is on <a href="https://pianopals.netlify.app/#leaderboard">the main Piano Pals site</a>.';
      saveButton.disabled = true;
      return;
    }
    boardStatus.textContent = "Loading practice stars…";
    if (profile) {
      try { await sync(); } catch (error) { formStatus.textContent = error.message; }
    }
    try {
      const response = await fetch(URL, { cache: "no-store" });
      if (!response.ok) throw new Error("The board is unavailable right now.");
      const data = await response.json();
      showRows(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      boardStatus.textContent = "The board is offline right now. Your practice is still saved on this device.";
    }
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    formStatus.textContent = "Saving your place…";
    saveButton.disabled = true;
    try {
      if (profile) {
        const player = await sync(nicknameInput.value.trim());
        formStatus.textContent = "Nickname and score saved! ✨";
        accountView(player.score);
      } else {
        const data = await post({ action: "join", nickname: nicknameInput.value.trim(), days: state.practiceDays });
        profile = { id: data.player.id, secret: data.secret, nickname: data.player.nickname };
        localStorage.setItem(KEY, JSON.stringify(profile));
        accountView(data.player.score);
        formStatus.textContent = "You're on the board! ✨";
      }
      await window.refreshLeaderboard();
    } catch (error) {
      formStatus.textContent = error.message || "Please try again.";
    } finally { saveButton.disabled = false; }
  });

  leaveButton.addEventListener("click", async () => {
    if (!profile) return;
    const yes = await confirmAction({ emoji: "🏆", title: "Leave the board?", message: "Your nickname and score will be removed. Your piano practice stays on this device.", confirmText: "Remove my name" });
    if (!yes) return;
    try {
      await post({ action: "leave", id: profile.id, secret: profile.secret });
      localStorage.removeItem(KEY);
      profile = null;
      nicknameInput.value = "";
      accountView();
      formStatus.textContent = "Your name has been removed.";
      await window.refreshLeaderboard();
    } catch (error) { formStatus.textContent = error.message || "Please try again."; }
  });

  document.getElementById("refreshBoard").addEventListener("click", () => window.refreshLeaderboard());
  accountView();
  if (currentTab === "leaderboard") window.refreshLeaderboard();
})();
