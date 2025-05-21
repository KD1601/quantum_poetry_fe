const PoemGenerator = ({ word, language }) => {
  const generatePoem = (word, lang) => {
    // Đây là mock data, thực tế bạn có thể dùng API AI để generate thơ
    const poems = {
      en: {
        tree: `Tall and mighty,\nReaching for the sky,\nEternal guardian,\nEarth's living sigh.`,
        water: `Flowing endlessly,\nFrom mountain to the sea,\nLife's tender melody,\nPure and free.`
      },
      vi: {
        tree: `Cây xanh đứng giữa trời,\nLá rung rinh gió gọi mời,\nRễ sâu bám đất không rời,\nBốn mùa tỏa bóng cho đời nghỉ ngơi.`,
        water: `Nước chảy mãi không ngừng,\nTừ suối ra biển mênh mông,\nNuôi sống vạn vật trong lòng,\nHiền hòa mà cũng vô cùng mãnh liệt.`
      },
      ja: {
        tree: `木の下で (Ki no shita de)\n静かな時 (Shizuka na toki)\n春の風 (Haru no kaze)`,
        water: `水滴が (Suiteki ga)\n石を穿つ (Ishi o ugatsu)\n永遠に (Eien ni)`
      }
    }
    
    return poems[lang]?.[word.toLowerCase()] || `No poem found for "${word}" in ${lang}`
  }

  return (
    <div className="poem-container">
      <h3>Bài thơ về: {word}</h3>
      <pre>{generatePoem(word, language)}</pre>
    </div>
  )
}

export default PoemGenerator