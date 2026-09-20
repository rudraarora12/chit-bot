import { mockMembers } from '@/data/members.js'
import { mockDashboardData } from '@/data/dashboard'
import { initialAuctionData, initialLedgerTransactions } from '@/data/auction'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: ActionButton[]
}

export interface ActionButton {
  label: string
  href: string
}

type Member = (typeof mockMembers)[number]
type PaymentEntry = Member['paymentHistory'][number]
type RiskLevel = 'High' | 'Medium' | 'Low'
type PaymentStatus = 'Paid' | 'Pending' | 'Overdue'
type HistoryStatus = PaymentEntry['status']
type CompareOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq'

type Operation =
  | 'lookup'
  | 'filter'
  | 'rank'
  | 'aggregate'
  | 'compare'
  | 'trend'
  | 'summary'
  | 'explain'
  | 'clarify'
  | 'out_of_scope'
  | 'unknown'

type LookupField = 'history' | 'status' | 'pending' | 'contributed' | 'risk' | 'auctions'
type RankMetric = 'latePayments' | 'missedPayments' | 'pending' | 'contributed' | 'riskScore'
type AggregateMetric = 'pending' | 'contributed' | 'paidCount' | 'highestBid'

export interface QueryPlan {
  operation: Operation
  member?: Member
  filters: {
    paymentStatus?: PaymentStatus[]
    historyStatus?: HistoryStatus[]
    risk?: RiskLevel[]
    amount?: { op: CompareOp; value: number; field: 'pending' | 'contributed' | 'lateCount' }
  }
  lookup?: LookupField
  rankBy?: RankMetric
  rankDir?: 'desc' | 'asc'
  aggregate?: AggregateMetric
  cycleWindow?: number
  clarify?: string
  auctionView?: 'status' | 'next' | 'highestBid'
  showLedger?: boolean
}

interface ConversationContext {
  lastMemberId?: string
}

const conversation: ConversationContext = {}

