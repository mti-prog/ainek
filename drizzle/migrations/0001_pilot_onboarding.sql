ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS owner_user_id UUID,
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(32) DEFAULT 'creating_profile',
  ADD COLUMN IF NOT EXISTS onboarding_error TEXT;

UPDATE tenants
SET onboarding_status = 'ready'
WHERE onboarding_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_owner_user_id
  ON tenants(owner_user_id);
