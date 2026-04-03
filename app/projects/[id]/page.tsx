import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'
import AddMilestoneForm from '@/components/milestones/AddMilestoneForm'
import MilestoneCard from '@/components/milestones/MilestoneCard'

const STATUS_LABELS: Record<Project['status'], string> = {
  draft: 'Draft',
  job_posted: 'Job Posted',
  sourced: 'Sourcing',
  contracted: 'Contracted',
  assigned: 'Assigned',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

const STATUS_COLORS: Record<Project['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  job_posted: 'bg-blue-100 text-blue-700',
  sourced: 'bg-purple-100 text-purple-700',
  contracted: 'bg-indigo-100 text-indigo-700',
  assigned: 'bg-cyan-100 text-cyan-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-800',
  archived: 'bg-slate-100 text-slate-400',
}

type FreelancerRow = {
  first_name: string
  last_name: string
  role: string
  profile_url: string | null
}

type LinkRow = {
  id: string
  role_on_project: string | null
  contract_url: string | null
  status: string
  freelancer_id: string
  freelancers: FreelancerRow[] | null
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ linked?: string }>
}) {
  const { id } = await params
  const { linked } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: project }, { data: links }, { data: milestones }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase
      .from('freelancer_project_links')
      .select('id, role_on_project, contract_url, status, freelancer_id, freelancers(first_name, last_name, role, profile_url)')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .order('created_at'),
    supabase
      .from('milestones')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .order('due_date', { ascending: true, nullsFirst: false }),
  ])

  if (!project) notFound()

  const status = project.status as Project['status']

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                {project.contract_type === 'hourly' ? 'Hourly' : 'Fixed price'}
              </span>
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-slate-600">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/projects">
              <Button variant="outline" size="sm">All Projects</Button>
            </Link>
            <Link href={`/projects/${id}/link-freelancer`}>
              <Button size="sm">+ Link Freelancer</Button>
            </Link>
          </div>
        </div>

        {linked && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Freelancer linked to this project.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Scope */}
            {(project.scope_summary || project.out_of_scope || project.approval_requirements) && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h2 className="font-semibold text-slate-900">Scope &amp; Requirements</h2>
                {project.scope_summary && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">In scope</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.scope_summary}</p>
                  </div>
                )}
                {project.out_of_scope && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Out of scope</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.out_of_scope}</p>
                  </div>
                )}
                {project.approval_requirements && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Approval requirements</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.approval_requirements}</p>
                  </div>
                )}
              </div>
            )}

            {/* Linked freelancers */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Linked Freelancers</h2>
                <Link href={`/projects/${id}/link-freelancer`}>
                  <Button variant="outline" size="sm">+ Link</Button>
                </Link>
              </div>

              {links && links.length > 0 ? (
                <div className="space-y-3">
                  {(links as unknown as LinkRow[]).map((link) => {
                    const fl = Array.isArray(link.freelancers) ? link.freelancers[0] : link.freelancers
                    return (
                      <div key={link.id} className="flex items-start justify-between rounded-md border border-slate-100 p-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            {fl?.first_name} {fl?.last_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {link.role_on_project || fl?.role}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {fl?.profile_url && (
                            <a href={fl.profile_url} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline">
                              Profile ↗
                            </a>
                          )}
                          {link.contract_url && (
                            <a href={link.contract_url} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline">
                              Contract ↗
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No freelancers linked yet.</p>
              )}
            </div>

            {/* Milestones */}
            {project.contract_type === 'fixed_price' && project.approval_model === 'milestone_based' && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Milestones</h2>
                  <AddMilestoneForm projectId={id} />
                </div>

                {milestones && milestones.length > 0 ? (
                  <div className="space-y-3">
                    {milestones.map((m) => (
                      <MilestoneCard key={m.id} milestone={m} projectId={id} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No milestones yet. Add the first one above.</p>
                )}

                {milestones && milestones.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Total: ${milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0).toLocaleString()}
                    {' · '}
                    {milestones.filter(m => m.status === 'approved' || m.status === 'paid').length}/{milestones.length} approved
                  </div>
                )}
              </div>
            )}

            {/* Documentation notes */}
            {project.documentation_notes && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-2">Documentation &amp; References</h2>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.documentation_notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3 text-sm">
              <h2 className="font-semibold text-slate-900">Project Details</h2>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Contract type</p>
                <p className="text-slate-700">{project.contract_type === 'hourly' ? 'Hourly' : 'Fixed price'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Approval model</p>
                <p className="text-slate-700">
                  {project.approval_model === 'milestone_based' ? 'Milestone-based'
                    : project.approval_model === 'task_based' ? 'Task-based'
                    : 'Ongoing review'}
                </p>
              </div>

              {project.platform_source && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Platform</p>
                  <p className="text-slate-700 capitalize">{project.platform_source}</p>
                </div>
              )}

              {project.start_date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Start date</p>
                  <p className="text-slate-700">{new Date(project.start_date).toLocaleDateString()}</p>
                </div>
              )}

              {project.end_date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Target end</p>
                  <p className="text-slate-700">{new Date(project.end_date).toLocaleDateString()}</p>
                </div>
              )}

              {project.budget_cap && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Budget cap</p>
                  <p className="text-slate-700">${Number(project.budget_cap).toLocaleString()}</p>
                </div>
              )}

              {project.hours_cap && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Hours cap</p>
                  <p className="text-slate-700">
                    {project.hours_cap}h{project.hours_limit_interval ? ` / ${project.hours_limit_interval}` : ''}
                    {project.hours_limit_interval && project.hours_limit_interval !== 'weekly' && (
                      <span className="ml-1 text-xs text-slate-400">(internal tracking only)</span>
                    )}
                  </p>
                </div>
              )}

              {project.external_url && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">External URL</p>
                  <a href={project.external_url} target="_blank" rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm">
                    View workroom ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
