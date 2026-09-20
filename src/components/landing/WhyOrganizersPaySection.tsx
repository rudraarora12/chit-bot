import { XCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { whyOrganizersPayContent } from '@/data/landing'
import { Button } from '@/components/ui/button'

export function WhyOrganizersPaySection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="max-w-2xl">
        <p className="inline-flex items-center rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
          {whyOrganizersPayContent.eyebrow}
        </p>
        <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
          {whyOrganizersPayContent.heading}
        </h2>
        <p className="mt-4 text-[15.5px] leading-7 text-muted">
          {whyOrganizersPayContent.subtitle}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Without ChitLedger */}
        <div className="rounded-[18px] border border-rose-200/80 bg-rose-50/30 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-rose-200/60">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full border border-rose-200">
                  Legacy Approach
                </span>
                <h3 className="mt-3 text-[20px] font-extrabold text-navy">
                  Without ChitLedger
                </h3>
              </div>
              <span className="text-[20px] font-bold text-rose-500">✕</span>
            </div>

            <p className="mt-4 text-[13px] text-muted">
              Managing groups manually with fragmented offline records and chat apps creates confusion and risk.
            </p>

            <ul className="mt-6 space-y-3.5">
              {whyOrganizersPayContent.withoutChitLedger.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[13.5px] text-navy-soft">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-rose-200/60 text-[12px] text-rose-700 font-medium">
            Result: Hours spent chasing updates and resolving disputes.
          </div>
        </div>

        {/* With ChitLedger */}
        <div className="rounded-[18px] border-2 border-emerald/40 bg-card p-6 sm:p-8 shadow-(--shadow-card) flex flex-col justify-between relative">
          <div className="absolute -top-3 right-6 bg-emerald text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
            ₹499 / month Plan
          </div>

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-dark bg-emerald/10 px-2.5 py-1 rounded-full border border-emerald/20">
                  Modern Chit Operating System
                </span>
                <h3 className="mt-3 text-[20px] font-extrabold text-navy">
                  With ChitLedger Organizer
                </h3>
              </div>
              <ShieldCheck className="h-6 w-6 text-emerald" />
            </div>

            <p className="mt-4 text-[13px] text-muted">
              One organized workspace designed for complete visibility, transparency, and operational ease.
            </p>

            <ul className="mt-6 space-y-3.5">
              {whyOrganizersPayContent.withChitLedger.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[13.5px] text-navy font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[12px] text-muted leading-tight">
              Focus on group growth while ChitLedger handles the ledger.
            </div>
            <Link to="/subscription" className="shrink-0">
              <Button size="sm" className="bg-emerald hover:bg-emerald-dark text-white font-bold text-xs">
                Start for ₹499/mo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Operational disclaimer */}
      <div className="mt-6 rounded-[12px] bg-background border border-border p-4 text-center text-[12px] text-muted">
        {whyOrganizersPayContent.disclaimer}
      </div>
    </section>
  )
}
