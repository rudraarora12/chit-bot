export const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'Lifecycle', href: '#lifecycle' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI & Real-Time', href: '#ai-risk-monitoring' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Organize', href: '/subscription' },
] as const

export const heroContent = {
  badge: 'DIGITAL CHIT FUND PLATFORM • FREE FOR MEMBERS • ORGANIZER OS',
  heading: 'Run Your Chit Group. Digitally.',
  supporting:
    'ChitLedger brings committees, contributions, auctions, risk monitoring and AI-powered insights into one transparent platform.',
  trustNote: 'Built for organizers and the members they serve.',
  primaryCta: 'Start Organizing',
  primaryCtaHref: '/subscription',
  secondaryCta: 'Explore How It Works',
  secondaryCtaHref: '#how-it-works',
  trustIndicators: [
    'Members: 100% Free',
    'Organizers: ₹499/month',
    'Live Reverse Auctions',
    'AI Risk Indicators',
  ],
} as const

export const stats = [
  { value: '₹140Cr+', label: 'Chit Capital Supervised' },
  { value: '99.4%', label: 'On-Time Collection Velocity' },
  { value: '100%', label: 'Tamper-Evident Ledger Integrity' },
  { value: '12,000+', label: 'Active Chit Members' },
] as const

export const complianceItems = [
  'Free for all chit members',
  '₹499/month for group organizers',
  'RBI-aligned chit structures',
  'Tamper-evident ledger journaling',
] as const

export const dashboardPreview = {
  groupName: 'Chennai Gold Chit',
  series: 'Series 24',
  totalPool: '₹48,00,000',
  collection: { collected: 18, expected: 20, label: 'Members Paid' },
  risk: { value: '12.4%', label: 'Risk Telemetry Index' },
  auction: {
    status: 'Live',
    bids: [
      { initials: 'PK', member: 'Priya Krishnan', bid: '8.2% Discount' },
      { initials: 'AM', member: 'Arun Mehta', bid: '7.4% Discount' },
      { initials: 'MI', member: 'Meera Iyer', bid: '6.9% Discount' },
    ],
  },
  activity: [
    { time: '09:42 AM', text: 'Cycle 14 Contribution Confirmed' },
    { time: '09:18 AM', text: 'Bid sealed — Priya K.' },
    { time: '08:51 AM', text: 'Installment hash committed to ledger' },
  ],
  integrityHash: '0x8f2…a91',
} as const

export const problemContent = {
  eyebrow: 'THE LEGACY BOTTLENECK',
  heading: "Chit groups shouldn't run on scattered spreadsheets and WhatsApp messages.",
  supporting:
    'Traditional community chit funds suffer from fragmented record-keeping, delayed updates, and lack of transparency. Organizers and members lose hours chasing payments and reconciling books.',
  cards: [
    {
      title: 'Manual Records',
      description:
        'Contribution and payment tracking becomes difficult as groups grow.',
      impactBadge: 'Vulnerable to Error',
    },
    {
      title: 'Scattered Communication',
      description:
        'Members often rely on messages and manual updates for important information.',
      impactBadge: 'Information Asymmetry',
    },
    {
      title: 'Opaque Auctions',
      description:
        'Members need clearer visibility into auction activity and outcomes.',
      impactBadge: 'Zero Audit Trail',
    },
    {
      title: 'Limited Risk Visibility',
      description:
        'Organizers may notice payment issues only after they become serious.',
      impactBadge: 'Late Detection',
    },
  ],
} as const

export const solutionLifecycleContent = {
  eyebrow: 'THE COMPLETE CHIT LIFECYCLE',
  heading: 'One platform for the entire chit lifecycle.',
  subtitle:
    'From creating a committee to running auctions and tracking every contribution.',
  steps: [
    {
      code: 'CREATE',
      title: 'Create',
      description: 'Create and configure your chit committee.',
      tag: '01',
    },
    {
      code: 'MANAGE',
      title: 'Manage',
      description: 'Manage members and committee participation.',
      tag: '02',
    },
    {
      code: 'COLLECT',
      title: 'Collect',
      description: 'Track contributions and payment status.',
      tag: '03',
    },
    {
      code: 'AUCTION',
      title: 'Auction',
      description: 'Run transparent live reverse auctions.',
      tag: '04',
    },
    {
      code: 'MONITOR',
      title: 'Monitor',
      description: 'Identify unusual payment behaviour early.',
      tag: '05',
    },
    {
      code: 'ANALYZE',
      title: 'Analyze',
      description: 'Understand group activity with real-time insights.',
      tag: '06',
    },
  ],
} as const

