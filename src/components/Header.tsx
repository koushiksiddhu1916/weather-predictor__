"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CloudSun, History, Home, LogIn, LogOut, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <CloudSun className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Weather Forecast</h1>
              <p className="text-xs text-muted-foreground">Predict with confidence</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>

            {!isPending && session?.user ? (
              <>
                <Button
                  variant={isActive("/history") ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href="/history">
                    <History className="mr-2 h-4 w-4" />
                    History
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isActive("/login") ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button
                  variant={isActive("/register") ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
