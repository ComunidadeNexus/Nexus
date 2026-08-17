-- Drop the problematic recursive RLS policy
DROP POLICY IF EXISTS "Users can view their own participations" ON conversation_participants;

-- Create a simplified non-recursive policy
CREATE POLICY "Users can view their own participations" ON conversation_participants
FOR SELECT
USING (user_id = auth.uid());