import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, ExternalLink, CalendarDays } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewsReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: {
    title: string;
    content: string;
    url: string;
    imageUrl?: string;
    source: string;
    publishedAt: string;
  } | null;
}

const NewsReaderModal = ({ isOpen, onClose, news }: NewsReaderModalProps) => {
  if (!news) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col overflow-hidden bg-white dark:bg-[#0B1416] border-gray-200 dark:border-gray-800">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1 font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
              <Globe className="w-3.5 h-3.5" />
              {news.source}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {news.publishedAt}
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold leading-tight mb-2">{news.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-none prose dark:prose-invert prose-img:rounded-xl prose-img:w-full prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300">
            {news.imageUrl && (
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full max-h-[400px] object-cover rounded-xl mb-6 shadow-sm"
              />
            )}

            <div
              className="text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-center">
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-[#1A282D] hover:bg-gray-200 dark:hover:bg-[#2A3B42] text-gray-900 dark:text-gray-100 font-bold rounded-full transition-colors"
              >
                Ler no site original <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewsReaderModal;
