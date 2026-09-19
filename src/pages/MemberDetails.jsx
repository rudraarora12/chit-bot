import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { RiskCard } from '@/components/members/RiskCard';
import { memberService } from '@/services/memberService';
import './MemberDetails.css';

/* ─── Helpers ─── */
function StatusBadge({ status }) {
  const map = {
    Paid:    'mdb-badge mdb-badge--paid',
    Pending: 'mdb-badge mdb-badge--pending',
    Overdue: 'mdb-badge mdb-badge--overdue',
    Late:    'mdb-badge mdb-badge--late',
    Missed:  'mdb-badge mdb-badge--missed',
  };
  return <span className={map[status] || 'mdb-badge'}>{status}</span>;
}

function RiskBadge({ risk }) {
  const map = {
    Low:    'mdb-badge mdb-badge--low',
    Medium: 'mdb-badge mdb-badge--medium',
    High:   'mdb-badge mdb-badge--high',
  };
  const r = risk || 'Low';
  return (
    <span className={map[r] || 'mdb-badge'}>
      <span className={`mdb-badge__dot mdb-badge__dot--${r.toLowerCase()}`} aria-hidden="true" />
      {r} Risk
    </span>
  );
}

function AuctionResult({ result }) {
  return (
    <span className={result === 'Won' ? 'mdb-badge mdb-badge--paid' : 'mdb-badge mdb-badge--pending'}>
      {result}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`mdb-stat-card mdb-stat-card--${accent || 'default'}`}>
      <p className="mdb-stat-card__label">{label}</p>
      <p className="mdb-stat-card__value">{value}</p>
      {sub && <p className="mdb-stat-card__sub">{sub}</p>}
    </div>
  );
}

function BehaviourStat({ label, value, accent }) {
  return (
    <div className="mdb-behav-item">
      <span className="mdb-behav-item__label">{label}</span>
      <span className={`mdb-behav-item__value${accent ? ` mdb-behav-item__value--${accent}` : ''}`}>{value}</span>
    </div>
  );
}

