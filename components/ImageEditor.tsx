import React, { useState } from 'react';
import { Character } from '../types';
import { Button } from './Button';
import { editCharacterImage } from '../services/gemini';
import { LoadingScreen } from './LoadingScreen';

interface ImageEditorProps {
    character: Character;
    onUpdateCharacter: (newChar: Character) => void;
    onClose: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ character, onUpdateCharacter, onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleEdit = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            // Send current image (or preview if chaining edits) + prompt
            const sourceImage = previewUrl || character.imageUrl;
            const newImage = await editCharacterImage(sourceImage, prompt);
            setPreviewUrl(newImage);
        } catch (error) {
            alert("Resim düzenlenemedi. Tekrar dene.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (previewUrl) {
            onUpdateCharacter({ ...character, imageUrl: previewUrl });
            onClose();
        }
    };

    if (loading) return <LoadingScreen message="Sihir yapılıyor... ✨" />;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                <h3 className="text-2xl font-bold mb-4 text-purple-600">Sihirli Değnek ✨</h3>
                
                <div className="flex justify-center mb-6">
                    <img 
                        src={previewUrl || character.imageUrl} 
                        alt="Editing" 
                        className="w-64 h-64 object-cover rounded-2xl shadow-lg border-4 border-purple-200"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Ne değiştirelim?</label>
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Örn: Şapka ekle, Güneş gözlüğü tak..."
                        className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-purple-500 outline-none"
                    />
                </div>

                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={onClose}>İptal</Button>
                    {previewUrl ? (
                         <Button variant="success" onClick={handleSave}>Kaydet</Button>
                    ) : (
                         <Button variant="primary" onClick={handleEdit} disabled={!prompt}>Uygula</Button>
                    )}
                </div>
            </div>
        </div>
    );
};