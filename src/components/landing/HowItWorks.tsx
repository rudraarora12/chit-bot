import { CreditCard, PlusCircle, UserPlus, PlayCircle, ShieldCheck, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { howItWorksOrganizerContent } from '@/data/landing'
import { Button } from '@/components/ui/button'

export function HowItWorks() {
  const stepIcons = [CreditCard, PlusCircle, UserPlus, PlayCircle, ShieldCheck]

  return (
    <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
            {howItWorksOrganizerContent.eyebrow}
          </p>
          <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
            {howItWorksOrganizerContent.heading}
          </h2>
          <p className="mt-4 text-[15.5px] leading-7 text-muted">
            {howItWorksOrganizerContent.subtitle}
          </p>
        </div>

        <div className="shrink-0">
          <Link to="/subscription">
            <Button className="bg-emerald hover:bg-emerald-dark text-white font-bold text-xs px-5 py-2.5">
              Start Organizing Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 5-Step Organizer Grid */}
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 relative">
        {howItWorksOrganizerContent.steps.map((step, index) => {
          const Icon = stepIcons[index % stepIcons.length]
          const isLast = index === howItWorksOrganizerContent.steps.length - 1

          return (
            <div key={step.number} className="relative flex flex-col">
              <div className="flex flex-1 flex-col justify-between rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:border-emerald/40 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-black text-emerald-dark bg-emerald/10 px-2.5 py-1 rounded-[8px] border border-emerald/20">
                      {step.number}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border text-navy">
                      <Icon className="h-4 w-4 text-emerald-dark" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-[17px] font-bold tracking-tight text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-5 text-muted">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-dark">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                  <span>{step.badge}</span>
                </div>
              </div>

              {/* Connecting arrow for desktop between cards */}
              {!isLast && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs">
                  <ArrowRight className="h-3 w-3 text-emerald-dark" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
