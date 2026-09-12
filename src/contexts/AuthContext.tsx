import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  clearClientSignedOut,
  clearPersistedSupabaseAuth,
  hasClientSignedOut,
  markClientSignedOut,
} from "@/lib/authStorage";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signingOut: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    username: string,
  ) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: "google" | "discord" | "github") => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SIGN_OUT_TIMEOUT_MS = 2500;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(() => hasClientSignedOut());
  const { toast } = useToast();
  const navigate = useNavigate();
  const signingOutRef = useRef(signingOut);

  const beginSignedOut = () => {
    signingOutRef.current = true;
    markClientSignedOut();
    setSigningOut(true);
    setSession(null);
    setUser(null);
  };

  const endSignedOut = () => {
    signingOutRef.current = false;
    clearClientSignedOut();
    setSigningOut(false);
  };

  useEffect(() => {
    let settled = false;
    const applySession = (nextSession: Session | null) => {
      if ((signingOutRef.current || hasClientSignedOut()) && nextSession) {
        // In-memory supabase session / late TOKEN_REFRESHED must not revive the user.
        clearPersistedSupabaseAuth();
        setSession(null);
        setUser(null);
        setSigningOut(true);
        setLoading(false);
        settled = true;
        return;
      }
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      settled = true;
    };

    // Set up auth state listener BEFORE checking session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    // Check for existing session — always clear loading, including reject/hang.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        applySession(session);
      })
      .catch((error) => {
        console.error("Error reading auth session:", error);
        if (!settled) setLoading(false);
      });

    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        console.warn("Auth session check timed out");
        setLoading(false);
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    endSignedOut();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    endSignedOut();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name,
            username,
          },
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithOAuth = async (provider: "google" | "discord" | "github") => {
    endSignedOut();
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseKey },
      });
      if (!settingsRes.ok) {
        throw new Error("Não foi possível conectar ao servidor de autenticação.");
      }
      const settings = await settingsRes.json();
      if (!settings?.external?.[provider]) {
        throw new Error(
          provider === "google"
            ? "Login com Google ainda não está ativado. Entre com email e senha."
            : "Este login social ainda não está disponível.",
        );
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error("Não foi possível iniciar o login social.");

      window.location.assign(data.url);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    beginSignedOut();
    // Wipe first so a hung lock/network signOut cannot leave this device logged in.
    clearPersistedSupabaseAuth();
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
    navigate("/auth", { replace: true });

    try {
      // Default scope is `global` and can return early without _removeSession
      // (network / lock / non-401 logout API error). Fall back to local, then wipe again.
      await Promise.race([
        (async () => {
          const { error } = await supabase.auth.signOut({ scope: "global" });
          if (error) {
            await supabase.auth.signOut({ scope: "local" });
          }
        })(),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, SIGN_OUT_TIMEOUT_MS);
        }),
      ]);
    } catch (error) {
      console.error("Error during signOut:", error);
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // storage wipe below is the guarantee
      }
    } finally {
      clearPersistedSupabaseAuth();
      beginSignedOut();
    }
  };

  useEffect(() => {
    console.log("AuthContext state updated:", { user: !!user, session: !!session, loading });
  }, [user, session, loading]);

  return (
    <AuthContext.Provider
      value={{
        user: signingOut ? null : user,
        session: signingOut ? null : session,
        loading: signingOut ? false : loading,
        signingOut,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
