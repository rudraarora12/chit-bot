import { ArrowRight, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { finalCtaContent } from '@/data/landing'

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <div className="relative overflow-hidden rounded-[24px] border border-border/20 bg-navy px-6 py-14 text-center sm:px-12 sm:py-16 md:px-16 shadow-xl">
        {/* Subtle decorative background glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-emerald/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/15 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-teal uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            {finalCtaContent.eyebrow}
          </p>

          <h2 className="mt-5 text-[32px] leading-[1.12] font-black tracking-[-0.03em] text-white sm:text-[44px]">
            {finalCtaContent.heading}
          </h2>

          <p className="mt-3 text-[17px] font-medium text-emerald-200">
            {finalCtaContent.subtitle}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-white text-xs font-semibold">
            <span className="font-mono text-base font-extrabold text-emerald-300">{finalCtaContent.price}</span>
            <span>{finalCtaContent.period}</span>
            <span className="text-white/40">•</span>
            <span>{finalCtaContent.planLabel}</span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link to={finalCtaContent.primaryCtaHref} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-emerald text-white hover:bg-emerald-dark font-bold text-sm shadow-lg shadow-emerald/30 py-3 px-8">
                {finalCtaContent.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href={finalCtaContent.secondaryCtaHref} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white font-semibold text-sm py-3 px-6"
              >
                <Compass className="h-4 w-4 text-emerald-300" />
                {finalCtaContent.secondaryCta}
              </Button>
            </a>
          </div>

          <p className="mt-6 text-[12px] text-gray-400">
            {finalCtaContent.valueBadge}
          </p>
        </div>
      </div>
    </section>
  )
}