export const organizerFeaturesContent = {
  eyebrow: 'ORGANIZER PAID SUITE',
  heading: 'Everything an organizer needs to run a digital chit group.',
  subtitle:
    'Powerful organizer tools, available with ChitLedger Organizer for ₹499/month.',
  features: [
    {
      id: 'f1',
      title: 'Create Chit Committees',
      description:
        'Create committees with member limits, contribution amounts, duration and auction rules.',
      tag: 'Setup & Rules',
      accent: 'emerald',
    },
    {
      id: 'f2',
      title: 'Member Management',
      description:
        'Manage members, participation, contribution status and payment history from one workspace.',
      tag: 'Directory',
      accent: 'teal',
    },
    {
      id: 'f3',
      title: 'Digital Ledger',
      description:
        'Maintain a centralized record of contributions, payments and committee activity.',
      tag: 'Audit Trail',
      accent: 'navy',
    },
    {
      id: 'f4',
      title: 'Live Reverse Auctions',
      description:
        'Run transparent real-time auctions where eligible members can submit bids.',
      tag: 'Real-Time Bidding',
      accent: 'emerald',
    },
    {
      id: 'f5',
      title: 'AI Risk Monitoring',
      description:
        'Identify unusual payment behaviour and surface members who may need review with AI-assisted early risk indicators.',
      tag: 'Early Signals',
      accent: 'indigo',
    },
    {
      id: 'f6',
      title: 'AI Assistant',
      description:
        'Ask questions about members, payments, contributions, auctions and group activity using live ChitLedger data.',
      tag: 'Live Copilot',
      accent: 'indigo',
    },
    {
      id: 'f7',
      title: 'Real-time Updates',
      description:
        'Committee activity, payments and auction changes update across connected users without manual refresh.',
      tag: 'Instant Sync',
      accent: 'teal',
    },
    {
      id: 'f8',
      title: 'Organizer Analytics',
      description:
        'Understand collections, pending payments, member activity and committee performance.',
      tag: 'Control Center',
      accent: 'navy',
    },
  ],
} as const

export const whyOrganizersPayContent = {
  eyebrow: 'BUSINESS VALUE & ROI',
  heading: 'Why would an organizer pay ₹499/month?',
  subtitle:
    'Replace scattered tools with one organized operating system for your chit group.',
  disclaimer:
    'ChitLedger focuses on organization, visibility, transparency, and operational convenience for sustainable group management.',
  withoutChitLedger: [
    'Spreadsheets with version errors',
    'Manual payment tracking & receipts',
    'WhatsApp-based fragmented updates',
    'Manual auction coordination over phone calls',
    'Limited risk visibility until default occurs',
    'Repeated member queries about dues & status',
    'Scattered records across paper registers',
  ],
  withChitLedger: [
    'Digital committee management & rule configuration',
    'Centralized payment tracking & instant dues overview',
    'Real-time updates across connected participants',
    'Live reverse auctions with automated calculations',
    'AI risk monitoring with early behavioural indicators',
    'AI assistant answering live group queries instantly',
    'Digital ledger with full audit logging',
    'Organizer analytics covering collection velocity & performance',
  ],
} as const

export const memberExperienceContent = {
  eyebrow: 'INCLUSIVE MEMBER EXPERIENCE',
  heading: 'Members get a better chit experience too.',
  badge: '100% FREE FOR MEMBERS',
  supportingMessage:
    'Organizers power the platform. Members get a transparent digital experience without paying any platform fees.',
  features: [
    'Browse available committees',
    'View committee terms and rules',
    'Join a committee with one click',
    'Track contributions & receipts in real time',
    'View comprehensive payment history',
    'Participate in eligible live auctions',
    'View auction results & dividend distributions',
    'Understand benefits and group activity',
    'Ask the AI assistant about their own chit information',
  ],
} as const

