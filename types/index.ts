export interface Freelancer {
  id: string
  user_id: string
  first_name: string
  last_name: string
  role: string
  profile_url?: string
  city?: string
  state?: string
  country: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  scope_summary?: string
  out_of_scope?: string
  contract_type: 'hourly' | 'fixed_price'
  approval_model: 'task_based' | 'milestone_based' | 'ongoing_review'
  platform_source?: string
  external_url?: string
  start_date?: string
  end_date?: string
  budget_cap?: number
  hours_cap?: number
  hours_limit_interval?: 'daily' | 'weekly' | 'monthly'
  approval_requirements?: string
  documentation_notes?: string
  status:
    | 'draft'
    | 'job_posted'
    | 'sourced'
    | 'contracted'
    | 'assigned'
    | 'active'
    | 'paused'
    | 'completed'
    | 'archived'
  created_at: string
  updated_at: string
}

export interface FreelancerProjectLink {
  id: string
  user_id: string
  freelancer_id: string
  project_id: string
  contract_url?: string
  role_on_project?: string
  status: 'active' | 'inactive' | 'completed'
  created_at: string
  updated_at: string
}

export interface Deliverable {
  id: string
  user_id: string
  freelancer_id: string
  project_id?: string
  title: string
  description?: string
  amount?: number
  due_date?: string
  status: 'assigned' | 'in_progress' | 'submitted' | 'approved' | 'paid'
  quality_score?: number
  speed_score?: number
  communication_score?: number
  notes?: string
  created_at: string
  updated_at: string
}
