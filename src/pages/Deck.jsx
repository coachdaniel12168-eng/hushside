import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCards, fetchWitnessCards } from '../lib/supabase'
import JoinList from '../components/JoinList'

const T = {
  navy: '#0A1628', gold: '#D4A853', cream: '#FDF8F0',
  white: '#FFFFFF', grey200: '#E5E0D8', grey400: '#8A8A8A',
  grey600: '#4A4A4A', grey800: '#1E1E1E',
}

const LEVEL_LABELS = { 1: 'Warm-up', 2: 'Go Deeper', 3: 'Truth' }
const DEPTH_LABELS = { 1: 'Surface', 2: 'Personal', 3: 'Deep', 4: 'Core' }

export default function Deck() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [witnesses, setWitnesses] = useState([])
  const [tab, setTab] = useState('cards')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    Promise.all([fetchCards(), fetchWitnessCards()])
      .then(([cs, ws]) => { setCards(cs); setWitnesses(ws) })
      .catch((e) => setLoadError(e.message || 'Could not load the deck.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredCards = filter === 'all' ? cards : cards.filter(c => c.level === parseInt(filter))
  const filteredWitnesses = filter === 'all' ? witnesses : witnesses.filter(w => w.depth === parseInt(filter))

  return (
    <div style={{
      minHeight: '100vh', background: T.cream,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: T.grey600 }}>←</button>
          <h1 style={{ fontSize: 24, fontWeight: 400, color: T.navy, margin: 0 }}>The Deck</h1>
          <div style={{ width: 24 }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: T.grey200, borderRadius: 20, padding: 4 }}>
          {['cards', 'witnesses'].map(t => (
            <button key={t}
              onClick={() => { setTab(t); setFilter('all') }}
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 18, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                background: tab === t ? T.white : 'transparent',
                color: tab === t ? T.navy : T.grey600,
              }}>
              {t === 'cards' ? 'Question Cards' : 'Witness Cards'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[['all', 'All']].concat(
            tab === 'cards'
              ? [[1, 'Level 1'], [2, 'Level 2'], [3, 'Level 3']]
              : [[1, 'Depth 1'], [2, 'Depth 2'], [3, 'Depth 3'], [4, 'Depth 4']]
          ).map(([val, label]) => (
            <button key={val}
              onClick={() => setFilter(String(val))}
              style={{
                padding: '6px 16px', borderRadius: 20, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                background: filter === String(val) ? T.navy : T.white,
                color: filter === String(val) ? T.white : T.grey600,
              }}>
              {label}
            </button>
          ))}
        </div>

        {loading && <p style={{ textAlign: 'center', color: T.grey400 }}>Loading…</p>}

        {!loading && loadError && (
          <div style={{
            background: T.white, borderRadius: 16, padding: '28px 24px', marginBottom: 12,
            textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: 20, color: T.navy, marginBottom: 8 }}>🤫 Deck loading soon</div>
            <div style={{ fontSize: 14, color: T.grey600, lineHeight: 1.6 }}>
              The HushSide deck is still being shuffled — check back in a day or two.
            </div>
          </div>
        )}

        {/* Cards */}
        {tab === 'cards' && filteredCards.map(c => (
          <div key={c.id} style={{
            background: T.white, borderRadius: 16, padding: '20px 24px',
            marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Card {c.card_no} · {LEVEL_LABELS[c.level]}
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.6, color: T.grey800 }}>{c.text}</div>
          </div>
        ))}

        {/* Witnesses */}
        {tab === 'witnesses' && filteredWitnesses.map(w => (
          <div key={w.id} style={{
            background: T.white, borderRadius: 16, padding: '20px 24px',
            marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            borderLeft: `3px solid ${T.gold}`
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              {w.witness_name} · {DEPTH_LABELS[w.depth]}
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: T.grey800, fontStyle: 'italic' }}>
              "{w.script_text}"
            </div>
          </div>
        ))}

        <div style={{ marginTop: 40 }}>
          <JoinList variant="deck" />
        </div>
      </div>
    </div>
  )
}
