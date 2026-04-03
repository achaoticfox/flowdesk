-- Extend projects + freelancer links for FlowDesk project model

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS scope_summary TEXT,
  ADD COLUMN IF NOT EXISTS out_of_scope TEXT,
  ADD COLUMN IF NOT EXISTS contract_type TEXT,
  ADD COLUMN IF NOT EXISTS approval_model TEXT,
  ADD COLUMN IF NOT EXISTS platform_source TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS budget_cap DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS hours_cap DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS hours_limit_interval TEXT,
  ADD COLUMN IF NOT EXISTS approval_requirements TEXT,
  ADD COLUMN IF NOT EXISTS documentation_notes TEXT;

UPDATE projects
SET
  contract_type = COALESCE(contract_type, 'fixed_price'),
  approval_model = COALESCE(approval_model, 'milestone_based')
WHERE contract_type IS NULL OR approval_model IS NULL;

ALTER TABLE projects
  ALTER COLUMN contract_type SET DEFAULT 'fixed_price',
  ALTER COLUMN approval_model SET DEFAULT 'milestone_based',
  ALTER COLUMN contract_type SET NOT NULL,
  ALTER COLUMN approval_model SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
  END IF;
END $$;

ALTER TABLE projects
  ALTER COLUMN status SET DEFAULT 'draft';

UPDATE projects
SET status = CASE
  WHEN status = 'active' THEN 'active'
  WHEN status = 'paused' THEN 'paused'
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'archived' THEN 'archived'
  ELSE 'draft'
END;

ALTER TABLE projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('draft', 'job_posted', 'sourced', 'contracted', 'assigned', 'active', 'paused', 'completed', 'archived'));

ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_contract_type_check;
ALTER TABLE projects
  ADD CONSTRAINT projects_contract_type_check
  CHECK (contract_type IN ('hourly', 'fixed_price'));

ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_approval_model_check;
ALTER TABLE projects
  ADD CONSTRAINT projects_approval_model_check
  CHECK (approval_model IN ('task_based', 'milestone_based', 'ongoing_review'));

ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_hours_limit_interval_check;
ALTER TABLE projects
  ADD CONSTRAINT projects_hours_limit_interval_check
  CHECK (hours_limit_interval IN ('daily', 'weekly', 'monthly') OR hours_limit_interval IS NULL);

ALTER TABLE freelancer_project_links
  ADD COLUMN IF NOT EXISTS role_on_project TEXT;
