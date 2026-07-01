"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/profile";
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const loginHref =
    nextPath !== "/profile"
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const result = await resetPassword(email.trim());
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    setEmailSent(true);
    setIsLoading(false);
    toast.success("Password reset email sent");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-neutral-200 rounded-none">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
              {emailSent ? (
                <MailCheck className="h-5 w-5" />
              ) : (
                <KeyRound className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif">Reset password</h1>
              <p className="text-sm text-neutral-600">
                {emailSent
                  ? "Check your inbox for the reset link"
                  : "We will email you a link to choose a new password"}
              </p>
            </div>
          </div>

          {emailSent ? (
            <div className="space-y-4 text-sm text-neutral-600">
              <p>
                If an account exists for <span className="font-medium text-black">{email}</span>,
                you will receive a password reset email shortly.
              </p>
              <p>Open the link in that email to set a new password. The link expires after a short time.</p>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-none border-neutral-300"
                onClick={() => setEmailSent(false)}
              >
                Send another email
              </Button>
            </div>
          ) : (
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

              <Button
                type="submit"
                className="w-full rounded-none bg-black text-white hover:bg-neutral-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}

          <p className="text-sm text-neutral-600 mt-6 text-center">
            Remember your password?{" "}
            <Link href={loginHref} className="text-black underline underline-offset-4">
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
        <div className="min-h-[70vh] flex items-center justify-center text-neutral-600">
          Loading...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
