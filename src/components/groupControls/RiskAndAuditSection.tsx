import { useState } from 'react'
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Clock,
  History,
  Info,
  Sliders,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  RiskMonitoringConfig,
  RiskProfile,
  AuditTransparencyState,
  LedgerVerificationResult,
  ConfigHistoryEntry,
} from '@/data/groupControls'
import { LedgerVerificationModal } from './LedgerVerificationModal'

interface RiskAndAuditSectionProps {
  riskConfig: RiskMonitoringConfig
  onUpdateRisk: (updates: Partial<RiskMonitoringConfig>, log?: { title: string; desc: string }) => void
  onToggleSignal: (signalKey: keyof RiskMonitoringConfig['signals']) => void
  audit: AuditTransparencyState
  isVerifying: boolean
  onVerify: () => Promise<LedgerVerificationResult>
  history: ConfigHistoryEntry[]
  onResetDefaults?: () => void
}

const PROFILES: { id: RiskProfile; label: string; desc: string }[] = [
  { id: 'Conservative', label: 'Conservative', desc: 'Flags minor delays > 24h' },
  { id: 'Balanced', label: 'Balanced', desc: 'Standard ChitLedger multi-cycle model' },
  { id: 'Sensitive', label: 'Sensitive', desc: 'Predictive early velocity alerts' },
]

const SIGNALS_META: {
  key: keyof RiskMonitoringConfig['signals']
  label: string
  desc: string
}[] = [
  {
    key: 'latePaymentFrequency',
    label: 'Late Payment Monitoring',
    desc: 'Tracks recurring deposit delays across cycles',
  },
  {
    key: 'missedContributions',
    label: 'Missed Contribution Monitoring',
    desc: 'Flags installments unpaid past grace',
  },
  {
    key: 'outstandingBalance',
    label: 'Outstanding Balance Monitoring',
    desc: 'Monitors net subscriber debt exposure',
  },
  {
    key: 'paymentTimingChanges',
    label: 'Payment Behaviour Change Monitoring',
    desc: 'Detects unexpected drift from usual payment date',
  },
  {
    key: 'auctionBehaviourChanges',
    label: 'Auction Behaviour Monitoring',
    desc: 'Monitors sudden high-discount distress bidding',
  },
]

