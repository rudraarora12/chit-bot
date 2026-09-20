import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '@/components/landing/Navbar'
import { fetchCommitteeAuction, startAuction, endAuction, submitAuctionBid } from '@/services/auctionService'
import { useUser } from '@clerk/react'
import { io } from 'socket.io-client'
import { 
  ArrowLeft, 
  Gavel, 
  Clock, 
  TrendingDown, 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Info,
  UserCheck,
  Lock
} from 'lucide-react'
import './LiveAuctionRoomPage.css'

export default function LiveAuctionRoomPage() {
  const { id: committeeId } = useParams()
  const { user } = useUser()

  const [committee, setCommittee] = useState(null)
  const [auction, setAuction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Bidding states
  const [bidAmountInput, setBidAmountInput] = useState('')
  const [validationError, setValidationError] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(null)

  // Controller states for organizer
  const [actionLoading, setActionLoading] = useState(false)

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(0)

  const userEmail = (user?.primaryEmailAddress?.emailAddress || '').toLowerCase().trim()
  const userId = (user?.id || '').trim()
  const userName = user?.fullName || 'Chit Participant'

  // Load committee auction details
  const loadAuctionData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    setError(null)
    try {
      let targetId = committeeId
      if (!targetId) {
        const commListRes = await fetch('http://127.0.0.1:5050/api/committees').then((r) => r.json())
        if (commListRes && commListRes.data && commListRes.data.length > 0) {
          targetId = commListRes.data[0]._id || commListRes.data[0].id
        }
      }

      if (!targetId) {
        setError('No active chit committee found to display live auction. Please create a committee first.')
        return
      }

      const res = await fetchCommitteeAuction(targetId)
      if (res && res.data) {
        setAuction(res.data)
      }
      if (res && res.committee) {
        setCommittee(res.committee)
      }
    } catch (err) {
      console.error('Error loading live auction room:', err)
      setError(err.message || 'Unable to load live auction for this committee.')
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [committeeId])

  useEffect(() => {
    loadAuctionData(true)

    // Polling sync fallback every 3s
    const pollInterval = setInterval(() => {
      loadAuctionData(false)
    }, 3000)

    // Real-Time Socket.IO connection
    const socket = io('http://127.0.0.1:5050', {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to Live Reverse Auction Room')
    })

    socket.on('auctionBidCreated', (data) => {
      if (data && data.updatedAuction) {
        setAuction(data.updatedAuction)
      }
    })

    socket.on('auctionStarted', (updated) => {
      if (updated && (updated.committee === committeeId || updated.committeeIdStr === committeeId)) {
        setAuction(updated)
      }
    })

    socket.on('auctionEnded', (updated) => {
      if (updated && (updated.committee === committeeId || updated.committeeIdStr === committeeId)) {
        setAuction(updated)
      }
    })

    socket.on('auctionUpdated', (updated) => {
      if (updated && (updated._id === auction?._id || updated.committeeIdStr === committeeId)) {
        setAuction(updated)
      }
    })

    return () => {
      clearInterval(pollInterval)
      socket.disconnect()
    }
  }, [committeeId, loadAuctionData, auction?._id])

  // Countdown Timer Logic
  useEffect(() => {
    if (!auction || auction.status !== 'Live' || !auction.endTime) {
      setSecondsLeft(0)
      return
    }

    const calcTime = () => {
      const diff = Math.max(0, Math.floor((new Date(auction.endTime).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)

      if (diff <= 0 && auction.status === 'Live') {
        endAuction(auction._id).then((endedData) => {
          if (endedData) setAuction(endedData)
        }).catch(() => {})
      }
    }

    calcTime()
    const timerInterval = setInterval(calcTime, 1000)
    return () => clearInterval(timerInterval)
  }, [auction])

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Determine user identity & roles
  const isOrganizer = committee ? (
    (userEmail && committee.organizerEmail && userEmail === committee.organizerEmail.toLowerCase()) ||
    (userId && committee.organizerId && userId === committee.organizerId) ||
    (userName && committee.organizer && userName.toLowerCase() === committee.organizer.toLowerCase())
  ) : false

  const isMember = committee?.members?.some((m) => {
    if (userEmail && m.email && m.email.toLowerCase() === userEmail) return true;
    if (userId && m.memberId && m.memberId === userId) return true;
    if (userName && m.name && m.name.toLowerCase() === userName.toLowerCase()) return true;
    return false;
  })

  const currentLowest = auction ? (auction.currentLowestBid || auction.chitValue || auction.startingBid || 100000) : 100000
  const chitValue = auction ? (auction.chitValue || auction.poolAmount || 100000) : 100000
  const currentDiscount = Math.max(0, chitValue - currentLowest)

  // Validate Bid Input (LOWER IS BETTER)
  const handleBidInputChange = (val) => {
    setBidAmountInput(val)
    setValidationError(null)

    const numVal = Number(val)
    if (!val) return

    if (isNaN(numVal) || numVal <= 0) {
      setValidationError('Please enter a valid bid amount.')
      return
    }

    if (numVal >= currentLowest) {
      setValidationError(`Your bid must be lower than the current lowest bid of ₹${currentLowest.toLocaleString('en-IN')}.`)
    }
  }

  const handleOpenConfirm = (e) => {
    e.preventDefault()
    const numVal = Number(bidAmountInput)

    if (!bidAmountInput || isNaN(numVal) || numVal <= 0) {
      setValidationError('Please enter a valid numeric bid amount.')
      return
    }

    if (numVal >= currentLowest) {
      setValidationError(`Your bid must be lower than the current lowest bid of ₹${currentLowest.toLocaleString('en-IN')}.`)
      return
    }

    setValidationError(null)
    setShowConfirmModal(true)
  }

  // Submit Confirmed Bid to Backend
  const handleConfirmSubmit = async () => {
    if (!auction?._id) return
    setSubmitting(true)
    setValidationError(null)
    setActionSuccess(null)

    try {
      const numVal = Number(bidAmountInput)
      const res = await submitAuctionBid(auction._id, {
        amount: numVal,
        bidderName: userName,
        bidderEmail: userEmail,
        bidderId: userId,
      })

      if (res.data) {
        setAuction(res.data)
      }
      setShowConfirmModal(false)
      setBidAmountInput('')
      setActionSuccess(`Your bid of ₹${numVal.toLocaleString('en-IN')} was submitted successfully as the new leading bid!`)
    } catch (err) {
      console.error('Bid error:', err)
      setValidationError(err.message || 'Failed to submit bid.')
      setShowConfirmModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Organizer Controls: Start Auction
  const handleStartAuction = async () => {
    if (!auction?._id) return
    setActionLoading(true)
    setError(null)
    try {
      const updated = await startAuction(auction._id, 10)
      setAuction(updated)
      setActionSuccess('Live auction started! 10-minute timer initiated.')
    } catch (err) {
      console.error('Start error:', err)
      setError(err.message || 'Failed to start auction.')
    } finally {
      setActionLoading(false)
    }
  }

  // Organizer Controls: End Auction
  const handleEndAuction = async () => {
    if (!auction?._id) return
    setActionLoading(true)
    setError(null)
    try {
      const updated = await endAuction(auction._id)
      setAuction(updated)
      setActionSuccess('Auction concluded successfully. Winning bid recorded.')
    } catch (err) {
      console.error('End error:', err)
      setError(err.message || 'Failed to end auction.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="live-auction-page">
      <Navbar />

      <main className="live-auction-container">
        {/* Breadcrumb Back Link */}
        <div className="mb-4 text-left">
          <Link to={`/committees/${committeeId}`} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-dark hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Committee Details</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-semibold text-sm">
            Connecting to Live Reverse Bidding Room...
          </div>
        ) : error && !auction ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-rose-200">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-navy mb-1">{error}</h3>
            <p className="text-xs text-muted mb-4">Please verify that backend server is running on port 5050.</p>
            <Link to="/members" className="px-4 py-2 bg-emerald text-white text-xs font-bold rounded-xl">
              Return to Committees
            </Link>
          </div>
        ) : (
          <>
            {/* TOP HEADER BANNER */}
            <div className="live-auction-header">
              <div className="live-badge-row">
                {auction.status === 'Live' ? (
                  <span className="badge-live-pulse">
                    <span className="pulse-dot" />
                    <span>LIVE REVERSE AUCTION</span>
                  </span>
                ) : auction.status === 'Upcoming' ? (
                  <span className="badge-upcoming">
                    <Clock className="h-3.5 w-3.5" />
                    <span>UPCOMING AUCTION</span>
                  </span>
                ) : (
                  <span className="badge-ended">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>AUCTION CONCLUDED</span>
                  </span>
                )}

                <span className="text-xs text-slate-300 font-semibold">
                  Cycle {auction.cycle || 1} • {committee?.auctionFrequency || 'Monthly'} Reverse Auction
                </span>
              </div>

              <h1 className="live-header-title">{committee?.name || 'Community Savings Circle'}</h1>
              <p className="live-header-subtitle">
                Organized by {committee?.organizer || 'Sharma Organizer'} • Lowest valid bid wins the chit payout.
              </p>
            </div>

            {actionSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald" />
                  <span>{actionSuccess}</span>
                </div>
                <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:underline">
                  Dismiss
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold">
                {error}
              </div>
            )}

            {/* MAIN CENTRAL AUCTION CARD */}
            <div className="main-auction-card">
              {auction.status === 'Live' && (
                <div className="auction-timer-box">
                  <span className="timer-label">Time Remaining</span>
                  <span className="timer-digits">{formatTimer(secondsLeft)}</span>
                </div>
              )}

              {/* DOMINANT METRICS GRID */}
              <div className="metrics-highlight-grid">
                <div className="metric-highlight-box">
                  <span className="metric-hl-label">Total Chit Value</span>
                  <span className="metric-hl-val">₹{Number(chitValue).toLocaleString('en-IN')}</span>
                </div>

                <div className="metric-highlight-box metric-highlight-box--dominant">
                  <span className="metric-hl-label text-emerald-800">Current Lowest Bid</span>
                  <span className="metric-hl-val--dominant">₹{Number(currentLowest).toLocaleString('en-IN')}</span>
                  <span className="metric-hl-sub">Lowest valid bid wins ✓</span>
                </div>

                <div className="metric-highlight-box">
                  <span className="metric-hl-label">Current Auction Discount</span>
                  <span className="metric-hl-val text-emerald-700">₹{Number(currentDiscount).toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">Distributed to non-winners</span>
                </div>
              </div>

              {/* ORGANIZER CONTROL CENTER */}
              {isOrganizer && (
                <div className="mt-6 pt-6 border-t border-slate-200 bg-slate-50 p-4 rounded-xl text-left">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-indigo-600" />
                      <h4 className="text-sm font-bold text-navy">Live Auction Control Center (Organizer View)</h4>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      Observer / Foreman
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    As the foreman of this committee, you control the auction lifecycle. Organizers are strictly excluded from submitting bids.
                  </p>

                  <div className="flex items-center gap-3">
                    {auction.status === 'Upcoming' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleStartAuction}
                        className="px-6 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white font-bold text-xs shadow-md transition-colors"
                      >
                        {actionLoading ? 'Starting Auction...' : '▶ Start Live Auction (10-Min Timer)'}
                      </button>
                    )}

                    {auction.status === 'Live' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleEndAuction}
                        className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        {actionLoading ? 'Ending Auction...' : '⏹ End Auction & Conclude Winner'}
                      </button>
                    )}

                    {auction.status === 'Ended' && (
                      <div className="text-xs font-bold text-slate-700 bg-slate-200 px-4 py-2 rounded-xl">
                        Auction Concluded & Hash Journaled
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AUCTION ENDED RESULTS BOX */}
            {auction.status === 'Ended' && (
              <div className="mb-6 bg-white border border-emerald-300 p-6 rounded-2xl shadow-sm text-left space-y-4">
                <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                  <Award className="h-6 w-6 text-emerald" />
                  <div>
                    <h3 className="text-base font-extrabold text-navy">Auction Results &amp; Winner Declaration</h3>
                    <p className="text-xs text-muted">Final winning bid determined by backend reverse bidding engine</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Winning Member</span>
                    <span className="text-sm font-bold text-navy block mt-0.5">
                      {auction.winner?.maskedName || auction.winner?.name || 'Member #01'}
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[11px] font-semibold text-emerald-800 block">Winning Bid</span>
                    <span className="text-sm font-extrabold text-emerald-900 block mt-0.5">
                      ₹{Number(auction.winningBid || currentLowest).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Auction Discount</span>
                    <span className="text-sm font-bold text-navy block mt-0.5">
                      ₹{Number(auction.winningDiscount || currentDiscount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Total Bids Submitted</span>
                    <span className="text-sm font-bold text-navy block mt-0.5">
                      {auction.bids?.length || 0} Bids
                    </span>
                  </div>
                </div>

                <div className="text-xs text-emerald-800 font-semibold pt-2">
                  ✓ All auction activity has been recorded in the ChitLedger digital ledger.
                </div>
              </div>
            )}

            {/* MEMBER BIDDING FORM */}
            {auction.status === 'Live' && !isOrganizer && (
              <div className="bidding-section">
                {isMember ? (
                  <>
                    <h3 className="bidding-title">Place Your Reverse Bid</h3>
                    <p className="bidding-subtitle">
                      Submit the amount you are willing to take from the ₹{Number(chitValue).toLocaleString('en-IN')} chit pool.
                      Your bid must be lower than <strong>₹{Number(currentLowest).toLocaleString('en-IN')}</strong>.
                    </p>

                    {validationError && (
                      <div className="max-w-md mx-auto mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                        {validationError}
                      </div>
                    )}

                    <form onSubmit={handleOpenConfirm}>
                      <div className="bid-input-wrap">
                        <span className="bid-currency-symbol">₹</span>
                        <input
                          type="number"
                          placeholder={(currentLowest - 1000).toString()}
                          value={bidAmountInput}
                          onChange={(e) => handleBidInputChange(e.target.value)}
                          className="bid-input-field"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!!validationError || !bidAmountInput}
                        className="btn-submit-bid"
                      >
                        <TrendingDown className="h-4 w-4" />
                        <span>Submit Bid (₹{bidAmountInput ? Number(bidAmountInput).toLocaleString('en-IN') : '0'})</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 inline-block mr-2" />
                    You are not eligible to participate in this auction (must be a joined member of {committee?.name || 'this committee'}).
                  </div>
                )}
              </div>
            )}

            {/* UPCOMING AUCTION NOTICE */}
            {auction.status === 'Upcoming' && !isOrganizer && (
              <div className="bidding-section text-center py-10">
                <Clock className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-navy mb-1">Auction Not Started Yet</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  The committee organizer will initiate the live reverse bidding room shortly. Stay tuned!
                </p>
              </div>
            )}

            {/* LIVE BID ACTIVITY FEED */}
            <div className="activity-feed-card text-left">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-emerald" />
                  <h3 className="text-sm font-bold text-navy">Live Bid Activity ({auction.bids?.length || 0} Bids)</h3>
                </div>
                <span className="text-xs text-muted">Lowest valid bid leads</span>
              </div>

              {!auction.bids || auction.bids.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted">
                  No bids placed yet. Submissions will appear here in real time.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {auction.bids
                    .slice()
                    .sort((a, b) => a.amount - b.amount)
                    .map((bid, idx) => (
                      <div
                        key={bid._id || idx}
                        className={`bid-item-row ${idx === 0 ? 'bid-item-row--leading' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold">
                            {bid.maskedName ? bid.maskedName.slice(0, 2).toUpperCase() : `M${idx + 1}`}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-navy">{bid.maskedName || 'Member'}</span>
                            <span className="ml-2 text-[10px] text-slate-500">
                              • {bid.createdAt ? new Date(bid.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald text-white">
                              Leading Bid
                            </span>
                          )}
                          <span className="font-mono font-extrabold text-sm text-navy">
                            ₹{Number(bid.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* HOW REVERSE BIDDING WORKS */}
            <div className="rules-explanation-box text-left">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">How Reverse Bidding Works</h4>
              </div>
              <div className="rules-list">
                <div>1. Members submit bids representing the payout amount they request.</div>
                <div>2. Lower valid bids become the new leading bid.</div>
                <div>3. The lowest valid bid at auction close wins the cycle payout.</div>
                <div>4. The resulting auction discount is distributed as member dividends.</div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* BID CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-card text-left">
            <h3 className="text-base font-bold text-navy mb-1">Confirm Your Reverse Bid</h3>
            <p className="text-xs text-muted mb-3">Please verify your bid parameters before submitting.</p>

            <div className="modal-summary-box">
              <div className="modal-summary-row">
                <span className="text-slate-600 font-semibold">Your Bid</span>
                <span className="font-bold text-emerald-700 text-sm">₹{Number(bidAmountInput).toLocaleString('en-IN')}</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-semibold">Current Lowest Bid</span>
                <span className="font-bold text-navy">₹{Number(currentLowest).toLocaleString('en-IN')}</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-semibold">Resulting Discount</span>
                <span className="font-bold text-emerald-800">₹{Number(chitValue - Number(bidAmountInput)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmSubmit}
                className="px-5 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white font-bold text-xs transition-colors"
              >
                {submitting ? 'Submitting...' : 'Confirm Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
