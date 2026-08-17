-- Fix RLS policies for conversations table
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversation" ON public.conversations;

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Participants can update conversation" 
ON public.conversations FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = id AND user_id = auth.uid()
  )
);

-- Fix RLS policies for conversation_participants table
DROP POLICY IF EXISTS "Authenticated users can add participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;

CREATE POLICY "Authenticated users can add participants" 
ON public.conversation_participants FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own participations" 
ON public.conversation_participants FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" 
ON public.conversation_participants FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Fix RLS policies for direct_messages table
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.direct_messages;

CREATE POLICY "Users can send messages to their conversations" 
ON public.direct_messages FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = direct_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view messages in their conversations" 
ON public.direct_messages FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = direct_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their conversations" 
ON public.direct_messages FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = direct_messages.conversation_id 
    AND user_id = auth.uid()
  )
);