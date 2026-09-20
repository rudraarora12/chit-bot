import { useState } from 'react'
import {
  Sparkles,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldAlert,
  Info,
  ChevronDown,
  CheckCircle,
  Database,
  Layers,
  Cpu,
  Bot,
  ArrowRight,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import { aiDataDifferentiatorContent } from '@/data/landing'
import { Button } from '@/components/ui/button'

export function AiRiskSection() {
  const [showExplanation, setShowExplanation] = useState(true)
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0)

  const pipelineIcons = [Database, Layers, Cpu, Bot, CheckCircle]

  return (
    <section
      id="ai-risk-monitoring"
      className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20 border-t border-border/70"
    >
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo/20 bg-indigo/10 px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] text-indigo uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          {aiDataDifferentiatorContent.eyebrow}
        </p>
        <h2 className="mt-4 text-[30px] leading-[1.18] font-extrabold tracking-[-0.03em] text-navy sm:text-[38px]">
          {aiDataDifferentiatorContent.heading}
        </h2>
        <p className="mt-4 text-[16px] leading-7 text-muted">
          {aiDataDifferentiatorContent.supporting}
        </p>
      </div>

      {/* Visual Live Data Pipeline */}
      <div className="mt-10 rounded-[18px] border border-border bg-card p-6 sm:p-8 shadow-(--shadow-card)">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted mb-4">
          Live Data Pipeline & Intelligence Architecture
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {aiDataDifferentiatorContent.pipeline.map((node, index) => {
            const Icon = pipelineIcons[index % pipelineIcons.length]
            const isLast = index === aiDataDifferentiatorContent.pipeline.length - 1

            return (
              <div key={node.label} className="relative flex flex-col">
                <div className="flex flex-1 items-center gap-3 rounded-[12px] border border-border bg-background p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-indigo/10 text-indigo font-bold">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-navy">{node.label}</p>
                    <p className="text-[11px] text-muted">{node.sub}</p>
                  </div>
                </div>

                {!isLast && (
                  <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-indigo/60">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column Section: Live AI Queries + Realistic AI Risk Alert Card */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Instant AI Chit Queries */}
        <div className="rounded-[18px] border border-border bg-card p-6 shadow-(--shadow-card)">
          <div className="flex items-center gap-2 mb-2 text-indigo">
            <Bot className="h-5 w-5" />
            <h3 className="text-[18px] font-bold text-navy">Live AI Copilot Queries</h3>
          </div>
          <p className="text-[13px] text-muted mb-5">
            Organizers and members can ask questions about live committee records in plain English.
          </p>

          <div className="space-y-2.5">
            {aiDataDifferentiatorContent.sampleQueries.map((item, idx) => (
              <button
                key={item.query}
                type="button"
                onClick={() => setSelectedQueryIndex(idx)}
                className={`w-full text-left p-3.5 rounded-[12px] border transition-all text-xs flex flex-col gap-1.5 ${
                  selectedQueryIndex === idx
                    ? 'border-indigo/50 bg-indigo/5 shadow-xs'
                    : 'border-border bg-background hover:border-indigo/20'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-navy">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo shrink-0" />
                    "{item.query}"
                  </span>
                  {selectedQueryIndex === idx && (
                    <span className="text-[10px] text-indigo font-extrabold uppercase bg-indigo/10 px-2 py-0.5 rounded-md">
                      Live Answer
                    </span>
                  )}
                </div>
                {selectedQueryIndex === idx && (
                  <p className="mt-1 text-[12.5px] leading-relaxed text-navy-soft pl-5 border-l-2 border-indigo font-medium">
                    {item.answer}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: AI Risk Telemetry Mockup */}
        <div className="rounded-[18px] border border-border bg-card p-6 shadow-(--shadow-preview)">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-bold text-white text-[13px]">
                RS
              </div>
              <div>
                <p className="text-[15px] font-bold text-navy">
                  {aiDataDifferentiatorContent.mockup.member}
                </p>
                <p className="text-[11.5px] text-muted">
                  {aiDataDifferentiatorContent.mockup.series}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              {aiDataDifferentiatorContent.mockup.riskLevel}
            </span>
          </div>

          {/* Risk Metric Bar */}
          <div className="mt-5 rounded-[12px] border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-muted uppercase tracking-wider">
                Behavioral Risk Index
              </span>
              <span className="font-mono text-[17px] font-bold text-navy">
                {aiDataDifferentiatorContent.mockup.riskScore}
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald via-amber-500 to-rose-500"
                style={{ width: '64%' }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
              <span>0 (Low)</span>
              <span>50 (Moderate)</span>
              <span>100 (High Alert)</span>
            </div>
          </div>

          {/* Observed Risk Signals */}
          <div className="mt-4">
            <p className="text-[11.5px] font-bold text-muted uppercase tracking-wider">
              AI-Assisted Early Risk Indicators
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {aiDataDifferentiatorContent.mockup.signals.map((signal) => (
                <span
                  key={signal}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11.5px] font-semibold text-rose-700"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  {signal}
                </span>
              ))}
            </div>
          </div>

          {/* Explain Risk with AI */}
          <div className="mt-5 rounded-[12px] border border-indigo/25 bg-indigo/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo">
                <Sparkles className="h-4 w-4" />
                <span className="text-[12.5px] font-bold text-navy">
                  AI Decision Support Explanation
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-bold text-indigo hover:text-indigo-900"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? 'Hide rationale' : aiDataDifferentiatorContent.mockup.buttonText}
                <ChevronDown
                  className={`h-3 w-3 ml-1 transition-transform ${
                    showExplanation ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </div>

            {showExplanation && (
              <div className="mt-3">
                <p className="text-[12.5px] leading-relaxed text-navy-soft">
                  {aiDataDifferentiatorContent.mockup.explanation}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[11px] font-semibold text-indigo">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Signal grounded in live Cycle 22 & 23 ledger entries
                </div>
              </div>
            )}
          </div>

          {/* Decision-Support Notice */}
          <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-border bg-background p-3">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted">
              <strong className="text-navy font-semibold">Decision-Support Notice: </strong>
              {aiDataDifferentiatorContent.mockup.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
