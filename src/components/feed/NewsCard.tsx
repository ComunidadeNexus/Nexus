import React from "react";
import { ExternalLink, Globe } from "lucide-react";

interface NewsCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  onClick?: () => void;
}

const NewsCard = ({
  title,
  description,
  url,
  imageUrl,
  source,
  publishedAt,
  onClick,
}: NewsCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-4 overflow-hidden flex flex-col sm:flex-row transition-all hover:border-primary/50 hover:shadow-md cursor-pointer group"
    >
      {/* Imagem (Esquerda) */}
      {imageUrl && (
        <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-100 dark:bg-[#0B1416] relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400";
            }}
          />
        </div>
      )}

      {/* Conteúdo (Direita) */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-primary">{source}</span>
            <span>•</span>
            <span>{publishedAt}</span>
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 font-semibold group-hover:text-primary transition-colors">
            Ler artigo completo
          </span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            Notícia Externa
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
