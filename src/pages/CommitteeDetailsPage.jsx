import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/landing/Navbar'
import { fetchCommitteeById, joinCommittee } from '@/services/committeeService'
import { MembersTable } from '@/components/members/MembersTable'
import { useUser } from '@clerk/react'
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Gavel, 
  CreditCard, 
  TrendingUp, 
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import './CommitteeDetailsPage.css'

export default function CommitteeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()

  const [committee, setCommittee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState(null)
  const [role, setRole] = useState('member') // 'member' or 'organizer'

  const loadDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCommitteeById(id)
      if (!data) {
        setError('Committee not found.')
      } else {
        setCommittee(data)
      }
    } catch (err) {
      console.error('Error loading committee details:', err)
      setError('Unable to load committee. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetails()

    // Poll for real-time sync every 4 seconds as fallback
    const interval = setInterval(() => {
      fetchCommitteeById(id).then((fresh) => {
        if (fresh) setCommittee(fresh)
      }).catch(() => {})
    }, 4000)

    return () => clearInterval(interval)
  }, [id, loadDetails])

  const userEmail = user?.primaryEmailAddress?.emailAddress || ''
  const userName = user?.fullName || 'Chit Member'
  const isJoined = committee?.members?.some((m) => {
    if (userEmail && m.email && m.email.toLowerCase() === userEmail.toLowerCase()) return true;
    return false;
  })

  const availableSlots = committee ? Math.max(0, committee.totalMembers - (committee.joinedMembers || 0)) : 0

  const handleConfirmJoin = async () => {
    setJoinLoading(true)
    setJoinError(null)
    try {
      const updated = await joinCommittee(id, {
        name: userName,
        email: userEmail,
        phone: user?.primaryPhoneNumber?.phoneNumber || '',
      })
      setCommittee(updated)
      setShowJoinModal(false)
    } catch (err) {
      console.error('Error joining committee:', err)
      setJoinError(err.message || 'Failed to join committee.')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className="committee-details-page">
      <Navbar />

      <main className="committee-details-container">
        {/* Navigation Breadcrumb & Role Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link to="/members" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-dark hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Committees</span>
          </Link>

          <div className="inline-flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`px-3 py-1.5 rounded-lg transition-all ${role === 'member' ? 'bg-white text-navy shadow-xs font-bold' : 'text-slate-600'}`}
            >
              Member View
            </button>
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`px-3 py-1.5 rounded-lg transition-all ${role === 'organizer' ? 'bg-emerald text-white shadow-xs font-bold' : 'text-slate-600'}`}
            >
              Organizer View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted text-sm font-medium">
            Loading committee details from MongoDB...
          </div>
        ) : error || !committee ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-navy mb-1">{error || 'Committee Not Found'}</h3>
            <p className="text-xs text-muted mb-4">The committee you are looking for may have been removed or renamed.</p>
            <Link to="/members" className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald text-white px-4 py-2 rounded-lg">
              Return to Committees
            </Link>
          </div>
        ) : (
          <>
            {/* HERO BANNER */}
            <div className="committee-hero-banner">
              <div className="hero-meta-badges">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  committee.status === 'Open' ? 'bg-emerald/20 text-emerald-300 border border-emerald/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {committee.status === 'Open' ? 'Open for Joining' : committee.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {committee.auctionFrequency || 'Monthly'} {committee.auctionType || 'Reverse Auction'}
                </span>
              </div>

              <h1 className="hero-title">{committee.name}</h1>
              <p className="hero-organizer">Organized by {committee.organizer || 'Sharma Organizer'} • {committee.description || 'Verified Community Savings Circle'}</p>

              <div className="hero-metrics-grid">
                <div className="hero-metric-box">
                  <div className="hero-metric-label">Monthly Contribution</div>
                  <div className="hero-metric-value text-emerald-300">₹{Number(committee.monthlyContribution).toLocaleString('en-IN')}</div>
                </div>
                <div className="hero-metric-box">
                  <div className="hero-metric-label">Total Chit Value</div>
                  <div className="hero-metric-value">₹{Number(committee.totalChitValue).toLocaleString('en-IN')}</div>
                </div>
                <div className="hero-metric-box">
                  <div className="hero-metric-label">Members Joined</div>
                  <div className="hero-metric-value">{committee.joinedMembers || 0} / {committee.totalMembers}</div>
                </div>
                <div className="hero-metric-box">
                  <div className="hero-metric-label">Available Capacity</div>
                  <div className="hero-metric-value text-amber-300">{availableSlots} Slots Left</div>
                </div>
              </div>

              {/* ACTION CTA BAR */}
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between flex-wrap gap-4">
                <div className="text-xs text-slate-300">
                  <span>Start Date: <strong>{committee.startDate ? new Date(committee.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Upcoming'}</strong></span>
                  {committee.durationMonths && <span className="ml-4">Duration: <strong>{committee.durationMonths} Months</strong></span>}
                </div>

                {(() => {
                  const isOrganizerUser =
                    (userEmail && committee.organizerEmail && committee.organizerEmail.toLowerCase() === userEmail.toLowerCase()) ||
                    (user?.id && committee.organizerId && committee.organizerId === user.id) ||
                    (committee.organizer && committee.organizer.toLowerCase() === (user?.fullName || 'Sharma Organizer').toLowerCase());

                  if (isOrganizerUser || role === 'organizer') {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1.5 rounded-lg font-bold">
                          Organizer of this committee
                        </span>
                      </div>
                    );
                  }

                  if (isJoined) {
                    return (
                      <Link to="/member/dashboard" className="px-5 py-2.5 rounded-xl bg-emerald text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-emerald-dark transition-colors">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Open My Chit</span>
                      </Link>
                    );
                  }

                  if (committee.joiningDeadline && new Date() > new Date(committee.joiningDeadline)) {
                    return (
                      <button disabled type="button" className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-400 font-bold text-xs cursor-not-allowed">
                        Joining Closed
                      </button>
                    );
                  }

                  if (availableSlots <= 0 || committee.status === 'Full') {
                    return (
                      <button disabled type="button" className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-400 font-bold text-xs cursor-not-allowed">
                        Committee Full
                      </button>
                    );
                  }

                  if (committee.status !== 'Open') {
                    return (
                      <button disabled type="button" className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-400 font-bold text-xs cursor-not-allowed">
                        Joining Closed
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(true)}
                      className="px-6 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white font-bold text-xs transition-colors shadow-lg shadow-emerald/20"
                    >
                      Join Committee
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* TABS */}
            <div className="committee-tabs">
              <button
                type="button"
                className={`committee-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview & Rules
              </button>
              <button
                type="button"
                className={`committee-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                Members Joined ({committee.joinedMembers || 0})
              </button>
              <button
                type="button"
                className={`committee-tab-btn ${activeTab === 'auctions' ? 'active' : ''}`}
                onClick={() => setActiveTab('auctions')}
              >
                Reverse Auctions
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* HOW THIS CHIT WORKS */}
                <div className="how-it-works-box">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald" />
                    <h3 className="text-base font-bold text-navy">How this Chit Committee Works</h3>
                  </div>
                  <p className="text-xs text-muted mt-1">Simple step-by-step financial lifecycle for all participants.</p>

                  <div className="how-steps-grid">
                    <div className="how-step-card">
                      <span className="how-step-num">STEP 1</span>
                      <div className="how-step-title">Monthly Contributions</div>
                      <div className="how-step-desc">All {committee.totalMembers} members deposit ₹{Number(committee.monthlyContribution).toLocaleString('en-IN')} into the secure escrow pool each cycle.</div>
                    </div>
                    <div className="how-step-card">
                      <span className="how-step-num">STEP 2</span>
                      <div className="how-step-title">Pool Aggregation</div>
                      <div className="how-step-desc">Total collected capital forms a ₹{Number(committee.totalChitValue).toLocaleString('en-IN')} chit pool for bidding.</div>
                    </div>
                    <div className="how-step-card">
                      <span className="how-step-num">STEP 3</span>
                      <div className="how-step-title">Reverse Auction</div>
                      <div className="how-step-desc">Members needing funds place reverse bids. Lowest bid wins the lump sum payout for that month.</div>
                    </div>
                    <div className="how-step-card">
                      <span className="how-step-num">STEP 4</span>
                      <div className="how-step-title">Dividend Distribution</div>
                      <div className="how-step-desc">Foregone discount is distributed equally to non-winning members as dividend savings.</div>
                    </div>
                    <div className="how-step-card">
                      <span className="how-step-num">STEP 5</span>
                      <div className="how-step-title">Digital Ledger Audit</div>
                      <div className="how-step-desc">All transactions are recorded immutably on ChitLedger for transparency.</div>
                    </div>
                    <div className="how-step-card">
                      <span className="how-step-num">STEP 6</span>
                      <div className="how-step-title">Complete Cycle</div>
                      <div className="how-step-desc">Process repeats for {committee.durationMonths} months until every member receives their chit payout.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-navy">Committee Member Registry</h3>
                    <p className="text-xs text-muted">Members registered in {committee.name}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-dark bg-emerald/10 px-3 py-1 rounded-full">
                    {committee.joinedMembers} of {committee.totalMembers} Joined
                  </span>
                </div>

                {committee.members && committee.members.length > 0 ? (
                  <MembersTable
                    members={committee.members.map((m, idx) => ({
                      id: m.memberId || `CL-${idx + 1}`,
                      memberId: m.memberId || `CL-${idx + 1}`,
                      name: m.name,
                      email: m.email || 'N/A',
                      phone: m.phone || 'N/A',
                      contributed: committee.monthlyContribution,
                      paymentStatus: 'Paid',
                      risk: 'Low',
                      memberSince: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-IN') : 'Recent',
                    }))}
                  />
                ) : (
                  <div className="py-12 text-center text-muted text-xs">
                    No members have joined this committee yet. Share the committee link with participants!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'auctions' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center py-10 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald mx-auto">
                  <Gavel className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-1">{committee.name} — Live Reverse Auction</h3>
                  <p className="text-xs text-muted max-w-md mx-auto">
                    Reverse auctions for this committee are scheduled according to the {committee.auctionFrequency || 'Monthly'} cycle frequency. Members bid down payout requests; lowest valid bid wins.
                  </p>
                </div>

                <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Chit Value Pool</span>
                    <span className="font-bold text-navy">₹{Number(committee.totalChitValue).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Auction Model</span>
                    <span className="font-bold text-emerald-dark">Reverse Bidding (Lowest Wins)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Frequency</span>
                    <span className="font-bold text-navy">{committee.auctionFrequency || 'Monthly'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/committees/${committee._id || committee.id}/auction`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
                  >
                    <Gavel className="h-4 w-4" />
                    <span>Enter Live Reverse Auction Room</span>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* JOIN CONFIRMATION MODAL */}
      {showJoinModal && (
        <div className="join-modal-backdrop">
          <div className="join-modal-card">
            <h3 className="join-modal-title">Join {committee?.name}?</h3>
            <p className="text-xs text-muted">
              Please review the financial parameters before confirming your membership in this chit committee.
            </p>

            {joinError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {joinError}
              </div>
            )}

            <div className="join-modal-summary">
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Monthly Contribution</span>
                <span className="font-bold text-navy">₹{Number(committee?.monthlyContribution || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Duration</span>
                <span className="font-bold text-navy">{committee?.durationMonths} Months</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Total Chit Value</span>
                <span className="font-bold text-emerald-dark">₹{Number(committee?.totalChitValue || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Capacity</span>
                <span className="font-bold text-navy">{committee?.joinedMembers} / {committee?.totalMembers} Members</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={joinLoading}
                onClick={handleConfirmJoin}
                className="px-6 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white font-bold text-xs transition-colors"
              >
                {joinLoading ? 'Joining...' : 'Confirm & Join Committee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
