'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn, loginError } = useAuth();

  const onsubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="text-sm font-medium text-neutral-300 hover:text-white">← Back to home</Link>
        <Link href="/register" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10">
          Sign up
        </Link>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-white/10 bg-white/5 text-white backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to your learning tracker</CardDescription>
        </CardHeader>
        <form onSubmit={onsubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {loginError && <p className="text-red-400 text-sm">{(loginError as any).response?.data?.error || 'Login failed'}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Log in'}
            </Button>
            <p className="text-sm text-neutral-400">
              Don't have an account? <Link href="/register" className="text-white hover:underline">Sign up</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
