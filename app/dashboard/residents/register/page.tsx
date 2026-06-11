import React from 'react';
import RegistrationForm from '@/components/residents/RegistrationForm';

export const metadata = {
  title: 'Resident Registration',
};

export default function Page() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Resident Registration</h1>
      <RegistrationForm />
    </div>
  );
}
