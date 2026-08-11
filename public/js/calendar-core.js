export const STATUS_LABELS = {
  available: { mark: "○", label: "空き" },
  waiting: { mark: "△", label: "キャンセル待ち" },
  unavailable: { mark: "×", label: "満室" },
};

export function tokyoToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function monthRange(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { first: dateKey(first), last: dateKey(last) };
}

export function renderCalendar({
  grid,
  month,
  today,
  availability,
  selected = new Set(),
  editable = false,
  symbolOnly = false,
  closeToday = false,
  onSelect,
}) {
  grid.replaceChildren();
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < first.getDay(); i += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-cell blank";
    fragment.append(blank);
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const key = dateKey(date);
    const status = availability.get(key);
    const isPast = closeToday ? key <= today : key < today;
    const cell = document.createElement(editable ? "button" : "div");
    cell.className = "calendar-cell";
    cell.dataset.date = key;

    if (isPast) cell.classList.add("past");
    if (selected.has(key)) cell.classList.add("selected");
    if (editable) {
      cell.type = "button";
      cell.setAttribute("aria-pressed", selected.has(key) ? "true" : "false");
      cell.addEventListener("click", () => onSelect(key));
    }

    const number = document.createElement("span");
    number.className = "date-number";
    number.textContent = String(day);
    cell.append(number);

    if (status && (!isPast || editable)) {
      const meta = STATUS_LABELS[status];
      const state = document.createElement("span");
      state.className = `status status-${status}`;
      state.textContent = symbolOnly ? meta.mark : `${meta.mark} ${meta.label}`;
      cell.append(state);
    }

    fragment.append(cell);
  }

  grid.append(fragment);
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "request_failed");
  }
  return data;
}
