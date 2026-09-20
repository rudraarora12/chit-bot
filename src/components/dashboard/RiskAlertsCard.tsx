import { ShieldAlert, ChevronRight, AlertTriangle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { RiskAlert } from '@/data/dashboard'

interface RiskAlertsCardProps {
  alerts: RiskAlert[]
}

export function RiskAlertsCard({ alerts }: RiskAlertsCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-[16px] border border-border bg-card p-5 shadow-(--shadow-card)">
      <div>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-500/10 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy">AI Risk Monitoring</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  {alerts.length} Signal{alerts.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-muted">
                Unusual behavior telemetry • Requires review
              </p>
            </div>
          </div>

          <Link to="/risk">
            <Button size="sm" variant="outline" className="gap-1 text-xs font-semibold">
              View All Risk Alerts
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Disclaimer Notice Banner */}
        <div className="mt-3.5 flex items-center gap-2 rounded-[10px] border border-border bg-background/80 px-3 py-2 text-[11px] text-muted">
          <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span>Automated behavioral indicator to support organizer review. Not a legal or fraud determination.</span>
        </div>

        {/* Risk Alerts Feed */}
        <div className="mt-4 space-y-3">
          {alerts.length === 0 ? <p className="rounded-[12px] border border-border bg-background p-4 text-sm text-muted">No active risk signals.</p> : alerts.map((alert) => {
            const isHigh = alert.riskLevel === 'High'

            return (
              <div
                key={alert.id}
                className="flex flex-col gap-3 rounded-[12px] border border-border/80 bg-background p-3.5 transition-all hover:border-border sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {alert.avatarInitials}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-navy">{alert.memberName}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isHigh
                            ? 'border border-rose-500/20 bg-rose-500/10 text-rose-700'
                            : 'border border-amber-500/20 bg-amber-500/10 text-amber-700'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {alert.riskLevel} Risk
                      </span>
                      <span className="text-[11px] text-muted-foreground">• {alert.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs text-navy-soft font-medium">
                      {alert.reason}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/members/${alert.memberId}`}
                  className="self-end sm:self-center shrink-0"
                >
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-emerald-dark hover:text-emerald">
                    View Member
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}
