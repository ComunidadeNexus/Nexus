import { useState } from "react";
import { Lightbulb, Bug, Smartphone, HelpCircle, X } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { HelpModal } from "@/components/HelpModal";
import { InstallAppModal } from "@/components/InstallAppModal";
import { useIsMobile } from "@/hooks/use-mobile";

export const FloatingHelpButtons = () => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  const actions = (
    <>
      <InstallAppModal>
        <button
          type="button"
          className="flex items-center justify-center min-h-11 min-w-11 w-12 h-12 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
          title="Baixar App"
        >
          <Smartphone className="w-6 h-6 text-primary" />
        </button>
      </InstallAppModal>
      <FeedbackModal>
        <button
          type="button"
          className="flex items-center justify-center min-h-11 min-w-11 w-12 h-12 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
          title="Dar uma dica"
        >
          <Lightbulb className="w-6 h-6 text-yellow-500" />
        </button>
      </FeedbackModal>
      <HelpModal>
        <button
          type="button"
          className="flex items-center justify-center min-h-11 min-w-11 w-12 h-12 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
          title="Reportar Erro ou Bug"
        >
          <Bug className="w-6 h-6 text-red-500" />
        </button>
      </HelpModal>
    </>
  );

  return (
    <div className="fixed z-40 flex flex-col items-end gap-3 right-3 md:right-6 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6">
      {isMobile ? (
        <>
          {expanded && <div className="flex flex-col gap-3">{actions}</div>}
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="flex items-center justify-center min-h-11 min-w-11 w-12 h-12 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg"
            aria-label={expanded ? "Fechar ajuda" : "Ajuda e feedback"}
          >
            {expanded ? (
              <X className="w-6 h-6 text-gray-400" />
            ) : (
              <HelpCircle className="w-6 h-6 text-primary" />
            )}
          </button>
        </>
      ) : (
        actions
      )}
    </div>
  );
};
