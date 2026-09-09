import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JoinList from '../components/JoinList'

const T = {
  navy: '#0A1628', gold: '#D4A853', cream: '#FDF8F0',
  white: '#FFFFFF', grey400: '#8A8A8A', grey600: '#4A4A4A',
  grey800: '#1E1E1E',
}

export default function Home() {
  const [playerNames, setPlayerNames] = useState(['', ''])
  const [step, setStep] = useState('landing') // landing | names | count
  const navigate = useNavigate()

  const addPlayer = () => {
    if (playerNames.length < 8) setPlayerNames([...playerNames, ''])
  }
  const removePlayer = (i) => {
    if (playerNames.length > 2) setPlayerNames(playerNames.filter((_, idx) => idx !== i))
  }
  const updateName = (i, val) => {
    const next = [...playerNames]
    next[i] = val
    setPlayerNames(next)
  }

  const startGame = () => {
    const players = playerNames
      .map((n, i) => ({ name: n.trim() || `Player ${i + 1}`, tokens_left: 3 }))
      .filter(p => p.name)
    navigate('/play', { state: { players } })
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.cream,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, fontWeight: 400, color: T.navy, margin: 0, letterSpacing: 2 }}>
          HushSide
        </h1>
        <p style={{ fontSize: 16, color: T.grey600, marginTop: 8, fontStyle: 'italic' }}>
          The card game that goes where small talk cannot
        </p>
      </div>

      {/* How it works */}
      {step === 'landing' && (
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <div style={{ fontSize: 18, color: T.grey800, lineHeight: 1.7, marginBottom: 32 }}>
            Three levels of questions. <b>Witness cards</b> that speak from an unexpected point of view.
            A deck designed for conversations that actually mean something.
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            {[
              { lvl: 'Level 1', label: 'Warm-up', desc: 'Easy, curious, safe' },
              { lvl: 'Level 2', label: 'Go deeper', desc: 'Personal, reflective' },
              { lvl: 'Level 3', label: 'Truth', desc: 'Honest, vulnerable' },
            ].map(l => (
              <div key={l.lvl} style={{
                background: T.white, borderRadius: 16, padding: '20px 24px',
                width: 150, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {l.lvl}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginTop: 6 }}>{l.label}</div>
                <div style={{ fontSize: 13, color: T.grey400, marginTop: 4 }}>{l.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('names')}
            style={{
              padding: '16px 48px', fontSize: 18, fontWeight: 700,
              background: T.navy, color: T.white, border: 'none',
              borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: 1
            }}>
            Play Now — Free
          </button>
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => navigate('/deck')}
              style={{
                padding: '12px 32px', fontSize: 14, fontWeight: 600,
                background: 'transparent', color: T.navy, border: `2px solid ${T.navy}`,
                borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit'
              }}>
              Browse the Deck
            </button>
          </div>
          {/* Pricing */}
          <div style={{ width: '100%', textAlign: 'center', marginTop: 64 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
              Pricing
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 400, color: T.navy, margin: '0 0 28px' }}>
              Free to play. Yours to keep.
            </h2>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch' }}>
              {/* Free tier */}
              <div style={{
                background: T.white, borderRadius: 16, padding: '26px 24px', width: 260,
                textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1 }}>Free</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.navy, margin: '6px 0 2px' }}>Play in your browser</div>
                <div style={{ fontSize: 13, color: T.grey400, marginBottom: 14 }}>Forever, with anyone, anywhere</div>
                <ul style={{ fontSize: 14, color: T.grey800, lineHeight: 1.9, paddingLeft: 18, margin: '0 0 18px' }}>
                  <li>All three levels — warm-up, deeper, truth</li>
                  <li>36 question cards + 40 witness cards</li>
                  <li>2 to 8 players, no app to install</li>
                </ul>
                <button onClick={() => setStep('names')}
                  style={{
                    marginTop: 'auto', padding: '13px 20px', fontSize: 15, fontWeight: 700,
                    background: T.cream, color: T.navy, border: `1.5px solid ${T.grey200}`,
                    borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit'
                  }}>
                  Start Playing
                </button>
              </div>
              {/* Deck tier */}
              <div style={{
                background: T.white, borderRadius: 16, padding: '26px 24px', width: 260,
                textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column',
                borderTop: `3px solid ${T.gold}`
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1 }}>The Complete Deck</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.navy, margin: '6px 0 2px' }}>
                  S$18 <span style={{ fontSize: 13, fontWeight: 400, color: T.grey600 }}>one-time</span>
                </div>
                <div style={{ fontSize: 13, color: T.grey400, marginBottom: 14 }}>The whole game, yours to keep</div>
                <ul style={{ fontSize: 14, color: T.grey800, lineHeight: 1.9, paddingLeft: 18, margin: '0 0 18px' }}>
                  <li>All 76 cards as a print-ready PDF</li>
                  <li>Beautiful at-home printing, A4</li>
                  <li>Every future HushSide card pack, free</li>
                </ul>
                <a href="https://pay.airwallex.com/sghm48m0l2ss" target="_blank" rel="noopener noreferrer"
                  style={{
                    marginTop: 'auto', padding: '13px 20px', fontSize: 15, fontWeight: 700,
                    background: T.navy, color: T.white, border: 'none', textDecoration: 'none',
                    borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', display: 'block'
                  }}>
                  Get the Deck
                </a>
              </div>
            </div>
            <p style={{ fontSize: 12, color: T.grey400, marginTop: 18, fontStyle: 'italic' }}>
              Every deck sold keeps HushSide free for everyone.
            </p>
          </div>
          <div style={{ marginTop: 56 }}>
            <JoinList variant="home" />
          </div>
        </div>
      )}

      {/* Player names */}
      {step === 'names' && (
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, color: T.navy, marginBottom: 24 }}>
            Who's playing?
          </h2>
          {playerNames.map((name, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                value={name}
                onChange={e => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                autoFocus={i === 0}
                style={{
                  flex: 1, padding: '14px 18px', fontSize: 16,
                  borderRadius: 12, border: `1.5px solid ${T.grey400}33`,
                  background: T.white, fontFamily: 'inherit', outline: 'none'
                }}
              />
              {playerNames.length > 2 && (
                <button onClick={() => removePlayer(i)}
                  style={{
                    width: 44, borderRadius: 12, border: 'none',
                    background: '#f5f5f5', fontSize: 18, cursor: 'pointer'
                  }}>−</button>
              )}
            </div>
          ))}
          {playerNames.length < 8 && (
            <button onClick={addPlayer}
              style={{
                padding: '10px 24px', fontSize: 14, marginTop: 8,
                background: 'transparent', color: T.grey600, border: `1.5px dashed ${T.grey400}`,
                borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit'
              }}>+ Add player</button>
          )}
          <div style={{ marginTop: 32 }}>
            <button onClick={startGame}
              style={{
                padding: '16px 48px', fontSize: 18, fontWeight: 700,
                background: T.navy, color: T.white, border: 'none',
                borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit'
              }}>
              Deal the Cards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
