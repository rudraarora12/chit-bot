import { PlusCircle, Users, Wallet, Gavel, ShieldAlert, BarChart3, ArrowRight } from 'lucide-react'
import { solutionLifecycleContent } from '@/data/landing'

export function SolutionLifecycleSection() {
  const stepIcons = [PlusCircle, Users, Wallet, Gavel, ShieldAlert, BarChart3]

  return (
    <section id="lifecycle" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="max-w-2xl">
        <p className="inline-flex items-center rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
          {solutionLifecycleContent.eyebrow}
        </p>
        <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
          {solutionLifecycleContent.heading}
        </h2>
        <p className="mt-4 text-[15.5px] leading-7 text-muted">
          {solutionLifecycleContent.subtitle}
        </p>
      </div>

      {/* Visual Flow Grid */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 relative">
        {solutionLifecycleContent.steps.map((step, index) => {
          const Icon = stepIcons[index % stepIcons.length]
          const isLast = index === solutionLifecycleContent.steps.length - 1

          return (
            <div key={step.code} className="relative flex flex-col">
              <div className="flex flex-1 flex-col justify-between rounded-[14px] border border-border bg-card p-5 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:border-emerald/40 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-extrabold text-emerald-dark bg-emerald/10 px-2 py-0.5 rounded-[6px] border border-emerald/20">
                      {step.code}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-emerald-dark">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-[16px] font-bold tracking-tight text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-5 text-muted">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-dark">
                  <span>Step {step.tag} of 06</span>
                </div>
              </div>

              {/* Connecting indicator on large screens */}
              {!isLast && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-xs">
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
