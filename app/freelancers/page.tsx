import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function FreelancersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: freelancers, error } = await supabase
    .from('freelancers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Freelancers</h1>
            <p className="mt-1 text-sm text-slate-600">
              Your reusable talent profiles live here. Projects and contracts will link onto these records.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/freelancers/new">
              <Button>Add Freelancer</Button>
            </Link>
          </div>
        </div>

        {freelancers && freelancers.length > 0 ? (
          <div className="grid gap-4">
            {freelancers.map((freelancer) => (
              <div key={freelancer.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {freelancer.first_name} {freelancer.last_name}
                    </h2>
                    <p className="text-sm text-slate-600">{freelancer.role}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {[freelancer.city, freelancer.state, freelancer.country].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  {freelancer.profile_url && (
                    <a
                      href={freelancer.profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View profile
                    </a>
                  )}
                </div>

                {freelancer.notes && (
                  <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    {freelancer.notes}
                  </div>
                )}

                <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  Project links and scored deliverable history coming next.
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-medium text-slate-900">No freelancers yet</h2>
            <p className="mt-2 text-sm text-slate-600">Create your first talent profile to get started.</p>
            <div className="mt-4">
              <Link href="/freelancers/new">
                <Button>Add Freelancer</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
