import { Gavel, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { AuctionData } from '@/data/dashboard'

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`
const orDash = (value: number) => (value > 0 ? money(value) : '—')
export function CurrentAuctionCard({ auction }: { auction: AuctionData | null }) {
  if (!auction) return <article className="rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card)"><div className="flex items-center gap-2.5"><Gavel className="h-5 w-5 text-emerald" /><h2 className="text-base font-bold text-navy">Current Auction</h2></div><p className="mt-4 text-sm text-muted">No auction scheduled.</p></article>
  return <article className="rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card)"><div className="flex items-center justify-between gap-3 border-b border-border pb-4"><div className="flex items-center gap-2.5"><Gavel className="h-5 w-5 text-emerald" /><div><h2 className="text-base font-bold text-navy">Current Auction</h2><p className="text-xs text-muted">Cycle {auction.cycle} • {auction.date}</p></div></div><Link to="/auction"><Button size="sm" variant="default" className="text-xs">View Auction</Button></Link></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-[10px] border border-border bg-background p-3"><span className="text-[11px] text-muted">Pool Amount</span><p className="mt-1 font-bold text-navy">{orDash(auction.poolAmount)}</p></div><div className="rounded-[10px] border border-border bg-background p-3"><span className="text-[11px] text-muted">Winning Bid</span><p className="mt-1 font-bold text-emerald-dark">{orDash(auction.winningBid)}</p></div><div className="rounded-[10px] border border-border bg-background p-3"><span className="text-[11px] text-muted">Participants</span><p className="mt-1 flex items-center gap-1 font-bold text-navy"><Users className="h-3.5 w-3.5" />{auction.participantsCount}</p></div></div></article>
}
