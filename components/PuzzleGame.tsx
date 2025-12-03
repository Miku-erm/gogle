import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { Button } from './Button';

interface PuzzleGameProps {
  characters: Character[];
  onBack: () => void;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ characters, onBack }) => {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [pieces, setPieces] = useState<number[]>([0, 1, 2, 3]);
  const [isSolved, setIsSolved] = useState(false);
  const [swapSource, setSwapSource] = useState<number | null>(null);

  useEffect(() => {
    if (selectedChar) {
      shuffle();
    }
  }, [selectedChar]);

  const shuffle = () => {
    let newPieces = [0, 1, 2, 3];
    // Shuffle logic
    for (let i = newPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
    }
    // Ensure it's not solved initially
    if (newPieces.every((val, idx) => val === idx)) {
        newPieces = [3, 2, 1, 0];
    }
    setPieces(newPieces);
    setIsSolved(false);
    setSwapSource(null);
  };

  const onPieceClick = (clickedIndex: number) => {
    if (isSolved) return;

    if (swapSource === null) {
        setSwapSource(clickedIndex);
    } else {
        // Swap
        const newPieces = [...pieces];
        const temp = newPieces[swapSource];
        newPieces[swapSource] = newPieces[clickedIndex];
        newPieces[clickedIndex] = temp;
        setPieces(newPieces);
        setSwapSource(null);

        // Check solved
        if (newPieces.every((val, idx) => val === idx)) {
            setIsSolved(true);
        }
    }
  };

  if (!selectedChar) {
    return (
        <div className="flex flex-col h-full p-4 items-center">
        <div className="w-full flex justify-start mb-4">
         <Button onClick={onBack} size="sm" variant="secondary">🔙 Geri</Button>
       </div>
       <h2 className="text-3xl font-bold text-orange-600 mb-8">Puzzle için birini seç!</h2>
       <div className="grid grid-cols-2 gap-6 max-w-2xl">
         {characters.map(char => (
           <button
             key={char.id}
             onClick={() => setSelectedChar(char)}
             className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-xl border-4 border-transparent hover:border-orange-300 transition transform hover:scale-105"
           >
             <img src={char.imageUrl} alt={char.name} className="w-32 h-32 rounded-full object-cover mb-4" />
             <span className="text-xl font-bold text-gray-700">{char.name}</span>
           </button>
         ))}
       </div>
     </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
        <div className="w-full flex justify-between mb-8">
            <Button onClick={() => setSelectedChar(null)} variant="secondary">Çık</Button>
            <h2 className="text-3xl font-bold text-orange-600">Puzzle!</h2>
            <Button onClick={shuffle} variant="primary">Karıştır</Button>
        </div>

        {isSolved && (
            <div className="mb-4 text-4xl font-bold text-green-500 animate-bounce">
                Harika! Bildin! 🎉
            </div>
        )}

        <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] grid grid-cols-2 grid-rows-2 gap-1 bg-orange-100 p-2 rounded-xl shadow-2xl">
            {pieces.map((piecePosition, visualIndex) => {
                const x = (piecePosition % 2) * 100; // 0 or 100%
                const y = Math.floor(piecePosition / 2) * 100; // 0 or 100%

                return (
                    <div 
                        key={visualIndex}
                        onClick={() => onPieceClick(visualIndex)}
                        className={`
                            relative overflow-hidden cursor-pointer border-2 
                            ${swapSource === visualIndex ? 'border-blue-500 scale-95' : 'border-white'}
                            ${isSolved ? 'border-none' : ''}
                            transition-all duration-300
                        `}
                    >
                        <div 
                            className="w-[200%] h-[200%] absolute"
                            style={{
                                backgroundImage: `url(${selectedChar.imageUrl})`,
                                backgroundSize: '100% 100%',
                                left: `-${x}%`,
                                top: `-${y}%`
                            }}
                        />
                    </div>
                );
            })}
        </div>
        <p className="mt-6 text-gray-500 text-lg">İki parçaya tıklayarak yerlerini değiştir.</p>
    </div>
  );
};