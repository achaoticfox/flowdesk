import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function createProject(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim() || null
  const scope_summary = String(formData.get('scope_summary') || '').trim() || null
  const out_of_scope = String(formData.get('out_of_scope') || '').trim() || null
  const contract_type = String(formData.get('contract_type') || 'fixed_price')
  const approval_model = String(formData.get('approval_model') || 'milestone_based')
  const platform_source = String(formData.get('platform_source') || '').trim() || null
  const external_url = String(formData.get('external_url') || '').trim() || null
  const start_date = String(formData.get('start_date') || '').trim() || null
  const end_date = String(formData.get('end_date') || '').trim() || null
  const budget_cap = formData.get('budget_cap') ? Number(formData.get('budget_cap')) : null
  const hours_cap = formData.get('hours_cap') ? Number(formData.get('hours_cap')) : null
  const hours_limit_interval = String(formData.get('hours_limit_interval') || '').trim() || null
  const approval_requirements = String(formData.get('approval_requirements') || '').trim() || null
  const documentation_notes = String(formData.get('documentation_notes') || '').trim() || null

  if (!name) redirect('/projects/new?error=Project+name+is+required')

  const { error } = await supabase.from('projects').insert({
    user_id: user.id,
    name,
    description,
    scope_summary,
    out_of_scope,
    contract_type,
    approval_model,
    platform_source,
    external_url,
    start_date,
    end_date,
    budget_cap,
    hours_cap,
    hours_limit_interval: hours_limit_interval || null,
    approval_requirements,
    documentation_notes,
    status: 'draft',
  })

  if (error) redirect(`/projects/new?error=${encodeURIComponent(error.message)}`)

  redirect('/projects?created=project')
}

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Create Project</h1>
            <p className="mt-1 text-sm text-slate-600">
              Projects are the engagement container. Freelancers, milestones, and contract details link onto the project.
            </p>
          </div>
          <Link href="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>

        <form action={createProject} className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Core identity */}
          <Card>
            <CardHeader>
              <CardTitle>Project Identity</CardTitle>
              <CardDescription>What is this engagement?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" placeholder="e.g. Q3 Blog Content Program" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short description</Label>
                <Input id="description" name="description" placeholder="One-line summary for your own reference" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start date</Label>
                  <Input id="start_date" name="start_date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Target end date</Label>
                  <Input id="end_date" name="end_date" type="date" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform_source">Platform / source</Label>
                  <select
                    id="platform_source"
                    name="platform_source"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                  >
                    <option value="">Select...</option>
                    <option value="upwork">Upwork</option>
                    <option value="fiverr">Fiverr</option>
                    <option value="contra">Contra</option>
                    <option value="direct">Direct hire</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="external_url">External project / workroom URL</Label>
                  <Input id="external_url" name="external_url" type="url" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work model */}
          <Card>
            <CardHeader>
              <CardTitle>Work Model</CardTitle>
              <CardDescription>How is this engagement structured?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contract_type">Contract type</Label>
                  <select
                    id="contract_type"
                    name="contract_type"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                  >
                    <option value="fixed_price">Fixed price</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approval_model">Approval model</Label>
                  <select
                    id="approval_model"
                    name="approval_model"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                  >
                    <option value="milestone_based">Milestone-based</option>
                    <option value="task_based">Task-based</option>
                    <option value="ongoing_review">Ongoing review (hourly)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="budget_cap">Budget cap ($)</Label>
                  <Input id="budget_cap" name="budget_cap" type="number" min="0" step="0.01" placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours_cap">Hours cap</Label>
                  <Input id="hours_cap" name="hours_cap" type="number" min="0" step="0.5" placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours_limit_interval">Hours limit cadence</Label>
                  <select
                    id="hours_limit_interval"
                    name="hours_limit_interval"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                  >
                    <option value="">None</option>
                    <option value="weekly">Weekly (enforced on Upwork)</option>
                    <option value="daily">Daily (internal tracking only)</option>
                    <option value="monthly">Monthly (internal tracking only)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scope */}
          <Card>
            <CardHeader>
              <CardTitle>Scope &amp; Approval Requirements</CardTitle>
              <CardDescription>
                Define what's in, what's out, and what "approved" means. This is your internal brief — not a freelancer-facing doc yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope_summary">What's in scope</Label>
                <textarea
                  id="scope_summary"
                  name="scope_summary"
                  className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Describe what this project covers..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="out_of_scope">What's out of scope</Label>
                <textarea
                  id="out_of_scope"
                  name="out_of_scope"
                  className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Explicitly exclude anything that might cause scope creep..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval_requirements">Hard requirements for approval</Label>
                <textarea
                  id="approval_requirements"
                  name="approval_requirements"
                  className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="What does every deliverable need to meet before you approve? File format, length, accuracy standards, revision expectations, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentation_notes">Project documentation notes</Label>
                <textarea
                  id="documentation_notes"
                  name="documentation_notes"
                  className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Links to brand guide, style guide, SOPs, reference materials, etc."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/projects">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
