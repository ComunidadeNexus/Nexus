import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import { useFeed } from "@/hooks/useFeed";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

const Feed = () => {
  const location = useLocation();
  // Derive sort from the URL so /popular does not wait on a lagged setState
  // (desktop sidebar navigation reused this component and kept sortBy=top).
  const sortBy: "hot" | "new" | "top" = location.pathname === "/popular" ? "top" : "hot";

  const searchParams = new URLSearchParams(location.search);
  const categorySlug = searchParams.get("categoria");

  const { posts, isLoading, error } = useFeed(sortBy, categorySlug);
  const { categories } = useCategories();
  const feedPosts = posts ?? [];
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const isHomeSort = location.pathname !== "/popular" && !categorySlug;
  const isPopularSort = location.pathname === "/popular";

  const chipClass = (active: boolean) =>
    cn(
      "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
      active
        ? "bg-primary/15 text-primary border-primary/30"
        : "bg-gray-100 dark:bg-[#2A3B42] text-gray-700 dark:text-gray-300 border-transparent",
    );

  useEffect(() => {
    setLoadTimedOut(false);
    if (!isLoading) return;
    const timer = window.setTimeout(() => setLoadTimedOut(true), 4000);
    return () => window.clearTimeout(timer);
  }, [isLoading, sortBy, categorySlug]);

  const showLoading = isLoading && !loadTimedOut && !error && feedPosts.length === 0;

  return (
    <div className="w-full">
      {/* Mobile: existing Início / Popular / categorias as a thin chip row */}
      <div className="md:hidden sticky top-12 z-40 bg-white dark:bg-[#1A282D] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2">
          <Link to="/comunidade" className={chipClass(isHomeSort)}>
            Início
          </Link>
          <Link to="/popular" className={chipClass(isPopularSort)}>
            Popular
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/feed?categoria=${category.slug}`}
              className={chipClass(categorySlug === category.slug)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="flex flex-col gap-0">
        {showLoading ? (
          <div className="flex justify-center p-8">
            <span className="text-gray-500">Carregando posts...</span>
          </div>
        ) : feedPosts.length > 0 ? (
          feedPosts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              nucleus={post.nucleo?.slug || "geral"}
              author={post.author?.name || post.author?.username || "Usuário"}
              authorId={post.user_id}
              authorAvatar={post.author?.avatar_url}
              timeAgo={new Date(post.created_at).toLocaleDateString()}
              title={post.title || "Sem Título"}
              content={post.content}
              votes={post.upvotes_count - post.downvotes_count}
              comments={post.comments_count}
              mediaUrl={post.media_url || undefined}
              mediaType={post.media_type || undefined}
              userVote={post.user_vote}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-[#1A1D24] to-[#0f1218] rounded-2xl border border-white/5 shadow-2xl mt-4 max-md:mx-3 relative overflow-hidden group">
            <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full group-hover:bg-secondary/20 transition-all duration-700" />

            <div className="w-20 h-20 bg-background/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 mb-6 shadow-xl z-10">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3 text-center z-10">
              {categorySlug ? `Nada em “${categorySlug}” ainda` : "Bem-vindo à Nexus!"}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8 z-10">
              {categorySlug
                ? "Nenhum post nesta categoria. Seja o primeiro a publicar sobre este assunto."
                : "A comunidade ainda está silenciosa. Que tal quebrar o gelo? Crie o primeiro post e comece a subir de nível interagindo com a galera!"}
            </p>

            <div className="relative z-10">
              <CreatePostModal
                triggerNode={
                  <button
                    type="button"
                    className="min-h-11 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform"
                  >
                    Fazer a Primeira Postagem
                  </button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
