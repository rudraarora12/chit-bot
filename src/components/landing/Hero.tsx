import { ArrowRight, ArrowDownCircle, Shield, CheckCircle2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { Button } from '@/components/ui/button'
import { heroContent } from '@/data/landing'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-12 lg:pt-14 lg:pb-16 border-b border-border/60 bg-gradient-to-b from-card/60 via-background to-background">
      {/* Decorative gradient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[900px] rounded-full bg-emerald/10 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 relative z-10">
        <div>
          {/* Business Model Pill */}
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald/25 bg-emerald/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.06em] text-emerald-dark uppercase">
            <Sparkles className="h-3.5 w-3.5 text-emerald shrink-0" />
            <span>Digital Chit Fund Platform</span>
            <span className="h-1 w-1 rounded-full bg-emerald-dark/50" />
            <span className="text-emerald-900 font-extrabold">Members Free</span>
            <span className="h-1 w-1 rounded-full bg-emerald-dark/50" />
            <span className="text-emerald-900 font-extrabold">Organizers ₹499/mo</span>
          </div>

          <h1 className="mt-5 text-[38px] leading-[1.08] font-black tracking-[-0.038em] text-navy sm:text-[48px] lg:text-[54px]">
            {heroContent.heading}
          </h1>

          <p className="mt-5 max-w-[34rem] text-[16px] leading-relaxed text-muted font-normal">
            {heroContent.supporting}
          </p>

          <p className="mt-3 text-[13.5px] font-semibold text-emerald-dark flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald inline-block animate-pulse" />
            {heroContent.trustNote}
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <Link to={heroContent.primaryCtaHref}>
              <Button size="lg" className="w-full sm:w-auto font-bold bg-emerald hover:bg-emerald-dark text-white shadow-md shadow-emerald/20 transition-all hover:scale-[1.02]">
                {heroContent.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href={heroContent.secondaryCtaHref}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold border-border bg-card hover:bg-slate-50 text-navy transition-all">
                <ArrowDownCircle className="h-4 w-4 text-emerald" />
                {heroContent.secondaryCta}
              </Button>
            </a>
          </div>

          {/* Quick Value Indicators */}
          <div className="mt-8 pt-6 border-t border-border/80">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
              {heroContent.trustIndicators.map((item, i) => (
                <div key={item} className="flex items-center gap-2 text-[12.5px] font-medium text-navy-soft">
                  <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard preview on right */}
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-[22px] bg-gradient-to-tr from-emerald/20 to-teal/10 blur-md -z-10" />
          <DashboardPreview />
        </div>
      </div>
    </section>
  )
}
