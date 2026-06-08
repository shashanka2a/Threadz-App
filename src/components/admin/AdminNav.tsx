"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const ADMIN_LINKS = [
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Signed out");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
      <div className="flex flex-wrap gap-2">
        {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Button
              key={href}
              asChild
              variant={active ? "default" : "outline"}
              className={`rounded-none ${active ? "bg-black text-white hover:bg-neutral-800" : "border-neutral-300"}`}
            >
              <Link href={href}>
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Link>
            </Button>
          );
        })}
      </div>

      <Button variant="ghost" className="rounded-none text-neutral-600" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign out
      </Button>
    </div>
  );
}
