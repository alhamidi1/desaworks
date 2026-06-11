import React from 'react';

export default function Home() {
  return (
    <main style={{padding:32,fontFamily:'sans-serif'}}>
      <h1>DesaWorks — Development</h1>
      <p>
        The app uses the App Router. Open the registration page:{' '}
        <a href="/dashboard/residents/register">Resident Registration</a>
      </p>
    </main>
  );
}
