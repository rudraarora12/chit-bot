<<<<<<< Updated upstream
import { LayoutDashboard, Users, Gavel, ShieldAlert, Bot, SlidersHorizontal, X } from 'lucide-react'
=======
import { LayoutDashboard, Users, Gavel, ShieldAlert, SlidersHorizontal, Bot, X } from 'lucide-react'
>>>>>>> Stashed changes
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/landing/Logo'

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Members', href: '/members', icon: Users },
  { label: 'Auction & Ledger', href: '/auction', icon: Gavel },
  { label: 'Risk Monitoring', href: '/risk', icon: ShieldAlert },
  { label: 'AI Assistant', href: '/assistant', icon: Bot },
  { label: 'Group Controls', href: '/settings', icon: SlidersHorizontal },
]

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation()

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      <div>
        <div className="flex items-center justify-between pb-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-muted hover:bg-background lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href)

            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald/10 text-emerald-dark'
                    : 'text-muted hover:bg-background hover:text-navy'
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? 'text-emerald' : 'text-muted group-hover:text-navy'
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-[12px] border border-border bg-background/80 p-3.5">
          <div className="flex items-center gap-2 text-emerald-dark">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase">Chit Ledger Operating</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Organizer workflow: members, collections, auctions and risk
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-card lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-navy/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[80vw] border-r border-border bg-card shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
