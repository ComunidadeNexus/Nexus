-- Drop políticas com erro de referência
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversation" ON public.conversations;

-- Recriar política SELECT com referência correta (conversations.id)
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id 
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Recriar política UPDATE com referência correta (conversations.id)
CREATE POLICY "Participants can update conversation" 
ON public.conversations FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id 
    AND conversation_participants.user_id = auth.uid()
  )
);