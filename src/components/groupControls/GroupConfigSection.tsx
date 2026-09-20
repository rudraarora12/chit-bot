import { useState } from 'react'
import {
  Building2,
  Lock,
  Edit3,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GroupConfig } from '@/data/groupControls'

interface GroupConfigSectionProps {
  config: GroupConfig
  onUpdate: (updates: Partial<GroupConfig>, log?: { title: string; desc: string }) => void
}

export function GroupConfigSection({ config, onUpdate }: GroupConfigSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(config.groupName)

  const handleStartEdit = () => {
    setDraftName(config.groupName)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    if (draftName.trim() && draftName !== config.groupName) {
      onUpdate(
        { groupName: draftName.trim() },
        {
          title: 'Group Name updated',
          desc: `Renamed group from "${config.groupName}" to "${draftName.trim()}"`,
        },
      )
    }
    setIsEditing(false)
  }

  return (
    <section
      id="group-configuration"
      className="rounded-[16px] border border-border bg-card p-5 sm:p-6 shadow-(--shadow-card) transition-all"
    >
      {/* Header & Edit Flow */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-navy">
                1. Group Configuration
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-2 py-0.5 text-[11px] font-bold text-emerald-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                Active Cycle {config.currentCycle}/{config.totalCycles}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Core charter and pool identity. Contractual terms are locked after group inception.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-8 gap-1 rounded-lg text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="h-8 gap-1 rounded-lg text-xs font-semibold shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="h-8 gap-1.5 rounded-lg text-xs font-semibold hover:border-emerald/40 hover:text-emerald"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Group
            </Button>
          )}
        </div>
      </div>

      {/* 8 Core Fields Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Group Name (Operational - Editable) */}
        <div className="rounded-xl border border-border bg-background/60 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Group Name
            </span>
            <span className="text-[10px] font-semibold text-emerald-dark bg-emerald/10 px-1.5 py-0.5 rounded">
              Editable
            </span>
          </div>
          <div className="mt-2">
            {isEditing ? (
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm font-bold text-navy focus:border-emerald focus:outline-none"
              />
            ) : (
              <p className="text-sm font-bold text-navy">{config.groupName}</p>
            )}
            <p className="mt-1 text-[11px] text-muted">ID: {config.groupCode}</p>
          </div>
        </div>

        {/* 2. Chit Amount (Contractual - Locked) */}
        <div className="rounded-xl border border-border bg-background/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Chit Amount
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted bg-navy/5 px-1.5 py-0.5 rounded">
              <Lock className="h-3 w-3 text-muted-foreground" /> Locked
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm sm:text-base font-extrabold text-navy">
              ₹{config.chitAmount.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-[11px] text-muted">Total pool value per cycle</p>
          </div>
        </div>

        {/* 3. Number of Members (Contractual - Locked) */}
        <div className="rounded-xl border border-border bg-background/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Number of Members
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted bg-navy/5 px-1.5 py-0.5 rounded">
              <Lock className="h-3 w-3 text-muted-foreground" /> Locked
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm sm:text-base font-extrabold text-navy">
              {config.numberOfMembers} Members
            </p>
            <p className="mt-1 text-[11px] text-muted">Subscribed member slots</p>
          </div>
        </div>

        {/* 4. Total Cycles (Contractual - Locked) */}
        <div className="rounded-xl border border-border bg-background/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Total Cycles
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted bg-navy/5 px-1.5 py-0.5 rounded">
              <Lock className="h-3 w-3 text-muted-foreground" /> Locked
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm sm:text-base font-extrabold text-navy">
              {config.totalCycles} Cycles
            </p>
            <p className="mt-1 text-[11px] text-muted">Full lifecycle duration</p>
          </div>
        </div>

        {/* 5. Current Cycle (Contractual - Operational) */}
        <div className="rounded-xl border border-border bg-background/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Current Cycle
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-dark bg-emerald/10 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <p className="text-sm sm:text-base font-extrabold text-navy">
                Cycle #{config.currentCycle}
              </p>
              <span className="text-[11px] text-muted">
                ({config.totalCycles - config.currentCycle} left)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-emerald"
                style={{ width: `${(config.currentCycle / config.totalCycles) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 6. Contribution Amount (Contractual - Locked) */}
        <div className="rounded-xl border border-border bg-background/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Contribution Amount
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted bg-navy/5 px-1.5 py-0.5 rounded">
              <Lock className="h-3 w-3 text-muted-foreground" /> Locked
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm sm:text-base font-extrabold text-navy">
              ₹{config.contributionAmount.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-[11px] text-muted">Per member / cycle</p>
          </div>
        </div>

        {/* 7. Contribution Frequency (Contractual - Locked) */}
        <div className="rounded-xl border border-border bg-background/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Contribution Frequency
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted bg-navy/5 px-1.5 py-0.5 rounded">
              <Lock className="h-3 w-3 text-muted-foreground" /> Locked
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm sm:text-base font-extrabold text-navy">
              {config.contributionFrequency}
            </p>
            <p className="mt-1 text-[11px] text-muted">Scheduled cycle cadence</p>
          </div>
        </div>

        {/* 8. Start Date (Contractual - Locked) */}
        <div className="rounded-xl border border-border bg-background/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Start Date
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted bg-navy/5 px-1.5 py-0.5 rounded">
              <Lock className="h-3 w-3 text-muted-foreground" /> Locked
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm sm:text-base font-extrabold text-navy">
              {new Date(config.startDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="mt-1 text-[11px] text-muted">Group charter inception</p>
          </div>
        </div>
      </div>
    </section>
  )
}
