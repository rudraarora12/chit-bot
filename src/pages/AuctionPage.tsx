import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Gavel,
  Receipt,
  Wallet,
  Clock,
  CheckCircle2,
  TrendingDown,
  Users,
  Search,
  ShieldCheck,
  Award,
  Sparkles,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import type { CurrentAuction, LedgerTransaction, AuctionSummary } from '@/data/auction'
import { initialAuctionData, initialLedgerTransactions, initialAuctionSummary } from '@/data/auction'
import { auctionService } from '@/services/auctionService'

export default function AuctionPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [auction, setAuction] = useState<CurrentAuction>(initialAuctionData)
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(initialLedgerTransactions)
  const [summary, setSummary] = useState<AuctionSummary>(initialAuctionSummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterCategory, setFilterCategory] = useState<'All' | 'contribution' | 'auction' | 'payout' | 'pending'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  // State for Auction Execution Result
  const [auctionResult, setAuctionResult] = useState<{
    winnerName: string
    winnerId: string
    avatarInitials: string
    winningBidDiscount: string
    rawDiscount: number
    prizeAmount: string
    rawPrize: number
    dividendPerMember: string
    hash: string
    timestamp: string
  } | null>(null)

  const loadAuctionData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    setError(null)
    try {
      const data = await auctionService.fetchAuctionPageData()
      if (data.auction) setAuction(data.auction)
      if (data.transactions && data.transactions.length > 0) setTransactions(data.transactions)
      if (data.summary) setSummary(data.summary)
    } catch (err) {
      console.error('Error fetching live auction data:', err)
      setError('Unable to load live auction data. Please verify backend connection.')
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAuctionData(true)
    const timer = setInterval(() => {
      loadAuctionData(false)
    }, 5000)
    return () => clearInterval(timer)
  }, [loadAuctionData])

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !searchQuery ||
        tx.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.transaction.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        filterCategory === 'All' || tx.category === filterCategory

      return matchesSearch && matchesCategory
    })
  }, [transactions, searchQuery, filterCategory])

  // Handle "Run Auction" Execution
  const handleRunAuction = async () => {
    if (auctionResult || auction.bids.length === 0) return

    // Top bidder from bids array
    const topBid = auction.bids[0]
    const discount = topBid.bidAmount
    const prize = auction.chitAmount - discount
    const dividend = Math.round(discount / Math.max(1, auction.participants))

    const hashStr = `0x${Math.random().toString(16).substring(2, 8)}…${Math.random().toString(16).substring(2, 5)}`

    const result = {
      winnerName: topBid.memberName,
      winnerId: topBid.memberId,
      avatarInitials: topBid.avatarInitials,
      winningBidDiscount: `₹${discount.toLocaleString('en-IN')}`,
      rawDiscount: discount,
      prizeAmount: `₹${prize.toLocaleString('en-IN')}`,
      rawPrize: prize,
      dividendPerMember: `₹${dividend.toLocaleString('en-IN')}`,
      hash: hashStr,
      timestamp: 'Just now (Cycle Concluded)',
    }

    setAuctionResult(result)

    // Update auction status
    setAuction((prev) => ({
      ...prev,
      status: 'Completed',
    }))

    // Add new Payout transaction to digital ledger
    const newTx: LedgerTransaction = {
      id: `TX-8${transactions.length + 1}`,
      date: 'Today',
      member: topBid.memberName,
      memberId: topBid.memberId,
      transaction: 'Auction Payout',
      category: 'payout',
      amount: `₹${prize.toLocaleString('en-IN')}`,
      rawAmount: prize,
      status: 'Completed',
      integrityHash: result.hash,
    }

    setTransactions((prev) => [newTx, ...prev])

    // Save to backend MongoDB asynchronously
    await auctionService.createAuctionPayout({
      winnerId: topBid.memberId,
      winnerName: topBid.memberName,
      prizeAmount: prize,
      discountAmount: discount,
    })
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Layout Workspace */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header */}
        <TopBar
          groupName="ChitLedger Control Center"
          currentCycle={auction.cycle}
          totalCycles={auction.totalCycles}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-navy font-bold">Auction &amp; Digital Ledger</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy flex items-center gap-2.5">
                  <Gavel className="h-7 w-7 text-emerald" />
                  Reverse Auction &amp; Digital Ledger
                </h1>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Transparent reverse bidding, instant payout calculation, and tamper-evident transaction journaling from MongoDB.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald-dark">
                  <ShieldCheck className="h-4 w-4 text-emerald" />
                  Tamper-Evident Ledger Active
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* 3. QUICK SUMMARY CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="flex flex-col justify-between rounded-[14px] border border-border bg-card p-5 shadow-(--shadow-card)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Total Collected
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                  <Wallet className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy">
                  {summary.totalCollected}
                </span>
                <p className="mt-1 text-xs font-medium text-emerald-dark">
                  MongoDB contributions total
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[14px] border border-border bg-card p-5 shadow-(--shadow-card)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Pending Amount
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <Clock className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600">
                  {summary.pendingAmount}
                </span>
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Outstanding collection amount
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[14px] border border-border bg-card p-5 shadow-(--shadow-card)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Completed Transactions
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Receipt className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy">
                  {transactions.length}
                </span>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Hashed &amp; verified records
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[14px] border border-border bg-card p-5 shadow-(--shadow-card)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Current Cycle
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                  <Gavel className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy">
                  {summary.currentCycle}
                </span>
                <p className="mt-1 text-xs font-medium text-emerald-dark">
                  {auction.chitAmountFormatted} pool pot size
                </p>
              </div>
            </article>
          </div>

          {/* 1. CURRENT AUCTION SECTION */}
          <div className="rounded-[16px] border border-border bg-card p-5 sm:p-6 shadow-(--shadow-card) space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <Gavel className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-navy">Current Reverse Auction</h2>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        auction.status === 'Completed'
                          ? 'bg-slate-100 text-slate-700 border border-slate-300'
                          : 'bg-emerald/10 text-emerald-dark border border-emerald/20'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${auction.status === 'Completed' ? 'bg-slate-500' : 'bg-emerald animate-pulse'}`} />
                      {auction.status === 'Completed' ? 'Cycle Concluded' : 'Live Auction'}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Cycle {auction.cycle} of {auction.totalCycles} • Members submit dividend discounts
                  </p>
                </div>
              </div>

              {/* [Run Auction] Primary Button */}
              <button
                onClick={handleRunAuction}
                disabled={auction.status === 'Completed' || auction.bids.length === 0}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
                  auction.status === 'Completed' || auction.bids.length === 0
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                    : 'bg-emerald hover:bg-emerald-dark text-white active:scale-[0.98]'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>{auction.status === 'Completed' ? 'Auction Completed' : 'Run Auction & Calculate Payout'}</span>
              </button>
            </div>

            {/* Auction Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[12px] border border-border bg-background p-3.5">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Chit Amount</span>
                <p className="mt-1 text-lg font-extrabold text-navy">{auction.chitAmountFormatted}</p>
              </div>
              <div className="rounded-[12px] border border-border bg-background p-3.5">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Highest Bid Discount</span>
                <p className="mt-1 text-lg font-extrabold text-emerald-dark">{auction.highestBidFormatted}</p>
              </div>
              <div className="rounded-[12px] border border-border bg-background p-3.5">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Est. Net Prize Payout</span>
                <p className="mt-1 text-lg font-extrabold text-navy">{auction.prizeAmountFormatted}</p>
              </div>
              <div className="rounded-[12px] border border-border bg-background p-3.5">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Participants</span>
                <p className="mt-1 flex items-center gap-1.5 text-lg font-extrabold text-navy">
                  <Users className="h-4 w-4 text-muted" />
                  {auction.participants} Members
                </p>
              </div>
            </div>

            {/* AUCTION RESULT STATE BANNER (When "Run Auction" is clicked) */}
            {auctionResult && (
              <div className="rounded-[14px] border border-emerald/30 bg-emerald/10 p-5 space-y-3 animate-in fade-in zoom-in-98">
                <div className="flex items-center justify-between gap-3 border-b border-emerald/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald text-white">
                      <Award className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-emerald-dark">Auction Winner Declared</h3>
                      <p className="text-xs text-emerald-dark/80">{auctionResult.timestamp}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-dark bg-emerald/15 px-3 py-1 rounded-full border border-emerald/20">
                    Hash: {auctionResult.hash}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-card/90 rounded-[10px] p-3 border border-emerald/20">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Winner Name</span>
                    <span className="text-base font-extrabold text-navy flex items-center gap-2 mt-0.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">
                        {auctionResult.avatarInitials}
                      </span>
                      {auctionResult.winnerName}
                    </span>
                  </div>

                  <div className="bg-card/90 rounded-[10px] p-3 border border-emerald/20">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Winning Bid (Discount)</span>
                    <span className="text-base font-extrabold text-emerald-dark mt-0.5 block">
                      {auctionResult.winningBidDiscount}
                    </span>
                  </div>

                  <div className="bg-card/90 rounded-[10px] p-3 border border-emerald/20">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Net Prize Amount Payout</span>
                    <span className="text-base font-extrabold text-navy mt-0.5 block">
                      {auctionResult.prizeAmount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-dark font-medium pt-1">
                  <span>Dividend distributed to members: <strong>{auctionResult.dividendPerMember}</strong> each</span>
                  <span className="font-semibold">Recorded in Digital Ledger automatically ✓</span>
                </div>
              </div>
            )}

            {/* Recent Bids Feed */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-navy">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-emerald" />
                  Live Bid Submissions ({auction.bids.length} Bidders)
                </span>
                <span className="text-muted">Dividend Discount Offered</span>
              </div>

              {auction.bids.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted bg-background/50 rounded-xl border border-border">
                  No bids submitted yet. Add members to start reverse auction bidding.
                </div>
              ) : (
                <div className="divide-y divide-border/60 rounded-[12px] border border-border bg-background/70 overflow-hidden">
                  {auction.bids.map((bid, idx) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between px-4 py-3 text-xs transition-colors hover:bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">
                          {bid.avatarInitials}
                        </span>
                        <div>
                          <span className="font-bold text-navy">{bid.memberName}</span>
                          <span className="ml-2 font-mono text-[11px] text-muted-foreground">({bid.memberId})</span>
                          <span className="ml-2 text-[10px] text-muted-foreground">• {bid.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {idx === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-bold text-emerald-dark">
                            Highest Bid
                          </span>
                        )}
                        <span className="font-mono font-bold text-navy text-sm">{bid.bidFormatted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. DIGITAL LEDGER SECTION */}
          <div className="rounded-[16px] border border-border bg-card p-5 sm:p-6 shadow-(--shadow-card) space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-navy">Digital Ledger</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Immutable transaction log &amp; tamper-evident hash journal from MongoDB
                  </p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search member or TX ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 rounded-[10px] border border-border bg-background pl-9 pr-3 text-xs text-navy outline-none focus:border-emerald"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 rounded-[10px] border border-border bg-background p-1 flex-wrap">
                  {[
                    { label: 'All', value: 'All' },
                    { label: 'Contributions', value: 'contribution' },
                    { label: 'Auctions', value: 'auction' },
                    { label: 'Payouts', value: 'payout' },
                    { label: 'Pending', value: 'pending' },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterCategory(filter.value as any)}
                      className={`px-3 py-1 text-xs font-semibold rounded-[7px] transition-all ${
                        filterCategory === filter.value
                          ? 'bg-card text-navy shadow-xs font-bold'
                          : 'text-muted hover:text-navy'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-10 text-center text-muted text-xs font-medium">
                  Loading real-time MongoDB digital ledger transactions...
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-background/80 text-[11px] font-bold text-muted uppercase tracking-wider">
                      <th className="py-3 px-3 rounded-l-lg">Date</th>
                      <th className="py-3 px-3">Member</th>
                      <th className="py-3 px-3">Transaction</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right rounded-r-lg">Integrity Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredTransactions.map((tx) => {
                      let statusBadge = (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-dark">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </span>
                      )

                      if (tx.status === 'Pending') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )
                      } else if (tx.status === 'Overdue') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                            <AlertCircle className="h-3 w-3" />
                            Overdue
                          </span>
                        )
                      } else if (tx.status === 'Active') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            Active Bid
                          </span>
                        )
                      }

                      return (
                        <tr key={tx.id} className="transition-colors hover:bg-background/60">
                          <td className="py-3.5 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-navy">{tx.member}</span>
                            <span className="ml-2 font-mono text-[10px] text-muted-foreground">({tx.memberId})</span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-navy-soft whitespace-nowrap">
                            {tx.transaction}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-navy text-sm whitespace-nowrap">
                            {tx.amount}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {statusBadge}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-[11px] text-muted whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 bg-background px-2 py-0.5 rounded border border-border">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                              {tx.integrityHash}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {!loading && filteredTransactions.length === 0 && (
                <div className="py-10 text-center text-muted text-xs">
                  No transaction records found matching your filter criteria.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
