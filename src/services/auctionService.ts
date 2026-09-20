import type { CurrentAuction, LedgerTransaction, AuctionSummary } from '@/data/auction';

const API_BASE = 'http://127.0.0.1:5050/api';

function getInitials(name: string): string {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateIntegrityHash(id: string, text: string, amount: number): string {
  let hash = 0;
  const str = `${id}-${text}-${amount}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(6, '0');
  return `0x${hex.slice(0, 3)}…${hex.slice(3, 6)}`;
}

const asCycleNumber = (value: unknown): number | null => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};
const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const memberKey = (record: any): string | null => {
  const member = record?.member;
  if (member?._id) return member._id.toString();
  if (member?.memberId) return member.memberId.toString();
  if (typeof member === 'string') return member;
  return null;
};
const dateText = (value: unknown): string => {
  const date = typeof value === 'string' || typeof value === 'number' || value instanceof Date
    ? new Date(value)
    : null;
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatCurrency = (value: number): string =>
  value > 0 ? `₹${value.toLocaleString('en-IN')}` : '—';
const ledgerStatus = (status: string): 'Completed' | 'Pending' | 'Overdue' =>
  status === 'Paid' ? 'Completed' : status === 'Late' ? 'Overdue' : (status === 'Pending' ? 'Pending' : 'Overdue');

export interface AuctionPageData {
  auction: CurrentAuction | null;
  transactions: LedgerTransaction[];
  summary: AuctionSummary;
}

/**
 * Fetch live auction, digital ledger and cycle data from the MongoDB backend.
 * Uses real records only; no fabricated bids, prices or cycle numbers.
 */
export async function fetchAuctionPageData(): Promise<AuctionPageData> {
  const [auctionsRes, membersRes, paymentsRes, contributionsRes, dashboardRes] =
    await Promise.allSettled([
      fetch(`${API_BASE}/auctions`).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API_BASE}/members`).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API_BASE}/payments`).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API_BASE}/contributions`).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API_BASE}/dashboard`).then((res) => (res.ok ? res.json() : null)),
    ]);

  const auctionsList: any[] =
    auctionsRes.status === 'fulfilled' && auctionsRes.value?.data ? auctionsRes.value.data : [];
  const members =
    membersRes.status === 'fulfilled' && membersRes.value?.data ? membersRes.value.data : [];
  const paymentsList =
    paymentsRes.status === 'fulfilled' && paymentsRes.value?.data ? paymentsRes.value.data : [];
  const contributionsList =
    contributionsRes.status === 'fulfilled' && contributionsRes.value?.data
      ? contributionsRes.value.data
      : [];
  const currentCycle =
    dashboardRes.status === 'fulfilled' && dashboardRes.value?.data?.currentCycle
      ? asCycleNumber(dashboardRes.value.data.currentCycle)
      : null;

  const poolAmount = toNumber(auctionsList[0]?.poolAmount);
  const memberTarget = members.reduce(
    (sum: number, m: any) => sum + toNumber(m.monthlyContribution),
    0
  );
  const chitAmount = poolAmount > 0 ? poolAmount : memberTarget;
  const participants =
    (auctionsList[0]?.participants?.length as number) || members.length;
  const status = auctionsList[0]?.status || 'Scheduled';
  const cycle = asCycleNumber(auctionsList[0]?.auctionNumber) || currentCycle;
  const winningBid = toNumber(auctionsList[0]?.winningBid);

  const auction: CurrentAuction | null = auctionsList[0]
    ? {
        cycle: cycle || 0,
        chitAmount,
        chitAmountFormatted: formatCurrency(chitAmount),
        participants,
        currentHighestBid: winningBid,
        highestBidFormatted: formatCurrency(winningBid),
        estimatedPrizeAmount:
          winningBid > 0 && chitAmount > winningBid ? chitAmount - winningBid : 0,
        prizeAmountFormatted:
          winningBid > 0 && chitAmount > winningBid
            ? formatCurrency(chitAmount - winningBid)
            : '—',
        status,
        bids: [],
      }
    : null;

  const allPayments = [...paymentsList] as any[];
  const sortedPayments = allPayments
    .filter((p) => p.paidDate || p.updatedAt || p.createdAt)
    .sort(
      (a, b) =>
        new Date(b.paidDate || b.updatedAt || b.createdAt).getTime() -
        new Date(a.paidDate || a.updatedAt || a.createdAt).getTime()
    );
  const sortedContributions = [...contributionsList] as any[];
  const paidKeys = new Set(
    sortedPayments
      .filter((p) => p.status === 'Paid')
      .map((p) => {
        const key = memberKey(p);
        return key ? `${key}|${String(p.cycle)}` : null;
      })
      .filter(Boolean) as string[]
  );

  const transactions: LedgerTransaction[] = [];

  for (const contribution of sortedContributions) {
    const key = `${memberKey(contribution) || '?'}|${String(contribution.cycle)}`;
    if (paidKeys.has(key)) continue;
    const amount = toNumber(contribution.amount);
    const txId = contribution._id ? `TX-${contribution._id.toString().slice(-6)}` : '';
    transactions.push({
      id: txId,
      date: dateText(contribution.date || contribution.createdAt),
      member: contribution.member?.name || 'Unknown member',
      memberId: contribution.member?.memberId || '—',
      transaction: 'Contribution',
      category: 'contribution',
      amount: formatCurrency(amount),
      rawAmount: amount,
      status: 'Completed',
      integrityHash: generateIntegrityHash(txId, contribution.member?.name || 'Member', amount),
    });
  }

  for (const payment of sortedPayments) {
    const amount = toNumber(payment.amount);
    const txId = payment._id ? `TX-${payment._id.toString().slice(-6)}` : '';
    const completed = payment.status === 'Paid';
    transactions.push({
      id: txId,
      date: dateText(payment.paidDate || payment.updatedAt || payment.createdAt),
      member: payment.member?.name || 'Unknown member',
      memberId: payment.member?.memberId || '—',
      transaction: completed ? 'Contribution' : 'Pending Payment',
      category: completed ? 'contribution' : 'pending',
      amount: formatCurrency(amount),
      rawAmount: amount,
      status: ledgerStatus(payment.status || 'Pending'),
      integrityHash: generateIntegrityHash(txId, payment.member?.name || 'Member', amount),
    });
  }

  const totalCollectedRaw =
    sortedPayments
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + toNumber(p.amount), 0);

  const pendingAmountRaw = sortedPayments
    .filter((p) => ['Pending', 'Overdue', 'Late'].includes(p.status))
    .reduce((sum, p) => sum + toNumber(p.amount), 0);

  const summary: AuctionSummary = {
    totalCollected: formatCurrency(totalCollectedRaw),
    pendingAmount: formatCurrency(pendingAmountRaw),
    completedTransactions: transactions.filter((t) => t.status === 'Completed').length,
    currentCycle: cycle ? `Cycle ${cycle}` : 'No active cycle',
  };

  return {
    auction,
    transactions,
    summary,
  };
}

export const auctionService = {
  fetchAuctionPageData,
};

export default auctionService;
