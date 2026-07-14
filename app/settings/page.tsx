import { redirect } from 'next/navigation';

import { AppShell } from '@/components/app-shell';
import { SettingsForm } from '@/components/settings-form';
import { getCurrentUser } from '@/lib/auth';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Account</p>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your profile, learning preferences, and password.</p>
        </div>
        <SettingsForm user={user} />
      </div>
    </AppShell>
  );
}