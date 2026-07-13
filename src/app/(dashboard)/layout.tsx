import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch user profile from public.profiles to get their name and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // If profile doesn't exist, sign them out and redirect to login
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface">
      {/* Sidebar with role-based navigation */}
      <Sidebar role={profile.role} userName={profile.full_name} />

      {/* Main content area — pb-24 clears the fixed mobile bottom nav */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:py-8 lg:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