export function RiskAndAuditSection({
  riskConfig,
  onUpdateRisk,
  onToggleSignal,
  audit,
  isVerifying,
  onVerify,
  history,
  onResetDefaults,
}: RiskAndAuditSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<LedgerVerificationResult | undefined>(undefined)

  const activeModalData = modalData || audit.lastVerification

  const handleToggleMaster = () => {
    const nextVal = !riskConfig.active
    onUpdateRisk(
      { active: nextVal },
      {
        title: `AI Risk Monitoring: ${nextVal ? 'ON' : 'OFF'}`,
        desc: nextVal ? 'AI Risk Monitoring enabled' : 'AI Risk Monitoring paused',
      },
    )
  }

  const handleSelectProfile = (profile: RiskProfile) => {
    const old = riskConfig.profile
    onUpdateRisk(
      { profile },
      {
        title: `Risk profile: ${old} → ${profile}`,
        desc: `Algorithmic sensitivity changed to ${profile}.`,
      },
    )
  }

  const handleVerifyClick = async () => {
    const res = await onVerify()
    setModalData(res)
    setShowModal(true)
  }

  // Show only latest 3 to 5 recent changes
  const recentChanges = history.slice(0, 5)

  return (
    <section
      id="risk-and-audit"
      className="rounded-[16px] border border-border bg-card p-5 sm:p-6 shadow-(--shadow-card) transition-all space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-navy">
                4. Risk Monitoring &amp; Audit
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  riskConfig.active
                    ? 'border border-emerald/20 bg-emerald/10 text-emerald-dark'
                    : 'border border-slate-300 bg-slate-100 text-muted'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    riskConfig.active ? 'bg-emerald animate-pulse' : 'bg-slate-400'
                  }`}
                />
                AI Risk Monitoring: {riskConfig.active ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Configure telemetry risk signals, sensitivity profile, ledger integrity guarantees, and view recent changes.
            </p>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto rounded-xl border border-border bg-background px-3 py-1.5">
          <span className="text-xs font-bold text-navy">AI Risk Engine</span>
          <button
            type="button"
            role="switch"
            aria-checked={riskConfig.active}
            onClick={handleToggleMaster}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              riskConfig.active ? 'bg-emerald' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                riskConfig.active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SUBSECTION A: AI RISK MONITORING */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-emerald" />
            A. AI Risk Monitoring &amp; Sensitivity Profile
          </span>
          <span className="text-xs text-muted">
            Current Profile: <strong className="text-emerald-dark">{riskConfig.profile}</strong>
          </span>
        </div>

        {/* Sensitivity Profiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PROFILES.map((p) => {
            const isSelected = riskConfig.profile === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProfile(p.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-emerald bg-emerald/10 ring-1 ring-emerald shadow-xs'
                    : 'border-border bg-background/50 hover:bg-background'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy">{p.label}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-emerald-dark bg-emerald/20 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted">{p.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Ethical Explanation Card */}
        <div className="rounded-xl border border-emerald/20 bg-emerald/5 px-3.5 py-2.5 flex items-start gap-2.5 text-xs">
          <Info className="h-4 w-4 text-emerald shrink-0 mt-0.5" />
          <p className="text-emerald-dark font-medium leading-relaxed">
            &ldquo;{riskConfig.policyDisclaimer}&rdquo;
          </p>
        </div>

        {/* 5 Configurable Monitoring Signals */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
            Active Telemetry Signals ({Object.values(riskConfig.signals).filter(Boolean).length}/5)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {SIGNALS_META.map((sig) => {
              const isEnabled = riskConfig.signals[sig.key]
              return (
                <div
                  key={sig.key}
                  className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                    isEnabled
                      ? 'border-border bg-background/70'
                      : 'border-border/60 bg-background/20 opacity-70'
                  }`}
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-navy">{sig.label}</p>
                    <p className="text-[10px] text-muted mt-0.5">{sig.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => onToggleSignal(sig.key)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-emerald' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* SUBSECTION B: AUDIT & TRANSPARENCY */}
      <div className="pt-4 border-t border-border/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald" />
              B. Audit &amp; Transparency
            </span>
            <p className="mt-0.5 text-xs text-muted">
              Tamper-evident guarantees enforcing immutable transaction journaling.
            </p>
          </div>

          <Button
            onClick={handleVerifyClick}
            disabled={isVerifying}
            variant="default"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-xs shrink-0 self-start sm:self-auto"
          >
            {isVerifying ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Scanning Ledger…
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Verify Ledger Integrity
              </>
            )}
          </Button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              Audit Trail
            </span>
            <p className="mt-1 text-xs font-bold text-emerald-dark">● {audit.auditTrail}</p>
            <p className="mt-0.5 text-[10px] text-muted">Signed change logs</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              Transaction History
            </span>
            <p className="mt-1 text-xs font-bold text-emerald-dark">● {audit.transactionHistory}</p>
            <p className="mt-0.5 text-[10px] text-muted">Permanent records</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              Record Editing
            </span>
            <p className="mt-1 text-xs font-bold text-navy">● {audit.recordEditing}</p>
            <p className="mt-0.5 text-[10px] text-muted">Zero in-place mutation</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              Corrections
            </span>
            <p className="mt-1 text-xs font-bold text-blue-700">New Adjustment Entry</p>
            <p className="mt-0.5 text-[10px] text-muted">Double-entry balanced</p>
          </div>
        </div>

        {/* Compact Verification Result */}
        {audit.lastVerification && (
          <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
              <div>
                <span className="font-bold text-navy">
                  Ledger Verified ({audit.lastVerification.txCount} txs • {audit.lastVerification.totalVolume}):
                </span>{' '}
                <span className="text-muted text-[11px] font-mono">{audit.lastVerification.checksum.slice(0, 24)}…</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setModalData(audit.lastVerification)
                setShowModal(true)
              }}
              className="text-xs font-bold text-emerald hover:underline shrink-0"
            >
              Report Details →
            </button>
          </div>
        )}
      </div>

      {/* SUBSECTION C: RECENT CHANGES (Latest 3-5 only) */}
      <div className="pt-4 border-t border-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-emerald" />
            Recent Changes (Latest Activity)
          </span>
          {onResetDefaults && (
            <button
              type="button"
              onClick={onResetDefaults}
              className="text-[11px] text-muted hover:text-navy flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset Defaults
            </button>
          )}
        </div>

        <div className="divide-y divide-border/60 rounded-xl border border-border bg-background/40 overflow-hidden">
          {recentChanges.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted">No changes recorded yet.</div>
          ) : (
            recentChanges.map((change) => (
              <div key={change.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="rounded bg-navy/5 px-1.5 py-0.5 text-[10px] font-bold text-navy shrink-0">
                    {change.category}
                  </span>
                  <div className="truncate">
                    <p className="font-bold text-navy truncate">{change.title}</p>
                    <p className="text-[11px] text-muted truncate">{change.description}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted shrink-0 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {change.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && activeModalData && (
        <LedgerVerificationModal
          data={activeModalData}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  )
}
