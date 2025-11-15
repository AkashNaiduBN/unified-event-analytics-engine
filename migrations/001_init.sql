CREATE TABLE IF NOT EXISTS apps (
  id serial primary key,
  app_id uuid unique not null,
  name text not null,
  owner_email text not null,
  api_key uuid unique not null,
  created_at timestamptz default now(),
  expires_at timestamptz,
  revoked boolean default false
);
CREATE TABLE IF NOT EXISTS events (
  id serial primary key,
  app_id uuid not null,
  event_type text not null,
  url text,
  referrer text,
  device text,
  ip_address text,
  timestamp timestamptz default now(),
  metadata jsonb
);
CREATE INDEX IF NOT EXISTS idx_events_app_event_ts ON events(app_id,event_type,timestamp);
