(() => {
  const STORAGE_KEY = "piano-pals-calendar-v1";

  const CHILDREN = {
    zoe: { id: "zoe", name: "Zoe", emoji: "🌸", tone: "pink" },
    theo: { id: "theo", name: "Theo", emoji: "⭐", tone: "blue" }
  };

  const ACTIVITY_TYPES = {
    "off-ice": { id: "off-ice", label: "Off-ice", icon: "🏃", tone: "peach" },
    "on-ice": { id: "on-ice", label: "On-ice", icon: "⛸️", tone: "blue" },
    "piano": { id: "piano", label: "Piano", icon: "🎹", tone: "lavender" }
  };

  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const DAY_SHORT_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const DEFAULT_ACTIVITIES = [
    // Zoe's week
    { id: "def-zoe-1", child: "zoe", type: "off-ice", day: 0, start: "16:30", end: "17:30" },
    { id: "def-zoe-2", child: "zoe", type: "on-ice",  day: 1, start: "17:00", end: "18:00" },
    { id: "def-zoe-3", child: "zoe", type: "piano",   day: 2, start: "16:30", end: "17:15" },
    { id: "def-zoe-4", child: "zoe", type: "off-ice", day: 3, start: "16:00", end: "16:45" },
    { id: "def-zoe-5", child: "zoe", type: "on-ice",  day: 3, start: "17:00", end: "18:00" },
    { id: "def-zoe-6", child: "zoe", type: "piano",   day: 5, start: "10:00", end: "10:45" },
    { id: "def-zoe-7", child: "zoe", type: "on-ice",  day: 5, start: "11:30", end: "12:30" },
    // Theo's week
    { id: "def-theo-1", child: "theo", type: "off-ice", day: 0, start: "17:30", end: "18:15" },
    { id: "def-theo-2", child: "theo", type: "on-ice",  day: 1, start: "18:00", end: "19:00" },
    { id: "def-theo-3", child: "theo", type: "piano",   day: 2, start: "17:15", end: "17:45" },
    { id: "def-theo-4", child: "theo", type: "off-ice", day: 4, start: "16:30", end: "17:30" },
    { id: "def-theo-5", child: "theo", type: "piano",   day: 5, start: "10:45", end: "11:15" },
    { id: "def-theo-6", child: "theo", type: "on-ice",  day: 5, start: "12:30", end: "13:30" }
  ];

  function parseMinutes(timeStr) {
    if (typeof timeStr !== "string" || !/^\d{2}:\d{2}$/.test(timeStr)) return NaN;
    const [h, m] = timeStr.split(":").map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;
    return h * 60 + m;
  }

  function formatTime12(timeStr) {
    const mins = parseMinutes(timeStr);
    if (Number.isNaN(mins)) return timeStr;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMins = String(minutes).padStart(2, "0");
    return `${displayHours}:${displayMins} ${ampm}`;
  }

  function formatTimeRange(start, end) {
    return `${formatTime12(start)} – ${formatTime12(end)}`;
  }

  function getDurationMinutes(start, end) {
    const s = parseMinutes(start);
    const e = parseMinutes(end);
    if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return 0;
    return e - s;
  }

  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  function loadActivities() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACTIVITIES));
        return [...DEFAULT_ACTIVITIES];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(item => (
          item &&
          CHILDREN[item.child] &&
          ACTIVITY_TYPES[item.type] &&
          Number.isInteger(Number(item.day)) &&
          Number(item.day) >= 0 && Number(item.day) <= 6 &&
          typeof item.start === "string" &&
          typeof item.end === "string"
        )).map(item => ({
          id: String(item.id || `act-${Math.random().toString(36).slice(2, 8)}`),
          child: item.child,
          type: item.type,
          day: Number(item.day),
          start: item.start,
          end: item.end
        }));
      }
    } catch { /* use defaults on storage failure */ }
    return [...DEFAULT_ACTIVITIES];
  }

  function saveActivities(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore storage errors */ }
  }

  function toast(message) {
    if (typeof window.showToast === "function") {
      window.showToast(message);
      return;
    }
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._toastTimer);
    el._toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  function getWeekDates(refDate = new Date()) {
    const current = new Date(refDate);
    const jsDay = current.getDay();
    const dayOffset = jsDay === 0 ? 6 : jsDay - 1; // 0 for Monday, 6 for Sunday
    const monday = new Date(current.getFullYear(), current.getMonth(), current.getDate() - dayOffset);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    }

    const startMonth = dates[0].toLocaleString("en-US", { month: "short" });
    const startDay = dates[0].getDate();
    const endMonth = dates[6].toLocaleString("en-US", { month: "short" });
    const endDay = dates[6].getDate();
    const year = dates[6].getFullYear();

    const rangeText = startMonth === endMonth
      ? `${startMonth} ${startDay} – ${endDay}, ${year}`
      : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;

    return { dates, rangeText, todayIndex: dayOffset };
  }

  // State
  let activities = loadActivities();
  let currentFilter = "all";
  let editingId = null;

  // DOM elements
  const summaryEl = document.getElementById("calendarSummary");
  const weekDatesEl = document.getElementById("calendarWeekDates");
  const statusEl = document.getElementById("calendarStatus");
  const daysEl = document.getElementById("calendarDays");
  const addBtn = document.getElementById("addActivity");
  const filterBtns = document.querySelectorAll("[data-calendar-filter]");

  const dialog = document.getElementById("activityDialog");
  const form = document.getElementById("activityForm");
  const headingEl = document.getElementById("activityDialogHeading");
  const childSelect = document.getElementById("activityChild");
  const typeSelect = document.getElementById("activityType");
  const daySelect = document.getElementById("activityDay");
  const startInput = document.getElementById("activityStart");
  const endInput = document.getElementById("activityEnd");
  const errorEl = document.getElementById("activityError");
  const cancelBtn = document.getElementById("cancelActivity");
  const deleteBtn = document.getElementById("deleteActivity");

  function openModal(item = null, defaultDay = null) {
    editingId = item ? item.id : null;
    errorEl.textContent = "";

    if (item) {
      headingEl.textContent = "Edit activity";
      childSelect.value = item.child;
      typeSelect.value = item.type;
      daySelect.value = String(item.day);
      startInput.value = item.start;
      endInput.value = item.end;
      deleteBtn.hidden = false;
    } else {
      headingEl.textContent = "Add to the calendar";
      childSelect.value = currentFilter !== "all" ? currentFilter : "zoe";
      typeSelect.value = "piano";
      daySelect.value = defaultDay !== null ? String(defaultDay) : "0";
      startInput.value = "16:00";
      endInput.value = "17:00";
      deleteBtn.hidden = true;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeModal() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    editingId = null;
    errorEl.textContent = "";
  }

  function renderSummary() {
    if (!summaryEl) return;

    const zoeActs = activities.filter(a => a.child === "zoe");
    const theoActs = activities.filter(a => a.child === "theo");

    const zoeMins = zoeActs.reduce((acc, a) => acc + getDurationMinutes(a.start, a.end), 0);
    const theoMins = theoActs.reduce((acc, a) => acc + getDurationMinutes(a.start, a.end), 0);

    const zoeOffIce = zoeActs.filter(a => a.type === "off-ice").length;
    const zoeOnIce = zoeActs.filter(a => a.type === "on-ice").length;
    const zoePiano = zoeActs.filter(a => a.type === "piano").length;

    const theoOffIce = theoActs.filter(a => a.type === "off-ice").length;
    const theoOnIce = theoActs.filter(a => a.type === "on-ice").length;
    const theoPiano = theoActs.filter(a => a.type === "piano").length;

    summaryEl.innerHTML = `
      <div class="calendar-summary-card zoe-summary">
        <div class="summary-top">
          <div class="summary-avatar" aria-hidden="true">🌸</div>
          <div>
            <h4 class="summary-name">Zoe</h4>
            <p class="summary-total">${zoeActs.length} weekly activities · ${formatDuration(zoeMins)}</p>
          </div>
        </div>
        <div class="summary-pills">
          <span class="activity-pill off-ice">🏃 ${zoeOffIce} off-ice</span>
          <span class="activity-pill on-ice">⛸️ ${zoeOnIce} on-ice</span>
          <span class="activity-pill piano">🎹 ${zoePiano} piano</span>
        </div>
      </div>

      <div class="calendar-summary-card theo-summary">
        <div class="summary-top">
          <div class="summary-avatar" aria-hidden="true">⭐</div>
          <div>
            <h4 class="summary-name">Theo</h4>
            <p class="summary-total">${theoActs.length} weekly activities · ${formatDuration(theoMins)}</p>
          </div>
        </div>
        <div class="summary-pills">
          <span class="activity-pill off-ice">🏃 ${theoOffIce} off-ice</span>
          <span class="activity-pill on-ice">⛸️ ${theoOnIce} on-ice</span>
          <span class="activity-pill piano">🎹 ${theoPiano} piano</span>
        </div>
      </div>
    `;
  }

  function renderWeek() {
    const { dates, rangeText, todayIndex } = getWeekDates();
    if (weekDatesEl) weekDatesEl.textContent = rangeText;

    // Filtered activities
    const filtered = activities.filter(a => (currentFilter === "all" ? true : a.child === currentFilter));

    if (statusEl) {
      if (currentFilter === "zoe") {
        statusEl.textContent = `Showing Zoe's ${filtered.length} weekly activities ✨`;
      } else if (currentFilter === "theo") {
        statusEl.textContent = `Showing Theo's ${filtered.length} weekly activities ✨`;
      } else {
        statusEl.textContent = `Showing all ${filtered.length} activities for Zoe & Theo ✨`;
      }
    }

    if (!daysEl) return;
    daysEl.replaceChildren();

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayDate = dates[dayIndex];
      const isToday = dayIndex === todayIndex;
      const dayName = DAY_NAMES[dayIndex];
      const dayShort = DAY_SHORT_NAMES[dayIndex];
      const dateFormatted = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayCard = document.createElement("div");
      dayCard.className = `calendar-day-card${isToday ? " is-today" : ""}`;
      dayCard.setAttribute("data-day-index", String(dayIndex));

      // Day card header
      const header = document.createElement("div");
      header.className = "calendar-day-header";
      header.innerHTML = `
        <div class="day-title-wrap">
          <span class="day-name">${dayName}</span>
          <span class="day-date">${dateFormatted}</span>
        </div>
        ${isToday ? '<span class="today-badge" aria-label="Today">Today ✦</span>' : ""}
      `;
      dayCard.appendChild(header);

      // Activities for this day
      const dayActivities = filtered
        .filter(a => a.day === dayIndex)
        .sort((a, b) => (parseMinutes(a.start) || 0) - (parseMinutes(b.start) || 0));

      const listContainer = document.createElement("div");
      listContainer.className = "calendar-day-activities";

      if (dayActivities.length === 0) {
        const empty = document.createElement("div");
        empty.className = "calendar-day-empty";
        empty.innerHTML = `<span>🌟</span><p>Rest &amp; free play</p>`;
        listContainer.appendChild(empty);
      } else {
        for (const act of dayActivities) {
          const child = CHILDREN[act.child] || { name: act.child, emoji: "⭐", tone: "blue" };
          const type = ACTIVITY_TYPES[act.type] || { label: act.type, icon: "📅", tone: "lavender" };
          const durMins = getDurationMinutes(act.start, act.end);

          const itemEl = document.createElement("button");
          itemEl.type = "button";
          itemEl.className = `activity-item activity-child-${act.child} activity-type-${act.type}`;
          itemEl.setAttribute("aria-label", `Edit ${child.name}'s ${type.label} (${formatTimeRange(act.start, act.end)})`);
          itemEl.dataset.id = act.id;

          itemEl.innerHTML = `
            <div class="activity-item-top">
              <span class="activity-child-tag child-${act.child}">
                <span class="child-avatar" aria-hidden="true">${child.emoji}</span>
                <strong>${child.name}</strong>
              </span>
              <span class="activity-type-tag type-${act.type}">
                ${type.icon} ${type.label}
              </span>
            </div>
            <div class="activity-item-bottom">
              <span class="activity-time">${formatTimeRange(act.start, act.end)}</span>
              <span class="activity-duration">${formatDuration(durMins)}</span>
            </div>
          `;

          itemEl.addEventListener("click", () => openModal(act));
          listContainer.appendChild(itemEl);
        }
      }

      dayCard.appendChild(listContainer);

      // Quick add button for this day
      const quickAddBtn = document.createElement("button");
      quickAddBtn.type = "button";
      quickAddBtn.className = "calendar-day-add-btn";
      quickAddBtn.textContent = `+ Add for ${dayShort}`;
      quickAddBtn.setAttribute("aria-label", `Add an activity for ${dayName}`);
      quickAddBtn.addEventListener("click", () => openModal(null, dayIndex));
      dayCard.appendChild(quickAddBtn);

      daysEl.appendChild(dayCard);
    }
  }

  function render() {
    renderSummary();
    renderWeek();
  }

  // Event Listeners
  if (addBtn) {
    addBtn.addEventListener("click", () => openModal());
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.calendarFilter;
      if (!filter) return;
      currentFilter = filter;
      filterBtns.forEach(b => {
        const active = b.dataset.calendarFilter === filter;
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderWeek();
    });
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (!editingId) return;
      activities = activities.filter(a => a.id !== editingId);
      saveActivities(activities);
      render();
      closeModal();
      toast("Activity removed! 🗑️");
    });
  }

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      errorEl.textContent = "";

      const child = childSelect.value;
      const type = typeSelect.value;
      const day = Number(daySelect.value);
      const start = startInput.value;
      const end = endInput.value;

      const startMins = parseMinutes(start);
      const endMins = parseMinutes(end);

      if (Number.isNaN(startMins) || Number.isNaN(endMins)) {
        errorEl.textContent = "Please enter valid times.";
        return;
      }

      if (endMins <= startMins) {
        errorEl.textContent = "End time must be after start time.";
        return;
      }

      if (editingId) {
        const index = activities.findIndex(a => a.id === editingId);
        if (index !== -1) {
          activities[index] = { id: editingId, child, type, day, start, end };
        }
      } else {
        const newId = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        activities.push({ id: newId, child, type, day, start, end });
      }

      saveActivities(activities);
      render();
      closeModal();
      toast(editingId ? "Activity updated! 📅" : "Activity added! 📅");
    });
  }

  // Close dialog on backdrop click
  if (dialog) {
    dialog.addEventListener("click", event => {
      const rect = dialog.getBoundingClientRect();
      const inDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inDialog) closeModal();
    });
  }

  window.refreshCalendar = () => {
    render();
  };

  // Initial render
  render();
})();
