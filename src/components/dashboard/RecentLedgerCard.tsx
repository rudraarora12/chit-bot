import { Receipt, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Transaction } from '@/data/dashboard'

interface RecentLedgerCardProps {
  transactions: Transaction[]
}

export function RecentLedgerCard({ transactions }: RecentLedgerCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card)">
      <div>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald/10 text-emerald">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Recent Activity / Ledger</h2>
              <p className="text-xs text-muted">Tamper-evident transaction logs</p>
            </div>
          </div>

          <Link to="/ledger">
            <Button size="sm" variant="outline" className="gap-1 text-xs font-semibold">
              View Full Ledger
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Ledger Table */}
        <div className="mt-4 overflow-x-auto">
          {transactions.length === 0 ? (
            <p className="rounded-[12px] border border-border bg-background p-4 text-sm text-muted">No ledger activity yet.</p>
          ) : <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="pb-3 pl-1 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Member</th>
                <th className="pb-3 font-semibold">Activity</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 pr-1 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transactions.map((tx) => {
                let statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-2 py-0.5 text-[10px] font-bold text-emerald-dark">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                )

                if (tx.status === 'Pending') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )
                } else if (tx.status === 'Overdue') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      <AlertCircle className="h-3 w-3" />
                      Overdue
                    </span>
                  )
                } else if (tx.status === 'Active') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      Active Bid
                    </span>
                  )
                }

                return (
                  <tr key={tx.id} className="transition-colors hover:bg-background/60">
                    <td className="py-3 pl-1 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 font-bold text-navy whitespace-nowrap">
                      {tx.member}
                    </td>
                    <td className="py-3 font-medium text-navy-soft whitespace-nowrap">
                      {tx.activity}
                    </td>
                    <td className="py-3 font-mono font-bold text-navy whitespace-nowrap">
                      {tx.amount}
                    </td>
                    <td className="py-3 pr-1 text-right whitespace-nowrap">
                      {statusBadge}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>}
        </div>
      </div>
    </article>
  )
}
