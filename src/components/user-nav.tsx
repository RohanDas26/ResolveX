
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { LogOut, Ticket, User, MailWarning } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, sendEmailVerification } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDoc } from "@/firebase/firestore/use-doc";
import { UserProfile } from "@/lib/types";
import { doc } from "firebase/firestore";


export function UserNav() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        toast({
          title: "Verification Email Sent!",
          description: "Please check your inbox for the verification link.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not send verification email. Please try again later.",
        });
      }
    }
  };

  if (!user) {
    return null;
  }

  const isEmailVerified = user.emailVerified;
  
  const userName = userProfile?.name || user.displayName || user.email;
  const userImage = userProfile?.imageUrl || user.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`;
  const userFallback = userName?.[0].toUpperCase() || 'U';


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userImage} alt={userName ?? ""} />
            <AvatarFallback>{userFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!isEmailVerified && (
          <>
            <div className="p-2">
              <Alert variant="destructive" className="border-amber-500/50 text-amber-500 [&>svg]:text-amber-500">
                <MailWarning className="h-4 w-4" />
                <AlertTitle className="text-amber-600">Email Not Verified</AlertTitle>
                <AlertDescription className="text-amber-500 text-xs">
                  Please verify your email to get full access.
                </AlertDescription>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2" onClick={handleResendVerification}>
                  Resend verification link
                </Button>
              </Alert>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/tickets">
              <Ticket className="mr-2" />
              <span>My Tickets</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
