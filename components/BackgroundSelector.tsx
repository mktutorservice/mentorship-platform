'use client';

import { useState } from 'react';

interface BackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (bgUrl: string) => void;
}

const PRESET_BACKGROUNDS = [
  { id: 1, name: 'Tech Network', url: '/bg-tech.jpg' },
  { id: 2, name: 'Deep Space', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200' },
  { id: 3, name: 'Abstract Purple', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200' },
  { id: 4, name: 'Minimal Dark', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200' },
];

export default function BackgroundSelector({ isOpen, onClose, onSelectBackground }: BackgroundSelectorProps) {
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectBackground(customUrl.trim());
      setCustomUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[#171722] text-white p-6 rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xl font-bold gold-text">Choose Background</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Preset Background Options */}
        <div className="grid grid-cols-2 gap-3">
          {PRESET_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                onSelectBackground(bg.url);
                onClose();
              }}
              className="group relative h-24 rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#B38728] transition shadow-md cursor-pointer"
            >
              <img 
                src={bg.url} 
                alt={bg.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs font-semibold">
                {bg.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Image URL Option */}
        <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2 border-t border-white/10">
          <label className="block text-xs font-medium text-gray-300">
            Or enter custom Image URL:
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-4 py-2 text-xs rounded-xl bg-[#0f0f17] text-white border border-white/10 focus:outline-none focus:border-[#B38728]"
            />
            <button
              type="submit"
              className="gold-bg font-bold text-[#0f0f17] text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Apply
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}