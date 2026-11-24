-- Execute uma vez em seu banco D1 antes de usar o site.
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 salt TEXT NOT NULL,
 iterations INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS login_attempts (
 ip_hash TEXT NOT NULL,
 attempted_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(ip_hash, attempted_at);
CREATE TABLE IF NOT EXISTS leads (
 id TEXT PRIMARY KEY,
 name TEXT,
 email TEXT NOT NULL,
 hair_type TEXT NOT NULL DEFAULT 'nao-sei',
 source TEXT NOT NULL DEFAULT 'landing',
 consent INTEGER NOT NULL CHECK (consent = 1),
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
