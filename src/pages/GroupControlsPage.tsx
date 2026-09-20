import { useState } from 'react'
import {
  SlidersHorizontal,
  Building2,
  CreditCard,
  Gavel,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { useGroupControls } from '@/hooks/useGroupControls'
import { GroupConfigSection } from '@/components/groupControls/GroupConfigSection'
import { PaymentRulesSection } from '@/components/groupControls/PaymentRulesSection'
import { AuctionRulesSection } from '@/components/groupControls/AuctionRulesSection'
import { RiskAndAuditSection } from '@/components/groupControls/RiskAndAuditSection'

const NAV_SECTIONS = [
  { id: 'group-configuration', label: '1. Group Rules', icon: Building2 },
  { id: 'payment-rules', label: '2. Payments & Collections', icon: CreditCard },
  { id: 'auction-rules', label: '3. Auction Rules', icon: Gavel },
  { id: 'risk-and-audit', label: '4. Risk & Audit', icon: ShieldCheck },
]

export default function GroupControlsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const {
    state,
    savedNotice,
    isVerifying,
    updateGroupConfig,
    updateAuctionRules,
    updatePaymentRules,
    updateRiskConfig,
    toggleRiskSignal,
    verifyLedgerIntegrity,
    resetToDefaults,
  } = useGroupControls()

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Persistent / Mobile Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header */}
        <TopBar
          currentCycle={state.groupConfig.currentCycle}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-20">
          {/* Breadcrumb & Main Title Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-navy font-bold">Group Controls &amp; Trust</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy flex items-center gap-2.5">
                  <SlidersHorizontal className="h-7 w-7 text-emerald" />
                  Group Controls &amp; Trust
                </h1>
                <p className="mt-1 text-xs text-muted sm:text-sm max-w-3xl">
                  Configure the rules that power your group&apos;s payments, auctions and risk monitoring.
                </p>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {savedNotice && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald-dark animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
                    <span>{savedNotice}</span>
                  </div>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-navy shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                  Cycle {state.groupConfig.currentCycle} Active
                </span>
              </div>
            </div>
          </div>

          {/* Clean 4-Section Jump Bar */}
          <div className="sticky top-[68px] z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2 bg-background/90 backdrop-blur-md border-b border-border/70 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {NAV_SECTIONS.map((sec) => {
                const Icon = sec.icon
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-navy hover:border-emerald/40 hover:text-emerald hover:bg-emerald/5 transition-all shadow-xs"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted" />
                    <span>{sec.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 1: Group Configuration */}
          <GroupConfigSection
            config={state.groupConfig}
            onUpdate={updateGroupConfig}
          />

          {/* Section 2: Payment & Collection Rules */}
          <PaymentRulesSection
            rules={state.paymentRules}
            onUpdate={updatePaymentRules}
          />

          {/* Section 3: Auction Rules */}
          <AuctionRulesSection
            rules={state.auctionRules}
            onUpdate={updateAuctionRules}
          />

          {/* Section 4: Risk Monitoring & Audit */}
          <RiskAndAuditSection
            riskConfig={state.riskConfig}
            onUpdateRisk={updateRiskConfig}
            onToggleSignal={toggleRiskSignal}
            audit={state.audit}
            isVerifying={isVerifying}
            onVerify={verifyLedgerIntegrity}
            history={state.history}
            onResetDefaults={resetToDefaults}
          />
        </main>
      </div>
    </div>
  )
}
