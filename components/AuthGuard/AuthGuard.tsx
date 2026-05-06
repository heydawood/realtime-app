"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthLoading) return;

    const isAuthPage = pathname === "/login" || pathname === "/signup";

    //NOT LOGGED IN → block chat
    if (!user && !isAuthPage) {
      router.replace("/login");
    }

    //LOGGED IN → block auth pages
    if (user && isAuthPage) {
      router.replace("/chat/start");
    }
  }, [user, isAuthLoading, pathname]);

  //Prevent flicker
  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}