const mongoose = require('mongoose');
const Member = require('../models/Member');
const Contribution = require('../models/Contribution');
const Payment = require('../models/Payment');
const Auction = require('../models/Auction');
const RiskAlert = require('../models/RiskAlert');

const isDBConnected = () => mongoose.connection.readyState === 1;
const asCycleNumber = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};
const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const cycleQuery = (cycle) => ({ $in: [cycle, String(cycle)] });

const CYCLE_PAYMENT_STATUSES = ['Pending', 'Overdue', 'Late'];

async function resolveCurrentCycle() {
  const liveAuction = await Auction.findOne({ status: 'Live' }).sort({ date: -1 });
  const scheduledAuction = liveAuction
    ? null
    : await Auction.findOne({ status: 'Scheduled' }).sort({ date: 1 });
  const activeAuction = liveAuction || scheduledAuction;
  const activeCycle = asCycleNumber(activeAuction?.auctionNumber);
  if (activeCycle) return { cycle: activeCycle, auction: activeAuction };

  const [paymentCycles, contributionCycles, auctionCycles] = await Promise.all([
    Payment.distinct('cycle'),
    Contribution.distinct('cycle'),
    Auction.distinct('auctionNumber'),
  ]);
  const cycles = [...paymentCycles, ...contributionCycles, ...auctionCycles]
    .map(asCycleNumber)
    .filter(Boolean);
  const cycle = cycles.length ? Math.max(...cycles) : null;
  const auction = cycle
    ? await Auction.findOne({ auctionNumber: cycleQuery(cycle) }).sort({ date: -1 })
    : null;
  return { cycle, auction };
}

function latestPaymentByMember(payments) {
  const byMember = new Map();
  for (const payment of payments) {
    const memberId = payment.member?._id?.toString() || payment.member?.toString();
    if (memberId && !byMember.has(memberId)) byMember.set(memberId, payment);
  }
  return byMember;
}

function ledgerStatus(status) {
  if (status === 'Paid') return 'Completed';
  if (status === 'Late') return 'Overdue';
  return status || 'Pending';
}

function participantKey(ref) {
  return (ref?._id ? ref._id.toString() : ref?.toString()) || null;
}

