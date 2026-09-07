import { useEffect, useState } from 'react'

const T = {
  navy: '#0A1628', gold: '#D4A853', cream: '#FDF8F0',
  white: '#FFFFFF', grey400: '#8A8A8A', grey600: '#4A4A4A', grey800: '#1E1E1E',
}

const LABELS = {
  home: {
    heading: 'Keep the conversation going',
    blurb: 'New question packs, seasonal decks and the printable HushSide set — first to know, straight to your inbox.',
    cta: 'Join the circle',
  },
  deck: {
    heading: 'The full deck, in your inbox',
    blurb: 'The complete printable deck and new witness packs, the moment they drop.',
    cta: 'Email me the deck',
  },
}

// Player email capture — posts to the same-origin /api/capture function,
// which delivers each signup to Daniel's private Telegram channel.
// No-JS browsers fall back to a plain form POST (action=/api/capture) and
// bounce back to ?joined=1 / ?hs-error=1.
export default function JoinList({ variant = 'home' }) {
  const v = LABELS[variant] || LABELS.home
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('') // honeypot — hidden from humans, tempting to bots
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.has('joined')) setState('done')
    else if (q.has('hs-error')) { setState('error'); setErrorMsg('That did not go through — please try again.') }
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending'); setErrorMsg('')
    try {
      const r = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), _hp: hp }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j.ok) { setState('done'); setEmail('') }
      else { setState('error'); setErrorMsg((j && j.error) || 'Something went wrong — please try again.') }
    } catch {
      setState('error'); setErrorMsg('Could not reach the server — please try again.')
    }
  }

  if (state === 'done') {
    return (
      <div style={{
        background: T.white, borderRadius: 16, padding: '26px 28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', maxWidth: 480,
        margin: '0 auto', textAlign: 'center'
      }}>
        <div style={{ fontSize: 22, color: T.navy, marginBottom: 6 }}>You're in! 🤫</div>
        <div style={{ fontSize: 14, color: T.grey600, lineHeight: 1.6 }}>
          Welcome to the HushSide circle. Keep an eye on your inbox — the good stuff is on its way.
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      action="/api/capture"
      method="POST"
      style={{
        background: T.white, borderRadius: 16, padding: '26px 28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', maxWidth: 480,
        margin: '0 auto', textAlign: 'center'
      }}
    >
      <div style={{ fontSize: 20, color: T.navy, marginBottom: 6 }}>{v.heading}</div>
      <div style={{ fontSize: 14, color: T.grey600, lineHeight: 1.6, marginBottom: 18 }}>{v.blurb}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          type="email" name="email" value={email} required maxLength={254}
          autoComplete="email" onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" aria-label="Email address"
          style={{
            flex: 1, minWidth: 190, maxWidth: 280, padding: '12px 16px', fontSize: 15,
            borderRadius: 12, border: '1.5px solid rgba(138,138,138,0.35)',
            background: T.cream, fontFamily: 'inherit', outline: 'none'
          }}
        />
        <button
          type="submit" disabled={state === 'sending'}
          style={{
            padding: '12px 24px', fontSize: 14, fontWeight: 700,
            background: T.navy, color: T.white, border: 'none',
            borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
          }}
        >
          {state === 'sending' ? 'Sending…' : v.cta}
        </button>
      </div>
      {/* Honeypot field — off-screen, invisible to humans */}
      <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="hs_website">Website</label>
        <input id="hs_website" name="_hp" type="text" value={hp}
          onChange={e => setHp(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>
      {state === 'error' && (
        <div style={{ fontSize: 13, color: '#B33A3A', marginTop: 12 }}>{errorMsg}</div>
      )}
      <div style={{ fontSize: 12, color: T.grey400, marginTop: 14, fontStyle: 'italic' }}>
        Email only. No spam — ever. Unsubscribe any time.
      </div>
    </form>
  )
}
