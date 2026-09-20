export interface AuctionBid {
  id: string
  memberId: string
  memberName: string
  avatarInitials: string
  bidAmount: number
  bidFormatted: string
  timestamp: string
}

export interface CurrentAuction {
  cycle: number
  chitAmount: number
  chitAmountFormatted: string
  participants: number
  currentHighestBid: number
  highestBidFormatted: string
  estimatedPrizeAmount: number
  prizeAmountFormatted: string
  status: 'Scheduled' | 'Live' | 'Completed'
  bids: AuctionBid[]
}

export interface LedgerTransaction {
  id: string
  date: string
  member: string
  memberId: string
  transaction: 'Contribution' | 'Auction Bid' | 'Auction Payout' | 'Pending Payment'
  category: 'contribution' | 'auction' | 'payout' | 'pending'
  amount: string
  rawAmount: number
  status: 'Completed' | 'Pending' | 'Overdue' | 'Active'
  integrityHash: string
}

export interface AuctionSummary {
  totalCollected: string
  pendingAmount: string
  completedTransactions: number
  currentCycle: string
}

export const initialAuctionData: CurrentAuction = {
  cycle: 8,
  chitAmount: 50000,
  chitAmountFormatted: '₹50,000',
  participants: 12,
  currentHighestBid: 8500,
  highestBidFormatted: '₹8,500',
  estimatedPrizeAmount: 41500,
  prizeAmountFormatted: '₹41,500',
  status: 'Scheduled',
  bids: [
    {
      id: 'bid-1',
      memberId: 'CL-006',
      memberName: 'Priya Krishnan',
      avatarInitials: 'PK',
      bidAmount: 8500,
      bidFormatted: '₹8,500 discount',
      timestamp: '2 mins ago',
    },
    {
      id: 'bid-2',
      memberId: 'CL-001',
      memberName: 'Aarav Sharma',
      avatarInitials: 'AS',
      bidAmount: 8000,
      bidFormatted: '₹8,000 discount',
      timestamp: '8 mins ago',
    },
    {
      id: 'bid-3',
      memberId: 'CL-007',
      memberName: 'Arun Mehta',
      avatarInitials: 'AM',
      bidAmount: 7400,
      bidFormatted: '₹7,400 discount',
      timestamp: '15 mins ago',
    },
    {
      id: 'bid-4',
      memberId: 'CL-008',
      memberName: 'Meera Iyer',
      avatarInitials: 'MI',
      bidAmount: 6900,
      bidFormatted: '₹6,900 discount',
      timestamp: '28 mins ago',
    },
    {
      id: 'bid-5',
      memberId: 'CL-005',
      memberName: 'Vikram Nair',
      avatarInitials: 'VN',
      bidAmount: 6200,
      bidFormatted: '₹6,200 discount',
      timestamp: '42 mins ago',
    },
  ],
}

export const initialLedgerTransactions: LedgerTransaction[] = [
  {
    id: 'TX-801',
    date: '20 Sep 2026',
    member: 'Priya Krishnan',
    memberId: 'CL-006',
    transaction: 'Contribution',
    category: 'contribution',
    amount: '₹5,000',
    rawAmount: 5000,
    status: 'Completed',
    integrityHash: '0x8f2…a91',
  },
  {
    id: 'TX-802',
    date: '20 Sep 2026',
    member: 'Aarav Sharma',
    memberId: 'CL-001',
    transaction: 'Contribution',
    category: 'contribution',
    amount: '₹5,000',
    rawAmount: 5000,
    status: 'Completed',
    integrityHash: '0x4c9…b12',
  },
  {
    id: 'TX-803',
    date: '19 Sep 2026',
    member: 'Priya Krishnan',
    memberId: 'CL-006',
    transaction: 'Auction Bid',
    category: 'auction',
    amount: '₹8,500',
    rawAmount: 8500,
    status: 'Active',
    integrityHash: '0x7d3…e88',
  },
  {
    id: 'TX-804',
    date: '18 Sep 2026',
    member: 'Rahul Sharma',
    memberId: 'CL-003',
    transaction: 'Auction Payout',
    category: 'payout',
    amount: '₹42,000',
    rawAmount: 42000,
    status: 'Completed',
    integrityHash: '0x1a5…c44',
  },
  {
    id: 'TX-805',
    date: '17 Sep 2026',
    member: 'Simran Kaur',
    memberId: 'CL-002',
    transaction: 'Pending Payment',
    category: 'pending',
    amount: '₹5,000',
    rawAmount: 5000,
    status: 'Pending',
    integrityHash: '0x9e8…f33',
  },
  {
    id: 'TX-806',
    date: '16 Sep 2026',
    member: 'Ananya Singh',
    memberId: 'CL-004',
    transaction: 'Contribution',
    category: 'contribution',
    amount: '₹5,000',
    rawAmount: 5000,
    status: 'Completed',
    integrityHash: '0x3b2…d77',
  },
  {
    id: 'TX-807',
    date: '15 Sep 2026',
    member: 'Meera Iyer',
    memberId: 'CL-008',
    transaction: 'Contribution',
    category: 'contribution',
    amount: '₹5,000',
    rawAmount: 5000,
    status: 'Completed',
    integrityHash: '0x6f1…a09',
  },
  {
    id: 'TX-808',
    date: '14 Sep 2026',
    member: 'Deepak Patel',
    memberId: 'CL-009',
    transaction: 'Pending Payment',
    category: 'pending',
    amount: '₹5,000',
    rawAmount: 5000,
    status: 'Overdue',
    integrityHash: '0x2c4…e55',
  },
  {
    id: 'TX-809',
    date: '12 Sep 2026',
    member: 'Vikram Nair',
    memberId: 'CL-005',
    transaction: 'Auction Bid',
    category: 'auction',
    amount: '₹6,200',
    rawAmount: 6200,
    status: 'Completed',
    integrityHash: '0x5e7…b66',
  },
  {
    id: 'TX-810',
    date: '10 Sep 2026',
    member: 'Kavitha Reddy',
    memberId: 'CL-010',
    transaction: 'Contribution',
    category: 'contribution',
    amount: '₹5,000',
    rawAmount: 5000,
    status: 'Completed',
    integrityHash: '0x8d9…c11',
  },
]

export const initialAuctionSummary: AuctionSummary = {
  totalCollected: '₹5,42,000',
  pendingAmount: '₹18,000',
  completedTransactions: 24,
  currentCycle: 'Cycle 8 of 12',
}