// @desc GET a single real-data dashboard snapshot for the active cycle
// @route GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Dashboard data is unavailable.',
      });
    }

    const [members, { cycle, auction }, openRiskAlerts] = await Promise.all([
      Member.find().sort({ createdAt: -1 }),
      resolveCurrentCycle(),
      RiskAlert.find({ resolved: false, riskLevel: { $in: ['Medium', 'High'] } })
        .populate('member', 'name memberId')
        .sort({ createdAt: -1 }),
    ]);

    let payments = [];
    let contributions = [];
    let recentPayments = [];
    let recentContributions = [];
    if (cycle) {
      [payments, contributions, recentPayments, recentContributions] = await Promise.all([
        Payment.find({ cycle: cycleQuery(cycle) })
          .populate('member', 'name memberId')
          .sort({ updatedAt: -1 }),
        Contribution.find({ cycle: cycleQuery(cycle) })
          .populate('member', 'name memberId')
          .sort({ date: -1 }),
        Payment.find().populate('member', 'name memberId').sort({ updatedAt: -1 }),
        Contribution.find().populate('member', 'name memberId').sort({ date: -1 }),
      ]);
    } else {
      [recentPayments, recentContributions] = await Promise.all([
        Payment.find().populate('member', 'name memberId').sort({ updatedAt: -1 }),
        Contribution.find().populate('member', 'name memberId').sort({ date: -1 }),
      ]);
    }

    // Collection metrics (current cycle only)
    const memberTarget = members.reduce((sum, member) => sum + toNumber(member.monthlyContribution), 0);
    const paymentTarget = payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
    const paidFromPayments = payments
      .filter((payment) => payment.status === 'Paid')
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
    const collectedFromContributions = contributions
      .filter((contribution) => contribution.status === 'Completed')
      .reduce((sum, contribution) => sum + toNumber(contribution.amount), 0);
    const collected = collectedFromContributions || paidFromPayments;
    const target =
      cycle ? memberTarget || paymentTarget || toNumber(auction?.poolAmount) || null : null;
    const hasCollectionRecords = payments.length > 0 || contributions.length > 0;
    const pending = payments.length
      ? payments
          .filter((payment) => CYCLE_PAYMENT_STATUSES.includes(payment.status))
          .reduce((sum, payment) => sum + toNumber(payment.amount), 0)
      : contributions.length > 0 && target !== null
      ? Math.max(0, target - collected)
      : null;
    const overdueAmount = payments
      .filter((payment) => payment.status === 'Overdue' || payment.status === 'Late')
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

    // Payment status distribution per member for the current cycle
    const paymentByMember = latestPaymentByMember(payments);
    const paymentStatus = { paid: 0, pending: 0, overdue: 0, hasData: false };
    if (payments.length > 0) {
      paymentStatus.hasData = true;
      for (const member of members) {
        const status = paymentByMember.get(member._id.toString())?.status || 'Pending';
        if (status === 'Paid') paymentStatus.paid += 1;
        else if (status === 'Overdue' || status === 'Late') paymentStatus.overdue += 1;
        else paymentStatus.pending += 1;
      }
    } else if (contributions.length > 0) {
      paymentStatus.hasData = true;
      const contributedMemberIds = new Set(
        contributions.map((contribution) => participantKey(contribution.member)).filter(Boolean)
      );
      for (const member of members) {
        if (contributedMemberIds.has(member._id.toString())) paymentStatus.paid += 1;
        else if (member.paymentStatus === 'Overdue') paymentStatus.overdue += 1;
        else paymentStatus.pending += 1;
      }
    } else {
      for (const member of members) {
        if (member.paymentStatus === 'Paid') paymentStatus.paid += 1;
        else if (member.paymentStatus === 'Overdue') paymentStatus.overdue += 1;
        else paymentStatus.pending += 1;
      }
    }

    // Risk alerts derived from the same member risk profile used by Risk Monitoring,
    // enriched with the latest unresolved risk alert reasoning where one exists.
    const openRiskByMember = new Map();
    for (const alert of openRiskAlerts) {
      const key = participantKey(alert.member);
      if (key && !openRiskByMember.has(key)) openRiskByMember.set(key, alert);
    }
    const riskMembers = members.filter(
      (member) => member.riskLevel === 'Medium' || member.riskLevel === 'High'
    );
    const riskAlerts = riskMembers.map((member) => {
      const alert = openRiskByMember.get(member._id.toString());
      const pendingReported = toNumber(member.pendingAmount);
      const reason =
        alert?.reasons?.[0] ||
        (pendingReported > 0
          ? `Pending contribution balance of ₹${pendingReported.toLocaleString('en-IN')}`
          : `${member.riskLevel} risk profile recorded for review`);
      return {
        id: alert?._id || member._id,
        memberId: member.memberId || member._id,
        memberName: member.name || 'Unknown member',
        riskLevel: member.riskLevel,
        reason,
        createdAt: alert?.createdAt || member.updatedAt,
      };
    });

    // Recent ledger activity from real payment + contribution records.
    // A completed contribution that also has a matching Paid payment record is
    // shown once (as the payment entry) to avoid double counting the same event.
    const paidPaymentKeys = new Set(
      recentPayments
        .filter((payment) => payment.status === 'Paid')
        .map((payment) => {
          const key = participantKey(payment.member);
          const paymentCycle = asCycleNumber(payment.cycle) ?? String(payment.cycle);
          return key ? `${key}|${paymentCycle}` : null;
        })
        .filter(Boolean)
    );

    const ledger = [
      ...recentPayments.map((entry) => ({
        id: `payment-${entry._id}`,
        occurredAt: entry.paidDate || entry.updatedAt || entry.createdAt,
        member: entry.member?.name || 'Unknown member',
        activity: entry.status === 'Paid' ? 'Contribution' : 'Payment record',
        amount: toNumber(entry.amount),
        status: ledgerStatus(entry.status),
      })),
      ...recentContributions.map((entry) => {
        const key = `${participantKey(entry.member)}|${asCycleNumber(entry.cycle) ?? String(entry.cycle)}`;
        if (paidPaymentKeys.has(key)) return null;
        return {
          id: `contribution-${entry._id}`,
          occurredAt: entry.date || entry.createdAt,
          member: entry.member?.name || 'Unknown member',
          activity: 'Contribution',
          amount: toNumber(entry.amount),
          status: 'Completed',
        };
      }),
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
      .slice(0, 7);

    res.status(200).json({
      success: true,
      data: {
        currentCycle: cycle,
        activeMembers: members.length,
        collection: {
          target,
          collected,
          pending,
          overdueAmount,
          hasData: hasCollectionRecords,
        },
        paymentStatus: { ...paymentStatus, totalMembers: members.length },
        riskAlerts,
        auction: auction
          ? {
              id: auction._id,
              cycle: asCycleNumber(auction.auctionNumber),
              date: auction.date,
              poolAmount: toNumber(auction.poolAmount),
              status: auction.status,
              winningBid: toNumber(auction.winningBid),
              participantsCount: auction.participants?.length || 0,
            }
          : null,
        ledger,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
