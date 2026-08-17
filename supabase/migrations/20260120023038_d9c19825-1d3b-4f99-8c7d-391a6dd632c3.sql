-- Drop e recriar política de INSERT para conversations
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

-- Recriar política de INSERT permitindo que usuários autenticados criem conversas
CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations FOR INSERT 
TO authenticated
WITH CHECK (true);