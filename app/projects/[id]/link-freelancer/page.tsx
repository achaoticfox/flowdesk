import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function linkFreelancer(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const project_id = String(formData.get('project_id') || '')
  const freelancer_id = String(formData.get('freelancer_id') || '')
  const contract_url = String(formData.get('contract_url') || '').trim() || null
  const role_on_project = String(formData.get('role_on_project') || '').trim() || null

  if (!project_id || !freelancer_id) {
    redirect(`/projects/${project_id}/link-freelancer?error=Missing+required+fields`)
  }

  const { error } = await supabase.from('freelancer_project_links').insert({
    user_id: user.id,
    project_id,
    freelancer_id,
    contract_url,
    role_on_project,
    status: 'active',
  })

  if (error) {
    if (error.code === '23505') {
      redirect(`/projects/${project_id}/link-freelancer?error=This+freelancer+is+already+linked+to+this+project`)
    }
    redirect(`/projects/${project_id}/link-freelancer?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/projects/${project_id}?linked=true`)
}

export default async function LinkFreelancerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: project }, { data: freelancers }] = await Promise.all([
    supabase.from('projects').select('id, name').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('freelancers').select('id, first_name, last_name, role').eq('user_id', user.id).order('first_name'),
  ])

  if (!project) notFound()

  // Exclude already-linked freelancers
  const { data: existing } = await supabase
    .from('freelancer_project_links')
    .select('freelancer_id')
    .eq('project_id', id)

  const linkedIds = new Set((existing || []).map((r: { freelancer_id: string }) => r.freelancer_id))
  const available = (freelancers || []).filter((f: { id: string }) => !linkedIds.has(f.id))

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Project</p>
            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
          </div>
          <Link href={`/projects/${id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Link a Freelancer</CardTitle>
            <CardDescription>
              Attach a talent profile to this project. The contract URL lives on this link — the freelancer profile stays reusable across projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={linkFreelancer} className="space-y-5">
              <input type="hidden" name="project_id" value={id} />

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {decodeURIComponent(error)}
                </div>
              )}

              {available.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  All your freelancer profiles are already linked to this project, or you have no freelancer profiles yet.{' '}
                  <Link href="/freelancers/new" className="text-blue-600 hover:underline">Add a freelancer profile</Link>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="freelancer_id">Freelancer <span className="text-red-500">*</span></Label>
                    <select
                      id="freelancer_id"
                      name="freelancer_id"
                      required
                      className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                    >
                      <option value="">Select a freelancer...</option>
                      {available.map((f: { id: string; first_name: string; last_name: string; role: string }) => (
                        <option key={f.id} value={f.id}>
                          {f.first_name} {f.last_name} — {f.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role_on_project">Role on this project</Label>
                    <Input
                      id="role_on_project"
                      name="role_on_project"
                      placeholder="e.g. Lead Writer, QA Reviewer, Translator..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract_url">Contract URL</Label>
                    <Input
                      id="contract_url"
                      name="contract_url"
                      type="url"
                      placeholder="https://www.upwork.com/contracts/..."
                    />
                    <p className="text-xs text-slate-500">
                      Paste the Upwork contract URL or direct hire agreement link. This stays on the link, not the freelancer profile.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Link Freelancer</Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
