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

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-[13.5px] font-medium text-muted transition-colors hover:text-navy"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-[13.5px] font-medium text-muted transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <Show when="signed-out">
            <Link to="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mr-2">
                Dashboard
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
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-navy-soft hover:text-emerald-dark"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-navy-soft"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
          <div className="mt-4 flex gap-2">
            <Show when="signed-out">
              <Link to="/sign-in" className="flex-1">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up" className="flex-1">
                <Button className="w-full">Get Started</Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Dashboard
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
