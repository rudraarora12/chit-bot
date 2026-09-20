import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/landing/Navbar'
import { MembersTable } from '@/components/members/MembersTable'
import { AddMemberModal } from '@/components/members/AddMemberModal'
import { fetchCommittees, joinCommittee } from '@/services/committeeService'
import { fetchMembers, createMember } from '@/services/memberService'
import { getMySubscription } from '@/services/subscriptionService'
import { useUser } from '@clerk/react'
import { 
  Search, 
  Plus, 
  Users, 
  Gavel, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Building,
  UserCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import './Members.css'

export default function Members() {
  const { user } = useUser()
  const [role, setRole] = useState('member') // 'member' or 'organizer'
  const [committees, setCommittees] = useState([])
  const [membersList, setMembersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters for Member View
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [maxContribFilter, setMaxContribFilter] = useState('All')

  // Modal states
  const [selectedCommitteeToJoin, setSelectedCommitteeToJoin] = useState(null)
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [commRes, membRes] = await Promise.allSettled([
        fetchCommittees({ search, status: statusFilter }),
        fetchMembers(),
      ])

      if (commRes.status === 'fulfilled') {
        setCommittees(commRes.value.data || [])
      } else {
        console.error('Error fetching committees:', commRes.reason)
        setCommittees([])
      }

      if (membRes.status === 'fulfilled') {
        setMembersList(membRes.value.data || [])
      } else {
        setMembersList([])
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Unable to connect to backend server. Please verify backend is running.')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    loadData()
    // Real-time polling fallback every 4s
    const interval = setInterval(() => {
      fetchCommittees({ search, status: statusFilter }).then((res) => {
        if (res && res.data) setCommittees(res.data)
      }).catch(() => {})
    }, 4000)

    return () => clearInterval(interval)
  }, [loadData, search, statusFilter])

  const userEmail = user?.primaryEmailAddress?.emailAddress || ''
  const userName = user?.fullName || 'Chit Member'

  // Handle joining committee
  const handleConfirmJoin = async () => {
    if (!selectedCommitteeToJoin) return
    setJoinLoading(true)
    setJoinError(null)
    try {
      const updated = await joinCommittee(selectedCommitteeToJoin._id || selectedCommitteeToJoin.id, {
        name: userName,
        email: userEmail,
        phone: user?.primaryPhoneNumber?.phoneNumber || '',
      })
      setCommittees((prev) =>
        prev.map((c) => ((c._id === updated._id || c.id === updated.id) ? updated : c))
      )
      setSelectedCommitteeToJoin(null)
    } catch (err) {
      console.error('Join error:', err)
      setJoinError(err.message || 'Failed to join committee.')
    } finally {
      setJoinLoading(false)
    }
  }

  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    async function checkSub() {
      try {
        const sub = await getMySubscription({ email: userEmail, userId: user?.id })
        setSubscription(sub)
      } catch (err) {
        console.error('Subscription check error:', err)
      }
    }
    checkSub()
  }, [userEmail, user?.id])

  const isSubscribed = subscription && subscription.status === 'active' && new Date() < new Date(subscription.endDate)

  // Filtered committees logic
  const filteredCommittees = useMemo(() => {
    return committees.filter((c) => {
      if (maxContribFilter !== 'All') {
        const val = Number(c.monthlyContribution || 0)
        if (maxContribFilter === '<5000' && val > 5000) return false
        if (maxContribFilter === '5000-10000' && (val < 5000 || val > 10000)) return false
        if (maxContribFilter === '>10000' && val < 10000) return false
      }
      return true
    })
  }, [committees, maxContribFilter])

  return (
    <div className="members-page">
      <Navbar />

      <main className="members-page__main">
        <div className="members-page__container">
          {/* ROLE SWITCHER TOOLBAR */}
          <div className="role-switcher-toolbar">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald" />
              <span className="text-xs font-bold uppercase tracking-wider text-navy">View Role Mode</span>
            </div>

            <div className="role-switcher-toggle">
              <button
                type="button"
                className={`role-toggle-btn ${role === 'member' ? 'role-toggle-btn--active' : ''}`}
                onClick={() => setRole('member')}
              >
                Member View (Find Your Chit)
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${role === 'organizer' ? 'role-toggle-btn--active-organizer' : ''}`}
                onClick={() => setRole('organizer')}
              >
                Organizer View (Committee Admin)
              </button>
            </div>
          </div>

          {/* PAGE HEADER */}
          <div className="members-page__header">
            <div>
              <h1 className="members-page__title">
                {role === 'member' ? 'Find Your Chit' : 'Chit Committee Management'}
              </h1>
              <p className="members-page__subtitle">
                {role === 'member'
                  ? 'Explore active chit committees, compare their terms, and join the one that fits you.'
                  : 'Manage active chit groups, configure contribution rules, and inspect member participation.'}
              </p>
            </div>

            {role === 'organizer' && (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/subscription"
                  className={`text-xs px-3 py-2 rounded-xl font-bold border transition-colors ${
                    isSubscribed 
                      ? 'bg-emerald/10 text-emerald-dark border-emerald/20 hover:bg-emerald/20' 
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {isSubscribed 
                    ? `Organizer Plan • Active until ${new Date(subscription.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` 
                    : 'Organizer Plan • Inactive (₹499/mo)'}
                </Link>

                <Link
                  to={isSubscribed ? "/committees/create" : "/subscription"}
                  className="members-page__add-btn"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Create Committee</span>
                </Link>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* ============================================================ */}
          {/* MEMBER VIEW: DISCOVERY FEED & COMMITTEES CARDS */}
          {/* ============================================================ */}
          {role === 'member' ? (
            <>
              {/* FILTER BAR */}
              <div className="committees-filter-bar">
                <div className="search-input-wrap">
                  <Search className="search-icon-pos h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search committees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open for Joining</option>
                  <option value="Full">Full</option>
                </select>

                <select
                  value={maxContribFilter}
                  onChange={(e) => setMaxContribFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Contribution Amounts</option>
                  <option value="<5000">Under ₹5,000 / month</option>
                  <option value="5000-10000">₹5,000 - ₹10,000 / month</option>
                  <option value=">10000">Above ₹10,000 / month</option>
                </select>
              </div>

              {loading ? (
                <div className="py-16 text-center text-muted text-sm font-medium">
                  Loading active chit committees from MongoDB...
                </div>
              ) : filteredCommittees.length === 0 ? (
                <div className="empty-committees-box">
                  <div className="text-4xl mb-3">🤝</div>
                  <h3 className="text-lg font-bold text-navy mb-1">No active chit committees available</h3>
                  <p className="text-xs text-muted max-w-md mx-auto mb-4">
                    New chit committees created by organizers will appear here automatically in real time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className="inline-flex items-center gap-2 text-xs font-bold bg-emerald text-white px-4 py-2 rounded-xl"
                  >
                    <span>Switch to Organizer View & Create One</span>
                  </button>
                </div>
              ) : (
                <div className="committees-grid">
                  {filteredCommittees.map((comm) => {
                    const availableSlots = Math.max(0, comm.totalMembers - (comm.joinedMembers || 0))
                    const isUserJoined = comm.members?.some((m) => m.email && m.email.toLowerCase() === userEmail.toLowerCase())
                    const isFull = availableSlots === 0 || comm.status === 'Full'
                    const isOrganizer =
                      (userEmail && comm.organizerEmail && comm.organizerEmail.toLowerCase() === userEmail.toLowerCase()) ||
                      (user?.id && comm.organizerId && comm.organizerId === user.id) ||
                      (comm.organizer && comm.organizer.toLowerCase() === (user?.fullName || 'Sharma Organizer').toLowerCase())

                    return (
                      <div key={comm._id || comm.id} className="committee-card">
                        <div>
                          <div className="committee-card-header">
                            <div>
                              <h3 className="committee-name">{comm.name}</h3>
                              <p className="committee-organizer">
                                {isOrganizer ? (
                                  <span className="text-indigo-600 font-bold">You created this committee</span>
                                ) : (
                                  `Organized by ${comm.organizer || 'Sharma Organizer'}`
                                )}
                              </p>
                            </div>
                            <span className={isOrganizer ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-bold' : isFull ? 'status-badge-full' : 'status-badge-open'}>
                              {isOrganizer ? 'Organizer' : isFull ? 'Full' : 'Open'}
                            </span>
                          </div>

                          <div className="committee-card-body">
                            <div className="financial-highlight">
                              <span className="monthly-contrib">₹{Number(comm.monthlyContribution).toLocaleString('en-IN')}<span className="text-xs font-medium text-slate-500"> / mo</span></span>
                              <span className="chit-pool-val">₹{Number(comm.totalChitValue).toLocaleString('en-IN')} Chit Value</span>
                            </div>

                            <div className="capacity-progress-box">
                              <div className="capacity-text">
                                <span>{comm.joinedMembers || 0} / {comm.totalMembers} Members</span>
                                <span className="capacity-slots-avail">{availableSlots} Slots Available</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.round(((comm.joinedMembers || 0) / comm.totalMembers) * 100))}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-100">
                              <div>Duration: <strong>{comm.durationMonths} Months</strong></div>
                              <div>Auction: <strong>{comm.auctionFrequency || 'Monthly'}</strong></div>
                              <div>Starts: <strong>{comm.startDate ? new Date(comm.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Soon'}</strong></div>
                              <div>Type: <strong>{comm.auctionType || 'Reverse'}</strong></div>
                            </div>
                          </div>
                        </div>

                        <div className="committee-card-footer">
                          <Link to={`/committees/${comm._id || comm.id}`} className="btn-card-details">
                            View Details
                          </Link>

                          {isOrganizer ? (
                            <Link to={`/committees/${comm._id || comm.id}`} className="btn-card-join bg-slate-900 text-white hover:bg-slate-800">
                              Manage Committee
                            </Link>
                          ) : isUserJoined ? (
                            <Link to="/member/dashboard" className="btn-card-join bg-emerald/20 text-emerald-dark hover:bg-emerald/30">
                              Open My Chit
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled={isFull}
                              onClick={() => setSelectedCommitteeToJoin(comm)}
                              className="btn-card-join"
                            >
                              {isFull ? 'Full' : 'Join Committee'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            /* ============================================================ */
            /* ORGANIZER VIEW: COMMITTEE ADMIN & MEMBER MANAGEMENT */
            /* ============================================================ */
            <div className="space-y-8">
              {/* ORGANIZER COMMITTEES OVERVIEW */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-navy">Active Chit Groups Managed</h3>
                    <p className="text-xs text-muted">Real-time status of your organized chit circles</p>
                  </div>
                  <Link to="/committees/create" className="text-xs font-bold text-emerald hover:underline">
                    + Create Another Circle
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {committees.map((comm) => (
                    <div key={comm._id || comm.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-navy text-sm">{comm.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald/10 text-emerald-dark">
                            {comm.joinedMembers} / {comm.totalMembers} Joined
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          ₹{Number(comm.monthlyContribution).toLocaleString('en-IN')}/mo • Pool: ₹{Number(comm.totalChitValue).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">{comm.durationMonths} Months</span>
                        <Link to={`/committees/${comm._id || comm.id}`} className="text-xs font-bold text-emerald hover:underline">
                          Manage Circle →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EMBEDDED ORGANIZER MEMBER MANAGEMENT TABLE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-navy">Global Member Directory</h3>
                    <p className="text-xs text-muted">All registered members across chit groups</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald text-white text-xs font-semibold"
                  >
                    + Add Member
                  </button>
                </div>

                <MembersTable members={membersList} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* JOIN CONFIRMATION MODAL FOR MEMBER VIEW */}
      {selectedCommitteeToJoin && (
        <div className="join-modal-backdrop">
          <div className="join-modal-card">
            <h3 className="join-modal-title">Join {selectedCommitteeToJoin.name}?</h3>
            <p className="text-xs text-muted">
              Confirm your participation in this community chit group.
            </p>

            {joinError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {joinError}
              </div>
            )}

            <div className="join-modal-summary">
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Monthly Contribution</span>
                <span className="font-bold text-navy">₹{Number(selectedCommitteeToJoin.monthlyContribution).toLocaleString('en-IN')}</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Total Chit Value</span>
                <span className="font-bold text-emerald-dark">₹{Number(selectedCommitteeToJoin.totalChitValue).toLocaleString('en-IN')}</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Duration</span>
                <span className="font-bold text-navy">{selectedCommitteeToJoin.durationMonths} Months</span>
              </div>
              <div className="modal-summary-row">
                <span className="text-slate-600 font-medium">Capacity</span>
                <span className="font-bold text-navy">{selectedCommitteeToJoin.joinedMembers} / {selectedCommitteeToJoin.totalMembers} Members</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedCommitteeToJoin(null)}
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
                {joinLoading ? 'Joining...' : 'Confirm & Join'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <AddMemberModal
          onClose={() => setShowAddMemberModal(false)}
          onAdd={(newM) => setMembersList((prev) => [newM, ...prev])}
        />
      )}
    </div>
  )
}
