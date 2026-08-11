import {
  addMonths,
  fetchJson,
  monthKey,
  monthRange,
  parseMonthKey,
  renderCalendar,
  tokyoToday,
} from "./calendar-core.js";

const loginPanel = document.querySelector("#loginPanel");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const workspace = document.querySelector("#adminWorkspace");
const grid = document.querySelector("#calendarGrid");
const label = document.querySelector("#monthLabel");
const prev = document.querySelector("#prevMonth");
const next = document.querySelector("#nextMonth");
const statusForm = document.querySelector("#statusForm");
const adminMessage = document.querySelector("#adminMessage");
const selectionCount = document.querySelector("#selectionCount");
const lastUpdated = document.querySelector("#lastUpdated");
const logoutButton = document.querySelector("#logoutButton");

const today = tokyoToday();
const currentMonth = parseMonthKey(today.slice(0, 7));
let visibleMonth = currentMonth;
let maxFutureMonths = 3;
let availability = new Map();
let updatedAtByDate = new Map();
let selected = new Set();

init();

async function init() {
  try {
    const config = await fetchJson("/api/config");
    maxFutureMonths = config.maxFutureMonths;
  } catch {
    maxFutureMonths = 3;
  }

  bindEvents();
  await checkSession();
}

function bindEvents() {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.textContent = "";

    try {
      await fetchJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: loginForm.password.value }),
      });
      loginForm.reset();
      await showWorkspace();
    } catch {
      loginMessage.textContent = "パスワードが違います。";
    }
  });

  logoutButton.addEventListener("click", async () => {
    await fetchJson("/api/admin/logout", { method: "POST" }).catch(() => {});
    workspace.hidden = true;
    loginPanel.hidden = false;
  });

  prev.addEventListener("click", async () => {
    if (monthKey(visibleMonth) <= monthKey(currentMonth)) return;
    visibleMonth = addMonths(visibleMonth, -1);
    selected.clear();
    await loadMonth();
  });

  next.addEventListener("click", async () => {
    if (monthKey(visibleMonth) >= monthKey(addMonths(currentMonth, maxFutureMonths))) return;
    visibleMonth = addMonths(visibleMonth, 1);
    selected.clear();
    await loadMonth();
  });

  statusForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveSelected();
  });
}

async function checkSession() {
  try {
    await fetchJson("/api/admin/session");
    await showWorkspace();
  } catch {
    loginPanel.hidden = false;
    workspace.hidden = true;
  }
}

async function showWorkspace() {
  loginPanel.hidden = true;
  workspace.hidden = false;
  await loadMonth();
}

async function loadMonth() {
  const range = monthRange(visibleMonth);
  adminMessage.textContent = "";

  try {
    const data = await fetchJson(`/api/admin/availability?from=${range.first}&to=${range.last}`);
    availability = new Map(data.availability.map((item) => [item.date, item.status]));
    updatedAtByDate = new Map(data.availability.map((item) => [item.date, item.updated_at]));
  } catch {
    availability = new Map();
    updatedAtByDate = new Map();
    adminMessage.textContent = "予約状況を読み込めませんでした。";
  }

  paint();
}

function toggleDate(date) {
  if (selected.has(date)) {
    selected.delete(date);
  } else {
    selected.add(date);
  }
  paint();
}

async function saveSelected() {
  const dates = [...selected];
  if (dates.length === 0) {
    adminMessage.textContent = "変更する日付を選択してください。";
    return;
  }

  const status = new FormData(statusForm).get("status");
  adminMessage.textContent = "保存中です。";

  try {
    if (status === "unset") {
      await fetchJson("/api/admin/availability", { method: "DELETE", body: JSON.stringify({ dates }) });
    } else {
      await fetchJson("/api/admin/availability", { method: "PUT", body: JSON.stringify({ dates, status }) });
    }
    selected.clear();
    adminMessage.textContent = "保存しました。";
    await loadMonth();
  } catch {
    adminMessage.textContent = "保存できませんでした。内容を確認して再度お試しください。";
  }
}

function paint() {
  label.textContent = `${visibleMonth.getFullYear()}年${visibleMonth.getMonth() + 1}月`;
  prev.disabled = monthKey(visibleMonth) <= monthKey(currentMonth);
  next.disabled = monthKey(visibleMonth) >= monthKey(addMonths(currentMonth, maxFutureMonths));
  renderCalendar({ grid, month: visibleMonth, today, availability, selected, editable: true, onSelect: toggleDate });
  selectionCount.textContent = `${selected.size}日選択中`;
  const latest = [...updatedAtByDate.values()].sort().at(-1);
  lastUpdated.textContent = `最終更新日時: ${latest || "-"}`;
}
