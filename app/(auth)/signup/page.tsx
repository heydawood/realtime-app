"use client";

import { useState } from "react";
import { signup } from "@/lib/auth";
import { customToast } from "@/components/common/ShowToast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSignup = async () => {
    try {
      await signup(email, password);
      customToast.success("Account created");
      router.push("/"); // redirect after signup
    } catch (err: any) {
      customToast.error(err?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-chat px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Start chatting in seconds
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
            onClick={handleSignup}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          >
            Sign up
          </Button>
        </div>

        {/* FOOTER */}
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
