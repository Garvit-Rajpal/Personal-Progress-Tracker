'use client';
import { useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { getErrorMessage } from '@/lib/errorMessage';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isRegistering, registerError } = useAuth();

  const onsubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to home
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button render={<Link href="/login" />} variant="outline" size="sm">
            Log in
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Start tracking your learning roadmap.</CardDescription>
          </CardHeader>
          <form onSubmit={onsubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {registerError ? (
                <p role="alert" className="text-sm text-danger">
                  {getErrorMessage(registerError, 'Registration failed')}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? 'Signing up…' : 'Sign up'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
