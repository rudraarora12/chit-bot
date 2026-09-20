const API_BASE = 'http://127.0.0.1:5050/api';

export interface MemberHeaderInfo {
  name: string;
  memberId: string;
  groupName: string;
  currentCycle: string;
  status: string;
}

export interface SummaryCardItem {
  title: string;
  value: string;
  subtext: string;
  isAvailable: boolean;
}

export interface NextAuctionInfo {
  hasAuction: boolean;
  cycle?: number;
  dateTime?: string;
  chitValue?: string;
  highestBid?: string;
  eligibility?: string;
  status?: string;
}

export interface ContributionProgressInfo {
  totalExpected: number;
  totalContributed: number;
  remainingAmount: number;
  percentage: number;
  completedCycles: number;
  pendingPaymentsCount: number;
}

export interface PaymentHealthInfo {
  paymentsMade: number;
  onTimePayments: number;
  pendingPayments: number;
  missedPayments: number;
  status: 'Healthy' | 'Needs Attention';
}

export interface ActivityItem {
  id: string;
  title: string;
  date: string;
  amount?: string;
  type: 'contribution' | 'payment' | 'auction' | 'benefit' | 'pending';
}

export interface MemberDashboardData {
  header: MemberHeaderInfo;
  cards: {
    monthlyContribution: SummaryCardItem;
    totalContributed: SummaryCardItem;
    nextPayment: SummaryCardItem;
    dividendBenefit: SummaryCardItem;
  };
  nextAuction: NextAuctionInfo;
  progress: ContributionProgressInfo;
  health: PaymentHealthInfo;
  recentActivities: ActivityItem[];
}

/**
 * Fetch member-specific financial dashboard data from MongoDB backend
 */
