import React, { useState, useEffect, useCallback } from 'react';
import { Character } from '../types';
import { Button } from './Button';
import { generateSpeech } from '../services/gemini';
import { playAudioContent } from '../services/geminiUtils';

interface PasswordGameProps {
  characters: Character[];
  onBack: () => void;
}

export const PasswordGame: React.FC<PasswordGameProps> = ({ characters, onBack }) => {
  const [level, setLevel] = useState(1);
  const [targetChars, setTargetChars] = useState<Character[]>([]);
  const [targetCode, setTargetCode] = useState<number[]>([]);
  const [inputCode, setInputCode] = useState<(number | null)[]>([null, null, null]);
  const [charMap, setCharMap] = useState<Map<string, number>>(new Map());
  const [gameState, setGameState] = useState<'playing' | 'success' | 'finished'>('playing');

  const speak = useCallback(async (text: string) => {
    try {
      const audio = await generateSpeech(text);
      if (audio) playAudioContent(audio);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 1. Initialize Character Mapping ONCE (persists across levels)
  useEffect(() => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => 0.5 - Math.random());
    const newMap = new Map<string, number>();
    characters.forEach((char, index) => {
      // Use modulo if characters > 9, though we have 4
      newMap.set(char.id, numbers[index % numbers.length]);
    });
    setCharMap(newMap);
  }, [characters]);

  // 2. Setup Level (Runs when Level changes or Map is ready)
  useEffect(() => {
    if (gameState === 'finished' || charMap.size === 0) return;

    // Generate target code (3 characters) based on the PERSISTENT charMap
    const selectedChars = [
        characters[Math.floor(Math.random() * characters.length)],
        characters[Math.floor(Math.random() * characters.length)],
        characters[Math.floor(Math.random() * characters.length)]
    ];
    setTargetChars(selectedChars);
    
    // Calculate the numeric code
    const code = selectedChars.map(c => charMap.get(c.id)!);
    setTargetCode(code);

    setInputCode([null, null, null]);
    setGameState('playing');

    speak(`Seviye ${level}. Şifreyi çöz!`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, charMap, characters]);

  const handleKeypadClick = (num: number) => {
    if (gameState !== 'playing') return;
    const nextIndex = inputCode.findIndex(val => val === null);
    if (nextIndex !== -1) {
      const newInput = [...inputCode];
      newInput[nextIndex] = num;
      setInputCode(newInput);
      
      // Auto check if full
      if (nextIndex === 2) {
        checkWin(newInput as number[], targetCode);
      }
    }
  };

  const handleDelete = () => {
    if (gameState !== 'playing') return;
    const filledIndices = inputCode.map((v, i) => v !== null ? i : -1).filter(i => i !== -1);
    if (filledIndices.length > 0) {
        const lastIndex = filledIndices[filledIndices.length - 1];
        const newInput = [...inputCode];
        newInput[lastIndex] = null;
        setInputCode(newInput);
    }
  };

  const checkWin = (input: number[], target: number[]) => {
    const isCorrect = input.every((val, idx) => val === target[idx]);
    if (isCorrect) {
      if (level === 5) {
        setGameState('finished');
        speak("Tebrikler! Oyunu bitirdin!");
      } else {
        setGameState('success');
        speak("Harika! Doğru.");
        setTimeout(() => setLevel(l => l + 1), 2000);
      }
    } else {
      speak("Yanlış şifre.");
      setTimeout(() => setInputCode([null, null, null]), 1000);
    }
  };

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <h1 className="text-4xl font-bold text-green-600">Oyun Bitti!</h1>
        <div className="text-6xl animate-bounce">🏆</div>
        <p className="text-xl">Bütün şifreleri çözdün!</p>
        <Button onClick={onBack} size="lg">Ana Menü</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={onBack} size="sm" variant="secondary">🔙 Geri</Button>
        <h2 className="text-2xl font-bold text-blue-600">Şifre: Seviye {level}/5</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        {/* Left Side: The Challenge & Input */}
        <div className="flex flex-col gap-6">
            
            {/* The Challenge (Images) */}
            <div className="bg-blue-50 p-6 rounded-3xl shadow-lg border-4 border-blue-200 text-center">
                <h3 className="text-lg font-bold text-blue-800 mb-4">Bu şifre nedir?</h3>
                <div className="flex justify-center gap-4">
                    {targetChars.map((char, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-xl shadow-md transform transition hover:scale-105">
                            <img src={char.imageUrl} alt="Secret" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg bg-gray-100" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area + Keypad */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-blue-100 flex flex-col items-center flex-grow justify-start">
                {/* Input Slots */}
                <div className="flex gap-4 mb-6">
                    {inputCode.map((num, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-50 rounded-xl border-4 border-blue-200 flex items-center justify-center text-5xl font-bold text-blue-600 shadow-inner">
                        {num !== null ? num : ''}
                    </div>
                    ))}
                </div>
                
                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button 
                            key={num}
                            onClick={() => handleKeypadClick(num)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-4 rounded-2xl shadow-md border-b-4 border-blue-200 active:border-b-0 active:translate-y-1 active:shadow-none transition text-2xl"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="col-span-1"></div> {/* Spacer */}
                    <button 
                         onClick={() => handleKeypadClick(0)}
                         className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-4 rounded-2xl shadow-md border-b-4 border-blue-200 active:border-b-0 active:translate-y-1 active:shadow-none transition text-2xl"
                    >
                        0
                    </button>
                    <button 
                         onClick={handleDelete}
                         className="bg-red-50 hover:bg-red-100 text-red-500 font-bold py-4 rounded-2xl shadow-md border-b-4 border-red-200 active:border-b-0 active:translate-y-1 active:shadow-none transition text-2xl flex items-center justify-center"
                         title="Sil"
                    >
                        ⌫
                    </button>
                </div>
                
                {gameState === 'success' && <div className="text-green-500 font-bold text-2xl animate-pulse mt-4">Doğru! 🎉</div>}
            </div>
        </div>

        {/* Right Side: The Clues */}
        <div className="bg-yellow-50 p-6 rounded-3xl shadow-xl border-4 border-yellow-200 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-center text-yellow-700">İpuçları</h3>
          <div className="grid grid-cols-2 gap-4">
            {characters.map(char => (
              <div 
                key={char.id}
                className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-yellow-100"
              >
                <img src={char.imageUrl} alt={char.name} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400 bg-gray-100" />
                <span className="ml-4 text-4xl font-bold text-gray-700">
                   = {charMap.get(char.id)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};