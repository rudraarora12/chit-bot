const API_BASE_URL = 'http://127.0.0.1:5050/api/members';

/**
 * Generate initials from member name (e.g. "Aarav Sharma" -> "AS")
 */
function getInitials(name) {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format raw backend Mongo data into the object structure expected by frontend components
 */
export function formatMemberData(raw) {
  if (!raw) return null;
  const name = raw.name || '';
  const avatar = raw.avatar || getInitials(name);
  const memberId = raw.memberId || raw.id || (raw._id ? raw._id.toString() : '');

  return {
    _id: raw._id,
    id: memberId,
    memberId: memberId,
    name: name,
    phone: raw.phone || '',
    email: raw.email || '',
    address: raw.address || '',
    avatar: avatar,
    memberSince: raw.joinedAt || raw.createdAt || raw.memberSince || new Date().toISOString(),
    monthlyContribution: Number(raw.monthlyContribution || 0),
    contributed: Number(raw.totalContributed ?? raw.contributed ?? 0),
    pending: Number(raw.pendingAmount ?? raw.pending ?? 0),
    paymentStatus: raw.paymentStatus || 'Pending',
    risk: raw.riskLevel || raw.risk || 'Low',
    riskLevel: raw.riskLevel || raw.risk || 'Low',
    riskScore: Number(raw.riskScore ?? 0),
    auctions: Number(raw.auctionCount ?? raw.auctions ?? 0),
    paymentsMAde: Number(raw.paymentsMAde ?? 0),
    paymentsMissed: Number(raw.paymentsMissed ?? 0),
    latePayments: Number(raw.latePayments ?? 0),
    missedPayments: Number(raw.missedPayments ?? 0),
    avgDelay: raw.avgDelay || '0 days',
    longestDelay: raw.longestDelay || '0 days',
    paymentConsistency: Number(raw.paymentConsistency ?? 100),
    onTimePayments: raw.onTimePayments || '0/0',
    avgPaymentDelay: raw.avgPaymentDelay || '0 days',
    recentTrend: raw.recentTrend || 'New Member',
    aiRiskExplanation:
      raw.aiRiskExplanation ||
      'This is a newly added member with no payment history yet. Risk assessment will be available after the first contribution cycle is completed.',
    paymentHistory: Array.isArray(raw.paymentHistory) ? raw.paymentHistory : [],
    auctionHistory: Array.isArray(raw.auctionHistory) ? raw.auctionHistory : [],
    riskReasons: Array.isArray(raw.riskReasons) && raw.riskReasons.length > 0
      ? raw.riskReasons
      : ['New member — baseline risk profile'],
  };
}

/**
 * Fetch all members with optional query filters (search, paymentStatus, riskLevel)
 */
export async function fetchMembers(params = {}) {
  const query = new URLSearchParams();
  if (params.search && params.search.trim()) {
    query.append('search', params.search.trim());
  }
  if (params.paymentStatus && params.paymentStatus !== 'All') {
    query.append('paymentStatus', params.paymentStatus);
  }
  if (params.riskLevel && params.riskLevel !== 'All Risk' && params.riskLevel !== 'All') {
    query.append('riskLevel', params.riskLevel);
  }

  const url = `${API_BASE_URL}${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch members: ${response.statusText}`);
  }

  const result = await response.json();
  const rawList = Array.isArray(result.data) ? result.data : [];
  return {
    success: result.success,
    count: result.count ?? rawList.length,
    data: rawList.map(formatMemberData),
  };
}

/**
 * Fetch member details by ID or memberId
 */
export async function fetchMemberById(id) {
  if (!id) throw new Error('Member ID is required');

  const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch member: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.data) return null;
  return formatMemberData(result.data);
}

/**
 * Create a new member in backend MongoDB
 * Payload: { name, memberId, phone, email, address, monthlyContribution }
 */
export async function createMember(memberPayload) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberPayload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to create member: ${response.statusText}`);
  }

  const result = await response.json();
  return formatMemberData(result.data);
}

export const memberService = {
  fetchMembers,
  fetchMemberById,
  createMember,
  formatMemberData,
};

export default memberService;