export async function fetchMemberDashboardData(userEmailOrId?: string): Promise<MemberDashboardData> {
  const [membersRes, auctionsRes, paymentsRes, contributionsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/members`).then((res) => (res.ok ? res.json() : null)),
    fetch(`${API_BASE}/auctions`).then((res) => (res.ok ? res.json() : null)),
    fetch(`${API_BASE}/payments`).then((res) => (res.ok ? res.json() : null)),
    fetch(`${API_BASE}/contributions`).then((res) => (res.ok ? res.json() : null)),
  ]);

  const membersList = membersRes.status === 'fulfilled' && membersRes.value?.data ? membersRes.value.data : [];
  const auctionsList = auctionsRes.status === 'fulfilled' && auctionsRes.value?.data ? auctionsRes.value.data : [];
  const paymentsList = paymentsRes.status === 'fulfilled' && paymentsRes.value?.data ? paymentsRes.value.data : [];
  const contributionsList = contributionsRes.status === 'fulfilled' && contributionsRes.value?.data ? contributionsRes.value.data : [];

  // Resolve member identity (matching email/ID or fallback to first MongoDB member)
  let activeMember = null;
  if (userEmailOrId && Array.isArray(membersList)) {
    activeMember = membersList.find(
      (m: any) =>
        (m.email && m.email.toLowerCase() === userEmailOrId.toLowerCase()) ||
        (m.memberId && m.memberId.toLowerCase() === userEmailOrId.toLowerCase()) ||
        (m._id && m._id.toString() === userEmailOrId)
    );
  }

  if (!activeMember && Array.isArray(membersList) && membersList.length > 0) {
    activeMember = membersList[0];
  }

  // If no member exists in MongoDB yet, provide a clean default structure
  if (!activeMember) {
    return {
      header: {
        name: 'Guest Member',
        memberId: 'CL-000',
        groupName: 'ChitLedger Community Fund',
        currentCycle: 'Cycle 1 of 12',
        status: 'Active',
      },
      cards: {
        monthlyContribution: {
          title: 'Monthly Contribution',
          value: 'Not available',
          subtext: 'No active subscription',
          isAvailable: false,
        },
        totalContributed: {
          title: 'Total Contributed',
          value: '₹0',
          subtext: 'Across completed cycles',
          isAvailable: true,
        },
        nextPayment: {
          title: 'Next Payment',
          value: 'Not available',
          subtext: 'No pending dues',
          isAvailable: false,
        },
        dividendBenefit: {
          title: 'Dividend / Benefit',
          value: 'Not available',
          subtext: 'No payout records yet',
          isAvailable: false,
        },
      },
      nextAuction: {
        hasAuction: false,
      },
      progress: {
        totalExpected: 0,
        totalContributed: 0,
        remainingAmount: 0,
        percentage: 0,
        completedCycles: 0,
        pendingPaymentsCount: 0,
      },
      health: {
        paymentsMade: 0,
        onTimePayments: 0,
        pendingPayments: 0,
        missedPayments: 0,
        status: 'Healthy',
      },
      recentActivities: [],
    };
  }

  const memberIdStr = activeMember._id ? activeMember._id.toString() : '';
  const customId = activeMember.memberId || activeMember.id || 'CL-001';

  // Filter payments & contributions for this member
  const memberPayments = paymentsList.filter(
    (p: any) =>
      (p.member && (p.member._id === memberIdStr || p.member === memberIdStr || p.member.memberId === customId))
  );

  const memberContributions = contributionsList.filter(
    (c: any) =>
      (c.member && (c.member._id === memberIdStr || c.member === memberIdStr || c.member.memberId === customId))
  );

  const monthlyContribVal = Number(activeMember.monthlyContribution || 0);
  const totalContributedVal = Number(activeMember.totalContributed ?? activeMember.contributed ?? 0);
  const pendingAmountVal = Number(activeMember.pendingAmount ?? activeMember.pending ?? 0);

  // Card 3: Next Payment
  const pendingPaymentRecord = memberPayments.find((p: any) => p.status === 'Pending' || p.status === 'Overdue');
  let nextPaymentCard: SummaryCardItem;
  if (pendingPaymentRecord && pendingPaymentRecord.dueDate) {
    const formattedDueDate = new Date(pendingPaymentRecord.dueDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    nextPaymentCard = {
      title: 'Next Payment',
      value: formattedDueDate,
      subtext: `₹${Number(pendingPaymentRecord.amount || monthlyContribVal).toLocaleString('en-IN')} due`,
      isAvailable: true,
    };
  } else if (pendingAmountVal > 0) {
    nextPaymentCard = {
      title: 'Next Payment',
      value: 'Due Soon',
      subtext: `₹${pendingAmountVal.toLocaleString('en-IN')} pending balance`,
      isAvailable: true,
    };
  } else {
    nextPaymentCard = {
      title: 'Next Payment',
      value: 'Not available',
      subtext: 'All cycles clear',
      isAvailable: false,
    };
  }

  // Card 4: Dividend / Benefit
  // Check if member won any auction or received dividends
  const wonAuction = auctionsList.find((a: any) => a.winner && (a.winner._id === memberIdStr || a.winner.memberId === customId));
  let dividendCard: SummaryCardItem;
  if (wonAuction && wonAuction.winningBid) {
    const benefitVal = Number(wonAuction.poolAmount || monthlyContribVal * (membersList.length || 1)) - Number(wonAuction.winningBid);
    dividendCard = {
      title: 'Dividend / Benefit',
      value: `₹${benefitVal.toLocaleString('en-IN')}`,
      subtext: 'Auction payout received',
      isAvailable: true,
    };
  } else {
    dividendCard = {
      title: 'Dividend / Benefit',
      value: 'Not available',
      subtext: 'No auction dividend claimed yet',
      isAvailable: false,
    };
  }

  // Next Auction Section
  const upcomingAuction = auctionsList.find((a: any) => a.status === 'Live' || a.status === 'Scheduled');
  let nextAuctionInfo: NextAuctionInfo;
  if (upcomingAuction) {
    nextAuctionInfo = {
      hasAuction: true,
      cycle: upcomingAuction.cycle || 1,
      dateTime: upcomingAuction.date ? new Date(upcomingAuction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Upcoming',
      chitValue: `₹${Number(upcomingAuction.poolAmount || monthlyContribVal * membersList.length).toLocaleString('en-IN')}`,
      highestBid: upcomingAuction.winningBid ? `₹${Number(upcomingAuction.winningBid).toLocaleString('en-IN')}` : '₹0',
      eligibility: activeMember.paymentStatus === 'Overdue' ? 'Ineligible (Pending Dues)' : 'Eligible to Bid',
      status: upcomingAuction.status === 'Live' ? 'Live Auction' : 'Scheduled',
    };
  } else {
    nextAuctionInfo = {
      hasAuction: false,
    };
  }

  // Contribution Progress
  const totalExpected = monthlyContribVal * 12;
  const remainingAmount = Math.max(0, totalExpected - totalContributedVal);
  const progressPct = totalExpected > 0 ? Math.min(100, Math.round((totalContributedVal / totalExpected) * 100)) : 0;
  const completedCyclesCount = memberContributions.length || (monthlyContribVal > 0 ? Math.floor(totalContributedVal / monthlyContribVal) : 0);
  const pendingPaymentsCount = memberPayments.filter((p: any) => p.status === 'Pending' || p.status === 'Overdue').length || (pendingAmountVal > 0 ? 1 : 0);

  // Payment Health
  const paymentsMade = memberContributions.length || Number(activeMember.paymentsMAde || completedCyclesCount);
  const missedPayments = Number(activeMember.missedPayments || activeMember.latePayments || 0);
  const healthStatus: 'Healthy' | 'Needs Attention' = activeMember.paymentStatus === 'Overdue' || missedPayments > 0 ? 'Needs Attention' : 'Healthy';

  // Recent Activity Feed
  const recentActivities: ActivityItem[] = [];

  memberContributions.forEach((c: any, idx: number) => {
    recentActivities.push({
      id: `act-c-${c._id || idx}`,
      title: `Contribution of ₹${Number(c.amount).toLocaleString('en-IN')} recorded`,
      date: c.date ? new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
      amount: `₹${Number(c.amount).toLocaleString('en-IN')}`,
      type: 'contribution',
    });
  });

  memberPayments.forEach((p: any, idx: number) => {
    if (p.status === 'Paid') {
      recentActivities.push({
        id: `act-p-${p._id || idx}`,
        title: `Payment completed for Cycle ${p.cycle || 1}`,
        date: p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Completed',
        amount: `₹${Number(p.amount).toLocaleString('en-IN')}`,
        type: 'payment',
      });
    } else {
      recentActivities.push({
        id: `act-p-pend-${p._id || idx}`,
        title: `Payment installment pending (${p.status})`,
        date: p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Due Soon',
        amount: `₹${Number(p.amount).toLocaleString('en-IN')}`,
        type: 'pending',
      });
    }
  });

  if (wonAuction) {
    recentActivities.push({
      id: `act-auc-${wonAuction._id}`,
      title: `Auction Winner Dividend Claimed`,
      date: wonAuction.date ? new Date(wonAuction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
      amount: `₹${Number(wonAuction.winningBid || 0).toLocaleString('en-IN')}`,
      type: 'benefit',
    });
  }

  // Fallback default activity if MongoDB activity lists are empty
  if (recentActivities.length === 0) {
    if (totalContributedVal > 0) {
      recentActivities.push({
        id: 'act-def-1',
        title: `Total contributions recorded: ₹${totalContributedVal.toLocaleString('en-IN')}`,
        date: activeMember.createdAt ? new Date(activeMember.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Joined',
        amount: `₹${totalContributedVal.toLocaleString('en-IN')}`,
        type: 'contribution',
      });
    } else {
      recentActivities.push({
        id: 'act-def-2',
        title: 'Joined ChitLedger Community Fund',
        date: activeMember.createdAt ? new Date(activeMember.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active',
        type: 'contribution',
      });
    }
  }

  return {
    header: {
      name: activeMember.name || 'Member',
      memberId: customId,
      groupName: 'Sharma Community Chit',
      currentCycle: 'Cycle 1 of 12',
      status: 'Active',
    },
    cards: {
      monthlyContribution: {
        title: 'Monthly Contribution',
        value: monthlyContribVal > 0 ? `₹${monthlyContribVal.toLocaleString('en-IN')}` : 'Not available',
        subtext: 'Your regular monthly contribution',
        isAvailable: monthlyContribVal > 0,
      },
      totalContributed: {
        title: 'Total Contributed',
        value: `₹${totalContributedVal.toLocaleString('en-IN')}`,
        subtext: 'Across completed cycles',
        isAvailable: true,
      },
      nextPayment: nextPaymentCard,
      dividendBenefit: dividendCard,
    },
    nextAuction: nextAuctionInfo,
    progress: {
      totalExpected,
      totalContributed: totalContributedVal,
      remainingAmount,
      percentage: progressPct,
      completedCycles: completedCyclesCount,
      pendingPaymentsCount,
    },
    health: {
      paymentsMade,
      onTimePayments: paymentsMade,
      pendingPayments: pendingPaymentsCount,
      missedPayments,
      status: healthStatus,
    },
    recentActivities,
  };
}

export const memberDashboardService = {
  fetchMemberDashboardData,
};

export default memberDashboardService;
