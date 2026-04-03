'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMilestone } from '@/app/actions/milestones'

export default function AddMilestoneForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createMilestone(projectId, {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        amount: amount ? Number(amount) : null,
      })
      setTitle('')
      setDescription('')
      setDueDate('')
      setAmount('')
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add Milestone
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="ms-title">Title *</Label>
          <Input
            id="ms-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Draft delivery — Week 1"
            required
            autoFocus
          />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="ms-desc">Description</Label>
          <Input
            id="ms-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's included in this milestone?"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ms-due">Due date</Label>
          <Input
            id="ms-due"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ms-amount">Amount ($)</Label>
          <Input
            id="ms-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Adding...' : 'Add Milestone'}
        </Button>
      </div>
    </form>
  )
}
