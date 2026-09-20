export const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI Risk Monitoring', href: '#ai-risk-monitoring' },
  { label: 'Organize', href: '/subscription' },
  { label: 'About', href: '#about' },
] as const

export const heroContent = {
  badge: 'NEXT-GEN CHIT FUND & SAVINGS OS • AUDIT & TAMPER-EVIDENT',
  heading: 'Make Every Savings Group More Transparent.',
  supporting:
    'ChitLedger digitizes member records, installment collections, reverse auctions, and payouts — with a tamper-evident ledger and AI risk monitoring that keeps every cycle accountable.',
  primaryCta: 'Get Started',
  secondaryCta: 'View Product Demo',
  trustIndicators: [
    'SOC 2 Type II',
    'Encrypted at rest',
    '99.99% uptime',
  ],
} as const

export const stats = [
  { value: '₹140Cr+', label: 'Chit Capital Supervised' },
  { value: '99.4%', label: 'On-Time Collection Velocity' },
  { value: '100%', label: 'Tamper-Evident Ledger Integrity' },
  { value: '12,000+', label: 'Active Chit Members' },
] as const

export const complianceItems = [
  'RBI-aligned structured products',
  'ISO 27001 controls',
  'Tamper-evident journaling',
] as const

export const dashboardPreview = {
  groupName: 'Chennai Gold Chit',
  series: 'Series 24',
  totalPool: '₹48,00,000',
  collection: { collected: 18, expected: 20, label: 'Members Paid' },
  risk: { value: '12.4%', label: 'Default Probability' },
  auction: {
    status: 'Live',
    bids: [
      { initials: 'PK', member: 'Priya Krishnan', bid: '8.2% Bid' },
      { initials: 'AM', member: 'Arun Mehta', bid: '7.4% Bid' },
      { initials: 'MI', member: 'Meera Iyer', bid: '6.9% Bid' },
    ],
  },
  activity: [
    { time: '09:42 AM', text: 'Cycle 14 Collection Confirmed' },
    { time: '09:18 AM', text: 'Bid sealed — Priya K.' },
    { time: '08:51 AM', text: 'Hash committed to ledger' },
  ],
  integrityHash: '0x8f2…a91',
} as const

export const problemContent = {
  eyebrow: 'THE LEGACY BOTTLENECK',
  heading: "Trust shouldn't depend on a spreadsheet.",
  supporting:
    'Traditional community savings groups often rely on paper records, fragmented spreadsheets, chat receipts, and manual calculations. A missing payment or disputed transaction can quickly become a trust problem.',
  cards: [
    {
      title: 'Manual & Fragile Records',
      description:
        'Paper registers, spreadsheets, and scattered receipts make reconciliation slow and vulnerable to human error.',
      impactBadge: 'Vulnerable to Error',
    },
    {
      title: 'Unclear Transactions',
      description:
        'Members may not have a clear, consistent view of contributions, payments, auction outcomes, and outstanding dues.',
      impactBadge: 'Information Asymmetry',
    },
    {
      title: 'Blind-Spot Risk Monitoring',
      description:
        'Organisers can miss repeated late payments or unusual behaviour until the situation becomes harder to manage.',
      impactBadge: 'Late Detection',
    },
  ],
} as const

export const featuresContent = {
  eyebrow: 'THE OPERATING SYSTEM',
  heading: 'One platform. Complete visibility.',
  subtitle:
    'Everything organisers and members need to run transparent savings cycles from contribution to payout.',
  cards: [
    {
      title: 'DIGITAL LEDGER',
      description:
        'Track contributions, payments, penalties, payouts, and transaction history in one place.',
      label: 'Explore Ledger',
      tag: 'Core Protocol',
    },
    {
      title: 'SMART AUCTIONS',
      description:
        'Manage auction rounds, bids, winner selection, and payout calculations with transparent deterministic rules.',
      label: 'View Auction Engine',
      tag: 'Reverse Bidding',
    },
    {
      title: 'MEMBER MANAGEMENT',
      description:
        'Maintain member profiles, contribution status, payment history, and cycle participation.',
      label: 'Manage Directory',
      tag: 'Identity & Dues',
    },
    {
      title: 'AI RISK MONITORING',
      description:
        'Identify unusual payment and bidding patterns and surface explainable risk signals for organiser review.',
      label: 'Inspect Signals',
      tag: 'Decision Support',
    },
  ],
} as const

