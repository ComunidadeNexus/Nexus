import React, { useState } from "react";
import { Smile, Frown, Zap, Flame, Search } from "lucide-react";

// Catálogo curado de GIFs Premium
// Os links são diretos da mídia do Giphy para garantir carregamento instantâneo
const GIF_CATALOG = [
  // Reações Positivas / Comemorar
  {
    id: "g1",
    url: "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif",
    category: "Comemorar",
  },
  {
    id: "g2",
    url: "https://media.giphy.com/media/l0amJzVHIAfl7jMDos/giphy.gif",
    category: "Comemorar",
  },
  {
    id: "g3",
    url: "https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif",
    category: "Comemorar",
  },
  { id: "g4", url: "https://media.giphy.com/media/nxxCGnEAWsViw/giphy.gif", category: "Comemorar" },
  {
    id: "g5",
    url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
    category: "Comemorar",
  },

  // Rir
  { id: "g6", url: "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif", category: "Rir" },
  { id: "g7", url: "https://media.giphy.com/media/xUA7aM09ByyR1w5YWc/giphy.gif", category: "Rir" },
  { id: "g8", url: "https://media.giphy.com/media/Z9OGuQyrfHAE8/giphy.gif", category: "Rir" },
  { id: "g9", url: "https://media.giphy.com/media/Q7ozWJCHe315cejNCv/giphy.gif", category: "Rir" },
  { id: "g10", url: "https://media.giphy.com/media/9MFsKQ8A6HCN2/giphy.gif", category: "Rir" },

  // Chorar / Triste
  { id: "g11", url: "https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif", category: "Chorar" },
  { id: "g12", url: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif", category: "Chorar" },
  { id: "g13", url: "https://media.giphy.com/media/2rtQMJvhzOnRe/giphy.gif", category: "Chorar" },
  { id: "g14", url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif", category: "Chorar" },

  // Surpresa / Uau
  {
    id: "g15",
    url: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
    category: "Surpresa",
  },
  {
    id: "g16",
    url: "https://media.giphy.com/media/tfUW8mhiFk8NlJhgEh/giphy.gif",
    category: "Surpresa",
  },
  { id: "g17", url: "https://media.giphy.com/media/ebFG4jcnC1Ny8/giphy.gif", category: "Surpresa" },
  { id: "g18", url: "https://media.giphy.com/media/vQqeT3AYg8S5O/giphy.gif", category: "Surpresa" },

  // Raiva / Flame
  { id: "g19", url: "https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif", category: "Raiva" },
  { id: "g20", url: "https://media.giphy.com/media/10Uv70X15egAIG/giphy.gif", category: "Raiva" },
  {
    id: "g21",
    url: "https://media.giphy.com/media/WoF3yfYupTt8mHc7va/giphy.gif",
    category: "Raiva",
  },
];

const CATEGORIES = ["Todos", "Comemorar", "Rir", "Surpresa", "Chorar", "Raiva"];

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

const GifPicker = ({ onSelect, onClose }: GifPickerProps) => {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredGifs = GIF_CATALOG.filter((gif) =>
    activeCategory === "Todos" ? true : gif.category === activeCategory,
  );

  return (
    <div className="absolute bottom-full mb-2 left-0 w-[320px] bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
      {/* Header do Picker */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#203036] flex items-center gap-2">
        <Zap className="w-4 h-4 text-purple-500" />
        <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Selecione um GIF</span>
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-red-500">
          &times;
        </button>
      </div>

      {/* Categorias (Filtros) */}
      <div className="flex overflow-x-auto gap-2 p-2 px-3 border-b border-gray-100 dark:border-gray-800 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat
                ? "bg-purple-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grade de GIFs */}
      <div className="p-2 h-[260px] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          {filteredGifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif.url)}
              className="relative rounded-xl overflow-hidden group hover:ring-2 hover:ring-purple-500 hover:scale-105 transition-all duration-200"
            >
              <img src={gif.url} alt="GIF" className="w-full h-24 object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
