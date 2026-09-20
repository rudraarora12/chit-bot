import { Receipt, Gavel, History, Activity, ShieldAlert, BookOpenCheck } from 'lucide-react'
import { transparencyContent } from '@/data/landing'

export function TrustImpactSection() {
  const icons = [Receipt, Gavel, History, Activity, ShieldAlert, BookOpenCheck]

  return (
    <section id="about" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="max-w-2xl">
        <p className="inline-flex items-center rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
          {transparencyContent.eyebrow}
        </p>
        <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
          {transparencyContent.heading}
        </h2>
        <p className="mt-4 text-[15.5px] leading-7 text-muted">
          {transparencyContent.supporting}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {transparencyContent.pillars.map((item, index) => {
          const Icon = icons[index % icons.length]
          return (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-[16px] border border-border bg-card p-6 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/30"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-emerald/20 bg-emerald/8 text-emerald-dark">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[17px] font-bold tracking-tight text-navy">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-6 text-muted">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 border-t border-border/60 pt-3.5 flex items-center gap-2 text-[11.5px] font-semibold text-emerald-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                Verified & Transparent
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