export function resetAssistantConversation() {
  conversation.lastMemberId = undefined
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function parseDisplayDate(value: string): Date | null {
  if (!value || value.trim() === '-') return null
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (!match) return null
  const month = MONTHS[match[2].slice(0, 3).toLowerCase()]
  if (month === undefined) return null
  return new Date(Number(match[3]), month, Number(match[1]))
}

function daysBetween(paidOn: string, dueOn: string): number | null {
  const paid = parseDisplayDate(paidOn)
  const due = parseDisplayDate(dueOn)
  if (!paid || !due) return null
  return Math.round((paid.getTime() - due.getTime()) / 86_400_000)
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatDaysLate(days: number | null): string {
  if (days === null) return 'late'
  if (days === 1) return '1 day late'
  return `${days} days late`
}

function lateEntries(member: Member): PaymentEntry[] {
  return member.paymentHistory.filter((entry) => entry.status === 'Late')
}

function missedEntries(member: Member): PaymentEntry[] {
  return member.paymentHistory.filter((entry) => entry.status === 'Missed')
}

function latestLateDays(member: Member): number | null {
  const latest = lateEntries(member)[0]
  if (!latest) return null
  return daysBetween(latest.date, latest.dueDate)
}

function lateRate(member: Member): number {
  if (!member.paymentHistory.length) return 0
  return lateEntries(member).length / member.paymentHistory.length
}

function issueCount(entries: PaymentEntry[]): number {
  return entries.filter((entry) =>
    entry.status === 'Late' || entry.status === 'Missed' || entry.status === 'Overdue',
  ).length
}

function compareAmount(value: number, op: CompareOp, threshold: number): boolean {
  switch (op) {
    case 'gt':
      return value > threshold
    case 'gte':
      return value >= threshold
    case 'lt':
      return value < threshold
    case 'lte':
      return value <= threshold
    case 'eq':
      return value === threshold
  }
}

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/,/g, '')
    .replace(/[^\w\s₹]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasAny(norm: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(norm))
}

const DOMAIN_PATTERNS = [
  /\bchit\b/,
  /\bledger\b/,
  /\bpay(ing|er|ers|ment|ments)?\b/,
  /\bpaid\b/,
  /\bauction\b/,
  /\bmember(s)?\b/,
  /\brisk\b/,
  /\bhistory\b/,
  /\battention\b/,
  /\bpending\b/,
  /\bcycle\b/,
  /\bstatus\b/,
  /\bunpaid\b/,
  /\blate\b/,
  /\bmiss(ed|ing)?\b/,
  /\bdelay(ed|s|ing)?\b/,
  /\boverdue\b/,
  /\bcontribution(s)?\b/,
  /\bcontributed\b/,
  /\bgroup\b/,
  /\balert(s)?\b/,
  /\bbid(s|der|ders)?\b/,
  /\bowe(s|d|ing)?\b/,
  /\bbalance\b/,
  /\bcollection\b/,
  /\btransaction(s)?\b/,
  /\bcompare\b/,
  /\baverage\b/,
  /\bimproved\b/,
  /\bsummary\b/,
  /\brs\b/,
  /₹/,
]

function isInDomain(norm: string, member?: Member, usedPronoun = false): boolean {
  if (member || usedPronoun) return true
  return DOMAIN_PATTERNS.some((pattern) => pattern.test(norm))
}

function findMember(norm: string): Member | undefined {
  const ranked = mockMembers
    .map((member) => {
      const full = member.name.toLowerCase()
      const [first = '', last = ''] = full.split(' ')
      if (norm.includes(full)) return { member, score: 3 }
      if (last.length > 2 && norm.includes(first) && norm.includes(last)) return { member, score: 2 }
      if (first.length > 3 && new RegExp(`\\b${first}s?\\b`).test(norm)) return { member, score: 1 }
      return { member, score: 0 }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.member
}

function resolveMember(norm: string): { member?: Member; usedPronoun: boolean } {
  const direct = findMember(norm)
  if (direct) return { member: direct, usedPronoun: false }

  const usedPronoun = hasAny(norm, [/\b(he|him|his|she|her|they|them|their)\b/])
  if (usedPronoun && conversation.lastMemberId) {
    return {
      member: mockMembers.find((m) => m.id === conversation.lastMemberId),
      usedPronoun: true,
    }
  }

  return { member: undefined, usedPronoun }
}

function parseAmountFilter(norm: string): QueryPlan['filters']['amount'] | undefined {
  const match = norm.match(
    /\b(more than|greater than|above|over|at least|minimum|less than|under|below|up to|at most|exactly)\s*(₹|rs|inr)?\s*(\d+)/,
  )
  if (match) {
    const isCurrency = !!match[2];
    const opWord = match[1]
    const value = Number(match[3])
    
    // Ignore if it looks like cycles or times
    if (!isCurrency && /(times|cycles)/.test(norm)) {
      return undefined;
    }

    const op: CompareOp =
      opWord === 'at least' || opWord === 'minimum'
        ? 'gte'
        : opWord === 'up to' || opWord === 'at most'
          ? 'lte'
          : opWord === 'exactly'
            ? 'eq'
            : opWord === 'less than' || opWord === 'under' || opWord === 'below'
              ? 'lt'
              : 'gt'
    const field = /\blate\b/.test(norm) ? 'lateCount' : /\bcontribut/.test(norm) ? 'contributed' : 'pending'
    return { op, value, field }
  }

  const rupee = norm.match(/₹\s*(\d+)/)
  if (rupee && /\b(owe|owes|owing|pending|unpaid|above|over|more)\b/.test(norm)) {
    return { op: 'gt', value: Number(rupee[1]), field: 'pending' }
  }

  return undefined
}

function parseRiskLevels(norm: string): RiskLevel[] {
  const levels: RiskLevel[] = []
  if (/\bhigh\b/.test(norm) && /\brisk\b/.test(norm)) levels.push('High')
  if (/\bmedium\b/.test(norm) && /\brisk\b/.test(norm)) levels.push('Medium')
  if (/\blow\b/.test(norm) && /\brisk\b/.test(norm)) levels.push('Low')
  return levels
}

function parseCycleWindow(norm: string): number | undefined {
  const match = norm.match(/\blast\s+(\d+)\s+cycles?\b/)
  if (match) return Number(match[1])
  if (/\blast\s+cycles?\b|\brecent cycles\b|\bover time\b|\bimproved\b|\bworse|\btrend\b/.test(norm)) {
    return 5
  }
  return undefined
}

export function parseQuery(query: string): QueryPlan {
  const norm = normalizeQuery(query)
  const { member, usedPronoun } = resolveMember(norm)
  const amount = parseAmountFilter(norm)
  const risk = parseRiskLevels(norm)
  const cycleWindow = parseCycleWindow(norm)

  const late = hasAny(norm, [/\blate\b/, /\bdelay(ed|s|ing)?\b/])
  const delayed = late
  const missed = hasAny(norm, [/\bmiss(ed|ing)?\b/, /\bskipped\b/])
  const overdue = /\boverdue\b/.test(norm)
  const pending = hasAny(norm, [
    /\bpending\b/,
    /\bunpaid\b/,
    /\boutstanding\b/,
    /\bhasnt\b/,
    /\bhavent\b/,
    /\bhas not\b/,
    /\bhave not\b/,
    /\bnot (yet )?paid\b/,
    /\byet to pay\b/,
    /\bstill\b.+\b(pay|paid|payment|need|needs)\b/,
    /\b(need|needs|needed) to pay\b/,
    /\bowe(s|d|ing)?\b/,
  ])
  const paid = hasAny(norm, [
    /\bwho (has |have )?paid\b/,
    /\bmembers who paid\b/,
    /\bpeople who paid\b/,
    /\bnames.{0,24}paid\b/,
    /\bwhich.{0,24}paid\b/,
    /\bcompleted\b.+\bpayment/,
    /\bpaid members\b/,
  ]) && !late && !missed && !pending && !overdue && !delayed

  const compare = hasAny(norm, [/\bcompare\b/, /\bvs\b/, /\baverage\b/, /\bgroup average\b/])
  const trend = hasAny(norm, [/\bimproved\b/, /\bworsen/, /\btrend\b/, /\blast \d+ cycles\b/, /\bover the last\b/])
  const rank = hasAny(norm, [/\bmost\b/, /\bleast\b/, /\bhighest\b/, /\blowest\b/, /\bfewest\b/, /\btop\b/, /\brank\b/])
  const aggregate = hasAny(norm, [/\btotal\b/, /\bsum\b/, /\boverall\b/, /\bhow much money\b/, /\bhow much is pending\b/])
  const summary = hasAny(norm, [/\bsummar(y|ise|ize)\b/, /\boverview\b/, /\bthis cycle\b/, /\bthis month\b/, /\bcollection performance\b/])
  const why = /\bwhy\b/.test(norm)
  const history = /\bhistory\b/.test(norm)
  const contributed = hasAny(norm, [/\bcontribut(ed|ion|ions)\b/, /\bhow much has\b.+\bpaid\b/])
  const auction = /\bauction\b/.test(norm)
  const highestBid = hasAny(norm, [/\bhighest bidder\b/, /\bcurrent highest\b/, /\bwinning bid\b/])
  const ledger = hasAny(norm, [/\bledger\b/, /\btransaction(s)?\b/, /\brecent activity\b/])
  const attention = hasAny(norm, [/\battention\b/, /\brisk alerts?\b/, /\bneeds? attention\b/])
  const statusBare =
    /\bstatus\b/.test(norm) &&
    !member &&
    !auction &&
    !pending &&
    !paid &&
    !late &&
    !overdue &&
    !/\bpayment status\b/.test(norm) &&
    !/\bmember status\b/.test(norm) &&
    !/\bgroup status\b/.test(norm)

  const empty: QueryPlan = { operation: 'unknown', member, filters: {} }

  if (!isInDomain(norm, member, usedPronoun)) {
    return { ...empty, operation: 'out_of_scope' }
  }

  if (statusBare) {
    return {
      ...empty,
      operation: 'clarify',
      clarify: 'Do you mean payment status, member status, auction status, or overall group status?',
    }
  }

  if (why && (/\brisk\b/.test(norm) || member)) {
    return { ...empty, operation: 'explain', member }
  }

  if (compare) {
    return { ...empty, operation: 'compare', member, cycleWindow }
  }

  if (trend) {
    return { ...empty, operation: 'trend', member, cycleWindow: cycleWindow ?? 5 }
  }

  if (highestBid || (auction && /\bhighest\b/.test(norm))) {
    return { ...empty, operation: 'lookup', auctionView: 'highestBid' }
  }

  if (auction && /\bnext\b|\bwhen\b/.test(norm)) {
    return { ...empty, operation: 'lookup', auctionView: 'next' }
  }

  if (rank) {
    const rankDir: 'desc' | 'asc' = hasAny(norm, [/\bleast\b/, /\blowest\b/, /\bfewest\b/]) ? 'asc' : 'desc'
    const rankBy: RankMetric = missed
      ? 'missedPayments'
      : pending || overdue
        ? 'pending'
        : contributed
          ? 'contributed'
          : /\brisk\b/.test(norm)
            ? 'riskScore'
            : 'latePayments'
    return { ...empty, operation: 'rank', rankBy, rankDir, filters: { risk, amount } }
  }

  if (aggregate && (pending || overdue || /\bpending\b/.test(norm) || /\bowe/.test(norm))) {
    return { ...empty, operation: 'aggregate', aggregate: 'pending', filters: { amount, risk } }
  }

  if (summary) {
    return { ...empty, operation: 'summary' }
  }

  const listing = hasAny(norm, [
    /\bwho\b/,
    /\bwhich\b/,
    /\blist\b/,
    /\bnames of\b/,
    /\bmembers who\b/,
    /\bpeople who\b/,
  ])

  if (member && !listing) {
    if (history) return { ...empty, operation: 'lookup', lookup: 'history', member }
    if (contributed) return { ...empty, operation: 'lookup', lookup: 'contributed', member }
    if (pending || amount) return { ...empty, operation: 'lookup', lookup: 'pending', member }
    if (/\bstatus\b/.test(norm) || /\brisk\b/.test(norm) || /\bhow is\b/.test(norm)) {
      return { ...empty, operation: 'lookup', lookup: 'status', member }
    }
  }

  const paymentStatus: PaymentStatus[] = []
  if (overdue) paymentStatus.push('Overdue')
  if (pending && !overdue) paymentStatus.push('Pending', 'Overdue')
  if (paid) paymentStatus.push('Paid')

  const historyStatus: HistoryStatus[] = []
  if (late || delayed) historyStatus.push('Late')
  if (missed) historyStatus.push('Missed')

  const hasMulti =
    (paymentStatus.length > 0 || historyStatus.length > 0 || Boolean(amount) || pending || late || missed) &&
    risk.length > 0

  if (amount || hasMulti || paymentStatus.length || historyStatus.length) {
    return {
      ...empty,
      operation: 'filter',
      filters: {
        paymentStatus: paymentStatus.length ? paymentStatus : undefined,
        historyStatus: historyStatus.length ? historyStatus : undefined,
        risk: risk.length ? risk : undefined,
        amount,
      },
    }
  }

  if (history) {
    return { ...empty, operation: 'lookup', lookup: 'history', member }
  }

  if (member && contributed) {
    return { ...empty, operation: 'lookup', lookup: 'contributed', member }
  }

  if (member && pending) {
    return { ...empty, operation: 'lookup', lookup: 'pending', member }
  }

  if (ledger) {
    return { ...empty, operation: 'lookup', showLedger: true }
  }

  if (attention || (/\brisk\b/.test(norm) && /\b(who|which|alert|alerts|need|needs)\b/.test(norm))) {
    return { ...empty, operation: 'filter', filters: { risk: ['High', 'Medium'] } }
  }

  if (auction) {
    return { ...empty, operation: 'lookup', auctionView: 'status' }
  }

  if (member) {
    return { ...empty, operation: 'lookup', lookup: 'status', member }
  }

  if (/\bpayment status\b/.test(norm) || /\bgroup status\b/.test(norm)) {
    return { ...empty, operation: 'summary' }
  }

  return { ...empty, operation: 'unknown' }
}

function applyFilters(plan: QueryPlan): Member[] {
  const { paymentStatus, historyStatus, risk, amount } = plan.filters

  return mockMembers.filter((member) => {
    if (paymentStatus && !paymentStatus.includes(member.paymentStatus as PaymentStatus)) return false
    if (historyStatus && !historyStatus.some((status) => member.paymentHistory.some((entry) => entry.status === status))) {
      return false
    }
    if (risk && risk.length > 0 && !risk.includes(member.risk as RiskLevel)) return false
    if (amount) {
      const value = amount.field === 'contributed' ? member.contributed : amount.field === 'lateCount' ? lateEntries(member).length : member.pending
      if (!compareAmount(value, amount.op, amount.value)) return false
    }
    return true
  })
}

function metricValue(member: Member, metric: RankMetric): number {
  switch (metric) {
    case 'latePayments':
      return lateEntries(member).length
    case 'missedPayments':
      return missedEntries(member).length
    case 'pending':
      return member.pending
    case 'contributed':
      return member.contributed
    case 'riskScore':
      return member.riskScore
  }
}

function memberAction(member: Member): ActionButton {
  return { label: 'View Member', href: `/members/${member.id}` }
}

function filterActions(plan: QueryPlan, rows: Member[]): ActionButton[] | undefined {
  if (plan.filters.risk?.length) return [{ label: 'View Risk Monitoring', href: '/risk' }]
  if (
    plan.filters.paymentStatus?.includes('Pending') ||
    plan.filters.paymentStatus?.includes('Overdue') ||
    plan.filters.amount ||
    plan.filters.historyStatus?.length
  ) {
    return [{ label: 'View Pending Members', href: '/members' }]
  }
  if (rows.length === 1) return [memberAction(rows[0])]
  return undefined
}

function describeFilters(plan: QueryPlan): string {
  const parts: string[] = []
  if (plan.filters.historyStatus?.includes('Late')) parts.push('late payments')
  if (plan.filters.historyStatus?.includes('Missed')) parts.push('missed payments')
  if (plan.filters.paymentStatus?.includes('Overdue') && plan.filters.risk?.includes('High')) {
    return 'overdue and high risk'
  }
  if (plan.filters.paymentStatus?.length) {
    parts.push(plan.filters.paymentStatus.map((s) => s.toLowerCase()).join('/'))
  }
  if (plan.filters.risk?.length) parts.push(`${plan.filters.risk.join('/').toLowerCase()} risk`)
  if (plan.filters.amount) {
    const labels: Record<CompareOp, string> = {
      gt: 'more than',
      gte: 'at least',
      lt: 'less than',
      lte: 'up to',
      eq: 'exactly',
    }
    const val = plan.filters.amount.field === 'lateCount' ? `${plan.filters.amount.value} late payments` : `${formatInr(plan.filters.amount.value)} ${plan.filters.amount.field}`
    parts.push(`${labels[plan.filters.amount.op]} ${val}`)
  }
  return parts.join(', ') || 'the requested criteria'
}

function executePlan(plan: QueryPlan): { content: string; actions?: ActionButton[]; member?: Member } {
  switch (plan.operation) {
    case 'out_of_scope':
      return {
        content:
          'I can only help with ChitLedger-related information such as members, payments, ledger activity, auctions and risk monitoring.',
      }

    case 'clarify':
      return { content: plan.clarify ?? 'Could you clarify what you would like to see?' }

    case 'explain': {
      const member = plan.member
      if (!member) {
        return { content: 'Please name a member whose risk you want explained.' }
      }
      return {
        content: `**${member.name}** is currently marked **${member.risk}** risk (score ${member.riskScore}).\n\n${member.aiRiskExplanation}`,
        actions: [{ label: 'View Risk Monitoring', href: '/risk' }, memberAction(member)],
        member,
      }
    }

    case 'compare': {
      const member = plan.member
      const groupLateRate =
        mockMembers.reduce((sum, row) => sum + lateRate(row), 0) / mockMembers.length
      const groupMissed =
        mockMembers.reduce((sum, row) => sum + missedEntries(row).length, 0) / mockMembers.length
      const groupPending =
        mockMembers.reduce((sum, row) => sum + row.pending, 0) / mockMembers.length
        
      if (!member) {
        return {
          content: `Here are the group averages across ${mockMembers.length} members:\n\n` +
                   `• Late-payment rate: **${(groupLateRate * 100).toFixed(1)}%**\n` +
                   `• Missed payments: **${groupMissed.toFixed(1)}**\n` +
                   `• Pending balance: **${formatInr(Math.round(groupPending))}**`,
        }
      }

      const memberLate = lateRate(member)
      const lateDelta = memberLate - groupLateRate
      const lateDir = lateDelta === 0 ? 'in line with' : lateDelta > 0 ? 'above' : 'below'
      return {
        content:
          `**${member.name}** compared with the group average (${mockMembers.length} members):\n\n` +
          `• Late-payment rate: **${(memberLate * 100).toFixed(1)}%** vs group **${(groupLateRate * 100).toFixed(1)}%** (${lateDir} average)\n` +
          `• Missed payments: **${missedEntries(member).length}** vs group average **${groupMissed.toFixed(1)}**\n` +
          `• Pending balance: **${formatInr(member.pending)}** vs group average **${formatInr(Math.round(groupPending))}**\n` +
          `• Risk: **${member.risk}** (score ${member.riskScore})`,
        actions: [memberAction(member), { label: 'View Risk Monitoring', href: '/risk' }],
        member,
      }
    }

    case 'trend': {
      const member = plan.member
      if (!member) {
        return { content: 'Please name a member to review payment-behaviour trend.' }
      }
      const window = plan.cycleWindow ?? 5
      const recent = member.paymentHistory.slice(0, window)
      if (recent.length < 2) {
        return {
          content: `Not enough payment-history rows for ${member.name} to judge a trend.`,
          member,
        }
      }
      const mid = Math.ceil(recent.length / 2)
      const newer = recent.slice(0, mid)
      const older = recent.slice(mid)
      const newerIssues = issueCount(newer)
      const olderIssues = issueCount(older)
      let verdict = `${member.name}'s payment behaviour is mixed over the last ${recent.length} cycles.`
      if (newerIssues < olderIssues) {
        verdict = `${member.name}'s payment behaviour has **improved** over the last ${recent.length} cycles.`
      } else if (newerIssues > olderIssues) {
        verdict = `${member.name}'s payment behaviour has **worsened** over the last ${recent.length} cycles.`
      } else {
        verdict = `${member.name}'s payment behaviour is **unchanged** over the last ${recent.length} cycles.`
      }
      return {
        content:
          `${verdict}\n\n` +
          `Recorded trend on file: **${member.recentTrend}**.\n` +
          `Late/missed/overdue in older ${older.length} of those cycles: **${olderIssues}**. ` +
          `In the more recent ${newer.length}: **${newerIssues}**.\n\n` +
          recent
            .map(
              (entry) =>
                `• ${entry.cycle}: **${entry.status}**${entry.date && entry.date !== '-' ? ` (${entry.date})` : ''}`,
            )
            .join('\n'),
        actions: [memberAction(member)],
        member,
      }
    }

    case 'rank': {
      const metric = plan.rankBy ?? 'latePayments'
      const dir = plan.rankDir ?? 'desc'
      const rows = [...applyFilters(plan)].sort((a, b) => {
        const delta = metricValue(a, metric) - metricValue(b, metric)
        return dir === 'desc' ? delta * -1 : delta
      })
      const top = rows[0]
      if (!top) {
        return { content: `No members matched ${describeFilters(plan)}.` }
      }
      const topValue = metricValue(top, metric)
      const tied = rows.filter((row) => metricValue(row, metric) === topValue)
      const labels: Record<RankMetric, string> = {
        latePayments: 'late payments',
        missedPayments: 'missed payments',
        pending: 'pending balance',
        contributed: 'contributions',
        riskScore: 'risk score',
      }
      const formatValue = (member: Member) =>
        metric === 'pending' || metric === 'contributed'
          ? formatInr(metricValue(member, metric))
          : String(metricValue(member, metric))
      const leader =
        tied.length > 1
          ? `Tied at the top for ${labels[metric]}:\n\n` +
            tied.map((row) => `• **${row.name}** — ${formatValue(row)}`).join('\n')
          : `**${top.name}** has the ${dir === 'desc' ? 'most' : 'fewest'} ${labels[metric]}: **${formatValue(top)}**.`
      return {
        content:
          `${leader}\n\n` +
          rows
            .slice(0, 5)
            .map((row, index) => `${index + 1}. **${row.name}** — ${formatValue(row)}`)
            .join('\n'),
        actions: [memberAction(top)],
        member: top,
      }
    }

    case 'aggregate': {
      if (plan.aggregate === 'highestBid') {
        const top = [...initialAuctionData.bids].sort((a, b) => b.bidAmount - a.bidAmount)[0]
        return {
          content: `The current highest bid is **${top.bidFormatted}** by **${top.memberName}**.`,
          actions: [{ label: 'View Auction', href: '/auction' }],
        }
      }
      const rows = applyFilters({ ...plan, filters: { ...plan.filters, amount: undefined } })
      const totalPending = rows.reduce((sum, member) => sum + member.pending, 0)
      const owing = rows.filter((member) => member.pending > 0)
      return {
        content:
          `Total pending amount is **${formatInr(totalPending)}** across **${owing.length}** members.\n\n` +
          owing.map((member) => `• **${member.name}**: ${formatInr(member.pending)} (${member.paymentStatus})`).join('\n'),
        actions: [{ label: 'View Pending Members', href: '/members' }],
      }
    }

    case 'summary': {
      const paid = mockMembers.filter((m) => m.paymentStatus === 'Paid')
      const pending = mockMembers.filter((m) => m.paymentStatus === 'Pending')
      const overdue = mockMembers.filter((m) => m.paymentStatus === 'Overdue')
      const pendingTotal = mockMembers.reduce((sum, m) => sum + m.pending, 0)
      const contributedTotal = mockMembers.reduce((sum, m) => sum + m.contributed, 0)
      const { currentCycle, totalCycles, groupName, collectionOverview, currentAuction } = mockDashboardData
      return {
        content:
          `Summary for **${groupName}**, cycle **${currentCycle} of ${totalCycles}**:\n\n` +
          `• Members in the local register: **${mockMembers.length}** (Paid ${paid.length}, Pending ${pending.length}, Overdue ${overdue.length})\n` +
          `• Pending from member records: **${formatInr(pendingTotal)}**\n` +
          `• Lifetime contributions on record: **${formatInr(contributedTotal)}**\n` +
          `• Collection this cycle: **${collectionOverview.collectedAmount}** of **${collectionOverview.totalTarget}** (${collectionOverview.percentage}%)\n` +
          `• Auction: **${currentAuction.status}**, highest bid **${currentAuction.currentHighestBid}**`,
        actions: [{ label: 'View Ledger', href: '/ledger' }, { label: 'View Auction', href: '/auction' }],
      }
    }

    case 'filter': {
      const rows = applyFilters(plan)
      if (!rows.length) {
        return { content: `No members matched ${describeFilters(plan)}.` }
      }

      const lateList = plan.filters.historyStatus?.includes('Late')
      const missedList = plan.filters.historyStatus?.includes('Missed')
      const lines = rows.map((member) => {
        if (lateList) {
          return `• **${member.name}** — ${formatDaysLate(latestLateDays(member))} (${lateEntries(member).length} late in history)`
        }
        if (missedList) {
          const cycles = missedEntries(member).map((entry) => entry.cycle).join(', ')
          return `• **${member.name}** (${cycles || 'missed payment on record'})`
        }
        if (member.pending > 0) {
          return `• **${member.name}**: ${formatInr(member.pending)} (${member.paymentStatus}, ${member.risk} risk)`
        }
        return `• **${member.name}**: ${member.paymentStatus}, ${member.risk} risk, ${formatInr(member.monthlyContribution)} contribution`
      })

      return {
        content: `${rows.length} members matched ${describeFilters(plan)}:\n\n${lines.join('\n')}`,
        actions: filterActions(plan, rows),
        member: rows.length === 1 ? rows[0] : undefined,
      }
    }

    case 'lookup': {
      if (plan.showLedger) {
        return {
          content:
            'Recent ledger activity:\n\n' +
            initialLedgerTransactions
              .slice(0, 8)
              .map((tx) => `• ${tx.date} — **${tx.member}**: ${tx.transaction} ${tx.amount} (**${tx.status}**)`)
              .join('\n'),
          actions: [{ label: 'View Ledger', href: '/ledger' }],
        }
      }

      if (plan.auctionView === 'highestBid') {
        const top = [...initialAuctionData.bids].sort((a, b) => b.bidAmount - a.bidAmount)[0]
        return {
          content: `The current highest bidder is **${top.memberName}** at **${top.bidFormatted}**.`,
          actions: [{ label: 'View Auction', href: '/auction' }],
        }
      }

      if (plan.auctionView === 'next' || plan.auctionView === 'status') {
        return {
          content:
            `The auction is currently **${initialAuctionData.status}** (Cycle ${initialAuctionData.cycle} of ${initialAuctionData.totalCycles}). ` +
            `Chit amount ${initialAuctionData.chitAmountFormatted}, ${initialAuctionData.participants} eligible bidders, highest bid ${initialAuctionData.highestBidFormatted}.`,
          actions: [{ label: 'View Auction', href: '/auction' }],
        }
      }

      const member = plan.member
      if (!member) {
        if (plan.lookup === 'history') {
          return { content: 'Please name a member to see payment history.' }
        }
        return {
          content: 'Please name a member, or ask about payments, auctions, ledger activity, or risk.',
        }
      }

      if (plan.lookup === 'history') {
        return {
          content:
            `Here is ${member.name}'s recent payment history:\n\n` +
            member.paymentHistory
              .map(
                (entry) =>
                  `• ${entry.cycle}: ${entry.amount} - **${entry.status.toUpperCase()}**${
                    entry.date && entry.date !== '-' ? ` (${entry.date})` : ''
                  }`,
              )
              .join('\n'),
          actions: [memberAction(member)],
          member,
        }
      }

      if (plan.lookup === 'contributed') {
        return {
          content: `**${member.name}** has contributed **${formatInr(member.contributed)}** to date (${member.paymentsMAde} payments recorded).`,
          actions: [memberAction(member)],
          member,
        }
      }

      if (plan.lookup === 'pending') {
        return {
          content: `**${member.name}** currently owes **${formatInr(member.pending)}** (${member.paymentStatus}).`,
          actions: [memberAction(member), { label: 'View Pending Members', href: '/members' }],
          member,
        }
      }

      return {
        content:
          `**${member.name}** — ${member.paymentStatus}, risk ${member.risk} (score ${member.riskScore}).\n` +
          `Contributed ${formatInr(member.contributed)}. Pending ${formatInr(member.pending)}. ` +
          `Late payments: ${lateEntries(member).length}. Missed payments: ${missedEntries(member).length}.`,
        actions: [memberAction(member)],
        member,
      }
    }

    default:
      return {
        content:
          "I couldn't quite understand that. You can ask me about members, pending or late payments, the ledger, auctions, or risk monitoring.",
      }
  }
}

export const assistantService = {
  async processQuery(query: string): Promise<Message> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const plan = parseQuery(query)
    const result = executePlan(plan)

    if (result.member) {
      conversation.lastMemberId = result.member.id
    } else if (plan.member) {
      conversation.lastMemberId = plan.member.id
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: result.content,
      timestamp: new Date(),
      actions: result.actions,
    }
  },
}
