import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function createFreelancer(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const first_name = String(formData.get('first_name') || '').trim()
  const last_name = String(formData.get('last_name') || '').trim()
  const role = String(formData.get('role') || '').trim()
  const profile_url = String(formData.get('profile_url') || '').trim() || null
  const city = String(formData.get('city') || '').trim() || null
  const state = String(formData.get('state') || '').trim() || null
  const country = String(formData.get('country') || '').trim()
  const notes = String(formData.get('notes') || '').trim() || null

  if (!first_name || !last_name || !role || !country) {
    redirect('/freelancers/new?error=missing_required_fields')
  }

  const { error } = await supabase.from('freelancers').insert({
    user_id: user.id,
    first_name,
    last_name,
    role,
    profile_url,
    city,
    state,
    country,
    notes,
  })

  if (error) {
    redirect(`/freelancers/new?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard?created=freelancer')
}

export default async function NewFreelancerPage({
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
            <h1 className="text-2xl font-semibold text-slate-900">Add Freelancer</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create a reusable freelancer profile first. Projects and contract URLs can be linked later.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Freelancer Profile</CardTitle>
            <CardDescription>
              Talent lives separately from projects so the same person can be reused across multiple engagements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createFreelancer} className="space-y-6">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {decodeURIComponent(error)}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input id="first_name" name="first_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input id="last_name" name="last_name" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" placeholder="Writer, Editor, Designer, QA Reviewer..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_url">FL profile link</Label>
                  <Input id="profile_url" name="profile_url" type="url" placeholder="https://www.upwork.com/freelancers/..." />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State (optional if US)</Label>
                  <Input id="state" name="state" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  className="min-h-32 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Anything worth remembering: communication style, strengths, concerns, sourcing notes, availability, etc."
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Planned next on this profile</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Expandable project links</li>
                  <li>Contract URL captured when linking to a project</li>
                  <li>History of scored deliverables</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Create Freelancer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
