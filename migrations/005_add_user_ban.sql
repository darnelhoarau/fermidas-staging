-- Add user banning (policy enforcement)
-- Banned users keep their account and data but cannot sign in or access content.
-- NULL = not banned.

ALTER TABLE users
  ADD COLUMN banned_at TIMESTAMPTZ;