import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LeftSidebar from "./LeftSidebar";
import CreateNucleoModal from "../nucleos/CreateNucleoModal";

const DESKTOP_MQ = "(min-width: 768px)";

const MobileNavDrawer = () => {
  const [open, setOpen] = useState(false);
  const [createNucleoOpen, setCreateNucleoOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MQ);
    const closeOnDesktop = () => {
      if (mql.matches) setOpen(false);
    };
    mql.addEventListener("change", closeOnDesktop);
    return () => mql.removeEventListener("change", closeOnDesktop);
  }, []);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="md:hidden flex items-center justify-center min-h-11 min-w-11 p-2 -ml-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors"
            aria-label="Abrir navegação"
            aria-expanded={open}
          >
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          overlayClassName="z-[60]"
          className="w-[280px] max-w-[280px] sm:max-w-[280px] p-0 gap-0 bg-white dark:bg-[#1A282D] border-r border-gray-200 dark:border-gray-800 z-[60]"
        >
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Menu lateral com os mesmos destinos da barra esquerda do Nexus.
          </SheetDescription>
          <LeftSidebar
            variant="drawer"
            onNavigate={closeDrawer}
            onCreateNucleo={() => {
              setOpen(false);
              setCreateNucleoOpen(true);
            }}
          />
        </SheetContent>
      </Sheet>
      <CreateNucleoModal open={createNucleoOpen} onOpenChange={setCreateNucleoOpen} />
    </>
  );
};

export default MobileNavDrawer;
