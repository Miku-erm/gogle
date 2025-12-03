import React, { useState, useEffect } from 'react';
import { Character, StoryState } from '../types';
import { Button } from './Button';
import { generateStoryStart, generateStoryContinuation, generateSpeech } from '../services/gemini';
import { playAudioContent } from '../services/geminiUtils';
import { LoadingScreen } from './LoadingScreen';

interface StoryGameProps {
  characters: Character[];
  onBack: () => void;
}

export const StoryGame: React.FC<StoryGameProps> = ({ characters, onBack }) => {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [storyState, setStoryState] = useState<StoryState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const startStory = async (char: Character) => {
    setSelectedChar(char);
    setLoading(true);
    try {
      const result = await generateStoryStart(char.name);
      setStoryState({
        history: result.text,
        currentText: result.text,
        options: result.options
      });
      playText(result.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOption = async (option: string) => {
    if (!storyState) return;
    setLoading(true);
    try {
      const fullHistory = `${storyState.history}\nSeçim: ${option}`;
      const result = await generateStoryContinuation(fullHistory, option);
      setStoryState({
        history: fullHistory + "\n" + result.text,
        currentText: result.text,
        options: result.options
      });
      playText(result.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const playText = async (text: string) => {
    setIsPlayingAudio(true);
    const audio = await generateSpeech(text);
    if (audio) {
        await playAudioContent(audio);
    }
    setIsPlayingAudio(false);
  };

  if (loading) return <LoadingScreen message="Hikaye yazılıyor..." />;

  // Character Selection
  if (!selectedChar) {
    return (
      <div className="flex flex-col h-full p-4 items-center">
         <div className="w-full flex justify-start mb-4">
          <Button onClick={onBack} size="sm" variant="secondary">🔙 Geri</Button>
        </div>
        <h2 className="text-3xl font-bold text-purple-600 mb-8">Karakterini Seç</h2>
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => startStory(char)}
              className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-xl border-4 border-transparent hover:border-purple-300 transition transform hover:scale-105"
            >
              <img src={char.imageUrl} alt={char.name} className="w-32 h-32 rounded-full object-cover mb-4" />
              <span className="text-xl font-bold text-gray-700">{char.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Story View
  return (
    <div className="flex flex-col h-full p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setSelectedChar(null)} size="sm" variant="secondary">Karakter Seçimi</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-grow">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <img src={selectedChar.imageUrl} alt={selectedChar.name} className="w-64 h-64 rounded-3xl shadow-lg border-4 border-purple-200 object-cover" />
          <h3 className="text-2xl font-bold mt-4 text-purple-700">{selectedChar.name}</h3>
          <button 
            onClick={() => storyState && playText(storyState.currentText)}
            className="mt-4 bg-purple-100 p-3 rounded-full text-purple-600 hover:bg-purple-200 transition"
            title="Tekrar Oku"
          >
             🔊 Tekrar Dinle
          </button>
        </div>

        <div className="w-full md:w-2/3 flex flex-col justify-between">
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-purple-100 mb-6 flex-grow">
                <p className="text-xl leading-relaxed text-gray-700">
                    {storyState?.currentText}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {storyState?.options.map((opt, idx) => (
                    <Button 
                        key={idx} 
                        onClick={() => handleOption(opt)}
                        variant="primary"
                        className="text-left justify-start"
                    >
                        ✨ {opt}
                    </Button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};