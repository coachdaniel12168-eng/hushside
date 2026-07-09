import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Play from './pages/Play'
import Deck from './pages/Deck'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/deck" element={<Deck />} />
      </Routes>
    </BrowserRouter>
  )
}
