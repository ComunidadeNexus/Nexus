import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="glass-card p-12 rounded-2xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[100px] -z-10" />

        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Store className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-3xl font-bold gradient-text mb-4">Marketplace</h1>

        <p className="text-muted-foreground text-lg mb-8">
          Estamos preparando um espaço incrível para você comprar e vender com a comunidade. Aguarde
          a próxima atualização!
        </p>

        <div className="flex items-center gap-2 text-sm font-medium text-primary/80 bg-primary/10 px-4 py-2 rounded-full mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Em breve
        </div>

        <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
          Voltar
        </Button>
      </div>
    </div>
  );
};

export default Marketplace;
