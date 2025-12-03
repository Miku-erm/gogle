import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Character } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fallback generator if API fails
const getFallbackImage = (name: string) => {
  const colorMap: Record<string, string> = {
    "Mavi Gemi": "#bfdbfe", // blue-200
    "Kırmızı Kedi": "#fecaca", // red-200
    "Yeşil Kuş": "#bbf7d0", // green-200
    "Sarı Kalem": "#fef08a"  // yellow-200
  };
  const emojiMap: Record<string, string> = {
    "Mavi Gemi": "🚢",
    "Kırmızı Kedi": "🐱",
    "Yeşil Kuş": "🐦",
    "Sarı Kalem": "✏️"
  };
  const color = colorMap[name] || "#e5e7eb";
  const emoji = emojiMap[name] || "🧸";
  
  // Create a simple SVG with the emoji centered on a colored background
  const svg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="${color}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="250">${emoji}</text>
  </svg>`;
  
  // Robust base64 encoding for unicode strings
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// --- Image Generation ---

export const generateCharacterImage = async (name: string, description: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const prompt = `Cute cartoon illustration of ${name}, ${description}. Simple vector art style, thick lines, bright flat colors, white background. Designed for children.`;
    
    // Switch to gemini-2.5-flash-image for better availability
    // Note: imageSize is NOT supported in Flash Image model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    // If no inlineData, try fallback
    console.warn("API returned no image data, using fallback.");
    return getFallbackImage(name);
  } catch (error) {
    console.error("Error generating character (using fallback):", error);
    return getFallbackImage(name);
  }
};

export const generateColoringPage = async (characterDescription: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const prompt = `A simple black and white coloring book page outline of ${characterDescription}. Thick lines, white background, no shading.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No coloring page generated");
  } catch (error) {
    console.error("Error generating coloring page:", error);
    // Fallback coloring page (blank with text)
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="black" stroke-width="10"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="40" font-family="sans-serif" fill="#ccc">Boyama Sayfası</text>
      </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};

// --- Image Editing (Nano Banana) ---

export const editCharacterImage = async (base64Image: string, instruction: string): Promise<string> => {
  const ai = getAiClient();
  try {
    // Remove header for API
    const base64Data = base64Image.split(',')[1]; 

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png', // Assuming PNG for simplicity
            },
          },
          {
            text: instruction,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

// --- Text Generation (Story) ---

export const generateStoryStart = async (characterName: string): Promise<{ text: string; options: string[] }> => {
  const ai = getAiClient();
  // Modified prompt for SHORTER story to reduce TTS lag
  const prompt = `
    Create a VERY SHORT (max 2 sentences, ~20 words) story start for a 5-year-old child about ${characterName}.
    Keep it simple and fun.
    Language: Turkish.
    Return JSON format: { "text": "story text", "options": ["option 1", "option 2", "option 3"] }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["text", "options"]
      }
    }
  });

  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr);
};

export const generateStoryContinuation = async (history: string, choice: string): Promise<{ text: string; options: string[] }> => {
  const ai = getAiClient();
  // Modified prompt for SHORTER story to reduce TTS lag
  const prompt = `
    Continue this story for a 5-year-old child based on the choice: "${choice}".
    Make this segment VERY SHORT (max 2 sentences, ~20 words).
    Previous story: ${history}
    Language: Turkish.
    Return JSON format: { "text": "story text", "options": ["option 1", "option 2", "option 3"] }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["text", "options"]
      }
    }
  });

  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr);
};

// --- TTS ---

export const generateSpeech = async (text: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};