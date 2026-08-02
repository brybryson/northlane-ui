-- ====================================================================
-- Northlane Database Security & Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Enable RLS on Products Table
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow admin insert/update/delete on products"
  ON public.products FOR ALL
  USING (public.has_role('admin', auth.uid()));

-- 2. Enable RLS on Stock Adjustments Table
ALTER TABLE IF EXISTS public.stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access to stock_adjustments"
  ON public.stock_adjustments FOR ALL
  USING (public.has_role('admin', auth.uid()));

-- 3. Enable RLS on Journal Posts Table
ALTER TABLE IF EXISTS public.journal_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to journal_posts"
  ON public.journal_posts FOR SELECT
  USING (true);

CREATE POLICY "Allow admin manage journal_posts"
  ON public.journal_posts FOR ALL
  USING (public.has_role('admin', auth.uid()));

-- 4. Enable RLS on Customer Stories Table
ALTER TABLE IF EXISTS public.customer_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to customer_stories"
  ON public.customer_stories FOR SELECT
  USING (true);

CREATE POLICY "Allow admin manage customer_stories"
  ON public.customer_stories FOR ALL
  USING (public.has_role('admin', auth.uid()));

-- 5. Enable RLS on User Roles Table
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admin full manage on user_roles"
  ON public.user_roles FOR ALL
  USING (public.has_role('admin', auth.uid()));