export const howItWorksOrganizerContent = {
  eyebrow: 'ORGANIZER ONBOARDING',
  heading: 'How to start organizing with ChitLedger.',
  subtitle:
    'A simple 5-step workflow designed to take your chit group from manual setup to automated management.',
  steps: [
    {
      number: '01',
      title: 'Subscribe',
      description: 'Choose ChitLedger Organizer at ₹499/month to unlock creator privileges.',
      badge: 'Step 1',
    },
    {
      number: '02',
      title: 'Create',
      description: 'Create your chit committee and define its rules, duration, and pool size.',
      badge: 'Step 2',
    },
    {
      number: '03',
      title: 'Invite',
      description: 'Let members discover and join the committee through simple digital invites.',
      badge: 'Step 3',
    },
    {
      number: '04',
      title: 'Run',
      description: 'Track contributions and conduct live reverse auctions transparently.',
      badge: 'Step 4',
    },
    {
      number: '05',
      title: 'Monitor',
      description: 'Use the ledger, risk monitoring and AI insights to manage the group with confidence.',
      badge: 'Step 5',
    },
  ],
} as const

export const organizerPlanContent = {
  eyebrow: 'TRANSPARENT PRICING',
  planName: 'ChitLedger Organizer',
  price: '₹499',
  period: '/month',
  subtitle: 'For organizers who want to digitize and manage their chit groups.',
  ctaText: 'Start Organizing',
  ctaHref: '/subscription',
  features: [
    'Create chit committees with customized rules',
    'Member management & participation oversight',
    'Digital ledger with complete transaction history',
    'Contribution tracking & collection status',
    'Payment monitoring & overdue reminders',
    'Live reverse auctions with automated bidding room',
    'AI risk monitoring & early warning telemetry',
    'AI assistant for live group intelligence',
    'Real-time updates via instant sync',
    'Organizer analytics & collection performance',
  ],
} as const

export const comparisonTableContent = {
  eyebrow: 'FEATURE MATRIX',
  heading: 'Built for both sides of the chit.',
  subtitle:
    'Members join and participate for free. Organizers create, operate, and manage with the ₹499/month plan.',
  columns: [
    { name: 'Feature / Capability', key: 'feature' },
    { name: 'Member (FREE)', key: 'member', isFree: true },
    { name: 'Organizer (₹499/mo)', key: 'organizer', isPaid: true },
  ],
  rows: [
    { feature: 'Browse Committees', member: 'FREE', organizer: true },
    { feature: 'Join Committees', member: 'FREE', organizer: true },
    { feature: 'Track Own Contributions', member: 'FREE', organizer: true },
    { feature: 'View Own Payments', member: 'FREE', organizer: true },
    { feature: 'Participate in Live Auctions', member: 'FREE', organizer: true },
    { feature: 'Ask AI About Personal Dues', member: 'FREE', organizer: true },
    { feature: 'Create Committees', member: 'NO', organizer: true },
    { feature: 'Manage Members & Rosters', member: 'NO', organizer: true },
    { feature: 'Digital Ledger Management', member: 'NO', organizer: true },
    { feature: 'AI Risk Monitoring Telemetry', member: 'NO', organizer: true },
    { feature: 'Organizer Analytics & Insights', member: 'NO', organizer: true },
    { feature: 'Ask AI Full Group Analytics', member: 'NO', organizer: true },
  ],
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
      description: 'Full administrative toolkit to execute trustworthy, compliant savings cycles for ₹499/mo.',
      responsibilities: [
        'Create and manage savings groups',
        'Record contributions & payment status',
        'Conduct live reverse auctions',
        'Review payouts & digital ledger',
        'Review AI risk indicators',
      ],
    },
    {
      name: 'MEMBER',
      badge: 'Participant (100% Free)',
      description: 'Self-service visibility into installments, dividend allocations, and reverse auctions.',
      responsibilities: [
        'View contribution history',
        'Check outstanding dues',
        'Participate in eligible live auctions',
        'Review transaction history',
        'Ask AI assistant about personal status',
      ],
    },
  ],
} as const

