import { Lightbulb, Bug, Smartphone } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { HelpModal } from "@/components/HelpModal";
import { InstallAppModal } from "@/components/InstallAppModal";

export const FloatingHelpButtons = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <InstallAppModal>
        <button
          className="flex items-center justify-center w-12 h-12 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
          title="Baixar App"
        >
          <Smartphone className="w-6 h-6 text-primary" />
        </button>
      </InstallAppModal>
      <FeedbackModal>
        <button
          className="flex items-center justify-center w-12 h-12 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
          title="Dar uma dica"
        >
          <Lightbulb className="w-6 h-6 text-yellow-500" />
        </button>
      </FeedbackModal>

      <HelpModal>
        <button
          className="flex items-center justify-center w-12 h-12 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
          title="Reportar Erro ou Bug"
        >
          <Bug className="w-6 h-6 text-red-500" />
        </button>
      </HelpModal>
    </div>
  );
};
