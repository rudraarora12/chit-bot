import { ArrowUpRight } from 'lucide-react'
import type { CollectionData } from '@/data/dashboard'

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`

export function CollectionOverviewCard({ collection }: { collection: CollectionData }) {
  if (!collection.hasData) return <article className="rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card)"><h3 className="text-base font-bold text-navy">Collection Overview</h3><p className="mt-3 text-sm text-muted">No payments recorded for this cycle.</p></article>
  return <article className="rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card)">
    <div className="flex items-center justify-between gap-2 border-b border-border pb-3"><div><h3 className="text-base font-bold text-navy">Collection Overview</h3><p className="text-xs text-muted">Cycle {collection.cycle} collection status</p></div><span className="inline-flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-1 text-xs font-bold text-emerald-dark"><ArrowUpRight className="h-3.5 w-3.5" />{collection.percentage}% collected</span></div>
    <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><span className="text-muted">Target</span><p className="mt-1 font-bold text-navy">{collection.target === null ? '—' : money(collection.target)}</p></div><div><span className="text-muted">Collected</span><p className="mt-1 font-bold text-emerald-dark">{money(collection.collected)}</p></div><div><span className="text-muted">Pending</span><p className="mt-1 font-bold text-navy">{collection.pending === null ? '—' : money(collection.pending)}</p></div><div><span className="text-muted">Overdue</span><p className="mt-1 font-bold text-rose-600">{money(collection.overdueAmount)}</p></div></div>
    {collection.target !== null && <div className="mt-5"><div className="h-2.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-emerald" style={{ width: `${collection.percentage}%` }} /></div><p className="mt-2 text-[11px] text-muted">No collection trend is shown until it is stored as historical cycle data.</p></div>}
  </article>
}
