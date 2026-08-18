-- Add registration moderation to users
-- New self-service signups are created as 'pending' and must be approved
-- by an admin in System Admin before they can sign in.
-- Existing users default to 'approved' (unaffected).

ALTER TABLE users
  ADD COLUMN registration_status VARCHAR(20) NOT NULL DEFAULT 'approved';