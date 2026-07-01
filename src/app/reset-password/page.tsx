"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function ResetPasswordForm() {
  const router = useRouter();
  const { user, loading, updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Reset link is invalid or has expired");
    }
  }, [loading, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const result = await updatePassword(password);
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Password updated successfully");
    router.push("/profile");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-neutral-600">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-neutral-200 rounded-none">
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="text-2xl font-serif">Link expired</h1>
            <p className="text-sm text-neutral-600">
              This password reset link is invalid or has expired. Request a new one to continue.
            </p>
            <Button asChild className="w-full rounded-none bg-black text-white hover:bg-neutral-800">
              <Link href="/forgot-password">Request new reset link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-neutral-200 rounded-none">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-serif">Choose new password</h1>
              <p className="text-sm text-neutral-600">Enter a new password for your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-none border-neutral-300"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-none border-neutral-300"
                minLength={6}
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
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-neutral-600">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
