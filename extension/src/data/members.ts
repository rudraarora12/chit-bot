export type CollectionStatus = 'Overdue' | 'Due Soon'
export type CollectionPriority = 'High' | 'Low'
export interface PendingMember { id: string; name: string; amount: number; dueDate: string; status: CollectionStatus; priority: CollectionPriority }

// Future backend integration can replace this local array with an API adapter.
export const pendingMembers: PendingMember[] = [
  { id: 'rahul-sharma', name: 'Rahul Sharma', amount: 4167, dueDate: '18 Sep 2026', status: 'Overdue', priority: 'High' },
  { id: 'amit-malhotra', name: 'Amit Malhotra', amount: 4167, dueDate: '19 Sep 2026', status: 'Overdue', priority: 'High' },
  { id: 'sunita-rao', name: 'Sunita Rao', amount: 4167, dueDate: '22 Sep 2026', status: 'Due Soon', priority: 'Low' },
  { id: 'vikram-patel', name: 'Vikram Patel', amount: 5499, dueDate: '17 Sep 2026', status: 'Overdue', priority: 'High' },
]
export const collectionSummary = { pendingAmount: 18000, overdueCount: 4, dueSoonCount: 3 }
