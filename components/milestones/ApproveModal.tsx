'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { approveMilestone } from '@/app/actions/milestones'

function StarPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`text-2xl leading-none transition-colors ${
              n <= value ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ApproveModal({
  milestoneId,
  projectId,
  milestoneTitle,
  onClose,
}: {
  milestoneId: string
  projectId: string
  milestoneTitle: string
  onClose: () => void
}) {
  const [quality, setQuality] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setLoading(true)
    setError(null)
    try {
      await approveMilestone(milestoneId, projectId, {
        quality,
        speed,
        communication,
        note,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Approve Milestone</h2>
          <p className="text-sm text-slate-500 mt-0.5">{milestoneTitle}</p>
        </div>

        <p className="text-sm text-slate-600">
          Leave an internal score before approving. These stay private and feed into the freelancer&apos;s project history.
        </p>

        <StarPicker label="Quality" value={quality} onChange={setQuality} />
        <StarPicker label="Speed" value={speed} onChange={setSpeed} />
        <StarPicker label="Communication" value={communication} onChange={setCommunication} />

        <div className="space-y-1">
          <Label htmlFor="approval-note">Internal note (optional)</Label>
          <textarea
            id="approval-note"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Anything worth remembering about this delivery..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApprove} disabled={loading}>
            {loading ? 'Approving...' : 'Approve Milestone'}
          </Button>
        </div>
      </div>
    </div>
  )
}
