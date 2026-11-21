/**
 * Site analytics.
 *
 * - Vercel Web Analytics: cookieless, counts every visit, always on in
 *   production. Served from this same origin (/_vercel/insights), so it needs
 *   no CSP exception; it only reports once enabled in the Vercel dashboard.
 * - Google Analytics 4: for future Google Ads attribution and audiences. It
 *   sets cookies, so it loads ONLY after the visitor accepts in the cookie
 *   banner, and only when VITE_GA_MEASUREMENT_ID is configured.
 *
 * No npm dependencies: both are loaded as plain scripts.
 */

export const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''
const CONSENT_KEY = 'mao-consent'   // 'granted' | 'denied'

const isBrowser = typeof window !== 'undefined'

const addScript = (src, attrs = {}) => {
  const s = document.createElement('script')
  s.src = src
  s.defer = true
  Object.assign(s, attrs)
  document.head.appendChild(s)
}

export function initVercelAnalytics() {
  if (!isBrowser || !import.meta.env.PROD || window.va) return
  // Queue calls made before the script loads (same stub @vercel/analytics uses).
  window.va = function va(...args) { (window.vaq = window.vaq || []).push(args) }
  addScript('/_vercel/insights/script.js')
}

let gaLoaded = false
function loadGA() {
  if (!GA_ID || gaLoaded) return
  gaLoaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`, { async: true })
}

export function getConsent() {
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

export function setConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value) } catch { /* private mode: ask again next visit */ }
  if (value === 'granted') loadGA()
}

/** Loads GA on later visits for people who already accepted. */
export function initConsentedAnalytics() {
  if (isBrowser && getConsent() === 'granted') loadGA()
}

/**
 * The conversion that matters: a contact submitted. `generate_lead` is GA4's
 * recommended event name, which Google Ads can import as a conversion.
 */
export function trackLead(params = {}) {
  if (!isBrowser) return
  window.va?.('event', { name: 'envio_formulario', data: params })
  window.gtag?.('event', 'generate_lead', params)
}
