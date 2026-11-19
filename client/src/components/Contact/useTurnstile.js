import { useCallback, useEffect, useRef } from 'react'

const SITE_KEY   = import.meta.env.VITE_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise
const loadScript = () => {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.onload = () => resolve(window.turnstile)
    s.onerror = () => {
      scriptPromise = undefined
      reject(new Error('turnstile script failed to load'))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Cloudflare Turnstile in "interaction-only" mode: invisible for almost every
 * visitor, it only shows a checkbox when Cloudflare is unsure — so it doesn't
 * add friction to a flow built to reduce drop-off.
 *
 * Pass `active` = true when the container is mounted. Without
 * VITE_TURNSTILE_SITE_KEY it's a no-op and getToken() resolves to null.
 */
export default function useTurnstile(containerRef, active) {
  const widgetId = useRef(null)
  const token    = useRef(null)
  const waiters  = useRef([])

  const settle = (value) => {
    token.current = value
    if (value) {
      waiters.current.forEach((fn) => fn(value))
      waiters.current = []
    }
  }

  useEffect(() => {
    if (!SITE_KEY || !active || !containerRef.current) return
    let cancelled = false

    loadScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return
        widgetId.current = turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          appearance: 'interaction-only',
          language: 'es',
          action: 'contact',
          callback: settle,
          'expired-callback': () => settle(null),
          'error-callback': () => settle(null),
        })
      })
      .catch((err) => console.warn('[turnstile]', err.message))

    return () => {
      cancelled = true
      if (widgetId.current !== null) window.turnstile?.remove(widgetId.current)
      widgetId.current = null
      token.current = null
    }
  }, [active, containerRef])

  /** Resolves with a token, waiting briefly if the challenge is still running. */
  const getToken = useCallback((timeoutMs = 8000) => {
    if (!SITE_KEY) return Promise.resolve(null)
    if (token.current) return Promise.resolve(token.current)
    return new Promise((resolve) => {
      const done = (value) => { clearTimeout(timer); resolve(value) }
      const timer = setTimeout(() => {
        waiters.current = waiters.current.filter((fn) => fn !== done)
        resolve(null)
      }, timeoutMs)
      waiters.current.push(done)
    })
  }, [])

  /** Tokens are single-use: get a fresh one after every submit attempt. */
  const reset = useCallback(() => {
    token.current = null
    if (widgetId.current !== null) window.turnstile?.reset(widgetId.current)
  }, [])

  return { enabled: Boolean(SITE_KEY), getToken, reset }
}
