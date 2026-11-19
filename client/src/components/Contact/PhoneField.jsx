import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js'
import examples from 'libphonenumber-js/mobile/examples'
import * as Flags from 'country-flag-icons/react/3x2'
import './PhoneField.css'

// Loaded lazily from Contact.jsx (React.lazy): the phone metadata and ~250 flag
// SVGs only download when a visitor reaches the phone step.

/** Shown first: where most MAO leads come from. */
const FREQUENT = ['PE', 'MX', 'CO', 'CL', 'AR', 'EC', 'BO', 'ES', 'US']
const MAX_DIGITS = 15

const regionName = new Intl.DisplayNames(['es'], { type: 'region' })
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const COUNTRIES = getCountries()
  .map((code) => ({
    code,
    name: regionName.of(code) || code,
    dial: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))
const BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]))

/** Visitor's country from the browser language (es-MX → MX), else Peru. */
export const guessCountry = () => {
  const langs = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []
  for (const lang of langs) {
    const region = (lang || '').split('-')[1]?.toUpperCase()
    if (region && BY_CODE[region]) return region
  }
  return 'PE'
}

/** Everything Contact needs to validate and submit, derived from the field state. */
export const describePhone = (country, national) => {
  const parsed = national ? parsePhoneNumberFromString(national, country) : undefined
  return {
    country,
    countryName: BY_CODE[country]?.name || country,
    e164: parsed?.number || '',
    valid: Boolean(parsed?.isValid()),
  }
}

function Flag({ code }) {
  const Svg = Flags[code]
  return Svg
    ? <Svg className="phone__flag" aria-hidden="true" focusable="false" />
    : <span className="phone__flag phone__flag--blank" aria-hidden="true" />
}

/**
 * Country picker + national number input. Controlled through `country` and
 * `national` (digits only); reports changes with onChange({ country, national }).
 */
export default function PhoneField({ country, national, onChange, invalid, describedBy, inputId }) {
  const [open,   setOpen]   = useState(false)
  const [query,  setQuery]  = useState('')
  const [active, setActive] = useState(0)

  const rootRef    = useRef(null)
  const triggerRef = useRef(null)
  const searchRef  = useRef(null)
  const listRef    = useRef(null)
  const inputRef   = useRef(null)
  const listId     = useId()

  const current = BY_CODE[country] || BY_CODE.PE

  const options = useMemo(() => {
    const q = fold(query.trim()).replace(/^\+/, '')
    if (!q) {
      const frequent = FREQUENT.map((c) => BY_CODE[c]).filter(Boolean)
      return [
        { group: 'Frecuentes' }, ...frequent,
        { group: 'Todos los países' }, ...COUNTRIES,
      ]
    }
    return COUNTRIES.filter((c) =>
      fold(c.name).includes(q) || c.code.toLowerCase() === q || c.dial.startsWith(q))
  }, [query])

  const selectable = options.filter((o) => !o.group)

  // Close on outside press; keeps the dropdown from lingering over the card.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    setActive(Math.max(0, selectable.findIndex((o) => o.code === country)))
    // Phones pop the keyboard on focus; only autofocus search where there's a mouse.
    if (window.matchMedia('(hover: hover)').matches) searchRef.current?.focus()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setActive(0) }, [query])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const choose = (code) => {
    onChange({ country: code, national })
    setOpen(false)
    setQuery('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const onListKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, selectable.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (selectable[active]) choose(selectable[active].code) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); triggerRef.current?.focus() }
    else if (e.key === 'Tab') setOpen(false)
  }

  const onInput = (e) => {
    const raw = e.target.value
    // A pasted "+52 55…" picks the country by itself.
    if (raw.trim().startsWith('+')) {
      const parsed = parsePhoneNumberFromString(raw)
      if (parsed?.country) {
        onChange({ country: parsed.country, national: parsed.nationalNumber.slice(0, MAX_DIGITS) })
        return
      }
    }
    onChange({ country, national: raw.replace(/\D/g, '').slice(0, MAX_DIGITS) })
  }

  const display = national ? new AsYouType(country).input(national) : ''
  const placeholder = getExampleNumber(country, examples)?.formatNational() || ''

  let optionIndex = -1

  return (
    <div className={`phone${invalid ? ' has-error' : ''}${open ? ' is-open' : ''}`} ref={rootRef}>
      <div className="phone__field">
        <button
          type="button"
          ref={triggerRef}
          className="phone__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={`País: ${current.name} (+${current.dial}). Cambiar país`}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true) } }}
        >
          <Flag code={current.code} />
          <span className="phone__dial">+{current.dial}</span>
          <svg className="phone__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <input
          id={inputId}
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={display}
          onChange={onInput}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      </div>

      {open && (
        <div className="phone__menu" onKeyDown={onListKey}>
          <div className="phone__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar país o código"
              aria-label="Buscar país o código"
              aria-controls={listId}
              aria-activedescendant={selectable[active] ? `${listId}-${selectable[active].code}` : undefined}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <ul className="phone__list" id={listId} role="listbox" aria-label="Países" ref={listRef}>
            {options.map((o) => {
              if (o.group) return <li key={`g-${o.group}`} className="phone__group" role="presentation">{o.group}</li>
              optionIndex += 1
              const idx = optionIndex
              const isActive = idx === active
              return (
                <li
                  key={`${o.code}-${idx}`}
                  id={isActive ? `${listId}-${o.code}` : undefined}
                  role="option"
                  aria-selected={o.code === country}
                  data-active={isActive}
                  className="phone__option"
                  onPointerMove={() => setActive(idx)}
                  onClick={() => choose(o.code)}
                >
                  <Flag code={o.code} />
                  <span className="phone__name">{o.name}</span>
                  <span className="phone__code">+{o.dial}</span>
                  {o.code === country && (
                    <svg className="phone__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </li>
              )
            })}
            {selectable.length === 0 && <li className="phone__empty" role="presentation">Sin resultados para “{query}”</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
