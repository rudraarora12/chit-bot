import { useState, useEffect, useCallback } from 'react'
import { Show, RedirectToSignIn } from '@clerk/react'
import { io } from 'socket.io-client'
import type { DashboardData } from '@/data/dashboard'
import { dashboardService } from '@/services/dashboardService'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CurrentAuctionCard } from '@/components/dashboard/CurrentAuctionCard'
import { CollectionOverviewCard } from '@/components/dashboard/CollectionOverviewCard'
import { PaymentStatusCard } from '@/components/dashboard/PaymentStatusCard'
import { RiskAlertsCard } from '@/components/dashboard/RiskAlertsCard'
import { RecentLedgerCard } from '@/components/dashboard/RecentLedgerCard'

export default function DashboardPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    setError(null)
    try {
      const realData = await dashboardService.fetchDashboardData()
      setData(realData)
    } catch (err) {
      console.error('Error loading real-time dashboard metrics:', err)
      setError('Unable to connect to live backend. Please verify backend server is running.')
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData(true)
    const socket = io('http://127.0.0.1:5050', { transports: ['websocket', 'polling'] })
    const refresh = () => loadDashboardData(false)
;['memberCreated', 'memberUpdated', 'memberDeleted', 'paymentUpdated', 'contributionCreated', 'auctionCreated', 'auctionUpdated', 'riskUpdated'].forEach((event) => socket.on(event, refresh))
    return () => { socket.disconnect() }
  }, [loadDashboardData])

  return (
    <>
      <Show when="signed-in">
        <div className="flex min-h-screen bg-background text-foreground antialiased">
          {/* Sidebar Navigation */}
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Layout Area */}
          <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
            {/* Top Bar Header */}
            <TopBar
              currentCycle={data?.currentCycle ?? null}
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            />

            {/* Dashboard Content Workspace */}
            <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {/* Header Context & Quick Actions Bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-navy">
                    Organizer Control Center
                  </h2>
                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Real-time status of capital collections, reverse auctions, ledger integrity, and AI risk telemetry from MongoDB.
                  </p>
                </div>

                <QuickActions />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-muted text-sm font-medium">
                  Loading real-time MongoDB dashboard metrics...
                </div>
              ) : data ? (
                <>
                  {/* 5 Core Summary Cards */}
                  <SummaryCards stats={data.summaryStats} />

                  {/* Primary Grid: Current Auction & Collections & Payment Status */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                      <CurrentAuctionCard auction={data.currentAuction} />
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:col-span-5 sm:grid-cols-2 lg:grid-cols-1">
                      <CollectionOverviewCard collection={data.collectionOverview} />
                      <PaymentStatusCard status={data.paymentStatus} />
                    </div>
                  </div>

                  {/* Secondary Grid: AI Risk Alerts & Recent Activity / Ledger */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <RiskAlertsCard alerts={data.riskAlerts} />
                    </div>
                    <div className="lg:col-span-7">
                      <RecentLedgerCard transactions={data.recentTransactions} />
                    </div>
                  </div>
                </>
              ) : null}
            </main>
          </div>
        </div>
      </Show>

      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  )
}
