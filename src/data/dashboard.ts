export interface SummaryStat { id: string; label: string; value: string; supportingText: string; iconName: 'users' | 'wallet' | 'layers' | 'clock' | 'shieldAlert' }
export interface AuctionData { cycle: number; poolAmount: number; participantsCount: number; winningBid: number; status: 'Scheduled' | 'Live' | 'Completed'; date: string }
export interface CollectionData { target: number | null; collected: number; pending: number | null; overdueAmount: number; percentage: number; hasData: boolean; cycle: number | null }
export interface PaymentStatusData { paidCount: number; pendingCount: number; overdueCount: number; totalMembers: number; hasData: boolean }
export interface RiskAlert { id: string; memberId: string; memberName: string; avatarInitials: string; riskLevel: 'High' | 'Medium'; reason: string; timestamp: string }
export interface Transaction { id: string; date: string; member: string; activity: string; amount: string; status: 'Completed' | 'Pending' | 'Overdue' | 'Active' }
export interface DashboardData { currentCycle: number | null; summaryStats: SummaryStat[]; currentAuction: AuctionData | null; collectionOverview: CollectionData; paymentStatus: PaymentStatusData; riskAlerts: RiskAlert[]; recentTransactions: Transaction[] }
