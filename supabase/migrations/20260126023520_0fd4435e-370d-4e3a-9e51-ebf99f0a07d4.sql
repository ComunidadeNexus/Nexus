-- FIX 1: Block direct INSERT on conversations/conversation_participants tables
-- Force all conversation creation through the secure RPC function

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can add participants" ON conversation_participants;

-- Create restrictive policies that block direct inserts (RPC function uses SECURITY DEFINER to bypass)
CREATE POLICY "Block direct conversation creation"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Block direct participant addition"
ON conversation_participants FOR INSERT
TO authenticated
WITH CHECK (false);

-- FIX 2: Add auth.uid() validation to process_coin_transaction function
-- Prevent users from manipulating other users' wallets

CREATE OR REPLACE FUNCTION public.process_coin_transaction(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
  caller_id uuid := auth.uid();
  is_service_role boolean;
BEGIN
  -- Check if caller is service_role (for webhooks like Stripe)
  is_service_role := COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role',
    false
  );
  
  -- CRITICAL: Verify caller owns the wallet OR is service_role
  IF caller_id IS NOT NULL AND caller_id != p_user_id AND NOT is_service_role THEN
    RAISE EXCEPTION 'Cannot modify another user''s wallet';
  END IF;
  
  -- Validate transaction type - only service_role can create 'purchase' transactions
  IF p_type = 'purchase' AND NOT is_service_role THEN
    RAISE EXCEPTION 'Purchase transactions must come from payment webhooks';
  END IF;
  
  -- Validate allowed transaction types for regular users
  IF NOT is_service_role AND p_type NOT IN ('spend', 'reward', 'transfer_in', 'transfer_out', 'refund') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_type;
  END IF;
  
  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Transaction amount must be positive';
  END IF;
  
  -- Get current balance with lock
  SELECT balance INTO current_balance FROM public.user_wallets WHERE user_id = p_user_id FOR UPDATE;
  
  -- Check if wallet exists, create if not
  IF current_balance IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance) VALUES (p_user_id, 0);
    current_balance := 0;
  END IF;
  
  -- For spending, check if user has enough balance
  IF p_type IN ('spend', 'transfer_out') AND current_balance < p_amount THEN
    RETURN false;
  END IF;
  
  -- Update wallet balance
  IF p_type IN ('purchase', 'reward', 'transfer_in', 'refund') THEN
    UPDATE public.user_wallets 
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_wallets 
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Record transaction
  INSERT INTO public.coin_transactions (user_id, amount, type, description, reference_id, reference_type)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, p_reference_type);
  
  RETURN true;
END;
$$;