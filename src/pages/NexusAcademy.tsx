import React, { useState } from "react";
import {
  Play,
  PlayCircle,
  Star,
  Search,
  Clock,
  GraduationCap,
  ChevronRight,
  BookOpen,
  X,
  Loader2,
} from "lucide-react";
import { useYouTubeRSS } from "@/hooks/useYouTubeRSS";

const CATEGORIES = ["Todos", "Programação", "Marketing", "Design", "Negócios", "Idiomas"];

const NexusAcademy = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const { videos, loading } = useYouTubeRSS();

  const filteredCourses = videos.filter(
    (course) =>
      (activeCategory === "Todos" || course.category === activeCategory) &&
      course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full pb-20 animate-fade-in">
      {/* Hero Section */}
      <div className="relative w-full h-[250px] md:h-[300px] rounded-2xl overflow-hidden mb-8 mt-2 group">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop"
          alt="Academy Hero"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-500/20 backdrop-blur-md rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-purple-400 font-bold uppercase tracking-wider text-sm">
              Conhecimento Sem Limites
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 max-w-2xl leading-tight">
            Nexus Academy
          </h1>
          <p className="text-gray-300 max-w-xl text-sm md:text-base">
            Aprenda as habilidades do futuro sem sair da comunidade. Cursos selecionados, playlists
            completas e muito mais.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 scale-105"
                  : "bg-gray-100 dark:bg-[#2A3B42] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#344850]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1A282D] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Cursos em Destaque
          </h2>
          <button className="text-purple-500 hover:text-purple-600 text-sm font-semibold flex items-center gap-1 transition-colors">
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-[#1A282D] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <Loader2 className="w-12 h-12 text-purple-500 mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Buscando os vídeos mais recentes da internet...
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-[#1A282D] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <Search className="w-12 h-12 text-gray-400 mb-4 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum curso encontrado para essa busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white dark:bg-[#1A282D] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div
                  className="relative h-48 w-full overflow-hidden cursor-pointer"
                  onClick={() => setPlayingVideo(course.videoId)}
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-xs font-medium text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2 py-1 rounded-md">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {course.rating}
                    </div>
                  </div>

                  <h3
                    className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-1 cursor-pointer hover:text-purple-500 transition-colors"
                    onClick={() => setPlayingVideo(course.videoId)}
                  >
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{course.channel}</p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {course.views} alunos
                    </span>
                    <button
                      onClick={() => setPlayingVideo(course.videoId)}
                      className="flex items-center gap-2 text-sm font-semibold text-purple-500 hover:text-purple-600 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Começar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Custom Modal (Evita tela preta do Radix Dialog) */}
      {playingVideo && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-5xl px-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${playingVideo.replace("v=", "")}?autoplay=1&rel=0&hl=pt-BR`}
                title="Nexus Academy Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexusAcademy;
