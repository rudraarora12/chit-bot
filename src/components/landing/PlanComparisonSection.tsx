import { Check, Minus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { comparisonTableContent } from '@/data/landing'
import { Button } from '@/components/ui/button'

export function PlanComparisonSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="max-w-2xl">
        <p className="inline-flex items-center rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
          {comparisonTableContent.eyebrow}
        </p>
        <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
          {comparisonTableContent.heading}
        </h2>
        <p className="mt-4 text-[15.5px] leading-7 text-muted">
          {comparisonTableContent.subtitle}
        </p>
      </div>

      {/* Distinction Highlights Banner */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-border bg-card p-4.5 flex items-center gap-3.5">
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-navy shrink-0">
            01
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-muted">Chit Members</p>
            <p className="text-[14px] font-extrabold text-navy">Join and participate for FREE</p>
          </div>
        </div>

        <div className="rounded-[14px] border border-emerald/30 bg-emerald/5 p-4.5 flex items-center gap-3.5">
          <div className="h-9 w-9 rounded-full bg-emerald text-white flex items-center justify-center font-black text-xs shrink-0">
            02
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-emerald-dark">Chit Organizers</p>
            <p className="text-[14px] font-extrabold text-navy">Create and operate for ₹499/month</p>
          </div>
        </div>
      </div>

      {/* Responsive Comparison Table */}
      <div className="mt-10 overflow-hidden rounded-[18px] border border-border bg-card shadow-(--shadow-card)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/80">
                <th className="py-4.5 px-6 text-[13px] font-extrabold uppercase tracking-wider text-navy">
                  Feature / Capability
                </th>
                <th className="py-4.5 px-6 text-center text-[13px] font-extrabold uppercase tracking-wider text-navy">
                  <div className="flex flex-col items-center">
                    <span>Member</span>
                    <span className="mt-0.5 text-[11px] font-bold text-emerald-dark bg-emerald/10 px-2 py-0.5 rounded-full">
                      FREE
                    </span>
                  </div>
                </th>
                <th className="py-4.5 px-6 text-center text-[13px] font-extrabold uppercase tracking-wider text-navy bg-emerald/5 border-l border-border">
                  <div className="flex flex-col items-center">
                    <span>Organizer</span>
                    <span className="mt-0.5 text-[11px] font-black text-white bg-emerald px-2.5 py-0.5 rounded-full">
                      ₹499 / mo
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {comparisonTableContent.rows.map((row) => (
                <tr key={row.feature} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 text-[13.5px] font-semibold text-navy">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {row.member === 'FREE' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[12px] text-emerald-dark bg-emerald/10 px-2.5 py-0.5 rounded-full">
                        <Check className="h-3 w-3 stroke-[3]" />
                        FREE
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center text-muted-foreground/40">
                        <Minus className="h-4 w-4" />
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center bg-emerald/5 border-l border-border">
                    {row.organizer ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald text-white shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center text-muted-foreground/40">
                        <Minus className="h-4 w-4" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-border bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12.5px] text-muted text-center sm:text-left">
            Ready to lead your own chit fund with automated ledgers and live reverse auctions?
          </p>
          <Link to="/subscription" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto bg-emerald hover:bg-emerald-dark text-white font-bold text-xs">
              Subscribe as Organizer (₹499/mo)
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
