CREATE OR REPLACE FUNCTION public.protect_producer_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.is_producer := OLD.is_producer;
  NEW.producer_status := OLD.producer_status;
  NEW.cakto_account_id := OLD.cakto_account_id;
  NEW.cakto_account_status := OLD.cakto_account_status;
  NEW.cakto_customer_id := OLD.cakto_customer_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_producer_profile_columns ON public.profiles;
CREATE TRIGGER protect_producer_profile_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_producer_profile_columns();

REVOKE ALL ON FUNCTION public.protect_producer_profile_columns() FROM PUBLIC, anon, authenticated;
