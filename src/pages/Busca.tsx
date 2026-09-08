import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import SearchBar from "@/components/community/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Hexagon, FileText, Search as SearchIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/feed/PostCard";
import { Link } from "react-router-dom";

const Busca = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    posts: [] as any[],
    users: [] as any[],
    nucleos: [] as any[],
  });

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ posts: [], users: [], nucleos: [] });
      return;
    }

    setLoading(true);
    try {
      // Search Posts
      const { data: posts } = await supabase
        .from("posts")
        .select(
          `
          id, user_id, nucleo_id, title, content, media_url, media_type, 
          upvotes_count, downvotes_count, comments_count, created_at,
          profiles:user_id(username, avatar_url),
          nucleos(name, slug)
        `,
        )
        .textSearch("content", searchQuery, { type: "websearch" })
        .limit(20);

      // Se textSearch não funcionar bem com o título/conteúdo, usamos ilike como fallback
      let postsResult = posts;
      if (!posts || posts.length === 0) {
        const { data: fallbackPosts } = await supabase
          .from("posts")
          .select(
            `
            id, user_id, nucleo_id, title, content, media_url, media_type, 
            upvotes_count, downvotes_count, comments_count, created_at,
            profiles:user_id(username, avatar_url),
            nucleos(name, slug)
          `,
          )
          .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
          .limit(20);
        postsResult = fallbackPosts;
      }

      // Search Users
      const { data: users } = await supabase
        .from("profiles")
        .select("user_id, username, name, avatar_url, bio")
        .or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(20);

      // Search Nucleos
      const { data: nucleos } = await supabase
        .from("nucleos")
        .select("id, name, slug, description")
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(20);

      setResults({
        posts: postsResult || [],
        users: users || [],
        nucleos: nucleos || [],
      });
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== initialQuery) {
        navigate(`/busca?q=${encodeURIComponent(query)}`, { replace: true });
      }
      performSearch(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#152024] pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto pt-24 px-4">
        <div className="mb-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar posts, usuários ou núcleos..."
          />
        </div>

        {query.trim() === "" ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <SearchIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>Digite algo para começar a buscar</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6 bg-white dark:bg-[#1A282D]">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Posts</span>
                <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-xs px-2 py-0.5 rounded-full">
                  {results.posts.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Contas</span>
                <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-xs px-2 py-0.5 rounded-full">
                  {results.users.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="nucleos" className="flex items-center gap-2">
                <Hexagon className="w-4 h-4" />
                <span className="hidden sm:inline">Núcleos</span>
                <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-xs px-2 py-0.5 rounded-full">
                  {results.nucleos.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {results.posts.length > 0 ? (
                results.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    postId={post.id}
                    nucleus={post.nucleos?.name || "geral"}
                    author={post.profiles?.username || "Usuário"}
                    authorId={post.user_id}
                    authorAvatar={post.profiles?.avatar_url}
                    timeAgo={new Date(post.created_at).toLocaleDateString()}
                    title={post.title || ""}
                    content={post.content || ""}
                    votes={post.upvotes_count || 0}
                    comments={post.comments_count || 0}
                    mediaUrl={post.media_url}
                    mediaType={post.media_type}
                    userVote={null}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">Nenhum post encontrado.</div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {results.users.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.users.map((user) => (
                    <Link
                      key={user.user_id}
                      to={`/perfil/${user.user_id}`}
                      className="flex items-center gap-4 bg-white dark:bg-[#1A282D] p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {user.username}
                        </h4>
                        {user.name && <p className="text-sm text-gray-500">{user.name}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">Nenhuma conta encontrada.</div>
              )}
            </TabsContent>

            <TabsContent value="nucleos" className="space-y-4">
              {results.nucleos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.nucleos.map((nucleo) => (
                    <Link
                      key={nucleo.id}
                      to={`/nucleo/${nucleo.slug}`}
                      className="flex flex-col bg-white dark:bg-[#1A282D] p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        n/{nucleo.name}
                      </h4>
                      {nucleo.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{nucleo.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">Nenhum núcleo encontrado.</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Busca;
