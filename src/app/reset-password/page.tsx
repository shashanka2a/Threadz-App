"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const recoveryTokensRef = useRef<{ access_token: string; refresh_token: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const finishCheck = (hasSession: boolean) => {
      if (!mounted) return;
      setSessionReady(hasSession);
      setCheckingSession(false);
    };

    const checkSession = async () => {
      // 1. Check URL hash (implicit grant recovery: #access_token=...&refresh_token=...&type=recovery)
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && refreshToken && (type === "recovery" || !type)) {
        recoveryTokensRef.current = {
          access_token: accessToken,
          refresh_token: refreshToken,
        };
        const { error, data } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data.session) {
          window.history.replaceState({}, "", "/reset-password");
          finishCheck(true);
          return;
        }
      }

      // 2. Check query params (OTP token_hash, token, or PKCE code directly on /reset-password)
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash") || params.get("token");
      const otpType = params.get("type");
      const code = params.get("code");

      if (tokenHash) {
        const { error, data } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (otpType as "recovery") || "recovery",
        });
        if (!error && data.session) {
          window.history.replaceState({}, "", "/reset-password");
          finishCheck(true);
          return;
        }
      }

      if (code) {
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          window.history.replaceState({}, "", "/reset-password");
          finishCheck(true);
          return;
        }
      }

      // 3. Check existing cookie-based or memory session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        finishCheck(true);
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      finishCheck(Boolean(currentUser));
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        if (session) {
          setSessionReady(true);
          setCheckingSession(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const hasRecoverySession = sessionReady || Boolean(user);
  const isChecking = loading || checkingSession;

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

    const supabase = createClient();
    let {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && recoveryTokensRef.current) {
      const { data, error: setSessionError } = await supabase.auth.setSession(
        recoveryTokensRef.current
      );
      if (!setSessionError && data.session) {
        session = data.session;
      }
    }

    if (!session) {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error("Your reset session has expired or is missing. Please request a new password reset link.");
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    toast.success("Password updated successfully");
    setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, 1200);
  };

  if (isChecking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
        Verifying password reset session...
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-border rounded-none bg-card shadow-sm">
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-serif text-foreground">Password updated</h1>
            <p className="text-sm text-muted-foreground">
              Your password has been changed successfully. Redirecting you to your profile...
            </p>
            <Button
              onClick={() => {
                router.push("/profile");
                router.refresh();
              }}
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-11"
            >
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-border rounded-none bg-card shadow-sm">
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-serif text-foreground">Link invalid or expired</h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid, has expired, or was already used. Please request a new link to reset your password.
            </p>
            <Button asChild className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-11">
              <Link href="/forgot-password">Request new reset link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border rounded-none bg-card shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-sm shrink-0">
              <KeyRound className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-foreground">Choose new password</h1>
              <p className="text-sm text-muted-foreground">Enter a new password for your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-none border-border bg-background text-base min-h-11 focus-visible:border-foreground"
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-none border-border bg-background text-base min-h-11 focus-visible:border-foreground"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-11 text-base font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
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
        <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

