import type { RiskMember } from '@/data/riskData';

const API_BASE = 'http://127.0.0.1:5050/api';

/**
 * Generate initials from member name (e.g. "Rahul Mehta" -> "RM")
 */
function getInitials(name: string): string {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Fetch live risk telemetry data for all members from MongoDB
 */
export async function fetchRiskPageData(): Promise<RiskMember[]> {
  const [riskRes, membersRes] = await Promise.allSettled([
    fetch(`${API_BASE}/risk`).then((res) => (res.ok ? res.json() : null)),
    fetch(`${API_BASE}/members`).then((res) => (res.ok ? res.json() : null)),
  ]);

  const riskAlertsList = riskRes.status === 'fulfilled' && riskRes.value?.data ? riskRes.value.data : [];
  const membersList = membersRes.status === 'fulfilled' && membersRes.value?.data ? membersRes.value.data : [];

  if (!Array.isArray(membersList) || membersList.length === 0) {
    return [];
  }

  // Create a map of risk alerts per member
  const alertsByMemberMap = new Map<string, any[]>();
  if (Array.isArray(riskAlertsList)) {
    riskAlertsList.forEach((alert: any) => {
      const mId = alert.member?._id || alert.member?.memberId || alert.member;
      if (mId) {
        const key = mId.toString();
        if (!alertsByMemberMap.has(key)) alertsByMemberMap.set(key, []);
        alertsByMemberMap.get(key)!.push(alert);
      }
    });
  }

  return membersList.map((m: any, idx: number) => {
    const memberIdStr = m._id ? m._id.toString() : '';
    const customId = m.memberId || m.id || `CL-00${idx + 1}`;
    const memberAlerts = alertsByMemberMap.get(memberIdStr) || alertsByMemberMap.get(customId) || [];

    const riskLevel: 'Low' | 'Medium' | 'High' = m.riskLevel || m.risk || 'Low';
    const pendingAmount = Number(m.pendingAmount ?? m.pending ?? 0);
    const latePayments = Number(m.latePayments ?? 0);
    const missedPayments = Number(m.missedPayments ?? 0);

    const reasons: string[] = [];
    if (Array.isArray(m.riskReasons) && m.riskReasons.length > 0) {
      reasons.push(...m.riskReasons);
    } else if (memberAlerts.length > 0 && Array.isArray(memberAlerts[0].reasons)) {
      reasons.push(...memberAlerts[0].reasons);
    } else {
      if (pendingAmount > 0) {
        reasons.push(`Pending contribution balance of ₹${pendingAmount.toLocaleString('en-IN')}`);
      }
      if (latePayments > 0) {
        reasons.push(`${latePayments} late payment cycle(s) recorded`);
      }
      if (missedPayments > 0) {
        reasons.push(`${missedPayments} missed contribution cycle(s)`);
      }
      if (reasons.length === 0) {
        reasons.push('Member maintains a consistent payment record with zero observed delays.');
      }
    }

    const aiExplanation =
      m.aiRiskExplanation ||
      (memberAlerts.length > 0 && memberAlerts[0].aiExplanation) ||
      `Based on live MongoDB transaction telemetry, ${m.name} holds a ${riskLevel} risk rating with an outstanding balance of ₹${pendingAmount.toLocaleString('en-IN')}.`;

    const suggestedAction =
      riskLevel === 'High'
        ? 'Contact member immediately to establish a structured repayment agreement.'
        : riskLevel === 'Medium'
        ? 'Review recent contribution status and issue an automated payment reminder.'
        : 'No action required. Member is in good standing.';

    return {
      id: customId,
      name: m.name || 'Member',
      avatarInitials: m.avatar || getInitials(m.name || 'Member'),
      email: m.email || '',
      phone: m.phone || '',
      riskLevel,
      latePayments,
      missedPayments,
      recentCycles: 1,
      outstandingAmount: pendingAmount,
      behaviourChange: riskLevel === 'High' || riskLevel === 'Medium',
      riskReasons: reasons,
      aiExplanation,
      suggestedAction,
      lastActivity: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active',
    };
  });
}

/**
 * Trigger backend early-risk analysis on member payment history
 */
export async function triggerRiskAnalysis(memberId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/risk/analyze/${encodeURIComponent(memberId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error triggering risk analysis:', err);
    return null;
  }
}

export const riskService = {
  fetchRiskPageData,
  triggerRiskAnalysis,
};

export default riskService;
