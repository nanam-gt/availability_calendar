CREATE TABLE IF NOT EXISTS availability (
  date TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('available', 'waiting', 'unavailable')),
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_availability_updated_at ON availability(updated_at);
