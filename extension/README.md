# ChitLedger Collection Assistant

Manifest V3 Chrome extension prototype for WhatsApp Web. It is local-only: there is no backend, API, authentication, payment, AI, or WhatsApp-message automation.

## Build and load

From this `extension` folder run:

```bash
npm install
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the generated `dist` folder. Open or refresh `https://web.whatsapp.com/`, then use the floating **ChitLedger** button.

## Prototype behavior

- Displays the requested local summary and four dummy members.
- Search filters local names and displays an empty state.
- Detects only the currently open WhatsApp conversation title, using a lightweight, debounced `MutationObserver` on the WhatsApp UI. It does not inspect message contents or the WhatsApp composer.
- Matches the active chat name exactly against the local dummy members and updates without a WhatsApp page refresh. Unknown chats show a safe no-match state.
- A matched member is highlighted in the list and appears in the **Current member** card with due date, status, and priority.
- **Generate reminder** creates a local, status/priority-based reminder preview. **Copy message** copies that local text to the clipboard only.
- **Message** and **Send reminders** only show local confirmation toasts; no WhatsApp actions occur.
- The assistant is mounted in a Shadow DOM to keep its scoped styles separate from WhatsApp Web.

## V2 test flow

1. Reload the extension in `chrome://extensions`, then refresh WhatsApp Web.
2. Open the assistant and select a chat named **Rahul Sharma**, **Amit Malhotra**, **Sunita Rao**, or **Vikram Patel**. Confirm the Current member card and the highlighted list card update.
3. Switch directly between those chats. The Current member card should update without refreshing WhatsApp.
4. Open any non-member chat. Confirm that the panel shows **No ChitLedger member matched** rather than another member's data.
5. For a recognized chat, use **Generate reminder**, then **Copy message**. Confirm the message is copied; it is never inserted into or sent through WhatsApp.

For local iteration, use `npm run dev`, reload the extension in Chrome, and refresh WhatsApp Web.
