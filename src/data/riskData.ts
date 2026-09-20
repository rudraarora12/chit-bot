export interface RiskMember {
  id: string
  name: string
  avatarInitials: string
  email: string
  phone: string
  riskLevel: 'Low' | 'Medium' | 'High'
  latePayments: number
  missedPayments: number
  recentCycles: number
  outstandingAmount: number
  behaviourChange: boolean
  riskReasons: string[]
  aiExplanation: string
  suggestedAction: string
  lastActivity: string
}