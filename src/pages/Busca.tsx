import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "@/components/community/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Hexagon, FileText, Search as SearchIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/feed/PostCard";
import { Link } from "react-router-dom";
import { displayPostAuthor, displayPostTitle, mapFeedPosts, type FeedPost } from "@/lib/feedPosts";
import { buildPostsSearchOr, POST_SEARCH_COLUMNS } from "@/lib/searchPosts";

const Busca = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    posts: [] as FeedPost[],
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
      const postsOr = buildPostsSearchOr(searchQuery);
      let mappedPosts: FeedPost[] = [];

      if (postsOr) {
        // Flat select — same columns as the feed. Nested embeds + textSearch
        // were the Posts=0 hole: FTS misses short title tokens, and a join
        // error skipped the ilike fallback.
        const { data: postRows, error: postsError } = await supabase
          .from("posts")
          .select(POST_SEARCH_COLUMNS)
          .eq("is_hidden", false)
          .or(postsOr)
          .order("created_at", { ascending: false })
          .limit(20);

        if (postsError) {
          console.error("Erro na busca de posts:", postsError);
        } else {
          const rows = postRows || [];
          const userIds = [...new Set(rows.map((p) => p.user_id).filter(Boolean))];
          const nucleoIds = [...new Set(rows.map((p) => p.nucleo_id).filter(Boolean))];

          const [{ data: profilesData }, { data: nucleosData }] = await Promise.all([
            userIds.length
              ? supabase
                  .from("profiles")
                  .select("user_id, name, username, avatar_url")
                  .in("user_id", userIds)
              : Promise.resolve({
                  data: [] as {
                    user_id: string;
                    name: string | null;
                    username: string | null;
                    avatar_url: string | null;
                  }[],
                }),
            nucleoIds.length
              ? supabase.from("nucleos").select("id, slug, name").in("id", nucleoIds)
              : Promise.resolve({
                  data: [] as { id: string; slug: string | null; name: string | null }[],
                }),
          ]);

          const profiles: Record<
            string,
            { name: string | null; username: string | null; avatar_url: string | null }
          > = {};
          profilesData?.forEach((p) => {
            profiles[p.user_id] = {
              name: p.name,
              username: p.username,
              avatar_url: p.avatar_url,
            };
          });
          const nucleosMap: Record<string, { slug: string | null; name: string | null }> = {};
          nucleosData?.forEach((n) => {
            nucleosMap[n.id] = { slug: n.slug, name: n.name };
          });

          mappedPosts = mapFeedPosts(rows, { profiles, nucleos: nucleosMap });
        }
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
        posts: mappedPosts,
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
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery((prev) => (prev === q ? prev : q));
  }, [location.search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const encoded = query.trim() ? `/busca?q=${encodeURIComponent(query.trim())}` : "/busca";
      if (`${location.pathname}${location.search}` !== encoded) {
        navigate(encoded, { replace: true });
      }
      performSearch(query);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="w-full min-w-0 pb-4">
      <div className="mb-6">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={() => {
            const encoded = query.trim()
              ? `/busca?q=${encodeURIComponent(query.trim())}`
              : "/busca";
            navigate(encoded);
            performSearch(query);
          }}
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
                  nucleus={post.nucleo?.slug || "geral"}
                  author={displayPostAuthor(post)}
                  authorId={post.user_id}
                  authorAvatar={post.author?.avatar_url}
                  timeAgo={new Date(post.created_at).toLocaleDateString()}
                  title={displayPostTitle(post)}
                  content={typeof post.content === "string" ? post.content : ""}
                  votes={(post.upvotes_count ?? 0) - (post.downvotes_count ?? 0)}
                  comments={post.comments_count ?? 0}
                  mediaUrl={post.media_url || undefined}
                  mediaType={post.media_type || undefined}
                  userVote={post.user_vote}
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
    </div>
  );
};

export default Busca;
