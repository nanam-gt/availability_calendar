import {
  addMonths,
  fetchJson,
  monthKey,
  monthRange,
  parseMonthKey,
  renderCalendar,
  tokyoToday,
} from "./calendar-core.js";

const grid = document.querySelector("#calendarGrid");
const label = document.querySelector("#monthLabel");
const prev = document.querySelector("#prevMonth");
const next = document.querySelector("#nextMonth");
const message = document.querySelector("#calendarMessage");
const reservationLink = document.querySelector("#reservationLink");

const today = tokyoToday();
const currentMonth = parseMonthKey(today.slice(0, 7));
let visibleMonth = currentMonth;
let maxFutureMonths = 3;
let availability = new Map();

init();

async function init() {
  try {
    const config = await fetchJson("/api/config");
    maxFutureMonths = config.maxFutureMonths;
    reservationLink.href = config.reservationUrl;
  } catch {
    message.textContent = "設定を読み込めませんでした。時間をおいて再度ご確認ください。";
  }

  bindNavigation();
  await loadMonth();
}

function bindNavigation() {
  prev.addEventListener("click", async () => {
    if (monthKey(visibleMonth) <= monthKey(currentMonth)) return;
    visibleMonth = addMonths(visibleMonth, -1);
    await loadMonth();
  });

  next.addEventListener("click", async () => {
    if (monthKey(visibleMonth) >= monthKey(addMonths(currentMonth, maxFutureMonths))) return;
    visibleMonth = addMonths(visibleMonth, 1);
    await loadMonth();
  });
}

async function loadMonth() {
  const range = monthRange(visibleMonth);
  message.textContent = "";

  try {
    const data = await fetchJson(`/api/availability?from=${range.first}&to=${range.last}`);
    availability = new Map(data.availability.map((item) => [item.date, item.status]));
  } catch {
    availability = new Map();
    message.textContent = "空き状況を読み込めませんでした。空きとしては扱わず、時間をおいて再度ご確認ください。";
  }

  paint();
}

function paint() {
  label.textContent = `${visibleMonth.getFullYear()}年${visibleMonth.getMonth() + 1}月`;
  prev.disabled = monthKey(visibleMonth) <= monthKey(currentMonth);
  next.disabled = monthKey(visibleMonth) >= monthKey(addMonths(currentMonth, maxFutureMonths));
  renderCalendar({ grid, month: visibleMonth, today, availability });
}
