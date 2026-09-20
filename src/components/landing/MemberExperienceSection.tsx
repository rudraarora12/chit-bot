import { Check, HeartHandshake, Sparkles, UserCheck, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { memberExperienceContent } from '@/data/landing'
import { Button } from '@/components/ui/button'

export function MemberExperienceSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="rounded-[20px] border border-border bg-card p-6 sm:p-10 shadow-(--shadow-card)">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
                <HeartHandshake className="h-3.5 w-3.5" />
                {memberExperienceContent.eyebrow}
              </span>
              <span className="rounded-full bg-emerald text-white px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase shadow-xs">
                {memberExperienceContent.badge}
              </span>
            </div>

            <h2 className="mt-5 text-[28px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[36px]">
              {memberExperienceContent.heading}
            </h2>

            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              {memberExperienceContent.supportingMessage}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {memberExperienceContent.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5 text-[13.5px] text-navy font-medium">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-emerald-dark mt-0.5">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border/80 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link to="/committees">
                <Button size="sm" variant="outline" className="font-bold border-emerald/30 text-emerald-dark hover:bg-emerald/5">
                  Browse Public Committees
                </Button>
              </Link>
              <span className="text-[12px] text-muted font-medium">
                No credit card or payment required for chit members.
              </span>
            </div>
          </div>

          {/* Member Preview Card Visual */}
          <div className="rounded-[16px] border border-border bg-background p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-white font-bold text-sm">
                  PK
                </div>
                <div>
                  <p className="text-[14px] font-bold text-navy">Priya Krishnan</p>
                  <p className="text-[11.5px] text-muted">Member Portal • Series 24</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald/25 bg-emerald/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-dark">
                Active Member (FREE)
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="rounded-[10px] border border-border bg-card p-3 flex justify-between items-center text-xs">
                <span className="text-muted font-medium">My Total Contributions</span>
                <span className="font-bold text-navy font-mono">₹45,000 (18/20 Paid)</span>
              </div>
              <div className="rounded-[10px] border border-border bg-card p-3 flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Next Live Auction</span>
                <span className="font-bold text-emerald-dark font-mono">Friday, 4:00 PM IST</span>
              </div>
              <div className="rounded-[10px] border border-border bg-card p-3 flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Accrued Dividend Benefit</span>
                <span className="font-bold text-navy font-mono">₹6,400 earned</span>
              </div>
            </div>

            <div className="mt-4 rounded-[10px] bg-indigo/5 border border-indigo/20 p-3">
              <div className="flex items-center gap-1.5 text-indigo text-xs font-bold mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Member Assistant</span>
              </div>
              <p className="text-[11.5px] text-navy-soft leading-relaxed italic">
                "Your next installment of ₹2,500 is due on the 5th. You have 0 overdue payments and are eligible for the Series 24 round."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
