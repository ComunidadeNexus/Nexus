-- Create user wallets table
CREATE TABLE public.user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallet"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet"
  ON public.user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Create coin transactions table
CREATE TABLE public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'reward', 'spend', 'transfer_in', 'transfer_out', 'refund')),
  description text,
  reference_id uuid,
  reference_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.coin_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create coin packages table
CREATE TABLE public.coin_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  coins integer NOT NULL,
  bonus_coins integer NOT NULL DEFAULT 0,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  is_popular boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages (public read)
CREATE POLICY "Active packages are viewable by everyone"
  ON public.coin_packages FOR SELECT
  USING (is_active = true);

-- Insert default coin packages
INSERT INTO public.coin_packages (name, description, coins, bonus_coins, price, is_popular) VALUES
  ('Iniciante', 'Perfeito para começar', 100, 0, 9.90, false),
  ('Popular', 'Mais vendido!', 500, 50, 39.90, true),
  ('Premium', 'Melhor custo-benefício', 1200, 200, 79.90, false),
  ('Elite', 'Para os mais ativos', 3000, 600, 159.90, false);

-- Create function to initialize wallet for new users
CREATE OR REPLACE FUNCTION public.initialize_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (NEW.id, 50)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Add welcome bonus transaction
  INSERT INTO public.coin_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 50, 'reward', 'Bônus de boas-vindas');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user wallet
DROP TRIGGER IF EXISTS on_user_created_wallet ON auth.users;
CREATE TRIGGER on_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_wallet();

-- Create function to process coin transaction
CREATE OR REPLACE FUNCTION public.process_coin_transaction(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Get current balance
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();