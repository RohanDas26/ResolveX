"use client";

import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Icons } from "./icons";
import { LogOut, LayoutDashboard, PlusCircle, MapPin, Loader2, Shield } from "lucide-react";

const ADMIN_EMAIL = "admin@klh.edu.in";

export default function Header() {
  const { user, isUserLoading: loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold">ResolveX</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
             <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1"/>
              Live Map
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user ? (
            <>
              {user.email === ADMIN_EMAIL && (
                <Button variant="ghost" asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4"/>
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4"/>
                  Dashboard
                </Link>
              </Button>
              <Button asChild>
                <Link href="/submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Grievance
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}