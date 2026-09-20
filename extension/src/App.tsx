import { useEffect, useMemo, useRef, useState } from 'react'
import { CurrentMember } from './components/CurrentMember'
import { MemberCard } from './components/MemberCard'
import { ReminderPreview } from './components/ReminderPreview'
import { collectionSummary, pendingMembers, type PendingMember } from './data/members'
import { observeActiveWhatsAppChat } from './services/whatsappContext'
import { inr } from './utils/currency'
import { findMemberByChatName } from './utils/memberMatching'

const Icon = ({ name }: { name: 'search' | 'bell' | 'close' }) => <svg viewBox="0 0 24 24" aria-hidden="true">{name === 'search' && <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.25 4.25" /></>}{name === 'bell' && <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>}{name === 'close' && <><path d="M18 6 6 18M6 6l12 12" /></>}</svg>

export default function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [chatName, setChatName] = useState<string | null>(null)
  const [generatedMember, setGeneratedMember] = useState<PendingMember | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const currentMember = useMemo(() => findMemberByChatName(chatName, pendingMembers), [chatName])
  const matches = useMemo(() => { const query = search.trim().toLowerCase(); return query ? pendingMembers.filter((member) => member.name.toLowerCase().includes(query)) : pendingMembers }, [search])

  useEffect(() => observeActiveWhatsAppChat(setChatName), [])
  useEffect(() => setGeneratedMember(null), [currentMember?.id])

  const notify = (message: string) => { setToast(message); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setToast(null), 2800) }
  const copyReminder = async (message: string) => {
    try { await navigator.clipboard.writeText(message); notify('Reminder copied to clipboard') }
    catch { notify('Could not copy reminder. Please try again.') }
  }

  return <div className="chitledger-shell">
    {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}
    <button className="launcher" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="chitledger-panel"><span className="launcher-mark">₹</span><span>ChitLedger</span></button>
    <aside id="chitledger-panel" className={`panel ${isOpen ? 'panel-open' : ''}`} aria-hidden={!isOpen}>
      <header className="panel-header"><div className="brand"><span className="brand-mark">₹</span><div><h1>ChitLedger</h1><p>Collection Assistant</p></div></div><button className="icon-button" onClick={() => setIsOpen(false)} aria-label="Close assistant"><Icon name="close" /></button></header>
      <main className="panel-content">
        <CurrentMember member={currentMember} chatName={chatName} onGenerate={() => currentMember && setGeneratedMember(currentMember)} />
        {generatedMember && <ReminderPreview member={generatedMember} onCopy={copyReminder} />}
        <section className="summary"><div className="summary-primary"><span>Pending collection</span><strong>{inr.format(collectionSummary.pendingAmount)}</strong></div><div className="summary-stats"><div><strong>{collectionSummary.overdueCount}</strong><span>Overdue</span></div><div><strong>{collectionSummary.dueSoonCount}</strong><span>Due soon</span></div></div></section>
        <div className="section-heading"><div><h2>Pending members</h2><p>{pendingMembers.length} members need attention</p></div><button className="reminders-button" onClick={() => notify('Reminder batch prepared locally')}><Icon name="bell" />Send reminders</button></div>
        <label className="search-box"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member" aria-label="Search member" /></label>
        <section className="member-list" aria-live="polite">{matches.length ? matches.map((member) => <MemberCard key={member.id} member={member} isCurrentChat={member.id === currentMember?.id} onMessage={(selected) => notify(`Reminder prepared for ${selected.name}`)} />) : <div className="empty-state"><div className="empty-icon"><Icon name="search" /></div><h3>No members found</h3><p>Try a different name or clear your search.</p><button onClick={() => setSearch('')}>Clear search</button></div>}</section>
      </main><footer className="panel-footer"><span className="local-dot" />Local prototype — no messages are sent</footer>
    </aside>{toast && <div className="toast" role="status"><span className="toast-check">✓</span>{toast}</div>}
  </div>
}