/* ─── Page ─── */
export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMember() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await memberService.fetchMemberById(id);
        setMember(data);
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError('Unable to load member details. Please check that the backend is running.');
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [id]);

  if (loading) {
    return (
      <div className="mdb-page">
        <Navbar />
        <main className="mdb-main">
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading member details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mdb-page">
        <Navbar />
        <main className="mdb-not-found">
          <div className="mdb-not-found__icon" aria-hidden="true">⚠️</div>
          <h2 className="mdb-not-found__title">Error Loading Details</h2>
          <p className="mdb-not-found__sub">{error}</p>
          <button className="mdb-back-btn" type="button" onClick={() => navigate('/members')}>
            ← Back to Members
          </button>
        </main>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mdb-page">
        <Navbar />
        <main className="mdb-not-found">
          <div className="mdb-not-found__icon" aria-hidden="true">👤</div>
          <h2 className="mdb-not-found__title">Member not found</h2>
          <p className="mdb-not-found__sub">No member with ID <strong>{id}</strong> exists in the system.</p>
          <button className="mdb-back-btn" type="button" onClick={() => navigate('/members')}>
            ← Back to Members
          </button>
        </main>
      </div>
    );
  }

  const joinDate = new Date(member.memberSince).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const riskColor = member.risk === 'Low' ? 'green' : member.risk === 'Medium' ? 'amber' : 'red';
  const trendClass = member.recentTrend === 'Excellent' || member.recentTrend === 'Stable'
    ? 'good' : member.recentTrend === 'Declining' ? 'warn' : 'bad';

  return (
    <div className="mdb-page">
      <Navbar />
      <main className="mdb-main">
        <div className="mdb-container">

          {/* Breadcrumb */}
          <nav className="mdb-breadcrumb" aria-label="Breadcrumb">
            <button className="mdb-breadcrumb__link" type="button" onClick={() => navigate('/members')}>
              Member Management
            </button>
            <span className="mdb-breadcrumb__sep" aria-hidden="true">/</span>
            <span className="mdb-breadcrumb__current">{member.name}</span>
          </nav>

          {/* ── Hero profile card ── */}
          <section className="mdb-hero">
            <div className={`mdb-hero__accent mdb-hero__accent--${riskColor}`} aria-hidden="true" />
            <div className="mdb-hero__inner">
              {/* Left: avatar + identity */}
              <div className="mdb-hero__left">
                <div className="mdb-hero__avatar-wrap">
                  <div className="mdb-hero__avatar">{member.avatar}</div>
                  <span className={`mdb-hero__status-dot mdb-hero__status-dot--${riskColor}`} aria-hidden="true" />
                </div>
                <div>
                  <h1 className="mdb-hero__name">{member.name}</h1>
                  <div className="mdb-hero__meta">
                    <span className="mdb-hero__id">{member.id}</span>
                    <span className="mdb-hero__since">Member since {joinDate}</span>
                  </div>
                  <div className="mdb-hero__badges">
                    <span className="mdb-badge mdb-badge--active">Active</span>
                    <StatusBadge status={member.paymentStatus} />
                    <RiskBadge risk={member.risk} />
                  </div>
                </div>
              </div>

              {/* Right: quick stats */}
              <div className="mdb-hero__quick-stats">
                <div className="mdb-hero__quick-stat">
                  <span className="mdb-hero__quick-stat-label">Monthly</span>
                  <span className="mdb-hero__quick-stat-value">
                    ₹{member.monthlyContribution.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mdb-hero__quick-stat-divider" aria-hidden="true" />
                <div className="mdb-hero__quick-stat">
                  <span className="mdb-hero__quick-stat-label">Auctions</span>
                  <span className="mdb-hero__quick-stat-value">{member.auctions}</span>
                </div>
                <div className="mdb-hero__quick-stat-divider" aria-hidden="true" />
                <div className="mdb-hero__quick-stat">
                  <span className="mdb-hero__quick-stat-label">Consistency</span>
                  <span className={`mdb-hero__quick-stat-value mdb-hero__quick-stat-value--${riskColor}`}>
                    {member.paymentConsistency}%
                  </span>
                </div>
              </div>
            </div>

            {/* Contact row */}
            <div className="mdb-hero__contact">
              <span className="mdb-hero__contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.87 13.5 19.79 19.79 0 0 1 1.78 5a2 2 0 0 1 1.98-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {member.phone}
              </span>
              <span className="mdb-hero__contact-sep" aria-hidden="true">·</span>
              <span className="mdb-hero__contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {member.email}
              </span>
              {member.address && (
                <>
                  <span className="mdb-hero__contact-sep" aria-hidden="true">·</span>
                  <span className="mdb-hero__contact-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {member.address}
                  </span>
                </>
              )}
            </div>
          </section>

          {/* ── Contribution Summary ── */}
          <section className="mdb-section">
            <h2 className="mdb-section__title">Contribution Summary</h2>
            <div className="mdb-stat-grid">
              <StatCard
                label="Total Contributed"
                value={member.contributed.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                sub={`${member.paymentsMAde} payments completed`}
                accent="green"
              />
              <StatCard
                label="Total Pending"
                value={member.pending === 0 ? '₹0' : member.pending.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                sub={member.pending === 0 ? 'All clear' : 'Outstanding balance'}
                accent={member.pending === 0 ? 'green' : 'amber'}
              />
              <StatCard
                label="Payments Made"
                value={member.paymentsMAde}
                sub="Completed cycles"
                accent="blue"
              />
              <StatCard
                label="Payments Missed"
                value={member.missedPayments}
                sub={member.missedPayments === 0 ? 'Perfect record' : 'Needs attention'}
                accent={member.missedPayments === 0 ? 'green' : 'red'}
              />
            </div>
          </section>

          {/* ── Two-column content ── */}
          <div className="mdb-two-col">

            {/* Main column */}
            <div className="mdb-two-col__main">

              {/* Payment History */}
              <section className="mdb-section">
                <div className="mdb-section__header">
                  <h2 className="mdb-section__title">Payment History</h2>
                  <div className="mdb-section__pills">
                    <span className="mdb-pill mdb-pill--green">{member.paymentHistory.filter(p => p.status === 'Paid').length} Paid</span>
                    {member.paymentHistory.filter(p => p.status === 'Late').length > 0 &&
                      <span className="mdb-pill mdb-pill--amber">{member.paymentHistory.filter(p => p.status === 'Late').length} Late</span>}
                    {member.paymentHistory.filter(p => p.status === 'Missed' || p.status === 'Overdue').length > 0 &&
                      <span className="mdb-pill mdb-pill--red">{member.paymentHistory.filter(p => p.status === 'Missed' || p.status === 'Overdue').length} Missed/Overdue</span>}
                  </div>
                </div>
                <div className="mdb-table-wrap">
                  {member.paymentHistory.length === 0 ? (
                    <p className="mdb-table-empty">No payment history available yet.</p>
                  ) : (
                    <table className="mdb-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Cycle</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {member.paymentHistory.map((p, i) => (
                          <tr key={i} className={`mdb-table__row mdb-table__row--${(p.status || '').toLowerCase()}`}>
                            <td className="mdb-table__mono">{p.date !== '-' ? p.date : <span className="mdb-table__nil">—</span>}</td>
                            <td className="mdb-table__cycle">{p.cycle}</td>
                            <td className="mdb-table__amount">{p.amount}</td>
                            <td className="mdb-table__mono">{p.dueDate}</td>
                            <td><StatusBadge status={p.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              {/* Payment Behaviour */}
              <section className="mdb-section">
                <h2 className="mdb-section__title">Late &amp; Missed Payments</h2>
                <div className="mdb-behav-grid">
                  <div className={`mdb-behav-card mdb-behav-card--${member.latePayments > 2 ? 'amber' : 'default'}`}>
                    <p className="mdb-behav-card__num">{member.latePayments}</p>
                    <p className="mdb-behav-card__label">Late Payments</p>
                  </div>
                  <div className={`mdb-behav-card mdb-behav-card--${member.missedPayments > 0 ? 'red' : 'default'}`}>
                    <p className="mdb-behav-card__num">{member.missedPayments}</p>
                    <p className="mdb-behav-card__label">Missed Payments</p>
                  </div>
                  <div className="mdb-behav-card">
                    <p className="mdb-behav-card__num">{member.avgDelay}</p>
                    <p className="mdb-behav-card__label">Average Delay</p>
                  </div>
                  <div className="mdb-behav-card">
                    <p className="mdb-behav-card__num">{member.longestDelay}</p>
                    <p className="mdb-behav-card__label">Longest Delay</p>
                  </div>
                </div>
              </section>

              {/* Auction History */}
              <section className="mdb-section">
                <div className="mdb-section__header">
                  <h2 className="mdb-section__title">Auction Participation</h2>
                  <div className="mdb-section__pills">
                    <span className="mdb-pill mdb-pill--blue">{member.auctions} total</span>
                    <span className="mdb-pill mdb-pill--green">{member.auctionHistory.filter(a => a.result === 'Won').length} won</span>
                  </div>
                </div>
                <div className="mdb-table-wrap">
                  {member.auctionHistory.length === 0 ? (
                    <p className="mdb-table-empty">No auction history available yet.</p>
                  ) : (
                    <table className="mdb-table">
                      <thead>
                        <tr>
                          <th>Auction</th>
                          <th>Date</th>
                          <th>Bid / Discount</th>
                          <th>Result</th>
                          <th>Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {member.auctionHistory.map((a, i) => (
                          <tr key={i}>
                            <td className="mdb-table__bold">{a.auction}</td>
                            <td className="mdb-table__mono">{a.date}</td>
                            <td>{a.bidDiscount}</td>
                            <td><AuctionResult result={a.result} /></td>
                            <td className={`mdb-table__pos${a.position === '1st' ? ' mdb-table__pos--first' : ''}`}>{a.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>

            {/* ── Sidebar ── */}
            <aside className="mdb-two-col__aside">

              {/* Payment Behaviour Summary */}
              <section className="mdb-card">
                <h3 className="mdb-card__title">Payment Behaviour</h3>

                <div className="mdb-consist">
                  <div className="mdb-consist__header">
                    <span className="mdb-consist__label">Consistency Score</span>
                    <span className={`mdb-consist__pct mdb-consist__pct--${riskColor}`}>{member.paymentConsistency}%</span>
                  </div>
                  <div className="mdb-bar-track">
                    <div
                      className={`mdb-bar-fill mdb-bar-fill--${riskColor}`}
                      style={{ width: `${member.paymentConsistency}%` }}
                      role="progressbar"
                      aria-valuenow={member.paymentConsistency}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="mdb-bar-legend">
                    <span>Poor</span><span>Excellent</span>
                  </div>
                </div>

                <div className="mdb-behav-stats">
                  <BehaviourStat label="On-time payments" value={member.onTimePayments} />
                  <BehaviourStat label="Avg. payment delay" value={member.avgPaymentDelay} />
                  <BehaviourStat
                    label="Recent trend"
                    value={member.recentTrend}
                    accent={trendClass}
                  />
                </div>
              </section>

              {/* AI Risk Card */}
              <RiskCard member={member} />

            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}
