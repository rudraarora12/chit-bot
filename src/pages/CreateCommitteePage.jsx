import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Navbar } from '@/components/landing/Navbar'
import { createCommittee } from '@/services/committeeService'
import { getMySubscription } from '@/services/subscriptionService'
import { useUser } from '@clerk/react'
import { ArrowLeft, CheckCircle, Calculator, Users, DollarSign, Calendar, Gavel, Lock, Sparkles } from 'lucide-react'
import './CreateCommitteePage.css'

export default function CreateCommitteePage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subChecking, setSubChecking] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const userEmail = user?.primaryEmailAddress?.emailAddress || ''
  const userName = user?.fullName || 'Sharma Organizer'
  const userId = user?.id || 'ORG-001'

  useEffect(() => {
    async function checkSub() {
      setSubChecking(true)
      try {
        const sub = await getMySubscription({ email: userEmail, userId })
        if (sub && sub.status === 'active' && new Date() < new Date(sub.endDate)) {
          setIsSubscribed(true)
        } else {
          setIsSubscribed(false)
        }
      } catch (err) {
        console.error('Subscription check error:', err)
        setIsSubscribed(false)
      } finally {
        setSubChecking(false)
      }
    }
    checkSub()
  }, [userEmail, userId])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizer: userName,
    organizerEmail: userEmail,
    organizerId: userId,
    totalMembers: '20',
    minMembersToStart: '15',
    monthlyContribution: '10000',
    durationMonths: '20',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    joiningDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    auctionFrequency: 'Monthly',
    auctionType: 'Reverse Auction',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const calculatedChitPool = (Number(formData.monthlyContribution) || 0) * (Number(formData.totalMembers) || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isSubscribed) {
      setError('An active Organizer subscription is required to create a committee.')
      navigate('/subscription')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const created = await createCommittee({
        ...formData,
        organizer: formData.organizer || userName,
        organizerEmail: userEmail || formData.organizerEmail,
        organizerId: userId || formData.organizerId,
        totalChitValue: calculatedChitPool,
      })
      navigate(`/committees/${created._id || created.id || ''}`)
    } catch (err) {
      console.error('Error creating committee:', err)
      if (err.message && err.message.includes('subscription')) {
        navigate('/subscription')
      } else {
        setError(err.message || 'Failed to create chit committee. Please verify backend is connected.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-committee-page">
      <Navbar />

      <main className="create-committee-container">
        <div className="mb-4">
          <Link to="/members" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-dark hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Committees</span>
          </Link>
        </div>

        <div className="create-committee-header">
          <h1 className="create-committee-title">Create New Chit Committee</h1>
          <p className="create-committee-subtitle">
            Set up the rules, contribution amount, member capacity and duration for your chit group.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {subChecking ? (
          <div className="py-16 text-center text-muted text-sm font-medium">
            Verifying organizer subscription status from MongoDB...
          </div>
        ) : !isSubscribed ? (
          <div className="bg-white p-8 rounded-2xl border border-amber-200 shadow-sm text-center my-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold text-navy mb-2">Organizer Subscription Required</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
              An active ChitLedger Organizer subscription (₹499/month) is required before you can create a new chit committee.
            </p>
            <Link to="/subscription" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald text-white font-bold text-xs shadow-md shadow-emerald/20 hover:bg-emerald-dark transition-colors">
              <Sparkles className="h-4 w-4" />
              <span>View Organizer Plan & Activate Demo (₹499/mo)</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="create-form-card">
          {/* SECTION 1 — BASIC DETAILS */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="form-section-number">1</span>
              <span>Basic Details</span>
            </h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Committee Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Family Savings Circle"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose, eligibility rules, or payout guidelines for this chit group..."
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 — COMMITTEE SIZE */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="form-section-number">2</span>
              <span>Committee Size & Capacity</span>
            </h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="totalMembers">Total Members Required *</label>
                <input
                  id="totalMembers"
                  name="totalMembers"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 20"
                  value={formData.totalMembers}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="minMembersToStart">Minimum Members to Start</label>
                <input
                  id="minMembersToStart"
                  name="minMembersToStart"
                  type="number"
                  min="1"
                  placeholder="e.g. 15"
                  value={formData.minMembersToStart}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 — MONEY & CONTRIBUTION */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="form-section-number">3</span>
              <span>Money & Contribution</span>
            </h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="monthlyContribution">Monthly Contribution per Member (₹) *</label>
                <input
                  id="monthlyContribution"
                  name="monthlyContribution"
                  type="number"
                  min="100"
                  required
                  placeholder="e.g. 10000"
                  value={formData.monthlyContribution}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Total Chit Pool</label>
                <input
                  type="text"
                  disabled
                  value={`₹${calculatedChitPool.toLocaleString('en-IN')}`}
                  className="form-input bg-slate-100 text-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="calculated-pool-banner">
              <div>
                <span className="calculated-pool-label">Estimated Pool Value per Cycle</span>
                <p className="text-xs text-emerald-800">Monthly Contribution × Total Members</p>
              </div>
              <div className="calculated-pool-val">₹{calculatedChitPool.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* SECTION 4 — DURATION & DATES */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="form-section-number">4</span>
              <span>Duration & Timeline</span>
            </h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="durationMonths">Duration (Months) *</label>
                <input
                  id="durationMonths"
                  name="durationMonths"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 20"
                  value={formData.durationMonths}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Start Date *</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="joiningDeadline">Joining Deadline</label>
                <input
                  id="joiningDeadline"
                  name="joiningDeadline"
                  type="date"
                  value={formData.joiningDeadline}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5 — AUCTION SETTINGS */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="form-section-number">5</span>
              <span>Auction & Bidding Rules</span>
            </h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="auctionFrequency">Auction Frequency</label>
                <select
                  id="auctionFrequency"
                  name="auctionFrequency"
                  value={formData.auctionFrequency}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auctionType">Auction Type</label>
                <select
                  id="auctionType"
                  name="auctionType"
                  value={formData.auctionType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Reverse Auction">Reverse Auction (Bidding Discount)</option>
                  <option value="Standard Auction">Standard Auction</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 6 — REVIEW & SUBMIT */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="form-section-number">6</span>
              <span>Review Committee Summary</span>
            </h3>
            <div className="review-box">
              <div className="review-grid">
                <div>
                  <div className="review-item-label">Committee Name</div>
                  <div className="review-item-val">{formData.name || 'Unnamed Circle'}</div>
                </div>
                <div>
                  <div className="review-item-label">Capacity</div>
                  <div className="review-item-val">{formData.totalMembers} Members</div>
                </div>
                <div>
                  <div className="review-item-label">Monthly Contribution</div>
                  <div className="review-item-val">₹{Number(formData.monthlyContribution || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="review-item-label">Chit Value</div>
                  <div className="review-item-val text-emerald-dark">₹{calculatedChitPool.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="review-item-label">Duration</div>
                  <div className="review-item-val">{formData.durationMonths} Months</div>
                </div>
                <div>
                  <div className="review-item-label">Start Date</div>
                  <div className="review-item-val">{formData.startDate || 'TBD'}</div>
                </div>
                <div>
                  <div className="review-item-label">Auction</div>
                  <div className="review-item-val">{formData.auctionFrequency} ({formData.auctionType})</div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="form-actions">
            <Link to="/members" className="btn-cancel-committee">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit-committee"
            >
              {loading ? 'Creating Committee...' : 'Create Committee'}
            </button>
          </div>
        </form>
        )}
      </main>
    </div>
  )
}
