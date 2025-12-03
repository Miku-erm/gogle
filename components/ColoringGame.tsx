import React, { useState, useRef, useEffect } from 'react';
import { Character } from '../types';
import { Button } from './Button';
import { generateColoringPage } from '../services/gemini';
import { LoadingScreen } from './LoadingScreen';

interface ColoringGameProps {
  characters: Character[];
  onBack: () => void;
}

const COLORS = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE', '#FFFFFF', '#000000', '#A52A2A'];

export const ColoringGame: React.FC<ColoringGameProps> = ({ characters, onBack }) => {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [outlineUrl, setOutlineUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Generate coloring page when character is selected
  useEffect(() => {
    if (selectedChar) {
      setLoading(true);
      generateColoringPage(selectedChar.description || selectedChar.name)
        .then(url => {
          setOutlineUrl(url);
          // Initialize canvas
          setTimeout(() => loadCanvas(url), 100);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedChar]);

  const loadCanvas = (url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
        // Fit image to canvas maintaining aspect ratio
        ctx.fillStyle = "white";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if(canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.beginPath(); // Reset path
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Scaling factors to map screen coordinates to canvas internal resolution (800x800)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = selectedColor;
    ctx.globalCompositeOperation = 'multiply'; 
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  if (loading) return <LoadingScreen message="Boyama sayfası hazırlanıyor..." />;

  if (!selectedChar) {
    return (
      <div className="flex flex-col h-full p-4 items-center">
         <div className="w-full flex justify-start mb-4">
          <Button onClick={onBack} size="sm" variant="secondary">🔙 Geri</Button>
        </div>
        <h2 className="text-3xl font-bold text-pink-600 mb-8">Boyamak için birini seç!</h2>
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-xl border-4 border-transparent hover:border-pink-300 transition transform hover:scale-105"
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
    <div className="flex flex-col h-full p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
            <Button onClick={() => setSelectedChar(null)} size="sm" variant="secondary">Çık</Button>
            <h2 className="text-2xl font-bold text-pink-600">Hadi Boyayalım!</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Palette */}
            <div className="flex md:flex-col gap-2 p-2 bg-white rounded-xl shadow-md overflow-x-auto md:overflow-visible">
                {COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-12 h-12 rounded-full border-4 ${selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-200'} transition shadow-sm flex-shrink-0`}
                    />
                ))}
                 <button
                        onClick={() => loadCanvas(outlineUrl!)}
                        className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold"
                        title="Temizle"
                    >
                        Sil
                    </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-grow bg-white rounded-3xl shadow-2xl overflow-hidden touch-none relative border-4 border-pink-200">
                 <canvas
                    ref={canvasRef}
                    width={800} // Fixed resolution
                    height={800}
                    className="w-full h-full object-contain cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                 />
            </div>
        </div>
    </div>
  );
};