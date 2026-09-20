import {
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Hash,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LedgerVerificationResult } from '@/data/groupControls'

interface LedgerVerificationModalProps {
  data: LedgerVerificationResult
  onClose: () => void
}

export function LedgerVerificationModal({ data, onClose }: LedgerVerificationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-navy">
                  Ledger Cryptographic Integrity Report
                </h3>
                <span className="rounded-full bg-emerald/10 border border-emerald/20 px-2 py-0.5 text-[10px] font-bold text-emerald-dark">
                  Passed (0 Errors)
                </span>
              </div>
              <p className="text-xs text-muted">
                Sequential hash-verification performed across immutable journal records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-navy transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Verification Metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Audit Status
            </span>
            <p className="mt-1 text-xs font-bold text-emerald-dark flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
              Verified Valid
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Transactions Audited
            </span>
            <p className="mt-1 text-xs font-bold text-navy">{data.txCount} Records</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Total Volume
            </span>
            <p className="mt-1 text-xs font-bold text-navy">{data.totalVolume}</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Audit Timestamp
            </span>
            <p className="mt-1 text-xs font-bold text-navy truncate">{data.verifiedAt}</p>
          </div>
        </div>

        {/* Cryptographic Checksum & Hash Chain */}
        <div className="mt-4 rounded-xl border border-border bg-background/70 p-4 space-y-2.5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Hash className="h-3 w-3 text-emerald" /> Chained SHA-256 Digest
            </span>
            <p className="mt-1 font-mono text-xs font-semibold text-navy break-all bg-card border border-border/80 px-2.5 py-1.5 rounded-lg">
              {data.checksum}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Layers className="h-3 w-3 text-emerald" /> Journal Sequence Hash Continuity
            </span>
            <p className="mt-1 font-mono text-xs text-muted break-all bg-card border border-border/80 px-2.5 py-1.5 rounded-lg">
              {data.hashChain}
            </p>
          </div>
        </div>

        {/* Audit Details Checklist */}
        <div className="mt-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Verification Findings
          </span>
          <div className="space-y-1.5">
            {data.details.map((detail, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-navy-soft">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald mt-0.5" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency note */}
        <div className="mt-4 rounded-lg bg-navy/5 p-3 text-[11px] text-muted flex items-start gap-2">
          <Lock className="h-3.5 w-3.5 text-navy shrink-0 mt-0.5" />
          <span>
            <strong>Deterministic Cryptographic Journaling:</strong> ChitLedger uses immutable linear hashing to detect unauthorized record deletion or modification without relying on speculative third-party networks.
          </span>
        </div>

        {/* Close Button */}
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose} variant="default" size="sm" className="h-9 px-4 rounded-lg text-xs font-semibold">
            Done &amp; Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
