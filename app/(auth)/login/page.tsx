"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { customToast } from "@/components/common/ShowToast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      customToast.success("Log in successful");
      router.push("/");
    } catch (err: any) {
      customToast.error(err?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-chat px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Login to continue chatting
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            onClick={handleLogin}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          >
            Login
          </Button>
        </div>

        {/* FOOTER */}
        <p className="text-sm text-center text-muted-foreground">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-primary-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
