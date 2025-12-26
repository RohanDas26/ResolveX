"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!user.emailVerified) {
    router.replace('/login');
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
            <p className="text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
