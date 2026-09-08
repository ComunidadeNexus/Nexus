import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNucleos } from "@/hooks/useNucleos";
import { X, Globe, EyeOff, Lock } from "lucide-react";
import FileUpload from "@/components/upload/FileUpload";

interface CreateNucleoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { id: "anime", label: "Anime e cosplay", emoji: "👘" },
  { id: "arte", label: "Arte", emoji: "🎨" },
  { id: "assombracoes", label: "Assombrações", emoji: "👻" },
  { id: "bem-estar", label: "Bem-estar", emoji: "🧘" },
  { id: "carros", label: "Carros e veículos", emoji: "🚗" },
  { id: "casa", label: "Casa e jardinagem", emoji: "🏡" },
  { id: "ciencias", label: "Ciências", emoji: "🧪" },
  { id: "humanas", label: "Ciências humanas e Direito", emoji: "📜" },
  { id: "colecoes", label: "Coleções e outros passatempos", emoji: "🧩" },
  { id: "comida", label: "Comes e bebes", emoji: "🍔" },
  { id: "internet", label: "Cultura da internet", emoji: "👾" },
  { id: "pop", label: "Cultura pop", emoji: "✨" },
  { id: "educacao", label: "Educação e carreira", emoji: "🏫" },
  { id: "esportes", label: "Esportes", emoji: "🏅" },
  { id: "filmes", label: "Filmes e TV", emoji: "🎬" },
  { id: "identidade", label: "Identidade e relacionamentos", emoji: "🌈" },
  { id: "jogos", label: "Jogos", emoji: "🎮" },
  { id: "leitura", label: "Leitura e escrita", emoji: "📖" },
  { id: "viagens", label: "Lugares e viagens", emoji: "🌐" },
  { id: "moda", label: "Moda e beleza", emoji: "👗" },
  { id: "musica", label: "Música", emoji: "🎵" },
  { id: "natureza", label: "Natureza e espaços abertos", emoji: "🌿" },
  { id: "negocios", label: "Negócios e finanças", emoji: "💵" },
  { id: "noticias", label: "Notícias e política", emoji: "📰" },
  { id: "perguntas", label: "Perguntas e histórias", emoji: "✏️" },
  { id: "saude", label: "Saúde", emoji: "❤️" },
  { id: "tecnologia", label: "Tecnologia", emoji: "💻" },
  { id: "adulto", label: "Assuntos adultos", emoji: "🔞" },
];

