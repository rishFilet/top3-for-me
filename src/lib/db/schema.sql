-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (managed by Auth.js / next-auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- DayPlans
CREATE TABLE IF NOT EXISTS day_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  priority_1 TEXT,
  priority_2 TEXT,
  priority_3 TEXT,
  not_today TEXT,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  night_mode TEXT CHECK (night_mode IN ('mic', 'light', 'rest', 'open')),
  sent_to_display_at TIMESTAMPTZ,
  reflection_note TEXT,
  tomorrow_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_date)
);

-- Routines
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('morning', 'evening')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routine_steps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Pattern (which evening mode is typical for each day)
CREATE TABLE IF NOT EXISTS weekly_patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  default_night_mode TEXT CHECK (default_night_mode IN ('mic', 'light', 'rest', 'open')),
  morning_routine_id TEXT REFERENCES routines(id) ON DELETE SET NULL,
  evening_routine_id TEXT REFERENCES routines(id) ON DELETE SET NULL,
  UNIQUE(user_id, day_of_week)
);

-- Device Tokens (for e-ink display)
CREATE TABLE IF NOT EXISTS device_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  label TEXT,
  last_polled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row-Level Security)
ALTER TABLE day_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policies (app server uses service role, so these protect direct DB access)
CREATE POLICY day_plans_user ON day_plans USING (user_id = current_user);
CREATE POLICY routines_user ON routines USING (user_id = current_user);
CREATE POLICY weekly_patterns_user ON weekly_patterns USING (user_id = current_user);
CREATE POLICY device_tokens_user ON device_tokens USING (user_id = current_user);
