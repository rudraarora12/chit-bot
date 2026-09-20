/**
 * Reads only the active conversation header. It deliberately never queries
 * WhatsApp message rows or the composer. Keep selector changes isolated here.
 */
const CHAT_TITLE_SELECTORS = [
  '#main header [data-testid="conversation-info-header-chat-title"] span[dir="auto"]',
  '#main header [data-testid="conversation-info-header-chat-title"]',
  '#main header [data-testid="conversation-header"] span[dir="auto"]',
  '#main header span[dir="auto"]',
]

function textOf(element: Element | null): string | null {
  const text = element?.textContent?.trim()
  return text || null
}

export function getActiveWhatsAppChatName(): string | null {
  for (const selector of CHAT_TITLE_SELECTORS) {
    const title = textOf(document.querySelector(selector))
    if (title) return title
  }
  return null
}

/** Subscribe to header changes with one debounced document observer. */
export function observeActiveWhatsAppChat(onChange: (chatName: string | null) => void): () => void {
  let previousName: string | null = null
  let timer: number | undefined

  const publishIfChanged = () => {
    timer = undefined
    const nextName = getActiveWhatsAppChatName()
    if (nextName !== previousName) {
      previousName = nextName
      onChange(nextName)
    }
  }
  const scheduleCheck = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(publishIfChanged, 80)
  }

  publishIfChanged()
  const observer = new MutationObserver(scheduleCheck)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })

  return () => {
    observer.disconnect()
    window.clearTimeout(timer)
  }
}
