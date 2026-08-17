-- Criar função SECURITY DEFINER para criar conversas (contorna RLS)
CREATE OR REPLACE FUNCTION public.create_conversation_with_participants(
  p_other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_current_user_id UUID;
BEGIN
  -- Obter o ID do usuário autenticado
  v_current_user_id := auth.uid();
  
  -- Verificar se o usuário está autenticado
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Verificar se não está tentando conversar consigo mesmo
  IF v_current_user_id = p_other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  -- Verificar se já existe uma conversa entre esses usuários
  SELECT cp1.conversation_id INTO v_conversation_id
  FROM public.conversation_participants cp1
  INNER JOIN public.conversation_participants cp2 
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = v_current_user_id 
    AND cp2.user_id = p_other_user_id;
  
  -- Se já existe, retornar o ID existente
  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;
  
  -- Criar nova conversa
  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO v_conversation_id;
  
  -- Adicionar participantes
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES 
    (v_conversation_id, v_current_user_id),
    (v_conversation_id, p_other_user_id);
  
  RETURN v_conversation_id;
END;
$$;

-- Conceder permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(UUID) TO authenticated;