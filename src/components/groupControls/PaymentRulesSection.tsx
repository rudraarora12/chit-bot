import {
  CreditCard,
  Calendar,
  BellRing,
} from 'lucide-react'
import type { PaymentRules } from '@/data/groupControls'

interface PaymentRulesSectionProps {
  rules: PaymentRules
  onUpdate: (updates: Partial<PaymentRules>, log?: { title: string; desc: string }) => void
}

const DUE_DATE_OPTIONS = [1, 5, 7, 10, 15]

export function PaymentRulesSection({ rules, onUpdate }: PaymentRulesSectionProps) {
  const handleToggle = (key: keyof PaymentRules, label: string) => {
    const nextVal = !rules[key]
    onUpdate(
      { [key]: nextVal },
      {
        title: `${label}: ${nextVal ? 'ON' : 'OFF'}`,
        desc: `Payment automation "${label}" switched ${nextVal ? 'enabled' : 'disabled'}.`,
      },
    )
  }

  const handleDueDateChange = (day: number) => {
    onUpdate(
      { dueDate: day },
      {
        title: `Due Date changed: ${rules.dueDate}th → ${day}th`,
        desc: `Monthly installment collections due on the ${day}th of every month.`,
      },
    )
  }

  const handleGracePeriodChange = (days: number) => {
    onUpdate(
      { gracePeriodDays: days },
      {
        title: `Grace Period changed: ${rules.gracePeriodDays}d → ${days}d`,
        desc: `Subscribers granted ${days} days grace before late payment flags apply.`,
      },
    )
  }

  const handleLateThresholdChange = (days: number) => {
    onUpdate(
      { latePaymentThresholdDays: days },
      {
        title: `Late Threshold changed: ${rules.latePaymentThresholdDays}d → ${days}d`,
        desc: `Late penalty triggers at ${days} days past grace.`,
      },
    )
  }

  const handleOverdueThresholdChange = (days: number) => {
    onUpdate(
      { overdueThresholdDays: days },
      {
        title: `Overdue Threshold changed: ${rules.overdueThresholdDays}d → ${days}d`,
        desc: `Critical default threshold set to ${days} days past grace.`,
      },
    )
  }

  const handleContributionChange = (amount: number) => {
    onUpdate(
      { monthlyContribution: amount },
      {
        title: `Monthly contribution adjusted: ₹${amount.toLocaleString('en-IN')}`,
        desc: `Standard installment per member set to ₹${amount.toLocaleString('en-IN')}.`,
      },
    )
  }

  return (
    <section
      id="payment-rules"
      className="rounded-[16px] border border-border bg-card p-5 sm:p-6 shadow-(--shadow-card) transition-all"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-navy">
                2. Payment &amp; Collection Rules
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-2 py-0.5 text-[11px] font-bold text-emerald-dark">
                Auto-Enforced
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Configure installment amounts, calendar due dates, grace windows, and automated collection alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-background px-2.5 py-1 border border-border text-xs">
          <Calendar className="h-3.5 w-3.5 text-emerald" />
          <span className="text-muted">Due:</span>
          <span className="text-navy font-bold">{rules.dueDate}th of month</span>
        </div>
      </div>

      {/* 5 Core Controls */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Monthly Contribution */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Monthly Contribution
            </label>
            <span className="text-xs font-bold text-navy">
              ₹{rules.monthlyContribution.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Base monthly pool deposit per subscriber.</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-navy">₹</span>
            <input
              type="number"
              step="500"
              min="1000"
              max="50000"
              value={rules.monthlyContribution}
              onChange={(e) => handleContributionChange(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-navy focus:border-emerald focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Due Date */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Due Date
            </label>
            <span className="text-xs font-bold text-navy">{rules.dueDate}th of Month</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Target day for monthly contributions.</p>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {DUE_DATE_OPTIONS.map((day) => {
              const isSelected = rules.dueDate === day
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDueDateChange(day)}
                  className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-emerald bg-emerald text-white shadow-xs'
                      : 'border-border bg-card text-navy hover:bg-background'
                  }`}
                >
                  {day}th
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Grace Period */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Grace Period
            </label>
            <span className="text-xs font-bold text-emerald-dark bg-emerald/10 px-2 py-0.5 rounded">
              {rules.gracePeriodDays} Days
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Buffer days granted before late flags apply.</p>
          <div className="mt-3">
            <input
              type="range"
              min="1"
              max="10"
              value={rules.gracePeriodDays}
              onChange={(e) => handleGracePeriodChange(Number(e.target.value))}
              className="w-full accent-emerald cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-medium text-muted mt-1">
              <span>1 day</span>
              <span>5 days (Standard)</span>
              <span>10 days</span>
            </div>
          </div>
        </div>

        {/* 4. Late Payment Threshold */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Late Payment Threshold
            </label>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              +{rules.latePaymentThresholdDays} Days past grace
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Triggers late notification and penalty tag.</p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="7"
              value={rules.latePaymentThresholdDays}
              onChange={(e) => handleLateThresholdChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-navy w-10 text-right">
              {rules.latePaymentThresholdDays}d
            </span>
          </div>
        </div>

        {/* 5. Overdue Threshold */}
        <div className="rounded-xl border border-border bg-background/50 p-4 sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Overdue / Default Threshold
            </label>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              +{rules.overdueThresholdDays} Days past grace
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Escalates member to high-risk review and pauses auction participation.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="20"
              value={rules.overdueThresholdDays}
              onChange={(e) => handleOverdueThresholdChange(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-navy w-14 text-right">
              {rules.overdueThresholdDays} days
            </span>
          </div>
        </div>
      </div>

      {/* 3 Automation Toggles */}
      <div className="mt-5 pt-4 border-t border-border/70">
        <span className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center gap-1.5 mb-3">
          <BellRing className="h-3.5 w-3.5 text-emerald" />
          Payment Automation Toggles
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Toggle 1: Payment Reminder */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3">
            <div>
              <p className="text-xs font-bold text-navy">Payment Reminder</p>
              <p className="text-[11px] text-muted">3 days before due date</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={rules.paymentReminder}
              onClick={() => handleToggle('paymentReminder', 'Payment reminder')}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                rules.paymentReminder ? 'bg-emerald' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  rules.paymentReminder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Overdue Alert */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3">
            <div>
              <p className="text-xs font-bold text-navy">Overdue Alert</p>
              <p className="text-[11px] text-muted">When grace window expires</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={rules.overdueAlert}
              onClick={() => handleToggle('overdueAlert', 'Overdue alert')}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                rules.overdueAlert ? 'bg-emerald' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  rules.overdueAlert ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Feed Overdue into Risk Monitoring */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3">
            <div>
              <p className="text-xs font-bold text-navy">Feed Risk Monitoring</p>
              <p className="text-[11px] text-muted">Include overdue in AI risk scoring</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={rules.includeOverdueInRisk}
              onClick={() =>
                handleToggle('includeOverdueInRisk', 'Feed overdue behaviour into Risk Monitoring')
              }
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                rules.includeOverdueInRisk ? 'bg-emerald' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  rules.includeOverdueInRisk ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