export const aiDataDifferentiatorContent = {
  eyebrow: 'REAL-TIME DATA + AI ENGINE',
  heading: "Your chit data shouldn't sit still.",
  supporting:
    'ChitLedger connects your live committee data with real-time updates and AI-powered assistance.',
  pipeline: [
    { label: 'MongoDB', sub: 'Live Database' },
    { label: 'Live Committee Data', sub: 'Active Cycles & Dues' },
    { label: 'ChitLedger Core', sub: 'Sync & Ledger Engine' },
    { label: 'AI Assistant', sub: 'Context-Aware LLM' },
    { label: 'Actionable Insights', sub: 'Proactive Decisions' },
  ],
  sampleQueries: [
    { query: 'Who has not paid this cycle?', answer: '2 members pending: Rahul Sharma (2 days overdue) & Priya K.' },
    { query: 'When is the next auction?', answer: 'Series 24 auction opens on Friday at 04:00 PM IST.' },
    { query: 'How much has been collected?', answer: '₹43,20,000 of ₹48,00,000 total pool (90% collected).' },
    { query: 'Which members need attention?', answer: 'Rahul Sharma flagged with 2 consecutive delayed installments.' },
    { query: 'When is my next contribution due?', answer: 'Installment 15 of ₹2,500 is due on the 5th of next month.' },
  ],
  mockup: {
    member: 'Rahul Sharma',
    memberId: 'MEM-8842',
    series: 'Series 23 • Chennai Gold Chit',
    riskScore: '64 / 100',
    riskLevel: 'Moderate Alert',
    signals: [
      '2 consecutive late installments',
      'Sudden 14.5% discount bid spike',
      'Guarantor verification pending',
    ],
    buttonText: 'Explain Risk with AI',
    explanation:
      'Analysis indicates 2 consecutive late installment payments in Series 23 alongside an anomalous 14.5% bid discount spike in Round 4. Recommended action: request secondary guarantor verification before approving cycle payout.',
    disclaimer:
      'AI risk indicators provide decision support based on recorded payment history and are not automated credit guarantees.',
  },
} as const

export const transparencyContent = {
  eyebrow: 'INTEGRITY & TRUST',
  heading: 'Built around transparency.',
  supporting:
    'Members see what matters to them. Organizers get the operational visibility they need.',
  pillars: [
    {
      title: 'Contribution Tracking',
      description: 'Clear, timestamped tracking of every member contribution and installment status.',
    },
    {
      title: 'Auction Visibility',
      description: 'Open reverse bidding with instant dividend breakdown and payout calculations.',
    },
    {
      title: 'Payment History',
      description: 'Searchable, verifiable digital payment logs for both members and organizers.',
    },
    {
      title: 'Committee Activity',
      description: 'Real-time broadcast of member joins, bid submissions, and milestone completions.',
    },
    {
      title: 'Risk Indicators',
      description: 'Early behavioural alerts to protect the group fund before payment issues escalate.',
    },
    {
      title: 'Digital Ledger',
      description: 'Centralized, immutable record keeping replacing prone-to-loss paper registers.',
    },
  ],
} as const

export const finalCtaContent = {
  eyebrow: 'GET STARTED TODAY',
  heading: 'Ready to digitize your chit group?',
  subtitle: 'Start organizing with ChitLedger.',
  price: '₹499',
  period: '/month',
  planLabel: 'Organizer Plan',
  primaryCta: 'Start Organizing',
  primaryCtaHref: '/subscription',
  secondaryCta: 'Explore ChitLedger',
  secondaryCtaHref: '#product',
  valueBadge: '100% Free for Members • Instant Organizer Setup',
} as const

export const footerContent = {
  brand: 'ChitLedger',
  tagline: 'Transparent savings. Smarter oversight.',
  description:
    'Digital platform for community chit funds. Free for members. Powerful tools for organizers at ₹499/month.',
  links: [
    { label: 'Product', href: '#product' },
    { label: 'Lifecycle', href: '#lifecycle' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'AI Risk Monitoring', href: '#ai-risk-monitoring' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
  ],
} as const