const CreateNucleoModal = ({ open, onOpenChange }: CreateNucleoModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "restricted" | "private">("public");
  const [isAdult, setIsAdult] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { createNucleo } = useNucleos();

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const resetForm = () => {
    setStep(1);
    setSelectedCategory("");
    setPrivacy("public");
    setIsAdult(false);
    setName("");
    setDescription("");
    setAvatarUrl("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300); // reset after animation
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");
    const isPrivate = privacy === "private" || privacy === "restricted";

    // Anexando metadados na descrição por enquanto
    const finalDescription = `[${CATEGORIES.find((c) => c.id === selectedCategory)?.label || "Geral"}] ${isAdult ? "[18+] " : ""}${description}`;

    setIsCreating(true);
    const nucleo = await createNucleo({
      name,
      slug,
      description: finalDescription,
      is_private: isPrivate,
      avatar_url: avatarUrl || undefined,
    });
    setIsCreating(false);

    if (nucleo) {
      handleClose();
    }
  };

  // Preview dinâmico
  const generatedSlug = name.trim()
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
    : "nomedacomunidade";

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-[750px] p-0 bg-[#121212] border border-gray-800 text-white rounded-2xl shadow-2xl [&>button]:hidden">
        {/* Header Customizado */}
        <div className="flex justify-between items-start p-6 pb-2">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {step === 1 && "Sobre o que será sua comunidade?"}
              {step === 2 && "Que tipo de comunidade é essa?"}
              {step === 3 && "Conte-nos sobre sua comunidade"}
            </h2>
            <p className="text-sm text-gray-400">
              {step === 1 &&
                "Selecione um assunto para ajudar os redditors a descobrirem a comunidade"}
              {step === 2 &&
                "Defina quem pode visitar a comunidade e contribuir. Somente comunidades públicas aparecem na busca."}
              {step === 3 &&
                "O nome e a descrição ajudam as pessoas a saber do que se trata sua comunidade."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 py-4 min-h-[350px]">
          {step === 1 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                    selectedCategory === cat.id
                      ? "bg-gray-100 text-black border-gray-100"
                      : "bg-[#1A1A1A] text-gray-300 border-gray-800 hover:bg-[#2A2A2A]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3 mt-4">
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${privacy === "public" ? "border-primary bg-primary/5" : "border-gray-800 bg-[#1A1A1A] hover:bg-[#2A2A2A]"}`}
              >
                <Globe className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <div className="font-bold text-white">Pública</div>
                  <div className="text-xs text-gray-400">
                    Qualquer pessoa pode visualizar, postar e comentar nesta comunidade
                  </div>
                </div>
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === "public"}
                  onChange={() => setPrivacy("public")}
                  className="w-5 h-5 accent-primary"
                />
              </label>

              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${privacy === "restricted" ? "border-primary bg-primary/5" : "border-gray-800 bg-[#1A1A1A] hover:bg-[#2A2A2A]"}`}
              >
                <EyeOff className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <div className="font-bold text-white">Acesso restrito</div>
                  <div className="text-xs text-gray-400">
                    Qualquer pessoa pode visualizar, mas somente usuários aprovados podem contribuir
                  </div>
                </div>
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === "restricted"}
                  onChange={() => setPrivacy("restricted")}
                  className="w-5 h-5 accent-primary"
                />
              </label>

              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${privacy === "private" ? "border-primary bg-primary/5" : "border-gray-800 bg-[#1A1A1A] hover:bg-[#2A2A2A]"}`}
              >
                <Lock className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <div className="font-bold text-white">Privada</div>
                  <div className="text-xs text-gray-400">
                    Somente usuários aprovados podem visitar e contribuir
                  </div>
                </div>
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === "private"}
                  onChange={() => setPrivacy("private")}
                  className="w-5 h-5 accent-primary"
                />
              </label>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#1A1A1A] mt-4">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex items-center justify-center font-bold text-[10px] bg-red-600 rounded text-white shrink-0">
                    18+
                  </div>
                  <div>
                    <div className="font-bold text-white">Adulta (18+)</div>
                    <div className="text-xs text-gray-400">
                      Os usuários devem ser maiores de 18 anos para visitar e contribuir
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdult(!isAdult)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isAdult ? "bg-primary" : "bg-gray-600"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${isAdult ? "left-[26px]" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex gap-6 mt-4 h-full">
              {/* Esquerda: Inputs */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Upload de Avatar Compacto */}
                <div className="flex items-center gap-4 bg-[#2A2A2A] p-4 rounded-xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#1A1A1A] border border-gray-700 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-500 font-bold text-xl">
                        {name ? name.charAt(0).toUpperCase() : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1">Ícone da Comunidade</h4>
                    <p className="text-xs text-gray-400 mb-2">
                      Um ícone ajuda sua comunidade a se destacar.
                    </p>
                    <FileUpload
                      bucket="avatars"
                      onUpload={(url) => setAvatarUrl(url)}
                      accept="image/*"
                      maxSize={2}
                      preview={false}
                      className="!p-2"
                    />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nome da comunidade *"
                    value={name}
                    onChange={(e) => setName(e.target.value.substring(0, 21))}
                    className="w-full bg-[#2A2A2A] border-none rounded-xl p-4 pt-6 text-white focus:outline-none focus:ring-1 focus:ring-primary peer"
                  />
                  <label className="absolute left-4 top-2 text-xs text-gray-400">
                    Nome da comunidade <span className="text-red-500">*</span>
                  </label>
                  <div className="absolute right-3 bottom-2 text-xs text-gray-500">
                    {name.length}/21
                  </div>
                </div>

                <div className="relative flex-1">
                  <textarea
                    placeholder="Descrição *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-full min-h-[160px] bg-[#2A2A2A] border-none rounded-xl p-4 pt-6 text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none peer"
                  />
                  <label className="absolute left-4 top-2 text-xs text-gray-400">
                    Descrição <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Direita: Preview */}
              <div className="w-[300px] shrink-0 bg-[#1A1A1A] rounded-xl border border-gray-800 p-4 h-fit hidden sm:block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white text-xl overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>{name ? name.charAt(0).toUpperCase() : ""}</>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight break-all">
                      {generatedSlug}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      1 visitante semanal • 1 colaborador(a)
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 break-words mt-2">
                  {description || "Descrição da sua comunidade"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-800 bg-[#121212] rounded-b-2xl">
          {/* Indicadores de Passo */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${step === i ? "bg-white" : "bg-gray-600"}`}
              />
            ))}
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            {step === 1 ? (
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] transition-colors"
              >
                Cancelar
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] transition-colors"
              >
                Voltar
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !selectedCategory}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!name.trim() || isCreating}
                className="px-6 py-2.5 bg-gradient-to-r from-[#00C6FF] to-[#FF007F] text-white rounded-full text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isCreating ? "Criando..." : "Criar comunidade"}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNucleoModal;
