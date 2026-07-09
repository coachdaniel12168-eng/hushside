import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchCards, fetchWitnessCards, createSession } from '../lib/supabase'

const T = {
  navy: '#0A1628', gold: '#D4A853', cream: '#FDF8F0',
  white: '#FFFFFF', grey200: '#E5E0D8', grey400: '#8A8A8A',
  grey600: '#4A4A4A', grey800: '#1E1E1E',
}

const LEVEL_LABELS = { 1: 'Warm-up', 2: 'Go Deeper', 3: 'Truth' }
const LEVEL_COLORS = { 1: '#6B9080', 2: '#A4A062', 3: '#8B5E3C' }

export default function Play() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialPlayers = location.state?.players || [{ name: 'You', tokens_left: 3 }, { name: 'Friend', tokens_left: 3 }]

  const [players, setPlayers] = useState(initialPlayers)
  const [cards, setCards] = useState([])
  const [witnesses, setWitnesses] = useState([])
  const [currentCard, setCurrentCard] = useState(null)
  const [currentWitness, setCurrentWitness] = useState(null)
  const [level, setLevel] = useState(1)
  const [phase, setPhase] = useState('card') // card | answer | witness
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seenCards, setSeenCards] = useState([])
  const [seenWitnesses, setSeenWitnesses] = useState([])
  const [answerRevealed, setAnswerRevealed] = useState(false)

  useEffect(() => {
    loadCards()
    createSession(players).catch(() => {}) // fire-and-forget
  }, [])

  const loadCards = async () => {
    try {
      const [cs, ws] = await Promise.all([fetchCards(), fetchWitnessCards()])
      setCards(cs)
      setWitnesses(ws)
      dealCard(cs, 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const dealCard = useCallback((cardPool, lvl) => {
    const pool = cardPool.filter(c => c.level === lvl && !seenCards.includes(c.id))
    if (pool.length === 0) {
      // Level complete — move up
      if (lvl < 3) {
        setLevel(lvl + 1)
        const nextPool = cardPool.filter(c => c.level === lvl + 1 && !seenCards.includes(c.id))
        if (nextPool.length > 0) {
          const card = nextPool[Math.floor(Math.random() * nextPool.length)]
          setCurrentCard(card)
          setCurrentWitness(null)
          setPhase('card')
          setAnswerRevealed(false)
          return
        }
      }
      // All done
      setCurrentCard(null)
      setCurrentWitness(null)
      return
    }
    const card = pool[Math.floor(Math.random() * pool.length)]
    setCurrentCard(card)
    setCurrentWitness(null)
    setPhase('card')
    setAnswerRevealed(false)
  }, [seenCards])

  const revealAnswer = () => setAnswerRevealed(true)

  const drawWitness = () => {
    // Pick a witness matching current card's level (or any if none match)
    const matchDepth = currentCard.level
    const pool = witnesses.filter(w => w.depth === matchDepth && !seenWitnesses.includes(w.id))
    const fallback = witnesses.filter(w => !seenWitnesses.includes(w.id))
    const use = pool.length > 0 ? pool : fallback
    if (use.length === 0) {
      advanceCard()
      return
    }
    const w = use[Math.floor(Math.random() * use.length)]
    setCurrentWitness(w)
    setSeenWitnesses([...seenWitnesses, w.id])
    setPhase('witness')
  }

  const advanceCard = () => {
    if (currentCard) setSeenCards([...seenCards, currentCard.id])
    dealCard(cards, level)
  }

  const passToNext = () => {
    // Rotate players for next turn
    setPlayers([...players.slice(1), players[0]])
    advanceCard()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: T.cream, fontFamily: "'Georgia', serif" }}>
        <p style={{ fontSize: 20, color: T.grey600 }}>Shuffling the deck…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: T.cream, fontFamily: "'Georgia', serif", flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 18, color: '#C0392B' }}>Could not load cards: {error}</p>
        <button onClick={() => navigate('/')} style={{ padding: '12px 32px', borderRadius: 40, border: 'none', background: T.navy, color: T.white, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>Back to Home</button>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: T.cream, fontFamily: "'Georgia', serif", flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 24, color: T.navy }}>That's the deck.</p>
        <p style={{ fontSize: 16, color: T.grey600 }}>All cards played. Hope the conversation was worth it.</p>
        <button onClick={() => navigate('/')} style={{ padding: '12px 32px', borderRadius: 40, border: 'none', background: T.navy, color: T.white, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>Play Again</button>
      </div>
    )
  }

  const activePlayer = players[0]

  return (
    <div style={{
      minHeight: '100vh', background: T.cream,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: 'flex', flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: T.grey600 }}>←</button>
        <div style={{
          padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
          background: LEVEL_COLORS[level] + '18', color: LEVEL_COLORS[level]
        }}>
          {LEVEL_LABELS[level]}
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* Player turn indicator */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: T.grey400 }}>
          {activePlayer.name}'s turn
        </span>
      </div>

      {/* Main card */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        maxWidth: 500, margin: '0 auto', width: '100%',
      }}>
        {phase === 'card' && (
          <div style={{
            width: '100%', background: T.white, borderRadius: 24,
            padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
            minHeight: 280, display: 'flex', flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              Card {currentCard.card_no} · Level {currentCard.level}
            </div>
            <div style={{ fontSize: 24, lineHeight: 1.5, color: T.navy, fontWeight: 400 }}>
              {currentCard.text}
            </div>
          </div>
        )}

        {phase === 'answer' && (
          <div style={{
            width: '100%', background: T.white, borderRadius: 24,
            padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
            minHeight: 280, display: 'flex', flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              Your Answer
            </div>
            <div style={{ fontSize: 20, lineHeight: 1.5, color: T.grey600, fontStyle: 'italic' }}>
              {answerRevealed
                ? `Take your time. ${activePlayer.name}, share your answer.`
                : `${activePlayer.name}, whenever you're ready — tap to reveal the question again.`
              }
            </div>
            {!answerRevealed && (
              <button
                onClick={revealAnswer}
                style={{
                  marginTop: 24, padding: '10px 28px', fontSize: 14,
                  background: T.grey200, border: 'none', borderRadius: 40,
                  cursor: 'pointer', fontFamily: 'inherit', color: T.grey800
                }}>
                See the question
              </button>
            )}
          </div>
        )}

        {phase === 'witness' && currentWitness && (
          <div style={{
            width: '100%', background: T.white, borderRadius: 24,
            padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
            border: `2px solid ${T.gold}40`,
            minHeight: 280, display: 'flex', flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              Witness Card
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 16 }}>
              {currentWitness.witness_name}
            </div>
            <div style={{ fontSize: 20, lineHeight: 1.6, color: T.grey800, fontStyle: 'italic' }}>
              "{currentWitness.script_text}"
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{
        maxWidth: 500, margin: '0 auto', width: '100%',
        display: 'flex', gap: 12, paddingTop: 24
      }}>
        {phase === 'card' && (
          <>
            <button onClick={() => { setPhase('answer'); setAnswerRevealed(false) }}
              style={{
                flex: 1, padding: '16px 24px', fontSize: 16, fontWeight: 600,
                background: T.navy, color: T.white, border: 'none',
                borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit'
              }}>
              Answer
            </button>
            <button onClick={drawWitness}
              style={{
                flex: 1, padding: '16px 24px', fontSize: 16, fontWeight: 600,
                background: T.gold, color: T.white, border: 'none',
                borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit'
              }}>
              Draw Witness
            </button>
          </>
        )}

        {(phase === 'answer' || phase === 'witness') && (
          <button onClick={passToNext}
            style={{
              flex: 1, padding: '16px 24px', fontSize: 16, fontWeight: 600,
              background: T.navy, color: T.white, border: 'none',
              borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit'
            }}>
            Next Card →
          </button>
        )}
      </div>

      {/* Player list */}
      <div style={{
        maxWidth: 500, margin: '16px auto 0', width: '100%',
        display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap'
      }}>
        {players.map((p, i) => (
          <div key={i} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12,
            background: i === 0 ? T.navy : T.grey200,
            color: i === 0 ? T.white : T.grey600,
            fontWeight: i === 0 ? 700 : 400,
          }}>
            {p.name}
          </div>
        ))}
      </div>
    </div>
  )
}
