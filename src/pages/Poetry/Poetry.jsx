import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import WordSphere from '../../components/WordSphere/WordSphere'
import PoemGenerator from '../../components/PoemGenerator/PoemGenerator'

const Poetry = () => {
  const location = useLocation()
  const [selectedWord, setSelectedWord] = useState(null)
  const language = localStorage.getItem('selectedLanguage') || 'en'
  const wordFromState = location.state?.word

  useEffect(() => {
    const video = document.getElementById('poetry-bg-video')
    if (video) video.playbackRate = 0.8
  }, [])

  return (
    <div className="poetry-page" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="poetry-bg-video"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        src="/feature2_bg.mp4"
        id="poetry-bg-video"
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <WordSphere onWordSelect={setSelectedWord} word={wordFromState} selectedWord={selectedWord} />
        <PoemGenerator word={selectedWord} language={language} />
      </div>
    </div>
  )
}

export default Poetry