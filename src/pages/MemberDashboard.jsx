import React, { useState, useEffect, useCallback } from 'react'
import { Show, RedirectToSignIn, useUser, UserButton } from '@clerk/react'
import { Link } from 'react-router-dom'
import { 
  Menu, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Gavel, 
  CreditCard, 
  Bot, 
  Activity, 
  Clock, 
  TrendingUp, 
  Sparkles,
  HelpCircle
} from 'lucide-react'
import MemberSidebar from '@/components/member/MemberSidebar'
import { fetchMemberDashboardData } from '@/services/memberDashboardService'
import './MemberDashboard.css'

export default function MemberDashboard() {
  const { user } = useUser()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiPromptOpen, setAiPromptOpen] = useState(false)

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    setError(null)
    try {
      const emailOrId = user?.primaryEmailAddress?.emailAddress || user?.id
      const data = await fetchMemberDashboardData(emailOrId)
      setDashboardData(data)
    } catch (err) {
      console.error('Error fetching member dashboard data:', err)
      setError('Unable to load member metrics from backend.')
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData(true)
    const interval = setInterval(() => {
      loadData(false)
    }, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const memberName = user?.fullName || dashboardData?.header?.name || 'Chit Member'

  return (
    <>
      <Show when="signed-in">
        <div className="member-dashboard-container">
          {/* Member Sidebar Navigation */}
          <MemberSidebar
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Work Area */}
          <div className="member-dashboard-main">
            {/* Top Bar Header */}
            <header className="member-header-bar">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-navy lg:hidden hover:bg-background"
                  aria-label="Open member navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <div className="member-header-title-group">
                    <h1 className="member-header-name">My Chit Dashboard</h1>
                    <span className="member-badge member-badge-active">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                      {dashboardData?.header?.status || 'Active'}
                    </span>
                    <span className="hidden sm:inline-flex member-badge member-badge-cycle">
                      {dashboardData?.header?.currentCycle || 'Cycle 1 of 12'}
                    </span>
                  </div>
                  <p className="member-header-sub">
                    Welcome back, <strong className="text-navy">{memberName}</strong> ({dashboardData?.header?.memberId || 'CL-001'}) • {dashboardData?.header?.groupName || 'Sharma Community Chit'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1 pr-3 pl-1.5">
                  <UserButton />
                  <span className="hidden text-[13px] font-semibold text-navy md:inline">
                    Member Account
                  </span>
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="member-dashboard-content">
              {error && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {loading || !dashboardData ? (
                <div className="dashboard-loading-state">
                  <div className="spinner-icon" />
                  <p className="text-sm text-muted font-medium">Fetching real-time chit account telemetry...</p>
                </div>
              ) : (
                <>
                  {/* 4 Core Summary Cards */}
                  <div className="member-summary-cards">
                    {/* Card 1: Monthly Contribution */}
                    <div className="member-card">
                      <div className="member-card-title">{dashboardData.cards.monthlyContribution.title}</div>
                      <div className={`member-card-value ${!dashboardData.cards.monthlyContribution.isAvailable ? 'unavailable' : ''}`}>
                        {dashboardData.cards.monthlyContribution.value}
                      </div>
                      <div className="member-card-subtext">{dashboardData.cards.monthlyContribution.subtext}</div>
                    </div>

                    {/* Card 2: Total Contributed */}
                    <div className="member-card">
                      <div className="member-card-title">{dashboardData.cards.totalContributed.title}</div>
                      <div className="member-card-value text-emerald-dark">
                        {dashboardData.cards.totalContributed.value}
                      </div>
                      <div className="member-card-subtext">{dashboardData.cards.totalContributed.subtext}</div>
                    </div>

                    {/* Card 3: Next Payment */}
                    <div className="member-card">
                      <div className="member-card-title">{dashboardData.cards.nextPayment.title}</div>
                      <div className={`member-card-value ${!dashboardData.cards.nextPayment.isAvailable ? 'unavailable' : ''}`}>
                        {dashboardData.cards.nextPayment.value}
                      </div>
                      <div className="member-card-subtext">{dashboardData.cards.nextPayment.subtext}</div>
                    </div>

                    {/* Card 4: Dividend / Benefit */}
                    <div className="member-card">
                      <div className="member-card-title">{dashboardData.cards.dividendBenefit.title}</div>
                      <div className={`member-card-value ${!dashboardData.cards.dividendBenefit.isAvailable ? 'unavailable' : 'text-emerald'}`}>
                        {dashboardData.cards.dividendBenefit.value}
                      </div>
                      <div className="member-card-subtext">{dashboardData.cards.dividendBenefit.subtext}</div>
                    </div>
                  </div>

                  {/* Main Grid Section */}
                  <div className="member-grid-layout">
                    {/* Left Column: Next Auction & Contribution Progress & Activity */}
                    <div className="space-y-6">
                      {/* Next Auction Component */}
                      <div className="auction-banner">
                        <div className="auction-banner-header">
                          <div className="flex items-center gap-2">
                            <Gavel className="h-5 w-5 text-emerald" />
                            <h3 className="text-base font-bold text-white">Next Live Auction</h3>
                          </div>
                          {dashboardData.nextAuction.hasAuction ? (
                            <span className={dashboardData.nextAuction.status === 'Live Auction' ? 'auction-badge-live' : 'auction-badge-scheduled'}>
                              {dashboardData.nextAuction.status}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-semibold">No active auction</span>
                          )}
                        </div>

                        {dashboardData.nextAuction.hasAuction ? (
                          <>
                            <div className="auction-details-grid">
                              <div className="auction-detail-box">
                                <div className="auction-detail-label">Cycle & Date</div>
                                <div className="auction-detail-val">Cycle {dashboardData.nextAuction.cycle} • {dashboardData.nextAuction.dateTime}</div>
                              </div>
                              <div className="auction-detail-box">
                                <div className="auction-detail-label">Total Chit Value</div>
                                <div className="auction-detail-val">{dashboardData.nextAuction.chitValue}</div>
                              </div>
                              <div className="auction-detail-box">
                                <div className="auction-detail-label">Current Highest Bid</div>
                                <div className="auction-detail-val text-emerald-300">{dashboardData.nextAuction.highestBid}</div>
                              </div>
                              <div className="auction-detail-box">
                                <div className="auction-detail-label">Bidding Eligibility</div>
                                <div className="auction-detail-val text-sm font-semibold text-emerald-200">
                                  {dashboardData.nextAuction.eligibility}
                                </div>
                              </div>
                            </div>
                            <Link to="/member/auction" className="btn-auction-cta">
                              <span>Enter Live Auction Room</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </>
                        ) : (
                          <div className="py-6 text-center">
                            <p className="text-sm text-slate-300 mb-3">No upcoming auction scheduled for this cycle yet.</p>
                            <Link to="/member/auction" className="inline-flex items-center gap-2 text-xs font-bold text-emerald hover:underline">
                              <span>View Auction History & Rules</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Contribution Progress */}
                      <div className="member-section-card">
                        <div className="member-section-header">
                          <div className="member-section-title">
                            <TrendingUp className="h-5 w-5 text-emerald" />
                            <span>Contribution Progress</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-dark bg-emerald/10 px-2.5 py-1 rounded-full">
                            {dashboardData.progress.percentage}% Paid
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                            <span>₹{dashboardData.progress.totalContributed.toLocaleString('en-IN')} paid</span>
                            <span>₹{dashboardData.progress.totalExpected.toLocaleString('en-IN')} total expected</span>
                          </div>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${Math.min(100, dashboardData.progress.percentage)}%` }}
                            />
                          </div>
                        </div>

                        <div className="progress-metrics-grid">
                          <div className="progress-metric-item">
                            <div className="progress-metric-label">Completed Cycles</div>
                            <div className="progress-metric-val">{dashboardData.progress.completedCycles} / 12</div>
                          </div>
                          <div className="progress-metric-item">
                            <div className="progress-metric-label">Remaining Dues</div>
                            <div className="progress-metric-val text-slate-700">₹{dashboardData.progress.remainingAmount.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="progress-metric-item">
                            <div className="progress-metric-label">Pending Payments</div>
                            <div className="progress-metric-val text-amber-600">{dashboardData.progress.pendingPaymentsCount}</div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Chit Activity Feed */}
                      <div className="member-section-card">
                        <div className="member-section-header">
                          <div className="member-section-title">
                            <Activity className="h-5 w-5 text-emerald" />
                            <span>Recent Chit Activity</span>
                          </div>
                          <span className="text-xs text-muted">Live MongoDB Feed</span>
                        </div>

                        <div className="activity-feed-list">
                          {dashboardData.recentActivities.map((act) => (
                            <div key={act.id} className="activity-feed-item">
                              <div className={`activity-icon-box ${
                                act.type === 'contribution' ? 'activity-icon-contribution' :
                                act.type === 'payment' ? 'activity-icon-payment' :
                                act.type === 'benefit' ? 'activity-icon-auction' : 'activity-icon-pending'
                              }`}>
                                {act.type === 'contribution' && <CreditCard className="h-4 w-4" />}
                                {act.type === 'payment' && <CheckCircle2 className="h-4 w-4" />}
                                {act.type === 'benefit' && <Sparkles className="h-4 w-4" />}
                                {act.type === 'pending' && <Clock className="h-4 w-4" />}
                              </div>

                              <div className="activity-content">
                                <div className="activity-title">{act.title}</div>
                                <div className="activity-date">{act.date}</div>
                              </div>

                              {act.amount && (
                                <div className="activity-amount">{act.amount}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Payment Health & AI Assistant Card */}
                    <div className="space-y-6">
                      {/* Payment Health Card */}
                      <div className="member-section-card">
                        <div className="member-section-header">
                          <div className="member-section-title">
                            <ShieldCheck className="h-5 w-5 text-emerald" />
                            <span>Payment Health</span>
                          </div>
                          <span className={`health-status-badge ${dashboardData.health.status === 'Healthy' ? 'health-healthy' : 'health-attention'}`}>
                            {dashboardData.health.status === 'Healthy' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            )}
                            {dashboardData.health.status}
                          </span>
                        </div>

                        <p className="text-xs text-muted mb-3">
                          {dashboardData.health.status === 'Healthy' 
                            ? 'Your contribution record is in great standing. Keep up timely payments for maximum bidding eligibility.' 
                            : 'Attention required: Clear pending dues before the next live auction to maintain bidding eligibility.'}
                        </p>

                        <div className="health-breakdown-list">
                          <div className="health-item">
                            <span className="health-item-label">Total Contributions Made</span>
                            <span className="health-item-val">{dashboardData.health.paymentsMade}</span>
                          </div>
                          <div className="health-item">
                            <span className="health-item-label">On-Time Payments</span>
                            <span className="health-item-val text-emerald-dark">{dashboardData.health.onTimePayments}</span>
                          </div>
                          <div className="health-item">
                            <span className="health-item-label">Pending / Overdue Installments</span>
                            <span className="health-item-val text-amber-600">{dashboardData.health.pendingPayments}</span>
                          </div>
                          <div className="health-item">
                            <span className="health-item-label">Missed Payments</span>
                            <span className="health-item-val text-rose-600">{dashboardData.health.missedPayments}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Assistant Insight Card */}
                      <div className="member-section-card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-emerald/20 text-emerald">
                            <Bot className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">ChitLedger AI Financial Copilot</h4>
                            <span className="text-[10px] text-emerald-400 font-semibold">Gemini 1.5 Telemetry</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                          "Based on Sharma Community Chit payment trends, participating in Cycle {dashboardData.nextAuction.cycle || 1} reverse auction is optimal if you require liquidity. Remaining low-risk default probability: 98.4%."
                        </p>

                        <button
                          type="button"
                          onClick={() => setAiPromptOpen(!aiPromptOpen)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald hover:bg-emerald-dark text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Ask AI Assistant</span>
                        </button>

                        {aiPromptOpen && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200">
                            <p className="font-semibold text-emerald-300 mb-1">AI Copilot Quick Query:</p>
                            <p>You can ask the organizer AI assistant regarding optimal auction bidding strategies, dividend payouts, or payment schedules.</p>
                          </div>
                        )}
                      </div>

                      {/* Member Support & Help */}
                      <div className="member-section-card border-dashed">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-5 w-5 text-slate-400 shrink-0" />
                          <div>
                            <h5 className="text-xs font-bold text-navy">Need Assistance with your Chit?</h5>
                            <p className="text-[11px] text-muted">Contact your chit organizer or inspect legal rules at any time.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="quick-actions-bar">
                    <button 
                      type="button" 
                      disabled
                      className="action-btn action-btn-primary opacity-70 cursor-not-allowed"
                      title="Online payment processing coming soon"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Make Payment (Soon)</span>
                    </button>

                    <Link to="/member/contributions" className="action-btn">
                      <TrendingUp className="h-4 w-4 text-emerald" />
                      <span>View Contributions</span>
                    </Link>

                    <Link to="/member/auction" className="action-btn">
                      <Gavel className="h-4 w-4 text-amber-500" />
                      <span>Join/View Auction</span>
                    </Link>

                    <button 
                      type="button" 
                      onClick={() => setAiPromptOpen(true)}
                      className="action-btn"
                    >
                      <Bot className="h-4 w-4 text-indigo-500" />
                      <span>Ask AI Assistant</span>
                    </button>
                  </div>
                </>
              )}
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
