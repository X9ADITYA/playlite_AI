"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type SettingsUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  preferences: {
    topics: string[];
    languages: string[];
    learningGoals: string[];
    maxVideoDurationMinutes?: number;
  };
};

function Field({
  label,
  htmlFor,
  hint,
  error,
  children
}: Readonly<{ label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode }>) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-rose-300">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function SettingsForm({ user }: Readonly<{ user: SettingsUser }>) {
  const router = useRouter();

  // Profile state
  const [name, setName] = useState(user.name);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preferences state
  const [topics, setTopics] = useState(user.preferences.topics.join(', '));
  const [learningGoals, setLearningGoals] = useState(user.preferences.learningGoals.join(', '));
  const [languages, setLanguages] = useState(user.preferences.languages.join(', '));
  const [maxDuration, setMaxDuration] = useState(String(user.preferences.maxVideoDurationMinutes ?? 20));
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to save profile');

      setProfileMessage({ type: 'success', text: 'Profile updated.' });
      router.refresh();
    } catch (error) {
      setProfileMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save profile' });
    } finally {
      setProfileLoading(false);
    }
  }

  async function savePreferences(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPrefsLoading(true);
    setPrefsMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            topics: topics.split(',').map((v) => v.trim()).filter(Boolean),
            learningGoals: learningGoals.split(',').map((v) => v.trim()).filter(Boolean),
            languages: languages.split(',').map((v) => v.trim()).filter(Boolean),
            maxVideoDurationMinutes: Number(maxDuration || 20)
          }
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to save preferences');

      setPrefsMessage({ type: 'success', text: 'Preferences updated.' });
      router.refresh();
    } catch (error) {
      setPrefsMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save preferences' });
    } finally {
      setPrefsLoading(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to change password');

      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card className="glass-panel border-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Profile</p>
            <h2 className="text-xl font-semibold">Your details</h2>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={saveProfile}>
          <Field label="Full name" htmlFor="settings-name">
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email address" htmlFor="settings-email" hint="Email cannot be changed here.">
            <Input id="settings-email" value={user.email} disabled className="opacity-60" />
          </Field>
          {profileMessage ? (
            <p className={`text-sm ${profileMessage.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
              {profileMessage.text}
            </p>
          ) : null}
          <Button type="submit" disabled={profileLoading} className="w-fit">
            {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </Button>
        </form>
      </Card>

      {/* Preferences */}
      <Card className="glass-panel border-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Learning</p>
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={savePreferences}>
          <Field label="Topics you like" htmlFor="settings-topics" hint="Comma separated">
            <Textarea id="settings-topics" value={topics} onChange={(e) => setTopics(e.target.value)} rows={2} />
          </Field>
          <Field label="Learning goals" htmlFor="settings-goals" hint="Comma separated">
            <Textarea id="settings-goals" value={learningGoals} onChange={(e) => setLearningGoals(e.target.value)} rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preferred languages" htmlFor="settings-languages" hint="Comma separated, e.g. en, hi">
              <Input id="settings-languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />
            </Field>
            <Field label="Max video length" htmlFor="settings-duration" hint="1–180 minutes">
              <Input
                id="settings-duration"
                type="number"
                min="1"
                max="180"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
              />
            </Field>
          </div>
          {prefsMessage ? (
            <p className={`text-sm ${prefsMessage.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
              {prefsMessage.text}
            </p>
          ) : null}
          <Button type="submit" disabled={prefsLoading} className="w-fit">
            {prefsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save preferences
          </Button>
        </form>
      </Card>

      {/* Security */}
      <Card className="glass-panel border-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Security</p>
            <h2 className="text-xl font-semibold">Change password</h2>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={changePassword}>
          <Field label="Current password" htmlFor="settings-current-password">
            <Input
              id="settings-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" htmlFor="settings-new-password" hint="At least 8 characters">
              <Input
                id="settings-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="settings-confirm-password">
              <Input
                id="settings-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
          </div>
          {passwordMessage ? (
            <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
              {passwordMessage.text}
            </p>
          ) : null}
          <Button type="submit" disabled={passwordLoading} className="w-fit">
            {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}