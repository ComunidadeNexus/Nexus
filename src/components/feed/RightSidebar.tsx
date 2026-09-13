import React from "react";
import { TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNucleos } from "@/hooks/useNucleos";
import { useAuth } from "@/contexts/AuthContext";

const RightSidebar = () => {
  const { nucleos, isLoading, joinNucleo, isMember } = useNucleos();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pegar as top 3 comunidades para a barra lateral
  const topNucleos = nucleos.slice(0, 3);

  const formatMembersCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(".0", "") + "k";
    }
    return count;
  };

  const handleJoin = (e: React.MouseEvent, nucleoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    joinNucleo(nucleoId);
  };

  return (
    <div className="bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm h-fit sticky top-[76px] mt-2">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
          Comunidades em Alta
        </h2>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-gray-500 text-center py-4">Carregando...</div>
        ) : topNucleos.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            Nenhuma comunidade criada ainda.
          </div>
        ) : (
          topNucleos.map((nucleo, index) => {
            const memberStatus = isMember(nucleo.id);

            return (
              <Link
                to={`/nucleo/${nucleo.slug}`}
                key={nucleo.id}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-4 text-center">
                    {index + 1}
                  </span>
                  {nucleo.avatar_url ? (
                    <img
                      src={nucleo.avatar_url}
                      alt={nucleo.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm"
                      style={{ backgroundColor: nucleo.color || "#3b82f6" }}
                    >
                      {nucleo.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold group-hover:underline line-clamp-1">
                      n/{nucleo.slug}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMembersCount(nucleo.members_count)} membros
                    </span>
                  </div>
                </div>
                {!memberStatus ? (
                  <button
                    onClick={(e) => handleJoin(e, nucleo.id)}
                    className="px-3 py-1 bg-gray-100 dark:bg-[#2A3B42] hover:bg-gray-200 dark:hover:bg-[#344850] text-gray-800 dark:text-white rounded-full text-xs font-semibold transition-colors shrink-0 ml-2"
                  >
                    Entrar
                  </button>
                ) : (
                  <button className="px-3 py-1 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-semibold shrink-0 ml-2 cursor-default">
                    Membro
                  </button>
                )}
              </Link>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Link
          to="/nucleos"
          className="block w-full py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-[#2A3B42] text-primary font-bold rounded-full text-sm transition-colors text-center"
        >
          Ver todas as comunidades
        </Link>
      </div>
    </div>
  );
};

export default RightSidebar;
