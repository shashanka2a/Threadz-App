"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/profile";
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const result = await signIn(email, password);
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back");
    router.push(nextPath);
    router.refresh();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-neutral-200 rounded-none">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-serif">Sign In</h1>
              <p className="text-sm text-neutral-600">Access your profile and saved addresses</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="rounded-none border-neutral-300"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  href={
                    nextPath !== "/profile"
                      ? `/forgot-password?next=${encodeURIComponent(nextPath)}`
                      : "/forgot-password"
                  }
                  className="text-xs text-neutral-600 underline underline-offset-4 hover:text-black"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="rounded-none border-neutral-300"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-none bg-black text-white hover:bg-neutral-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-sm text-neutral-600 mt-6 text-center">
            New to THREADZ?{" "}
            <Link
              href={
                nextPath !== "/profile"
                  ? `/signup?next=${encodeURIComponent(nextPath)}`
                  : "/signup"
              }
              className="text-black underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-neutral-600">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
