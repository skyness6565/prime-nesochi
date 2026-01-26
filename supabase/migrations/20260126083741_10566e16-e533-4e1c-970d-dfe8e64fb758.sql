-- Allow admins to update user wallet addresses
CREATE POLICY "Admins can update wallet addresses" 
ON public.user_wallets 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert wallet addresses for users
CREATE POLICY "Admins can insert wallet addresses" 
ON public.user_wallets 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete wallet addresses
CREATE POLICY "Admins can delete wallet addresses" 
ON public.user_wallets 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));