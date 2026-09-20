import {
  FolderPlus,
  Users2,
  BookOpenCheck,
  Gavel,
  ShieldAlert,
  Bot,
  RefreshCw,
  LineChart,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { organizerFeaturesContent } from '@/data/landing'
import { Button } from '@/components/ui/button'

export function ProductFeatures() {
  const iconMap: Record<string, any> = {
    f1: FolderPlus,
    f2: Users2,
    f3: BookOpenCheck,
    f4: Gavel,
    f5: ShieldAlert,
    f6: Bot,
    f7: RefreshCw,
    f8: LineChart,
  }

  return (
    <section id="product" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-dark uppercase">
            <Sparkles className="h-3.5 w-3.5 text-emerald" />
            {organizerFeaturesContent.eyebrow}
          </p>
          <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
            {organizerFeaturesContent.heading}
          </h2>
          <p className="mt-4 text-[15.5px] leading-7 text-muted">
            {organizerFeaturesContent.subtitle}
          </p>
        </div>

        <div className="shrink-0">
          <Link to="/subscription">
            <Button className="bg-emerald hover:bg-emerald-dark text-white font-bold text-xs px-5 py-2.5 shadow-sm">
              Unlock Organizer Suite (₹499/mo)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 Feature Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {organizerFeaturesContent.features.map((feature) => {
          const Icon = iconMap[feature.id] || BookOpenCheck

          return (
            <div
              key={feature.id}
              className="group relative flex flex-col justify-between rounded-[16px] border border-border bg-card p-6 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:border-emerald/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-emerald/18 bg-emerald/8 text-emerald-dark transition-colors group-hover:bg-emerald group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-muted uppercase">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-[17px] font-bold tracking-tight text-navy">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-6 text-muted">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 border-t border-border/70 pt-4 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-emerald-dark flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                  Organizer Tool
                </span>
                <span className="text-muted text-[11px]">Included</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
