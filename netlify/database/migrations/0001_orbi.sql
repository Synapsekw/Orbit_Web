CREATE TABLE orbi_sessions (
  id text PRIMARY KEY,
  data text NOT NULL,
  expires_at timestamptz NOT NULL,
  lease_owner text,
  lease_until timestamptz
);
CREATE INDEX orbi_sessions_expiry ON orbi_sessions(expires_at);

CREATE TABLE orbi_callbacks (
  id text PRIMARY KEY,
  conversation text NOT NULL,
  digest text NOT NULL,
  status text NOT NULL CHECK (status IN ('sending', 'accepted', 'failed', 'unknown')),
  event text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orbi_callbacks_conversation ON orbi_callbacks(conversation, created_at DESC);
CREATE INDEX orbi_callbacks_expiry ON orbi_callbacks(created_at);

-- One locked row per UTC day makes shared IP and global limits atomic.
-- IP addresses are HMACs, never stored in plain text.
CREATE TABLE orbi_usage (
  day date PRIMARY KEY,
  total integer NOT NULL,
  ips jsonb NOT NULL
);
