-- Add access expiry to course enrollments
-- One-off course purchases get 30-day access; subscriptions and admin access remain unlimited.

ALTER TABLE course_enrollments
  ADD COLUMN access_expires_at TIMESTAMPTZ;

-- Backfill existing one-off course purchases with 30-day expiry from purchase date
-- Subscriptions and admin/manual enrollments stay NULL (unlimited access)
UPDATE course_enrollments ce
SET access_expires_at = op.created_at + INTERVAL '30 days'
FROM one_off_purchases op
WHERE ce.purchase_id = op.id
  AND op.course_id IS NOT NULL
  AND op.status = 'PAID';
