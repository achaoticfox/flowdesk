'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMilestone(
  projectId: string,
  data: {
    title: string
    description?: string | null
    due_date?: string | null
    amount?: number | null
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('milestones').insert({
    user_id: user.id,
    project_id: projectId,
    title: data.title,
    description: data.description || null,
    due_date: data.due_date || null,
    amount: data.amount ?? null,
    status: 'not_started',
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function updateMilestoneStatus(
  milestoneId: string,
  projectId: string,
  status: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('milestones')
    .update({ status })
    .eq('id', milestoneId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function approveMilestone(
  milestoneId: string,
  projectId: string,
  data: {
    quality: number
    speed: number
    communication: number
    note: string
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('milestones')
    .update({
      status: 'approved',
      quality_score: data.quality || null,
      speed_score: data.speed || null,
      communication_score: data.communication || null,
      approval_note: data.note || null,
      approved_at: new Date().toISOString(),
    })
    .eq('id', milestoneId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  // Auto-complete project if all milestones are now approved
  const { data: remaining } = await supabase
    .from('milestones')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .not('status', 'in', '("approved","paid")')
    .neq('id', milestoneId)

  if (remaining && remaining.length === 0) {
    await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', projectId)
      .eq('user_id', user.id)
  }

  revalidatePath(`/projects/${projectId}`)
}
