import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'

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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-600">
              Engagement containers. Freelancers, milestones, and contract details attach here.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/projects/new">
              <Button>New Project</Button>
            </Link>
          </div>
        </div>

        {params.created === 'project' && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Project created.
          </div>
        )}

        {projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status as Project['status']]}`}>
                        {STATUS_LABELS[project.status as Project['status']]}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                        {project.contract_type === 'hourly' ? 'Hourly' : 'Fixed price'}
                      </span>
                    </div>

                    {project.description && (
                      <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                      {project.start_date && (
                        <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                      )}
                      {project.end_date && (
                        <span>Target end: {new Date(project.end_date).toLocaleDateString()}</span>
                      )}
                      {project.budget_cap && (
                        <span>Budget: ${Number(project.budget_cap).toLocaleString()}</span>
                      )}
                      {project.hours_cap && (
                        <span>Hours cap: {project.hours_cap}h {project.hours_limit_interval ? `/ ${project.hours_limit_interval}` : ''}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {project.external_url && (
                      <a
                        href={project.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View workroom ↗
                      </a>
                    )}
                  </div>
                </div>

                {project.scope_summary && (
                  <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Scope: </span>
                    {project.scope_summary}
                  </div>
                )}

                <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  Freelancer links and milestones coming next.
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-medium text-slate-900">No projects yet</h2>
            <p className="mt-2 text-sm text-slate-600">Create your first project to start organizing your work.</p>
            <div className="mt-4">
              <Link href="/projects/new">
                <Button>New Project</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
