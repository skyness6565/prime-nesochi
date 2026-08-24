-- Add a note/narration column to transactions so admin-applied fees carry a reason
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS note text;

-- Allow admins to insert transaction records for any user (e.g. fee deductions)
CREATE POLICY "Admins can insert transactions for users"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));