'use client'

import { useState } from 'react'
import { updateMilestoneStatus } from '@/app/actions/milestones'
import ApproveModal from './ApproveModal'

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  active: 'Active',
  submitted: 'Submitted',
  approved: 'Approved',
  paid: 'Paid',
  blocked: 'Blocked',
}

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-500',
  active: 'bg-blue-100 text-blue-700',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-700',
}

const NEXT_STATUSES: Record<string, string[]> = {
  not_started: ['active', 'blocked'],
  active: ['submitted', 'blocked'],
  submitted: ['approved', 'active', 'blocked'],
  approved: ['paid'],
  paid: [],
  blocked: ['not_started', 'active'],
}

function StarRow({ label, score }: { label: string; score: number | null }) {
  if (!score) return null
  return (
    <span className="text-xs text-slate-500">
      {label}: {'★'.repeat(score)}{'☆'.repeat(5 - score)}
    </span>
  )
}

export default function MilestoneCard({
  milestone,
  projectId,
}: {
  milestone: {
    id: string
    title: string
    description: string | null
    due_date: string | null
    amount: number | null
    status: string
    quality_score: number | null
    speed_score: number | null
    communication_score: number | null
    approval_note: string | null
    approved_at: string | null
  }
  projectId: string
}) {
  const [approving, setApproving] = useState(false)
  const [loading, setLoading] = useState(false)

  const nextStatuses = NEXT_STATUSES[milestone.status] ?? []

  const handleStatusChange = async (status: string) => {
    if (status === 'approved') {
      setApproving(true)
      return
    }
    setLoading(true)
    await updateMilestoneStatus(milestone.id, projectId, status)
    setLoading(false)
  }

  const isApproved = milestone.status === 'approved' || milestone.status === 'paid'
  const hasScores = milestone.quality_score || milestone.speed_score || milestone.communication_score

  return (
    <>
      {approving && (
        <ApproveModal
          milestoneId={milestone.id}
          projectId={projectId}
          milestoneTitle={milestone.title}
          onClose={() => setApproving(false)}
        />
      )}

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-900">{milestone.title}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[milestone.status]}`}>
                {STATUS_LABELS[milestone.status]}
              </span>
            </div>

            {milestone.description && (
              <p className="mt-1 text-sm text-slate-600">{milestone.description}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              {milestone.due_date && (
                <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
              )}
              {milestone.amount && (
                <span>${Number(milestone.amount).toLocaleString()}</span>
              )}
            </div>

            {isApproved && hasScores && (
              <div className="mt-2 flex flex-wrap gap-3">
                <StarRow label="Quality" score={milestone.quality_score} />
                <StarRow label="Speed" score={milestone.speed_score} />
                <StarRow label="Comms" score={milestone.communication_score} />
              </div>
            )}

            {isApproved && milestone.approval_note && (
              <p className="mt-2 rounded bg-slate-50 px-2 py-1.5 text-xs text-slate-600 italic">
                &ldquo;{milestone.approval_note}&rdquo;
              </p>
            )}
          </div>

          {nextStatuses.length > 0 && (
            <div className="flex flex-col gap-1 shrink-0">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={loading}
                  className="rounded px-2 py-1 text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {s === 'approved' ? '✓ Approve' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
