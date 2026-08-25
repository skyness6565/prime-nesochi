CREATE TABLE public.user_transfer_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id text NOT NULL,
  symbol text NOT NULL,
  fee_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, coin_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_transfer_fees TO authenticated;
GRANT ALL ON public.user_transfer_fees TO service_role;

ALTER TABLE public.user_transfer_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage transfer fees"
ON public.user_transfer_fees
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own transfer fees"
ON public.user_transfer_fees
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_transfer_fees_updated_at
BEFORE UPDATE ON public.user_transfer_fees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();