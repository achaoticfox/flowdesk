-- FlowDesk Database Schema v2
-- Run this in Supabase SQL Editor for a fresh setup.
-- If you already created v1 tables, use the migration script instead of this file.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE freelancers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL,
    profile_url TEXT,
    city TEXT,
    state TEXT,
    country TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own freelancers" ON freelancers
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own freelancers" ON freelancers
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own freelancers" ON freelancers
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own freelancers" ON freelancers
    FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE freelancer_project_links (
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

CREATE POLICY "Users can view own freelancer project links" ON freelancer_project_links
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own freelancer project links" ON freelancer_project_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own freelancer project links" ON freelancer_project_links
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own freelancer project links" ON freelancer_project_links
    FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2),
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'approved', 'paid')),
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
    speed_score INTEGER CHECK (speed_score BETWEEN 1 AND 5),
    communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deliverables" ON deliverables
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deliverables" ON deliverables
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deliverables" ON deliverables
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deliverables" ON deliverables
    FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_freelancers_updated_at BEFORE UPDATE ON freelancers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_freelancer_project_links_updated_at BEFORE UPDATE ON freelancer_project_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
