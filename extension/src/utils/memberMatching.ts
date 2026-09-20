import { type PendingMember } from '../data/members'

export function normalizeMemberName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export function findMemberByChatName(chatName: string | null, members: PendingMember[]): PendingMember | null {
  if (!chatName) return null
  const normalizedChatName = normalizeMemberName(chatName)
  return members.find((member) => normalizeMemberName(member.name) === normalizedChatName) ?? null
}
