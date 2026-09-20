import { type PendingMember } from '../data/members'
import { inr } from '../utils/currency'

export function CurrentMember({ member, chatName, onGenerate }: { member: PendingMember | null; chatName: string | null; onGenerate: () => void }) {
  if (!member) return <section className="current-context unknown-context"><span className="eyebrow">Current chat</span><h2>No ChitLedger member matched.</h2><p>{chatName ? 'Open a member\'s WhatsApp chat to view collection details.' : 'Select a WhatsApp chat to view collection details.'}</p></section>
  return <section className="current-context"><span className="eyebrow">Current member</span><div className="current-member-title"><div><h2>{member.name}</h2><p>{inr.format(member.amount)} pending</p></div><span className={`status ${member.status === 'Overdue' ? 'overdue' : 'soon'}`}>{member.status}</span></div><div className="current-details"><span>Due {member.dueDate}</span><span>Collection priority <strong className={member.priority === 'High' ? 'priority-high' : 'priority-low'}>{member.priority}</strong></span></div><button className="generate-button" onClick={onGenerate}>Generate reminder</button></section>
}
