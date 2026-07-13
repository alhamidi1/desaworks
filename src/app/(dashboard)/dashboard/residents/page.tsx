import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listResidents } from '@/lib/actions/residents';
import { ResidentsDirectory } from '@/components/residents/ResidentsDirectory';

export const metadata = {
  title: 'Kelola Warga — DesaWorks',
};

export default async function ResidentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'manager' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const result = await listResidents();
  const residents = result.ok ? result.data : [];

  return <ResidentsDirectory residents={residents} />;
}
