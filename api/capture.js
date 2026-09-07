// HushSide player-list endpoint — Vercel serverless function (same-origin).
// Each signup is delivered to Daniel's private Telegram ops channel via the
// MyAI bot. Secrets live ONLY in Vercel env (TELEGRAM_BOT_TOKEN,
// TELEGRAM_HOME_CHANNEL) — never in client code.
// Collects an email address only. Nothing else. No PII stored anywhere.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' })
    return
  }

  const ctype = String(req.headers['content-type'] || '')
  const isForm = ctype.includes('application/x-www-form-urlencoded')

  // Vercel parses JSON bodies into an object; urlencoded may arrive as an
  // object or a raw string depending on the runtime — handle both.
  let email = ''
  let hp = ''
  const raw = req.body
  if (raw && typeof raw === 'object') {
    email = String(raw.email || '').trim()
    hp = String(raw._hp || '').trim() // honeypot — bots fill it, humans never see it
  } else if (typeof raw === 'string') {
    const params = new URLSearchParams(raw)
    email = String(params.get('email') || '').trim()
    hp = String(params.get('_hp') || '').trim()
  }

  const redirectTarget = (flag) => {
    let base = '/'
    try {
      const u = new URL(req.headers.referer || 'https://hushside.com/')
      if (u.pathname && u.pathname !== '/') base = u.pathname
    } catch { /* keep root */ }
    return base + (flag === 'joined' ? '?joined=1' : '?hs-error=1')
  }
  const redirect = (flag) => {
    res.writeHead(302, { Location: redirectTarget(flag) })
    res.end()
  }

  // Honeypot filled => bot. Pretend success, drop silently.
  if (hp) {
    if (isForm) return redirect('joined')
    return res.status(200).json({ ok: true })
  }

  email = email.toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    if (isForm) return redirect('error')
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' })
  }

  const bot = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_HOME_CHANNEL
  if (!bot || !chat) {
    if (isForm) return redirect('error')
    return res.status(500).json({ ok: false, error: 'Server not configured yet.' })
  }

  let page = 'hushside.com'
  try {
    const u = new URL(req.headers.referer || '')
    if (u.pathname) page = 'hushside.com' + u.pathname
  } catch { /* keep default */ }

  const text = [
    '🤫 HushSide — new player signup',
    '👤 ' + email,
    '🕐 ' + new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    'Source: ' + page
  ].join('\n')

  try {
    const r = await fetch('https://api.telegram.org/bot' + bot + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text })
    })
    const j = await r.json().catch(() => ({}))
    if (j.ok === true) {
      if (isForm) return redirect('joined')
      return res.status(200).json({ ok: true })
    }
    if (isForm) return redirect('error')
    res.status(502).json({ ok: false, error: 'delivery failed' })
  } catch {
    if (isForm) return redirect('error')
    res.status(502).json({ ok: false, error: 'delivery failed' })
  }
}
