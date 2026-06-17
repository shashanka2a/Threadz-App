"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function UserAccountButton({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const href = user ? "/profile" : "/login";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full shrink-0 ${className ?? ""}`}
      disabled={loading}
      asChild
    >
      <Link href={href}>
        <User className="h-4 w-4" />
        <span className="sr-only">{user ? "Profile" : "Sign in"}</span>
      </Link>
    </Button>
  );
}
