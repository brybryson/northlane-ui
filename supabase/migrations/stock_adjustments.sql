-- Stock Adjustments Table for Inventory Audit Trail
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  adjustment_type text NOT NULL, -- 'received', 'returned', 'damaged', 'correction', 'written_off', 'reserved'
  quantity_change integer NOT NULL, -- positive = stock in, negative = stock out
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  notes text,
  reference text, -- PO number, RMA number, etc.
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stock_adjustments' AND policyname = 'Admin can do all on stock_adjustments'
  ) THEN
    CREATE POLICY "Admin can do all on stock_adjustments" ON public.stock_adjustments FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

GRANT SELECT, INSERT ON public.stock_adjustments TO authenticated;
