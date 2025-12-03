import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Yükleniyor..." }) => {
  return (
    <div className="fixed inset-0 bg-sky-100 flex flex-col items-center justify-center z-50">
      <div className="animate-bounce text-6xl mb-8">🐰</div>
      <h2 className="text-3xl font-bold text-sky-600 animate-pulse">{message}</h2>
      <div className="mt-8 w-64 bg-white rounded-full h-4 overflow-hidden border-2 border-sky-300">
        <div className="bg-sky-500 h-full w-full animate-[wiggle_1s_ease-in-out_infinite] origin-left scale-x-50"></div>
      </div>
    </div>
  );
};