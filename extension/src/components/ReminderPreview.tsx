import { type PendingMember } from '../data/members'

function buildReminder(member: PendingMember): string {
  const timing = member.status === 'Overdue' ? 'is currently overdue' : 'is due soon'
  const urgency = member.priority === 'High' ? 'Please complete the payment at your earliest convenience.' : 'Please plan your payment before the due date.'
  return `Hi ${member.name.split(' ')[0]}, your ₹${member.amount.toLocaleString('en-IN')} Cycle 8 contribution ${timing}. ${urgency} If you've already made the payment, please ignore this message.`
}

export function ReminderPreview({ member, onCopy }: { member: PendingMember; onCopy: (message: string) => void }) {
  const message = buildReminder(member)
  return <section className="reminder-preview"><div><span className="eyebrow">Generated reminder</span><h3>{member.name}</h3></div><p>“{message}”</p><button className="copy-button" onClick={() => onCopy(message)}>Copy message</button></section>
}
