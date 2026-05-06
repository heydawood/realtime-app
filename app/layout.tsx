'use client'

import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuthStore } from "@/store/useAuthStore";
import IncomingCallListener from "@/components/call/IncomingCallListener";
import { Toaster } from "@/components/ui/sonner";
import { CallProvider } from "@/contexts/CallContext";
import CallUI from "@/components/call/CallUI";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// i added this - font optimization
const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

 
  //bridge between Firebase and UI, because Firebase handles authentication internally, React app doesn’t automatically know: when user logs in, logs out or when page reload happens.
  //onAuthStateChanged is listener from firebse in local globel state(zustand)

  //   useEffect(() => {
  //     const unsub = onAuthStateChanged(auth, (user) => {  
  //       setUser(user);
  //     });

  //     return () => unsub();
  //   }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <html
      lang="en"
      className={`${roboto.className} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-center" />


        <CallProvider>
          <IncomingCallListener />
          <CallUI />

          <AuthGuard>
            {children}
          </AuthGuard>

        </CallProvider>

      </body>
    </html>
  );
}
