import { type PendingMember } from '../data/members'
import { inr } from '../utils/currency'

interface MemberCardProps { member: PendingMember; isCurrentChat: boolean; onMessage: (member: PendingMember) => void }

export function MemberCard({ member, isCurrentChat, onMessage }: MemberCardProps) {
  const initials = member.name.split(' ').map((part) => part[0]).join('')
  return <article className={`member-card ${isCurrentChat ? 'current-member-card' : ''}`}>
    <div className="member-main"><div className="avatar">{initials}</div><div className="member-info"><h3>{member.name}</h3><p>Due {member.dueDate}</p></div><strong>{inr.format(member.amount)}</strong></div>
    <div className="member-footer"><span className={`status ${member.status === 'Overdue' ? 'overdue' : 'soon'}`}>{member.status}</span>{isCurrentChat && <span className="current-tag">Current chat</span>}<button className="message-button" onClick={() => onMessage(member)}>Message</button></div>
  </article>
}
