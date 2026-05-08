"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signIn, signUp } from "@/actions/auth";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = mode === "login"
        ? await signIn(formData)
        : await signUp(formData);

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // Redirect happens via server action — this catch handles the NEXT_REDIRECT "error"
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo / Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-600/30">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-300">
          {mode === "login"
            ? "Sign in to your university portal"
            : "Join the university management system"}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600 animate-fade-in">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <Input
            id="full_name"
            name="full_name"
            label="Full Name"
            placeholder="John Doe"
            required
          />
        )}

        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="you@email.com"
          required
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          minLength={6}
          required
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center text-sm text-surface-500 dark:text-surface-300">
        {mode === "login" ? (
          <>
            <Link href="/reset-password" className="text-primary-600 hover:text-primary-700 font-medium">
              Forgot password?
            </Link>
            <p className="mt-3">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </>
        ) : (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
