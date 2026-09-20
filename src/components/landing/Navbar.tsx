import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Show, UserButton } from '@clerk/react'
import { Logo } from '@/components/landing/Logo'
import { Button } from '@/components/ui/button'
import { navLinks } from '@/data/landing'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/94 backdrop-blur-[6px]">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isOrganize = link.label === 'Organize'

            if (link.href.startsWith('/')) {
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-[13.5px] font-medium transition-colors ${
                    isOrganize
                      ? 'rounded-full bg-emerald/10 px-3 py-1 font-bold text-emerald-dark border border-emerald/20 hover:bg-emerald/20'
                      : 'text-muted hover:text-navy'
                  }`}
                >
                  {link.label}
                </Link>
              )
            }

            return (
              <a
                key={link.href}
                href={link.href}
                className="text-[13.5px] font-medium text-muted transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Show when="signed-out">
            <Link to="/sign-in">
              <Button variant="ghost" size="sm" className="font-semibold text-xs">
                Sign In
              </Button>
            </Link>
            <Link to="/subscription">
              <Button size="sm" className="bg-emerald hover:bg-emerald-dark text-white font-bold text-xs shadow-xs">
                Start Organizing
              </Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mr-1 font-semibold text-xs">
                Dashboard
              </Button>
            </Link>
            <Link to="/subscription">
              <Button size="sm" className="mr-2 bg-emerald hover:bg-emerald-dark text-white font-bold text-xs">
                Organize
              </Button>
            </Link>
            <UserButton />
          </Show>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border text-navy lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-card px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isOrganize = link.label === 'Organize'

              return link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium ${
                    isOrganize
                      ? 'font-bold text-emerald-dark'
                      : 'text-navy-soft hover:text-emerald-dark'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-navy-soft hover:text-emerald-dark"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>
          <div className="mt-4 flex gap-2">
            <Show when="signed-out">
              <Link to="/sign-in" className="flex-1">
                <Button variant="outline" className="w-full text-xs font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/subscription" className="flex-1">
                <Button className="w-full bg-emerald hover:bg-emerald-dark text-white font-bold text-xs">
                  Start Organizing
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full text-xs font-semibold">
                  Dashboard
                </Button>
              </Link>
              <Link to="/subscription" className="flex-1">
                <Button className="w-full bg-emerald hover:bg-emerald-dark text-white font-bold text-xs">
                  Organize
                </Button>
              </Link>
              <div className="flex items-center justify-center p-2">
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      ) : null}
    </header>
  )
}
