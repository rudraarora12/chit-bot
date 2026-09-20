import { createRoot } from 'react-dom/client'
import App from './App'
import styles from './styles.css?inline'

const ROOT_ID = 'chitledger-collection-assistant-root'
function mountAssistant() {
  if (document.getElementById(ROOT_ID)) return
  const host = document.createElement('div')
  host.id = ROOT_ID
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = styles
  const app = document.createElement('div')
  shadow.append(style, app)
  document.body.appendChild(host)
  createRoot(app).render(<App />)
}
if (document.body) mountAssistant()
else window.addEventListener('DOMContentLoaded', mountAssistant, { once: true })
