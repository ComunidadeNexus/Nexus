import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Zap, ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const signupSchema = loginSchema
  .extend({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e _"),
    confirmPassword: z.string(),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "Você deve aceitar as Regras da Comunidade" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const getSafeNextPath = (raw: string | null) => {
  if (!raw) return "/comunidade";
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//") && !decoded.includes("://")) {
      return decoded;
    }
  } catch {
    return "/comunidade";
  }
  return "/comunidade";
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get("mode") === "signup");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { signIn, signUp, signInWithOAuth, user, signingOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (user && !signingOut) {
      navigate(nextPath);
    }
  }, [user, signingOut, navigate, nextPath]);

  useEffect(() => {
    const searchError = searchParams.get("error_description") || searchParams.get("error");
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hashParams.get("error_description") || hashParams.get("error");
    const oauthError = searchError || hashError;
    if (oauthError) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: decodeURIComponent(oauthError.replace(/\+/g, " ")),
      });
    }
  }, [searchParams, toast]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      username: "",
      confirmPassword: "",
      termsAccepted: undefined,
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error.message,
      });
    } else {
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });
      navigate(nextPath);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.name, data.username);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Você já pode usar a plataforma.",
      });
      navigate("/comunidade");
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: error.message,
      });
    } else {
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
      setIsForgotPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Back Button */}
        {isForgotPassword && (
          <button
            onClick={() => setIsForgotPassword(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        )}

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">Nexus</span>
          </div>

          {/* Toggle */}
          {!isForgotPassword && (
            <div className="flex mb-8 p-1 rounded-lg bg-muted/50">
              <button
                onClick={() => setIsSignup(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isSignup ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setIsSignup(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isSignup ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Forms */}
          {isForgotPassword ? (
            <form
              onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold">Esqueceu sua senha?</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Digite seu e-mail abaixo e enviaremos as instruções para você redefinir sua senha.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                  {...forgotPasswordForm.register("email")}
                />
                {forgotPasswordForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {forgotPasswordForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Enviar E-mail de Recuperação"
                )}
              </Button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar para o Login
              </button>
            </form>
          ) : !isSignup ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  {...signupForm.register("name")}
                />
                {signupForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username (@)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="username"
                    type="text"
                    placeholder="seunome"
                    className="pl-8"
                    {...signupForm.register("username")}
                  />
                </div>
                {signupForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="seu@email.com"
                  {...signupForm.register("email")}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  {...signupForm.register("password")}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  {...signupForm.register("confirmPassword")}
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  {...signupForm.register("termsAccepted")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Eu concordo com as{" "}
                    <a href="/regras" target="_blank" className="text-primary hover:underline">
                      Regras da Comunidade
                    </a>
                  </label>
                  {signupForm.formState.errors.termsAccepted && (
                    <p className="text-sm text-destructive mt-1">
                      {signupForm.formState.errors.termsAccepted.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Conta"}
              </Button>
            </form>
          )}

          {/* Social Logins */}
          {!isForgotPassword && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1a1f2e] px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    setOauthError(null);
                    setIsLoading(true);
                    const { error } = await signInWithOAuth("google");
                    setIsLoading(false);
                    if (error) {
                      const message =
                        error.message ||
                        "Login com Google ainda não está ativado. Entre com email e senha.";
                      setOauthError(message);
                      toast({
                        variant: "destructive",
                        title: "Erro ao entrar",
                        description: message,
                      });
                    }
                  }}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Google
                </Button>
                {oauthError && <p className="text-sm text-destructive text-center">{oauthError}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
