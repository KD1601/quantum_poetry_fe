import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Poetry from './pages/Poetry/Poetry'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/feature" element={<Poetry />} />
    </Routes>
  )
}

export default App