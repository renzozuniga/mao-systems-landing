import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/tokens.css'
import './App.css'
import App from './App.jsx'
import { initConsentedAnalytics, initVercelAnalytics } from './lib/analytics'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production HTML arrives prerendered (scripts/prerender.mjs), so React takes
// over the existing markup; in dev the root is empty and renders from scratch.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)

initVercelAnalytics()
initConsentedAnalytics()
