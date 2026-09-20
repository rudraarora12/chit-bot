import React, { useState } from 'react';
import { Menu, X, User, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenDemo?: () => void;
  onGetStarted?: () => void;
  onOpenSignIn?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemo,
  onGetStarted,
  onOpenSignIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform">
                <div className="grid grid-cols-2 gap-1 w-5 h-5">
                  <span className="w-2 h-2 rounded-[2px] bg-emerald-400"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-emerald-600"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-teal-500"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-emerald-300"></span>
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                Chit<span className="text-emerald-600">Ledger</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#product"
              className="hover:text-slate-900 transition-colors"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className="hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#ai-risk-monitoring"
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <span>AI Risk Monitoring</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                V2.4
              </span>
            </a>
            <a
              href="/subscription"
              className="hover:text-slate-900 transition-colors text-emerald-700 font-semibold"
            >
              Organize
            </a>
            <a
              href="#about"
              className="hover:text-slate-900 transition-colors"
            >
              About
            </a>
          </nav>

          {/* Right CTA Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenSignIn || onOpenDemo}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors px-2 py-1 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition active:scale-[0.98] cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              aria-label="User Profile"
              onClick={onOpenSignIn || onOpenDemo}
              className="w-9 h-9 rounded-full bg-slate-900 text-slate-200 hover:text-white flex items-center justify-center shadow-sm hover:bg-slate-800 transition cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <a
            href="#product"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            Product
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            How It Works
          </a>
          <a
            href="#ai-risk-monitoring"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            AI Risk Monitoring
          </a>
          <a
            href="/subscription"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Organize (Subscription)
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            About
          </a>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSignIn) {
                  onOpenSignIn();
                } else if (onOpenDemo) {
                  onOpenDemo();
                }
              }}
              className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