export const howItWorksContent = {
  eyebrow: 'HOW IT WORKS',
  heading: 'From contributions to transparent payouts.',
  subtitle:
    'One simple workflow for organisers and members to manage every savings cycle with confidence.',
  steps: [
    {
      number: 'STEP 01',
      title: 'Create a Savings Group',
      description:
        'Create the group, add members, configure contribution amounts, cycle duration, and auction rules.',
    },
    {
      number: 'STEP 02',
      title: 'Record Contributions',
      description:
        'Record member contributions and maintain a clear ledger of paid, pending, and overdue amounts.',
    },
    {
      number: 'STEP 03',
      title: 'Conduct the Auction',
      description:
        'Open the auction, collect bids, determine the winning bid according to configured rules, and display the payout calculation.',
    },
    {
      number: 'STEP 04',
      title: 'Verify & Close the Cycle',
      description:
        'Review the result, confirm the payout, close the cycle, and preserve the cycle history for members and organisers.',
    },
  ],
} as const

export const aiRiskContent = {
  eyebrow: 'EXPLAINABLE DECISION SUPPORT',
  heading: 'Spot unusual behaviour before it becomes a problem.',
  supporting:
    'Our AI risk layer reviews available payment and bidding history to identify unusual patterns and provide plain-language explanations for organisers.',
  benefits: [
    {
      title: 'Behavioural pattern detection',
      description:
        'Monitors installment timeliness shifts, bid discount deviations, and historical cycle volatility.',
    },
    {
      title: 'Explainable risk reasons',
      description:
        'Contextual summaries explain the exact signals contributing to elevated scrutiny.',
    },
    {
      title: 'Human-review decision support',
      description:
        'Gives organizers actionable recommendations while keeping final authority in human hands.',
    },
  ],
  mockup: {
    member: 'Rahul Sharma',
    memberId: 'MEM-8842',
    series: 'Series 23 • Chennai Gold Chit',
    riskScore: '64 / 100',
    riskLevel: 'Moderate Alert',
    signals: [
      '2 late payments',
      'unusual bidding behaviour',
      'pending verification',
    ],
    buttonText: 'Explain Risk with AI',
    explanation:
      'Analysis indicates 2 consecutive late installment payments in Series 23 alongside an anomalous 14.5% bid discount spike in Round 4. Recommended action: request secondary guarantor verification before approving cycle payout.',
    disclaimer:
      'Decision-support signal and NOT proof of fraud. Designed to assist organiser review and prevent avoidable defaults.',
  },
} as const

export const userRolesContent = {
  eyebrow: 'PLATFORM ACCESS',
  heading: 'Tailored workflows for both sides.',
  subtitle:
    'Built specifically for the distinct operational needs of chit custodians and group participants.',
  roles: [
    {
      name: 'ORGANISER',
      badge: 'Administration & Oversight',
      description: 'Full administrative toolkit to execute trustworthy, compliant savings cycles.',
      responsibilities: [
        'Create and manage savings groups',
        'Record contributions',
        'Manage auctions',
        'Review payouts',
        'Review risk alerts',
      ],
    },
    {
      name: 'MEMBER',
      badge: 'Participant & Bidder',
      description: 'Self-service visibility into installments, dividend allocations, and bids.',
      responsibilities: [
        'View contribution history',
        'Check outstanding dues',
        'View auction information',
        'Review transaction history',
        'Receive relevant reminders',
      ],
    },
  ],
} as const

export const trustImpactContent = {
  eyebrow: 'INTEGRITY BY DESIGN',
  heading: 'Built for transparency. Designed for trust.',
  subtitle:
    'Replacing uncertainty with deterministic ledger tracking, explainable alerts, and crystal-clear records.',
  statements: [
    {
      title: 'Clear transaction history',
      description:
        'Every installment, dividend distribution, and payout is recorded with an immutable audit trail accessible at any time.',
    },
    {
      title: 'Transparent auction calculations',
      description:
        'Deterministic mathematical formulas govern winning discounts and participant dividend shares with zero ambiguity.',
    },
    {
      title: 'Explainable risk alerts',
      description:
        'Plain-language risk telemetry surfaces anomalies early to inform human decisions without black-box automation.',
    },
    {
      title: 'Centralised member records',
      description:
        'Single source of truth for member participation, cycle commitments, and verified payment statuses.',
    },
  ],
} as const

export const finalCtaContent = {
  eyebrow: 'TRANSPARENT MODERN SAVINGS',
  heading: 'Bring transparency to every contribution.',
  supporting:
    'Manage community savings groups with clearer records, streamlined auctions, and explainable risk monitoring.',
  primaryCta: 'Get Started',
  secondaryCta: 'View Product Demo',
} as const

export const footerContent = {
  brand: 'ChitLedger',
  tagline: 'Transparent savings. Smarter oversight.',
  description:
    'Next-generation transparent digital ledger and risk-monitoring platform for community savings groups and chit funds.',
  links: [
    { label: 'Product', href: '#product' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'AI Risk Monitoring', href: '#ai-risk-monitoring' },
    { label: 'About', href: '#about' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
  ],
} as const
