import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  ChevronRight,
  Info,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import type { RiskMember } from '@/data/riskData'
import { mockRiskMembers } from '@/data/riskData'
import { riskService } from '@/services/riskService'

export default function RiskPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [selectedMember, setSelectedMember] = useState<RiskMember | null>(null)

  const [members, setMembers] = useState<RiskMember[]>(mockRiskMembers)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRiskData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    setError(null)
    try {
      const realMembers = await riskService.fetchRiskPageData()
      if (realMembers && realMembers.length > 0) {
        setMembers(realMembers)
      }
    } catch (err) {
      console.error('Error fetching live risk telemetry:', err)
      setError('Unable to load live risk telemetry. Please verify backend connection.')
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRiskData(true)
    const timer = setInterval(() => {
      loadRiskData(false)
    }, 5000)
    return () => clearInterval(timer)
  }, [loadRiskData])

  // Dynamically calculated stats from live MongoDB members
  const stats = useMemo(() => {
    const totalMembers = members.length
    const highRisk = members.filter((m) => m.riskLevel === 'High').length
    const mediumRisk = members.filter((m) => m.riskLevel === 'Medium').length
    const lowRisk = members.filter((m) => m.riskLevel === 'Low').length

    return {
      totalMembers,
      lowRisk,
      mediumRisk,
      highRisk,
    }
  }, [members])

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
      const matchesRisk = riskFilter === 'All' || m.riskLevel === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [members, search, riskFilter])

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header */}
        <TopBar
          groupName="ChitLedger Control Center"
          currentCycle={1}
          totalCycles={12}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-navy font-bold">AI Risk Monitoring</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy flex items-center gap-2.5">
                  <ShieldAlert className="h-7 w-7 text-amber-600" />
                  AI Risk Monitoring
                </h1>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Monitor unusual member behaviour and review potential risks across active chit cycles in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Real-time Telemetry Active
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* 2. Risk Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="flex flex-col justify-between rounded-[14px] border border-border bg-card p-5 shadow-(--shadow-card) transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Total Members
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                  <Users className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold tracking-tight text-navy">
                  {stats.totalMembers}
                </span>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Active in MongoDB database
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[14px] border border-emerald/20 border-t-4 border-t-emerald bg-card p-5 shadow-(--shadow-card) transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Low Risk
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-dark">
                  {stats.lowRisk}
                </span>
                <p className="mt-1 text-xs font-medium text-emerald-dark/80">
                  Consistent on-time payments
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[14px] border border-amber-500/20 border-t-4 border-t-amber-500 bg-card p-5 shadow-(--shadow-card) transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Medium Risk
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold tracking-tight text-amber-600">
                  {stats.mediumRisk}
                </span>
                <p className="mt-1 text-xs font-semibold text-amber-600">
                  Requires periodic review
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[14px] border border-rose-500/20 border-t-4 border-t-rose-500 bg-card p-5 shadow-(--shadow-card) transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  High Risk
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold tracking-tight text-rose-600">
                  {stats.highRisk}
                </span>
                <p className="mt-1 text-xs font-semibold text-rose-600">
                  Unusual pattern detected
                </p>
              </div>
            </article>
          </div>

          {/* Guidelines Disclaimer */}
          <div className="flex items-start gap-3 rounded-[14px] border border-border bg-card p-4 text-xs text-navy-soft shadow-xs">
            <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-navy">Risk Assessment Guidelines: </span>
              Risk flags are calculated automatically based on payment timelines, historical delay variance, and auction behavior. These are behavioral indicators designed to assist organizer review and do not constitute legal or fraud judgments.
            </div>
          </div>

          {/* 3. Member Risk List & Filter Controls */}
          <div className="rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card) space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-navy">Member Risk Roster</h2>
                <p className="text-xs text-muted">
                  Showing {filteredMembers.length} member(s) matching selected telemetry criteria
                </p>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-9 rounded-[10px] border border-border bg-background pl-9 pr-3 text-xs text-navy outline-none focus:border-emerald"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 rounded-[10px] border border-border bg-background p-1">
                  {(['All', 'High', 'Medium', 'Low'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(level)}
                      className={`px-3 py-1 text-xs font-semibold rounded-[7px] transition-all ${
                        riskFilter === level
                          ? 'bg-card text-navy shadow-xs font-bold'
                          : 'text-muted hover:text-navy'
                      }`}
                    >
                      {level === 'All' ? 'All Risk' : level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Members Roster List */}
            {loading ? (
              <div className="py-12 text-center text-muted text-xs font-medium">
                Loading real-time MongoDB AI risk telemetry...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs font-medium">
                No members found matching your filter criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member) => {
                  const isHigh = member.riskLevel === 'High'
                  const isMedium = member.riskLevel === 'Medium'

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[14px] border border-border/80 bg-background p-4 transition-all hover:border-border hover:shadow-xs"
                    >
                      {/* Left Info Column */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white shadow-xs">
                          {member.avatarInitials}
                        </span>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-base font-bold text-navy">{member.name}</span>
                            <span className="font-mono text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-md border border-border">
                              {member.id}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                isHigh
                                  ? 'border border-rose-500/20 bg-rose-500/10 text-rose-700'
                                  : isMedium
                                  ? 'border border-amber-500/20 bg-amber-500/10 text-amber-700'
                                  : 'border border-emerald/20 bg-emerald/10 text-emerald-dark'
                              }`}
                            >
                              {isHigh ? (
                                <ShieldAlert className="h-3 w-3" />
                              ) : isMedium ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {member.riskLevel} Risk
                            </span>
                          </div>

                          {/* Signals List */}
                          <ul className="space-y-1 pt-1">
                            {member.riskReasons.map((reason, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-navy-soft font-medium">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                    isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald'
                                  }`}
                                />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Middle Metrics Column */}
                      <div className="flex items-center gap-4 py-2 lg:py-0 border-y lg:border-y-0 border-border/60 text-xs shrink-0">
                        <div className="text-center px-3">
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                            Late / Missed
                          </span>
                          <span className="font-bold text-navy text-sm">
                            {member.latePayments} / {member.missedPayments}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center px-3">
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                            Pending Amount
                          </span>
                          <span className={`font-mono font-bold text-sm ${member.outstandingAmount > 0 ? 'text-amber-600' : 'text-emerald-dark'}`}>
                            ₹{member.outstandingAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Right Actions Column */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/70 transition-colors cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Explain Risk with AI
                        </button>

                        <Link
                          to={`/members/${member.id}`}
                          className="inline-flex items-center gap-1 h-9 px-3.5 rounded-[10px] bg-card hover:bg-background text-navy text-xs font-semibold border border-border transition-colors"
                        >
                          <span>View Member</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. "Explain Risk with AI" Modal Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedMember(null)}
          />

          <div className="relative w-full max-w-xl rounded-[20px] border border-border bg-card p-6 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-navy">AI Risk Explanation</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedMember.riskLevel === 'High'
                          ? 'bg-rose-500/10 text-rose-700'
                          : selectedMember.riskLevel === 'Medium'
                          ? 'bg-amber-500/10 text-amber-700'
                          : 'bg-emerald/10 text-emerald-dark'
                      }`}
                    >
                      {selectedMember.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Telemetry Analysis for <strong className="text-navy">{selectedMember.name}</strong> ({selectedMember.id})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-lg p-1 text-muted hover:bg-background hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs text-navy-soft">
              {/* Narrative Explanation */}
              <div className="rounded-[12px] border border-border bg-background p-4 leading-relaxed space-y-2">
                <h4 className="font-bold text-navy text-xs uppercase tracking-wider">
                  Automated Rationale
                </h4>
                <p className="text-sm text-slate-700 font-medium">
                  "{selectedMember.aiExplanation}"
                </p>
              </div>

              {/* Key Signals */}
              <div className="space-y-2">
                <h4 className="font-bold text-navy text-xs uppercase tracking-wider">
                  Key Telemetry Signals
                </h4>
                <ul className="space-y-2">
                  {selectedMember.riskReasons.map((signal, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-background/60 p-2.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      <span className="font-medium text-navy">{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Action */}
              <div className="rounded-[12px] border border-emerald/20 bg-emerald/10 p-4 space-y-1 text-emerald-dark">
                <span className="font-bold text-xs uppercase tracking-wider block">
                  Suggested Action
                </span>
                <p className="font-semibold text-sm">
                  {selectedMember.suggestedAction}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground border-t border-border">
                <Info className="h-3.5 w-3.5 text-muted shrink-0" />
                <span>AI-assisted risk flag. Final decisions remain with the organiser.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-[10px] border border-border bg-background text-xs font-semibold text-navy hover:bg-card"
              >
                Close
              </button>
              <Link
                to={`/members/${selectedMember.id}`}
                onClick={() => setSelectedMember(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-emerald hover:bg-emerald-dark text-xs font-semibold text-white shadow-xs"
              >
                <span>Open Member Profile</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
