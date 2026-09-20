import type { DashboardData, RiskAlert, Transaction } from '@/data/dashboard';

const API_BASE = 'http://127.0.0.1:5050/api';

/**
 * Generate initials from member name (e.g. "Ravi Kumar" -> "RK")
 */
function getInitials(name: string): string {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Fetch real-time aggregated dashboard data from MongoDB backend
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  const [statsRes, membersRes, riskRes] = await Promise.allSettled([
    fetch(`${API_BASE}/dashboard/stats`).then((res) => (res.ok ? res.json() : null)),
    fetch(`${API_BASE}/members`).then((res) => (res.ok ? res.json() : null)),
    fetch(`${API_BASE}/risk`).then((res) => (res.ok ? res.json() : null)),
  ]);

  const statsData = statsRes.status === 'fulfilled' && statsRes.value?.data ? statsRes.value.data : {};
  const members = membersRes.status === 'fulfilled' && membersRes.value?.data ? membersRes.value.data : [];
  const riskDocs = riskRes.status === 'fulfilled' && riskRes.value?.data ? riskRes.value.data : [];

  const totalMembers = members.length || statsData.totalMembers || 0;
  const totalCollectedRaw = members.reduce((sum: number, m: any) => sum + (m.totalContributed || m.contributed || 0), 0) || statsData.totalContributions || 0;
  const pendingAmountRaw = members.reduce((sum: number, m: any) => sum + (m.pendingAmount || m.pending || 0), 0) || statsData.pendingAmount || 0;
  const pendingPaymentsCount = members.filter((m: any) => (m.paymentStatus || 'Pending') !== 'Paid').length || statsData.pendingPayments || 0;

  // Build Risk Alerts from MongoDB members or RiskAlert collection
  const riskAlerts: RiskAlert[] = [];
  if (Array.isArray(riskDocs) && riskDocs.length > 0) {
    riskDocs.forEach((r: any, idx: number) => {
      const m = r.member || {};
      riskAlerts.push({
        id: r._id || `risk-${idx}`,
        memberId: m.memberId || m._id || `CL-${idx}`,
        memberName: m.name || 'Member',
        avatarInitials: getInitials(m.name || 'Member'),
        riskLevel: r.riskLevel || 'Medium',
        reason: Array.isArray(r.reasons) ? r.reasons[0] : 'Payment delay detected',
        timestamp: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent',
      });
    });
  } else {
    members.forEach((m: any, idx: number) => {
      const risk = m.riskLevel || m.risk || 'Low';
      if (risk === 'High' || risk === 'Medium') {
        riskAlerts.push({
          id: m._id || `risk-${idx}`,
          memberId: m.memberId || m.id || `CL-${idx}`,
          memberName: m.name || 'Member',
          avatarInitials: getInitials(m.name || 'Member'),
          riskLevel: risk as 'High' | 'Medium',
          reason: Array.isArray(m.riskReasons) && m.riskReasons.length > 0
            ? m.riskReasons[0]
            : `${risk} risk profile recorded`,
          timestamp: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : 'Active',
        });
      }
    });
  }

  // Payment Status Distribution
  const paidCount = members.filter((m: any) => m.paymentStatus === 'Paid').length;
  const pendingCount = members.filter((m: any) => m.paymentStatus === 'Pending' || !m.paymentStatus).length;
  const overdueCount = members.filter((m: any) => m.paymentStatus === 'Overdue').length;

  const paidPct = totalMembers > 0 ? Number(((paidCount / totalMembers) * 100).toFixed(1)) : 0;
  const pendingPct = totalMembers > 0 ? Number(((pendingCount / totalMembers) * 100).toFixed(1)) : 0;
  const overduePct = totalMembers > 0 ? Number(((overdueCount / totalMembers) * 100).toFixed(1)) : 0;

  // Build Recent Transactions from MongoDB members
  const recentTransactions: Transaction[] = members.slice(0, 7).map((m: any, idx: number) => ({
    id: m._id || `tx-${idx}`,
    date: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
    member: m.name,
    activity: m.paymentStatus === 'Paid' ? 'Contribution' : 'Pending Payment',
    type: m.paymentStatus === 'Paid' ? 'contribution' : 'pending',
    amount: `₹${(m.monthlyContribution || 0).toLocaleString('en-IN')}`,
    status: m.paymentStatus === 'Paid' ? 'Completed' : m.paymentStatus === 'Overdue' ? 'Overdue' : 'Pending',
  }));

  const totalTargetRaw = totalCollectedRaw + pendingAmountRaw;
  const collectionPct = totalTargetRaw > 0 ? Math.round((totalCollectedRaw / totalTargetRaw) * 100) : 0;

  return {
    groupName: 'ChitLedger Live Control Center',
    currentCycle: 1,
    totalCycles: 12,

    summaryStats: [
      {
        id: 'total-members',
        label: 'Total Members',
        value: totalMembers.toString(),
        supportingText: 'Active participants in MongoDB',
        iconName: 'users',
      },
      {
        id: 'total-collected',
        label: 'Total Collected',
        value: `₹${totalCollectedRaw.toLocaleString('en-IN')}`,
        supportingText: 'Across all member contributions',
        iconName: 'wallet',
      },
      {
        id: 'current-cycle',
        label: 'Current Cycle Pool',
        value: `₹${(members.reduce((acc: number, m: any) => acc + (m.monthlyContribution || 0), 0)).toLocaleString('en-IN')}`,
        supportingText: 'Monthly contribution total',
        iconName: 'layers',
      },
      {
        id: 'pending-payments',
        label: 'Pending Payments',
        value: `₹${pendingAmountRaw.toLocaleString('en-IN')}`,
        supportingText: `${pendingPaymentsCount} payment(s) pending`,
        iconName: 'clock',
      },
      {
        id: 'risk-alerts',
        label: 'Risk Alerts',
        value: riskAlerts.length.toString(),
        supportingText: 'Requires review',
        iconName: 'shieldAlert',
      },
    ],

    currentAuction: {
      cycle: 1,
      totalCycles: 12,
      chitAmount: `₹${(members.reduce((acc: number, m: any) => acc + (m.monthlyContribution || 0), 0)).toLocaleString('en-IN')}`,
      participantsCount: totalMembers,
      currentHighestBid: '₹0',
      estimatedPrizeAmount: `₹${(members.reduce((acc: number, m: any) => acc + (m.monthlyContribution || 0), 0)).toLocaleString('en-IN')}`,
      status: totalMembers > 0 ? 'Ready' : 'Upcoming',
      recentBids: [],
    },

    collectionOverview: {
      collectedAmount: `₹${totalCollectedRaw.toLocaleString('en-IN')}`,
      collectedRaw: totalCollectedRaw,
      pendingAmount: `₹${pendingAmountRaw.toLocaleString('en-IN')}`,
      pendingRaw: pendingAmountRaw,
      totalTarget: `₹${totalTargetRaw.toLocaleString('en-IN')}`,
      percentage: collectionPct,
      trend: [
        { label: 'Target', collected: totalCollectedRaw, pending: pendingAmountRaw },
      ],
    },

    paymentStatus: {
      paidCount,
      paidPercentage: paidPct,
      pendingCount,
      pendingPercentage: pendingPct,
      overdueCount,
      overduePercentage: overduePct,
      totalMembers,
    },

    riskAlerts,
    recentTransactions,
  };
}

export const dashboardService = {
  fetchDashboardData,
};

export default dashboardService;
