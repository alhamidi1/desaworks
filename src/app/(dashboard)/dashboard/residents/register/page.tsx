import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RegisterPageClient } from './client-wrapper';

export const metadata = {
  title: 'Daftar Warga — DesaWorks',
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'manager' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return <RegisterPageClient />;
}
