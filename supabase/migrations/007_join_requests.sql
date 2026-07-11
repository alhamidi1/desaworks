-- 007_join_requests
-- Manager-invite onboarding model: the public /register page submits a "request to
-- join" (with consent captured up front); a manager reviews and approves it, which
-- creates the real auth account. No public self-signup of accounts.

CREATE TABLE public.join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  message text,
  agreed_to_tos boolean NOT NULL DEFAULT false,
  agreed_to_privacy boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_join_requests_status ON public.join_requests(status);

ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- Public intake: anyone may submit a request (this is an intentional public contact
-- form, gated to rows that assert consent — not an open write to app data).
CREATE POLICY "Anyone can submit a join request" ON public.join_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (agreed_to_tos = true AND agreed_to_privacy = true);

-- Only managers/admins can read and triage requests.
CREATE POLICY "Managers read join requests" ON public.join_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );

CREATE POLICY "Managers update join requests" ON public.join_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );
