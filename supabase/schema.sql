-- FlowDesk Database Schema
-- Run this in Supabase SQL Editor

-- Enable RLS (Row Level Security) by default
alter table auth.users enable row level security;

-- Freelancers table
CREATE TABLE freelancers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    rate DECIMAL(10, 2) NOT NULL,
    rate_type TEXT NOT NULL CHECK (rate_type IN ('hourly', 'fixed')),
    platform_source TEXT NOT NULL CHECK (platform_source IN ('upwork', 'fiverr', 'contra', 'direct', 'other')),
    profile_url TEXT,
    contract_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on freelancers
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own freelancers
CREATE POLICY "Users can view own freelancers" ON freelancers
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own freelancers
CREATE POLICY "Users can insert own freelancers" ON freelancers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own freelancers
CREATE POLICY "Users can update own freelancers" ON freelancers
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own freelancers
CREATE POLICY "Users can delete own freelancers" ON freelancers
    FOR DELETE USING (auth.uid() = user_id);

-- Deliverables table
CREATE TABLE deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'approved', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on deliverables
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliverables
CREATE POLICY "Users can view own deliverables" ON deliverables
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deliverables" ON deliverables
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deliverables" ON deliverables
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deliverables" ON deliverables
    FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_freelancers_updated_at BEFORE UPDATE ON freelancers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
