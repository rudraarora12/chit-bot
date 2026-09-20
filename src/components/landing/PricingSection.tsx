import { Check, Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { organizerPlanContent } from '@/data/landing'
import { Button } from '@/components/ui/button'

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="text-center max-w-2xl mx-auto">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
          <Sparkles className="h-3.5 w-3.5 text-emerald" />
          {organizerPlanContent.eyebrow}
        </p>
        <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
          Simple, Predictable Organizer Pricing
        </h2>
        <p className="mt-4 text-[15.5px] leading-7 text-muted">
          Chit members participate completely free. Organizers pay a flat ₹499/month for full platform powers.
        </p>
      </div>

      <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.25fr] gap-6 items-stretch">
        {/* Free Member Plan Card */}
        <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider">
              For Participants
            </span>

            <h3 className="mt-4 text-[22px] font-extrabold text-navy">
              Chit Member
            </h3>
            <p className="mt-2 text-[13px] text-muted leading-relaxed">
              For individuals participating in community chit fund committees.
            </p>

            <div className="mt-6 pb-6 border-b border-border flex items-baseline gap-2">
              <span className="text-[38px] font-black text-navy font-mono">₹0</span>
              <span className="text-[13px] font-bold text-emerald-dark uppercase tracking-wide">Free Forever</span>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                'Browse & join chit committees',
                'Track personal contributions & payments',
                'Participate in live reverse auctions',
                'View auction results & dividend shares',
                'Ask AI assistant about personal status',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[13px] text-navy-soft">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Link to="/committees">
              <Button variant="outline" className="w-full font-bold text-xs py-2.5 border-border hover:bg-slate-50">
                Explore as a Member
              </Button>
            </Link>
          </div>
        </div>

        {/* Paid Organizer Plan Card */}
        <div className="rounded-[22px] border-2 border-emerald bg-card p-6 sm:p-8 shadow-(--shadow-preview) flex flex-col justify-between relative overflow-hidden">
          {/* Top highlight ribbon */}
          <div className="absolute top-0 right-0 bg-emerald text-white px-4 py-1 text-[10.5px] font-extrabold uppercase tracking-wider rounded-bl-[12px] shadow-xs">
            Most Popular
          </div>

          <div>
            <span className="rounded-full bg-emerald/10 text-emerald-dark px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider border border-emerald/20">
              For Group Leaders
            </span>

            <h3 className="mt-4 text-[24px] font-black text-navy">
              {organizerPlanContent.planName}
            </h3>
            <p className="mt-2 text-[13.5px] text-muted leading-relaxed">
              {organizerPlanContent.subtitle}
            </p>

            <div className="mt-6 pb-6 border-b border-border flex items-baseline gap-1.5">
              <span className="text-[44px] font-black text-navy font-mono">{organizerPlanContent.price}</span>
              <span className="text-[15px] font-semibold text-muted">{organizerPlanContent.period}</span>
              <span className="ml-2 text-[11px] font-bold text-emerald-dark bg-emerald/10 px-2 py-0.5 rounded-full">
                Billed monthly
              </span>
            </div>

            <p className="mt-4 text-[12px] font-bold text-navy uppercase tracking-wider">
              Included in Organizer Plan:
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {organizerPlanContent.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-[12.5px] text-navy font-medium">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-emerald-dark mt-0.5">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Link to={organizerPlanContent.ctaHref}>
              <Button size="lg" className="w-full font-black text-sm bg-emerald hover:bg-emerald-dark text-white shadow-lg shadow-emerald/25 py-3 transition-all hover:scale-[1.01]">
                {organizerPlanContent.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-center text-[11px] text-muted">
              Instant activation • No hidden charges • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
