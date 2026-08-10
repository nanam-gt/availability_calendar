export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  RESERVATION_URL?: string;
  MAX_FUTURE_MONTHS?: string;
}

type Status = "available" | "waiting" | "unavailable";

const STATUSES = new Set<Status>(["available", "waiting", "unavailable"]);
const SESSION_COOKIE = "ibv_session";
const SESSION_MAX_AGE = 60 * 60 * 24;
const MAX_DATES_PER_REQUEST = 120;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/availability" && request.method === "GET") {
        return handlePublicAvailability(request, env);
      }

      if (url.pathname === "/api/config" && request.method === "GET") {
        return json({
          reservationUrl: env.RESERVATION_URL || "https://docs.google.com/forms/",
          maxFutureMonths: getMaxFutureMonths(env),
        });
      }

      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        return handleLogin(request, env);
      }

      if (url.pathname === "/api/admin/logout" && request.method === "POST") {
        return handleLogout();
      }

      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        return handleSession(request, env);
      }

      if (url.pathname === "/api/admin/availability" && request.method === "GET") {
        return withAdmin(request, env, () => handlePublicAvailability(request, env, true));
      }

      if (url.pathname === "/api/admin/availability" && request.method === "PUT") {
        return withAdmin(request, env, () => handleUpdateAvailability(request, env));
      }

      if (url.pathname === "/api/admin/availability" && request.method === "DELETE") {
        return withAdmin(request, env, () => handleDeleteAvailability(request, env));
      }

      if (url.pathname.startsWith("/api/")) {
        return json({ error: "not_found" }, 404);
      }

      if (url.pathname === "/admin") {
        return env.ASSETS.fetch(new Request(new URL("/admin.html", url), request));
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("request_failed", error instanceof Error ? error.message : "unknown");
      return json({ error: "server_error" }, 500);
    }
  },
};

async function handlePublicAvailability(request: Request, env: Env, includeUpdatedAt = false): Promise<Response> {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to || !isValidDate(from) || !isValidDate(to) || from > to) {
    return json({ error: "invalid_date_range" }, 400);
  }

  const rows = await env.DB.prepare(
    `SELECT date, status, updated_at FROM availability WHERE date >= ? AND date <= ? ORDER BY date ASC`,
  )
    .bind(from, to)
    .all<{ date: string; status: Status; updated_at: string }>();

  const availability = (rows.results || []).map((row) =>
    includeUpdatedAt ? row : { date: row.date, status: row.status },
  );

  return json({ availability });
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ password?: string }>(request);

  if (!body.password || body.password !== env.ADMIN_PASSWORD) {
    return json({ error: "invalid_password" }, 401);
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const signature = await signSession(expiresAt, env.SESSION_SECRET);
  const cookie = `${SESSION_COOKIE}=${expiresAt}.${signature}; Max-Age=${SESSION_MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Lax`;

  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}

function handleLogout(): Response {
  return json(
    { ok: true },
    200,
    { "Set-Cookie": `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax` },
  );
}

async function handleSession(request: Request, env: Env): Promise<Response> {
  const authenticated = await isAuthenticated(request, env);
  return json({ authenticated }, authenticated ? 200 : 401);
}

async function handleUpdateAvailability(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ dates?: string[]; status?: Status }>(request);
  const validation = validateMutation(body);

  if (!validation.ok) {
    return json({ error: validation.error }, 400);
  }

  const updatedAt = tokyoIsoNow();
  const statements = validation.dates.map((date) =>
    env.DB.prepare(
      `INSERT INTO availability (date, status, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
    ).bind(date, validation.status, updatedAt),
  );

  await env.DB.batch(statements);
  return json({ ok: true, updatedAt });
}

async function handleDeleteAvailability(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ dates?: string[] }>(request);
  const dates = normalizeDates(body.dates);

  if (!dates.ok) {
    return json({ error: dates.error }, 400);
  }

  await env.DB.batch(dates.dates.map((date) => env.DB.prepare(`DELETE FROM availability WHERE date = ?`).bind(date)));
  return json({ ok: true });
}

async function withAdmin(request: Request, env: Env, handler: () => Promise<Response>): Promise<Response> {
  if (!(await isAuthenticated(request, env))) {
    return json({ error: "unauthorized" }, 401);
  }

  return handler();
}

async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;

  const [expiresText, signature] = decodeURIComponent(match[1]).split(".");
  const expiresAt = Number(expiresText);

  if (!Number.isInteger(expiresAt) || !signature || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = await signSession(expiresAt, env.SESSION_SECRET);
  return timingSafeEqual(signature, expected);
}

async function signSession(expiresAt: number, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`admin:${expiresAt}`));
  return base64Url(signature);
}

function validateMutation(body: { dates?: string[]; status?: Status }): { ok: true; dates: string[]; status: Status } | { ok: false; error: string } {
  const dates = normalizeDates(body.dates);
  if (!dates.ok) return dates;

  if (!body.status || !STATUSES.has(body.status)) {
    return { ok: false, error: "invalid_status" };
  }

  return { ok: true, dates: dates.dates, status: body.status };
}

function normalizeDates(dates: unknown): { ok: true; dates: string[] } | { ok: false; error: string } {
  if (!Array.isArray(dates) || dates.length === 0 || dates.length > MAX_DATES_PER_REQUEST) {
    return { ok: false, error: "invalid_dates" };
  }

  const unique = [...new Set(dates)];
  if (!unique.every((date) => typeof date === "string" && isValidDate(date))) {
    return { ok: false, error: "invalid_dates" };
  }

  return { ok: true, dates: unique };
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function tokyoIsoNow(): string {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date()).replace(" ", "T") + "+09:00";
}

function getMaxFutureMonths(env: Env): number {
  const value = Number(env.MAX_FUTURE_MONTHS || "3");
  return Number.isInteger(value) && value >= 0 && value <= 12 ? value : 3;
}

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function base64Url(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
