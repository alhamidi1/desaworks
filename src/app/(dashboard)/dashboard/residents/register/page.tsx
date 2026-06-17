import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RegistrationForm from '@/components/residents/RegistrationForm';

export const metadata = {
  title: 'Resident Registration — DesaWorks',
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'manager' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Resident Registration</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.03)]">
        <RegistrationForm />
      </div>
    </div>
  );
}
