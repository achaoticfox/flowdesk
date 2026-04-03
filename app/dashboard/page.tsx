import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-medium text-slate-900 mb-2">Freelancers</h2>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-sm text-slate-600 mt-1">Active roster</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-medium text-slate-900 mb-2">Pending Approvals</h2>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-sm text-slate-600 mt-1">Deliverables awaiting review</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-medium text-slate-900 mb-2">Payment Flags</h2>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-sm text-slate-600 mt-1">Approved but unpaid</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Get Started</h3>
          <p className="text-slate-600 mb-4">Add your first freelancer to start tracking your team.</p>
          <a 
            href="/freelancers/new" 
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Freelancer
          </a>
        </div>
      </main>
    </div>
  )
}
