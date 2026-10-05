export function authErrorMessage(raw: string, context: "login" | "signup" | "resend" = "login"): string {
  const message = raw.trim();
  const lower = message.toLowerCase();

  if (/email not confirmed|email.*n[aã]o confirmado/i.test(message)) {
    return "Confirme seu e-mail antes de entrar. Se não recebeu, use “Reenviar e-mail de confirmação”.";
  }

  if (/over_email_send_rate_limit|rate limit/i.test(message)) {
    return "Muitas tentativas de e-mail em pouco tempo. Aguarde cerca de 1 hora e tente de novo.";
  }

  if (/invalid login credentials|invalid credentials/i.test(message)) {
    return "E-mail ou senha incorretos.";
  }

  if (/user already registered|already been registered/i.test(message)) {
    return context === "signup"
      ? "Este e-mail já está cadastrado. Faça login ou recupere a senha."
      : "Este e-mail já está cadastrado.";
  }

  if (/not enabled|unsupported provider|provider is not/i.test(message)) {
    return "Login com Google ainda não está ativado. Use e-mail e senha.";
  }

  if (/email address.*invalid|invalid email/i.test(message)) {
    return "E-mail inválido ou não aceito. Use um endereço real (ex.: Gmail, Outlook).";
  }

  if (context === "resend" && /signup.*disabled|signups not allowed/i.test(lower)) {
    return "Cadastros estão temporariamente desativados.";
  }

  return message || "Não foi possível concluir. Tente novamente.";
}
