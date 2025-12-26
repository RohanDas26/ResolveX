
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "./icons";
import { PlusCircle, Map, Milestone, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { useUser } from "@/firebase";

const navLinks = [
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/directions", label: "Directions", icon: Milestone },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="container flex h-16 max-w-screen-2xl items-center">
      <div className="mr-8 flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ResolveX</span>
        </Link>
        {user && (
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  "transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-primary hover:text-primary"
                    : "text-foreground/60 hover:text-foreground"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        )}
      </div>
      <div className="flex flex-1 items-center justify-end space-x-4">
        {user && (
          <Button asChild>
            <Link href="/submit">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Grievance
            </Link>
          </Button>
        )}
        <UserNav />
      </div>
    </div>
  );
}
