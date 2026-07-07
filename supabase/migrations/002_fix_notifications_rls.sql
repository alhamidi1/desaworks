-- Fix critical security vulnerability: notifications INSERT policy
-- Previously: WITH CHECK (true) allowed ANY authenticated user to inject notifications for others
-- Fix: Only allow managers/admins to create notifications

DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;

CREATE POLICY "Managers can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (
    -- Allow managers and admins to create notifications for anyone
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- Keep existing SELECT policy: users can only read their own notifications
-- Keep existing UPDATE policy: users can only update their own notifications
