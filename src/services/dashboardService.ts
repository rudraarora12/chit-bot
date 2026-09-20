import type { DashboardData, RiskAlert } from '@/data/dashboard'

const API_BASE = 'http://127.0.0.1:5050/api'
const formatCurrency = (value: number) =>
  Number.isFinite(value) && value > 0 ? `₹${value.toLocaleString('en-IN')}` : '—'
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
const dateText = (value: unknown) => {
  const date = value ? new Date(value as string) : null
  if (!date || isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE}/dashboard`)
  if (!response.ok) throw new Error('Dashboard data is unavailable')
  const payload = await response.json()
  const data = payload.data
  const total = data.paymentStatus.totalMembers
  const target = Number(data.collection.target)
  const collected = Number(data.collection.collected)
  const percentage =
    Number.isFinite(target) && target > 0 ? Math.round((collected / target) * 100) : 0
  const riskAlerts: RiskAlert[] = (data.riskAlerts || []).map((alert: any) => ({
    id: String(alert.id), memberId: String(alert.memberId), memberName: alert.memberName,
    avatarInitials: initials(alert.memberName), riskLevel: alert.riskLevel,
    reason: alert.reason, timestamp: dateText(alert.createdAt),
  }))
  return {
    currentCycle: data.currentCycle,
    summaryStats: [
      { id: 'active-members', label: 'Active Members', value: String(data.activeMembers), supportingText: data.activeMembers ? 'Members in this group' : 'No members added yet.', iconName: 'users' },
      { id: 'cycle-target', label: 'Current Cycle Target', value: target > 0 ? formatCurrency(target) : '—', supportingText: data.currentCycle ? `Cycle ${data.currentCycle}` : 'No active cycle.', iconName: 'layers' },
      { id: 'collected', label: 'Collected This Cycle', value: data.collection.hasData ? (collected > 0 ? formatCurrency(collected) : '—') : '—', supportingText: data.collection.hasData ? (collected > 0 ? `Cycle ${data.currentCycle} collection` : 'No payments recorded for this cycle.') : 'No payments recorded for this cycle.', iconName: 'wallet' },
      { id: 'pending', label: 'Pending Collection', value: data.collection.pending === null || data.collection.pending === undefined ? '—' : formatCurrency(Number(data.collection.pending)), supportingText: data.collection.hasData ? `${data.paymentStatus.pending + data.paymentStatus.overdue} member payment(s) open` : 'No payments recorded for this cycle.', iconName: 'clock' },
      { id: 'risk-alerts', label: 'Risk Alerts', value: String(riskAlerts.length), supportingText: riskAlerts.length ? 'Active signals require review' : 'No active risk signals.', iconName: 'shieldAlert' },
    ],
    currentAuction: data.auction ? { ...data.auction, date: dateText(data.auction.date) } : null,
    collectionOverview: { ...data.collection, target: target > 0 ? target : null, pending: data.collection.pending === null || data.collection.pending === undefined ? null : Number(data.collection.pending), percentage, cycle: data.currentCycle },
    paymentStatus: { paidCount: data.paymentStatus.paid, pendingCount: data.paymentStatus.pending, overdueCount: data.paymentStatus.overdue, totalMembers: total, hasData: data.paymentStatus.hasData },
    riskAlerts,
    recentTransactions: (data.ledger || []).map((entry: any) => ({ id: entry.id, date: dateText(entry.occurredAt), member: entry.member, activity: entry.activity, amount: formatCurrency(entry.amount), status: entry.status === 'Paid' ? 'Completed' : entry.status })),
  }
}

export const dashboardService = { fetchDashboardData }