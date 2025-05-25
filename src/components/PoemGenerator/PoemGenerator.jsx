import { useState, useEffect } from 'react';
import './PoemGenerator.css';

// Hàm tách từ tiếng Việt, Nhật, Anh đơn giản
function splitWords(line) {
  // Tách theo khoảng trắng, loại bỏ ký tự đặc biệt cuối từ
  return line.split(/\s+/).map(w => w.replace(/[.,!?;:()"'""'']+$/g, ''));
}

const generatePoem = (word, language) => {
  if (!word) return '';
  const poems = {
    en: [
      `Whispers of ${word}\nDancing in the moonlight\nNature's gentle song`,
      `${word} flows like time\nEndless and mysterious\nA story untold`,
    ],
    vi: [
      `${word} đẹp như mơ\nLung linh trong nắng sớm\nHương thơm ngào ngạt\nVương vấn lòng người`,
      `${word} trong gió\nLay động nhẹ nhàng\nNhư lời thì thầm\nCủa mùa xuân đến`,
    ],
    ja: [
      `${word}の香り\n春風に乗って\n心癒す`,
      `${word}の道\n静かに続く\n秋の色`,
    ],
  };
  const selectedPoems = poems[language] || poems.en;
  return selectedPoems[Math.floor(Math.random() * selectedPoems.length)];
};

const TypingPoem = ({ poem, isGenerating, onWordClick }) => {
  // poem: string, isGenerating: bool, onWordClick: func
  return (
    <div className="poem-content">
      {poem.split('\n').map((line, idx) => (
        <p key={idx} className={idx === 0 ? 'poem-line first' : 'poem-line'}>
          {splitWords(line).map((word, i) =>
            word ? (
              <span
                key={i}
                className="poem-word"
                onClick={() => onWordClick && onWordClick(word)}
                style={{ cursor: onWordClick ? 'pointer' : 'default', userSelect: 'text' }}
              >
                {word}
                {i < splitWords(line).length - 1 ? ' ' : ''}
              </span>
            ) : null
          )}
        </p>
      ))}
      {isGenerating && <span className="typing-cursor">|</span>}
    </div>
  );
};

const PoemGenerator = ({ word, language }) => {
  // poems: [{keyWord, fullPoem, displayedPoem, isGenerating}]
  const [poems, setPoems] = useState([]);

  // Khi đổi từ gốc, reset poems
  useEffect(() => {
    if (word) {
      const newPoem = generatePoem(word, language);
      setPoems([
        {
          keyWord: word,
          fullPoem: newPoem,
          displayedPoem: '',
          isGenerating: true,
        },
      ]);
    } else {
      setPoems([]);
    }
  }, [word, language]);

  // Hiệu ứng typing cho từng bài thơ
  useEffect(() => {
    poems.forEach((poemObj, idx) => {
      if (poemObj.isGenerating && poemObj.displayedPoem.length < poemObj.fullPoem.length) {
        const interval = setInterval(() => {
          setPoems(prev => {
            const updated = [...prev];
            if (updated[idx].displayedPoem.length < updated[idx].fullPoem.length) {
              updated[idx] = {
                ...updated[idx],
                displayedPoem: updated[idx].fullPoem.slice(0, updated[idx].displayedPoem.length + 1),
                isGenerating: updated[idx].displayedPoem.length + 1 < updated[idx].fullPoem.length,
              };
            } else {
              updated[idx].isGenerating = false;
            }
            return updated;
          });
        },130);
        return () => clearInterval(interval);
      }
    });
  }, [poems]);

  // Khi click vào từ trong bài thơ, thêm bài thơ mới bên dưới
  const handleWordClick = (clickedWord) => {
    // Không thêm nếu đang typing bài thơ cuối
    if (poems.length > 0 && poems[poems.length - 1].isGenerating) return;
    const newPoem = generatePoem(clickedWord, language);
    setPoems(prev => [
      ...prev,
      {
        keyWord: clickedWord,
        fullPoem: newPoem,
        displayedPoem: '',
        isGenerating: true,
      },
    ]);
  };

  if (!word || poems.length === 0) return null;

  return (
    <div className="poem-container">
      {poems.map((poemObj, idx) => (
        <TypingPoem
          key={idx}
          poem={poemObj.displayedPoem}
          isGenerating={poemObj.isGenerating}
          onWordClick={poemObj.isGenerating ? undefined : handleWordClick}
        />
      ))}
    </div>
  );
};

export default PoemGenerator;