import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Navbar } from '@/components/landing/Navbar'
import { getMySubscription, activateDemoSubscription, resetDemoSubscription } from '@/services/subscriptionService'
import { useUser } from '@clerk/react'
import { 
  Check, 
  ShieldCheck, 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Building,
  RotateCcw
} from 'lucide-react'
import './SubscriptionPage.css'

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState(null)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const userEmail = user?.primaryEmailAddress?.emailAddress || ''
  const userId = user?.id || 'ORG-001'
  const userName = user?.fullName || 'Sharma Organizer'

  useEffect(() => {
    async function checkSub() {
      setLoading(true)
      try {
        const data = await getMySubscription({ email: userEmail, userId })
        setSubscription(data)
      } catch (err) {
        console.error('Error checking subscription:', err)
      } finally {
        setLoading(false)
      }
    }
    checkSub()
  }, [userEmail, userId])

  const isSubscribed = subscription && subscription.status === 'active' && new Date() < new Date(subscription.endDate)

  const handleActivate = async () => {
    setActivating(true)
    setError(null)
    try {
      const data = await activateDemoSubscription({
        organizerEmail: userEmail,
        organizerId: userId,
        organizerName: userName,
      })
      setSubscription(data)
      setShowDemoModal(false)
      setSuccessMsg('Organizer subscription activated successfully!')
    } catch (err) {
      console.error('Activation error:', err)
      setError(err.message || 'Failed to activate demo subscription.')
    } finally {
      setActivating(false)
    }
  }

  const handleReset = async () => {
    setActivating(true)
    setError(null)
    try {
      await resetDemoSubscription({
        organizerEmail: userEmail,
        organizerId: userId,
      })
      setSubscription(null)
      setSuccessMsg('Subscription reset to expired. You can now test the unsubscribed flow!')
    } catch (err) {
      console.error('Reset error:', err)
      setError(err.message || 'Failed to reset demo subscription.')
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="subscription-page">
      <Navbar />

      <main className="subscription-container">
        <div className="mb-4 text-left">
          <Link to="/members" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-dark hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Committees</span>
          </Link>
        </div>

        <div className="subscription-header">
          <h1 className="subscription-title">Unlock Organizer Tools</h1>
          <p className="subscription-subtitle">
            Create and manage your own chit committees with ChitLedger.
          </p>
        </div>

        {successMsg && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald" />
              <span>{successMsg}</span>
            </div>
            <Link to="/committees/create" className="px-3 py-1.5 rounded-lg bg-emerald text-white text-xs font-bold">
              Create Committee →
            </Link>
          </div>
        )}

        <div className="pricing-card-wrap">
          <div className="pricing-card">
            <span className="popular-badge">ChitLedger MVP Plan</span>

            <h3 className="plan-name">ChitLedger Organizer</h3>
            <p className="plan-desc">
              For organizers who want to digitise, automate, and manage their chit committees securely.
            </p>

            <div className="plan-price-box">
              <span className="plan-price">₹499</span>
              <span className="plan-period">/ month</span>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>Create chit committees</span>
              </div>
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>Manage members & contribution ledger</span>
              </div>
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>Digital ledger & payment tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>Live reverse auction management</span>
              </div>
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>AI Risk Monitoring telemetry</span>
              </div>
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>Real-time committee updates</span>
              </div>
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>Organizer control center analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-check-icon"><Check className="h-3.5 w-3.5" /></span>
                <span>AI-powered financial assistance</span>
              </div>
            </div>

            {isSubscribed ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 text-center">
                  Active Subscription • Valid until {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <Link to="/committees/create" className="btn-subscribe-cta text-center block">
                  Create Your Committee
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-center block"
                >
                  Go to Organizer Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={activating}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                  <span>Reset Subscription (Test Unsubscribed Flow)</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="btn-subscribe-cta"
              >
                Subscribe & Start Organizing
              </button>
            )}

            <div className="demo-notice-bar">
              Development Demo Mode — Activate subscription to test committee creation.
            </div>
          </div>
        </div>

        {/* Member Free Notice */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Note: Chit committee member access remains <strong>100% FREE</strong> for all participants.
        </div>
      </main>

      {/* DEMO ACTIVATION CONFIRMATION MODAL */}
      {showDemoModal && (
        <div className="demo-modal-backdrop">
          <div className="demo-modal-card text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-emerald" />
              <h3 className="text-lg font-bold text-navy">Activate Organizer Subscription</h3>
            </div>
            <p className="text-xs text-muted mb-4">
              Development mode — no real payment gateway is charged in demo environment.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Plan</span>
                <span className="font-bold text-navy">ChitLedger Organizer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Price</span>
                <span className="font-bold text-emerald-dark">₹499 / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Validity</span>
                <span className="font-bold text-navy">30 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Environment</span>
                <span className="font-bold text-indigo-600">Demo Activation</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={activating}
                onClick={handleActivate}
                className="px-6 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white font-bold text-xs transition-colors shadow-lg shadow-emerald/20"
              >
                {activating ? 'Activating...' : 'Activate Demo Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
