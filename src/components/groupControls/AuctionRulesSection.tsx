import {
  Gavel,
  Clock,
  TrendingDown,
  Bell,
} from 'lucide-react'
import type { AuctionRules, AuctionDurationOption } from '@/data/groupControls'

interface AuctionRulesSectionProps {
  rules: AuctionRules
  onUpdate: (updates: Partial<AuctionRules>, log?: { title: string; desc: string }) => void
}

const DURATION_OPTIONS: { label: string; value: AuctionDurationOption }[] = [
  { label: '30m', value: 30 },
  { label: '60m', value: 60 },
  { label: '2h', value: 120 },
  { label: '4h', value: 240 },
  { label: '24h', value: 1440 },
]

const INCREMENT_OPTIONS = [250, 500, 1000, 2000]

const ELIGIBILITY_OPTIONS = [
  'Non-winning members with zero payment defaults',
  'All non-winning members',
  'Members with verified guarantor backing',
]

const REMINDER_OPTIONS = [
  '24 hours & 2 hours before',
  '12 hours & 1 hour before',
  '2 hours before only',
  '15 minutes before only',
]

export function AuctionRulesSection({ rules, onUpdate }: AuctionRulesSectionProps) {
  const handleDurationChange = (val: AuctionDurationOption) => {
    const oldVal = rules.auctionDurationMinutes
    onUpdate(
      { auctionDurationMinutes: val },
      {
        title: `Auction duration changed: ${oldVal}m → ${val}m`,
        desc: `Duration updated to ${val} minutes.`,
      },
    )
  }

  const handleIncrementChange = (val: number) => {
    const oldVal = rules.minBidIncrement
    onUpdate(
      { minBidIncrement: val },
      {
        title: `Minimum bid increment changed: ₹${oldVal} → ₹${val}`,
        desc: `New minimum discount bid step set to ₹${val.toLocaleString('en-IN')}.`,
      },
    )
  }

  const handleEligibilityChange = (val: string) => {
    onUpdate(
      { eligibleMembersRule: val },
      {
        title: 'Auction eligibility rule updated',
        desc: `New eligibility rule: "${val}"`,
      },
    )
  }

  const handleReminderChange = (val: string) => {
    onUpdate(
      { auctionReminder: val },
      {
        title: 'Auction reminder timing updated',
        desc: `Scheduled alerts set to: "${val}"`,
      },
    )
  }

  const handleToggleAutoClose = () => {
    const nextVal = !rules.autoCloseAuction
    onUpdate(
      { autoCloseAuction: nextVal },
      {
        title: `Auto-close Auction: ${nextVal ? 'ON' : 'OFF'}`,
        desc: nextVal
          ? 'System will automatically finalize winning bid at timer expiry.'
          : 'Manual organizer sign-off required to finalize auction result.',
      },
    )
  }

  return (
    <section
      id="auction-rules"
      className="rounded-[16px] border border-border bg-card p-5 sm:p-6 shadow-(--shadow-card) transition-all"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-navy">
                3. Auction Rules
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-2 py-0.5 text-[11px] font-bold text-emerald-dark">
                Reverse Bidding
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Configure session duration, bid step thresholds, member eligibility, and auto-settlement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-background px-2.5 py-1 border border-border text-xs">
          <span className="text-muted">Type:</span>
          <span className="text-navy font-bold">{rules.auctionType}</span>
        </div>
      </div>

      {/* 6 Essential Auction Controls */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Auction Type (Fixed standard) */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Auction Type
            </span>
            <span className="text-[10px] font-semibold text-emerald-dark bg-emerald/10 px-1.5 py-0.5 rounded">
              Standard
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-navy">Reverse Auction</p>
          <p className="mt-1 text-[11px] text-muted leading-relaxed">
            Subscribers bid discount amounts. Winning discount is distributed as dividend savings to all group members.
          </p>
        </div>

        {/* 2. Auction Duration */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald" />
              Auction Duration
            </span>
            <span className="text-xs font-bold text-navy">
              {rules.auctionDurationMinutes} mins
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Active bidding window per cycle.</p>
          <div className="mt-3 grid grid-cols-5 gap-1">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = rules.auctionDurationMinutes === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleDurationChange(opt.value)}
                  className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-emerald bg-emerald text-white shadow-xs'
                      : 'border-border bg-card text-navy hover:bg-background'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Minimum Bid Increment */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-emerald" />
              Min Bid Increment
            </span>
            <span className="text-xs font-bold text-navy">
              ₹{rules.minBidIncrement.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Minimum step to outbid current offer.</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {INCREMENT_OPTIONS.map((amt) => {
              const isSelected = rules.minBidIncrement === amt
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleIncrementChange(amt)}
                  className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-emerald bg-emerald text-white shadow-xs'
                      : 'border-border bg-card text-navy hover:bg-background'
                  }`}
                >
                  ₹{amt}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Eligible Member Rule */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Eligible Member Rule
          </label>
          <p className="mt-1 text-[11px] text-muted">Who can place bids in active cycle.</p>
          <select
            value={rules.eligibleMembersRule}
            onChange={(e) => handleEligibilityChange(e.target.value)}
            className="mt-3 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-navy focus:border-emerald focus:outline-none"
          >
            {ELIGIBILITY_OPTIONS.map((rule) => (
              <option key={rule} value={rule}>
                {rule}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Auction Reminder */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
            <Bell className="h-3.5 w-3.5 text-emerald" />
            Auction Reminder
          </label>
          <p className="mt-1 text-[11px] text-muted">Notification timing before session opens.</p>
          <select
            value={rules.auctionReminder}
            onChange={(e) => handleReminderChange(e.target.value)}
            className="mt-3 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-navy focus:border-emerald focus:outline-none"
          >
            {REMINDER_OPTIONS.map((rem) => (
              <option key={rem} value={rem}>
                {rem}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Auto-close Auction */}
        <div className="rounded-xl border border-border bg-background/50 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Auto-Close Auction
            </span>
            <span className="text-xs font-bold text-navy">
              {rules.autoCloseAuction ? (
                <span className="text-emerald-dark">Enabled</span>
              ) : (
                <span className="text-muted">Manual</span>
              )}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted leading-relaxed">
            Automatically lock winning bid and journal payout math at timer expiry.
          </p>
          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-navy font-semibold">Auto-Settlement</span>
            <button
              type="button"
              role="switch"
              aria-checked={rules.autoCloseAuction}
              onClick={handleToggleAutoClose}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                rules.autoCloseAuction ? 'bg-emerald' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  rules.autoCloseAuction ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
