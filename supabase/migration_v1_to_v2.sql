-- FlowDesk migration: talent/project separation
-- Run this in Supabase SQL Editor if you already created the original v1 schema.

ALTER TABLE freelancers RENAME COLUMN name TO first_name;
ALTER TABLE freelancers ADD COLUMN last_name TEXT;
ALTER TABLE freelancers ADD COLUMN role TEXT;
ALTER TABLE freelancers ADD COLUMN city TEXT;
ALTER TABLE freelancers ADD COLUMN state TEXT;
ALTER TABLE freelancers ADD COLUMN country TEXT;

UPDATE freelancers
SET
  last_name = '',
  role = 'Freelancer',
  country = 'Unknown'
WHERE last_name IS NULL OR role IS NULL OR country IS NULL;

ALTER TABLE freelancers ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE freelancers ALTER COLUMN role SET NOT NULL;
ALTER TABLE freelancers ALTER COLUMN country SET NOT NULL;

ALTER TABLE freelancers RENAME COLUMN profile_url TO profile_url;
ALTER TABLE freelancers DROP COLUMN IF EXISTS email;
ALTER TABLE freelancers DROP COLUMN IF EXISTS rate;
ALTER TABLE freelancers DROP COLUMN IF EXISTS rate_type;
ALTER TABLE freelancers DROP COLUMN IF EXISTS platform_source;
ALTER TABLE freelancers DROP COLUMN IF EXISTS contract_url;
ALTER TABLE freelancers DROP COLUMN IF EXISTS status;

CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS freelancer_project_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contract_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (freelancer_id, project_id)
);

ALTER TABLE freelancer_project_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own freelancer project links" ON freelancer_project_links FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own freelancer project links" ON freelancer_project_links FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own freelancer project links" ON freelancer_project_links FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own freelancer project links" ON freelancer_project_links FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5);
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS speed_score INTEGER CHECK (speed_score BETWEEN 1 AND 5);
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 5);
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE deliverables ALTER COLUMN amount DROP NOT NULL;

DO $$ BEGIN
  CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER update_freelancer_project_links_updated_at BEFORE UPDATE ON freelancer_project_links
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
