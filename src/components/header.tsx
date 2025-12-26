"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "./icons";
import { PlusCircle, Map, ShieldCheck, User, LogIn, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/", label: "Live Map", icon: Map },
  { href: "/profile", label: "Profile", icon: User, protected: true },
  { href: "/admin", label: "Admin", icon: ShieldCheck, protected: true, admin: true },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, claims } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out. Please try again." });
    }
  };

  const filteredNavLinks = navLinks.filter(link => {
    if (link.admin) return claims?.isAdmin;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">ResolveX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {filteredNavLinks.map((link) => (
              (!link.protected || (link.protected && user)) && (
                <Button key={link.href} variant="ghost" asChild className={cn("transition-colors", pathname === link.href ? "text-primary hover:text-primary" : "text-foreground/60 hover:text-foreground")}>
                  <Link href={link.href}>
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Link>
                </Button>
              )
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            {user && (
              <Button asChild>
                <Link href="/submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Grievance
                </Link>
              </Button>
            )}
            {!isUserLoading && (
              user ? (
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )
            )}
        </div>
      </div>
    </header>
  );
}
