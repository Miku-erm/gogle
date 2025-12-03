import React, { useState, useEffect } from 'react';
import { GameMode, Character } from './types';
import { generateCharacterImage, generateSpeech } from './services/gemini';
import { playAudioContent } from './services/geminiUtils';
import { LoadingScreen } from './components/LoadingScreen';
import { PasswordGame } from './components/PasswordGame';
import { StoryGame } from './components/StoryGame';
import { ColoringGame } from './components/ColoringGame';
import { PuzzleGame } from './components/PuzzleGame';
import { ImageEditor } from './components/ImageEditor';

// Specific characters requested by user
const CHAR_DEFINITIONS = [
  { name: "Mavi Gemi", desc: "blue toy ship floating on water" },
  { name: "Kırmızı Kedi", desc: "red cat sitting and smiling" },
  { name: "Yeşil Kuş", desc: "cute round green bird flying" },
  { name: "Sarı Kalem", desc: "yellow pencil character with a funny face" }
];

function App() {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Arkadaşların hazırlanıyor...");
  const [editingChar, setEditingChar] = useState<Character | null>(null);

  // Setup / Init
  useEffect(() => {
    const initializeCharacters = async () => {
        setLoading(true);
        setLoadingMessage("Sihirli dünya kuruluyor...");
        try {
          // Generate all characters in parallel
          const promises = CHAR_DEFINITIONS.map((def, i) => 
            generateCharacterImage(def.name, def.desc).then(url => ({
              id: `char-${i}`,
              name: def.name,
              description: def.desc,
              imageUrl: url
            }))
          );
    
          const results = await Promise.all(promises);
          setCharacters(results);
          
          // Welcome Audio (fire and forget)
          generateSpeech("Merhaba! Oyun oynamaya hazır mısın?").then(audio => {
            if(audio) playAudioContent(audio);
          });
    
        } catch (error) {
          console.error("Setup failed", error);
        } finally {
          setLoading(false);
        }
      };

      initializeCharacters();
  }, []); // Run once on mount

  const updateCharacter = (updatedChar: Character) => {
    setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
  };

  if (loading) return <LoadingScreen message={loadingMessage} />;

  // Edit Modal Overlay
  const renderEditModal = () => {
    if (!editingChar) return null;
    return (
        <ImageEditor 
            character={editingChar} 
            onUpdateCharacter={updateCharacter} 
            onClose={() => setEditingChar(null)} 
        />
    );
  };

  // Main Menu
  if (mode === GameMode.MENU) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center bg-gradient-to-b from-yellow-100 to-green-100">
        {renderEditModal()}
        <header className="w-full flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-green-600 drop-shadow-sm">Sihirli Oyun Arkadaşları</h1>
        </header>

        {/* Character Showcase with Edit Button */}
        <div className="flex gap-6 mb-12 overflow-x-auto w-full justify-center py-6">
          {characters.map(char => (
            <div key={char.id} className="relative group flex flex-col items-center">
                <div className="relative">
                    <img 
                        src={char.imageUrl} 
                        alt={char.name} 
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
                    />
                    <button 
                        onClick={() => setEditingChar(char)}
                        className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full text-sm shadow-md hover:bg-purple-600 transition"
                        title="Düzenle"
                    >
                        ✏️
                    </button>
                </div>
                <span className="mt-2 font-bold text-gray-700 bg-white/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {char.name}
                </span>
            </div>
          ))}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl px-4">
          <button 
            onClick={() => setMode(GameMode.PASSWORD)}
            className="bg-blue-100 hover:bg-blue-200 p-8 rounded-3xl shadow-xl flex flex-col items-center transition transform hover:scale-105 border-b-8 border-blue-300"
          >
            <span className="text-6xl mb-4">🔢</span>
            <span className="text-2xl font-bold text-blue-700">Şifre Oyunu</span>
          </button>

          <button 
             onClick={() => setMode(GameMode.STORY)}
             className="bg-purple-100 hover:bg-purple-200 p-8 rounded-3xl shadow-xl flex flex-col items-center transition transform hover:scale-105 border-b-8 border-purple-300"
          >
            <span className="text-6xl mb-4">📖</span>
            <span className="text-2xl font-bold text-purple-700">Hikaye</span>
          </button>

          <button 
             onClick={() => setMode(GameMode.COLORING)}
             className="bg-pink-100 hover:bg-pink-200 p-8 rounded-3xl shadow-xl flex flex-col items-center transition transform hover:scale-105 border-b-8 border-pink-300"
          >
            <span className="text-6xl mb-4">🎨</span>
            <span className="text-2xl font-bold text-pink-700">Boyama</span>
          </button>

          <button 
             onClick={() => setMode(GameMode.PUZZLE)}
             className="bg-orange-100 hover:bg-orange-200 p-8 rounded-3xl shadow-xl flex flex-col items-center transition transform hover:scale-105 border-b-8 border-orange-300"
          >
            <span className="text-6xl mb-4">🧩</span>
            <span className="text-2xl font-bold text-orange-700">Puzzle</span>
          </button>
        </div>
      </div>
    );
  }

  const goBack = () => setMode(GameMode.MENU);

  return (
    <div className="h-screen bg-white overflow-hidden">
      {mode === GameMode.PASSWORD && <PasswordGame characters={characters} onBack={goBack} />}
      {mode === GameMode.STORY && <StoryGame characters={characters} onBack={goBack} />}
      {mode === GameMode.COLORING && <ColoringGame characters={characters} onBack={goBack} />}
      {mode === GameMode.PUZZLE && <PuzzleGame characters={characters} onBack={goBack} />}
    </div>
  );
}

export default App;