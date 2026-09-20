import { Menu, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/react'

interface TopBarProps {
  currentCycle: number | null
  onOpenMobileSidebar: () => void
}

export function TopBar({
  currentCycle,
  onOpenMobileSidebar,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-[6px] sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-navy lg:hidden hover:bg-background"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight text-navy sm:text-xl">
              Overview
            </h1>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-dark sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
              {currentCycle ? `Cycle ${currentCycle}` : 'No active cycle'}
            </span>
          </div>
          <p className="text-[12px] font-medium text-muted">
            ChitLedger Organizer Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Cycle indicator */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/10 px-2 py-0.5 text-[10px] font-bold text-emerald-dark sm:hidden">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          {currentCycle ? `Cycle ${currentCycle}` : 'No active cycle'}
        </span>

        {/* PRO • ₹499/month badge near account profile */}
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-2.5 py-1 text-[11px] font-extrabold text-emerald-dark shadow-xs">
          <Sparkles className="h-3 w-3 text-emerald" />
          <span>PRO • ₹499/month</span>
        </span>

        {/* View Plan button navigating to /subscription */}
        <Link
          to="/subscription"
          className="inline-flex items-center gap-1 rounded-[8px] border border-emerald/30 bg-emerald/5 hover:bg-emerald/15 px-2.5 py-1 text-[11.5px] font-bold text-emerald-dark transition-colors shadow-xs"
        >
          <span>View Plan</span>
          <ArrowRight className="h-3 w-3" />
        </Link>

        {/* Account Profile Box */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1 pr-3 pl-1.5">
          <UserButton />
          <span className="hidden text-[13px] font-semibold text-navy md:inline">
            Organizer Account
          </span>
        </div>
      </div>
    </header>
  )
}
