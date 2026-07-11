import Link from 'next/link';
import { Bot, LibraryBig, LogOut, PlaySquare, Sparkles, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LibraryBig },
  { href: '/dashboard#upload', label: 'Upload', icon: Upload },
  { href: '/dashboard#recommendations', label: 'Recommendations', icon: Sparkles },
  { href: '/dashboard#search', label: 'Search', icon: Bot }
];

export function AppShell({ user, children }: Readonly<{ user: { name: string; email: string } | null; children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6 lg:py-6">
        <aside className="glass-panel flex flex-col gap-6 rounded-3xl p-5">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                <PlaySquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">PlayLite AI</p>
                <p className="text-sm text-slate-300">Video learning workspace</p>
              </div>
            </Link>
            <Card className="border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                {user ? 'Signed in' : 'Guest mode'}
              </p>
              <p className="mt-2 text-lg font-semibold">{user?.name ?? 'Browsing as guest'}</p>
              <p className="text-sm text-slate-400">{user?.email ?? 'Sign in to personalize recommendations.'}</p>
            </Card>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-cyan-300" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            {user ? (
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="ghost" className="w-full justify-start">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </form>
            ) : (
              <Button className="w-full" asChild>
                <Link href="/signup">Create account</Link>
              </Button>
            )}
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}