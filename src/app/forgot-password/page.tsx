"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/profile";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (callbackError === "auth_callback_failed") {
      toast.error("The password reset link was invalid or has expired. Please request a new one.");
    }
  }, [callbackError]);

  const loginHref =
    nextPath !== "/profile"
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Could not send reset email");
      }

      setEmailSent(true);
      toast.success("Password reset email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border rounded-none bg-card shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-sm shrink-0">
              {emailSent ? (
                <MailCheck className="h-5 w-5 text-foreground" aria-hidden="true" />
              ) : (
                <KeyRound className="h-5 w-5 text-foreground" aria-hidden="true" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif text-foreground">Reset password</h1>
              <p className="text-sm text-muted-foreground">
                {emailSent
                  ? "Check your inbox for the reset link"
                  : "We will email you a link to choose a new password"}
              </p>
            </div>
          </div>

          {callbackError === "auth_callback_failed" && !emailSent && (
            <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <p>Your previous reset link has expired or was already used. Enter your email below to request a new one.</p>
            </div>
          )}

          {emailSent ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                If an account exists for <span className="font-medium text-foreground">{email}</span>,
                you will receive a password reset email shortly.
              </p>
              <p>Open the link in that email to set a new password. The link expires after a short time.</p>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-none border-border text-foreground hover:bg-muted"
                onClick={() => setEmailSent(false)}
              >
                Send another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="rounded-none border-border bg-background text-base min-h-11 focus-visible:border-foreground"
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
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Remember your password?{" "}
            <Link href={loginHref} className="text-foreground underline underline-offset-4 hover:opacity-80">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}

