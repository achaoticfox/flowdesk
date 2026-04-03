export interface Freelancer {
  id: string
  user_id: string
  name: string
  email?: string
  rate: number
  rate_type: 'hourly' | 'fixed'
  platform_source: 'upwork' | 'fiverr' | 'contra' | 'direct' | 'other'
  profile_url?: string
  contract_url?: string
  notes?: string
  status: 'active' | 'inactive' | 'paused'
  created_at: string
  updated_at: string
}

export interface Deliverable {
  id: string
  user_id: string
  freelancer_id: string
  title: string
  description?: string
  amount: number
  due_date?: string
  status: 'assigned' | 'in_progress' | 'submitted' | 'approved' | 'paid'
  created_at: string
  updated_at: string
}

export interface OnboardingChecklist {
  id: string
  user_id: string
  freelancer_id: string
  items: {
    id: string
    label: string
    completed: boolean
    completed_at?: string
  }[]
  created_at: string
  updated_at: string
}
