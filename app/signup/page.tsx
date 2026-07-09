import Link from 'next/link';

import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm uppercase tracking-[0.32em] text-cyan-300">
          PlayLite AI
        </Link>
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}