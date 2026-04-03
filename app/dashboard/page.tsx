import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { count: freelancerCount },
    { count: projectCount },
    { count: pendingCount },
    { count: paymentFlagCount },
  ] = await Promise.all([
    supabase.from('freelancers').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).in('status', ['active', 'assigned']),
    supabase.from('deliverables').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('deliverables').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">FlowDesk</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-blue-600 hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {params.created === 'freelancer' && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Freelancer created.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Freelancers</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{freelancerCount ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Talent profiles</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Active Projects</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{projectCount ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Assigned or active</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{pendingCount ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Submitted deliverables</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Payment Flags</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{paymentFlagCount ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Approved but unpaid</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/projects" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors">
            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Projects</p>
            <p className="mt-1 text-sm text-slate-500">View all projects and their status</p>
          </Link>
          <Link href="/projects/new" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors">
            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">New Project</p>
            <p className="mt-1 text-sm text-slate-500">Create a project brief</p>
          </Link>
          <Link href="/freelancers" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors">
            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Freelancers</p>
            <p className="mt-1 text-sm text-slate-500">View your talent roster</p>
          </Link>
          <Link href="/freelancers/new" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors">
            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Add Freelancer</p>
            <p className="mt-1 text-sm text-slate-500">Create a reusable talent profile</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
