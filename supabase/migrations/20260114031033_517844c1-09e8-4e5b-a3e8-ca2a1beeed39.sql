-- Fix Issue 1: Restrict coin_transactions INSERT to prevent client 'purchase' type
-- Fix Issue 3: Update dm-media storage policies to verify conversation membership

-- Drop existing INSERT policy on coin_transactions
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.coin_transactions;

-- Create new policy that blocks 'purchase' type from client (only server/SECURITY DEFINER can insert purchases)
CREATE POLICY "Users can create non-purchase transactions"
ON public.coin_transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND type IN ('spend', 'reward', 'transfer_in', 'transfer_out', 'refund')
);

-- Drop existing weak dm-media storage policies
DROP POLICY IF EXISTS "DM media accessible by conversation participants" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload DM media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their DM media" ON storage.objects;

-- Create proper dm-media SELECT policy that checks conversation membership
CREATE POLICY "DM media accessible by conversation participants"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dm-media' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
  )
);

-- Create dm-media INSERT policy that checks conversation membership
CREATE POLICY "Users can upload DM media to their conversations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dm-media'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
  )
);

-- Create dm-media DELETE policy for own uploads
CREATE POLICY "Users can delete their own DM media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dm-media'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[2]
);