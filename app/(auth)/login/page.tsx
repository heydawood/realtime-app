"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { customToast } from "@/components/common/ShowToast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter()

  const handleLogin = async () => {
    try {
      await login(email, password);
      //alert("Logged In");
      customToast.success('Log in successful')
      router.push('/')

    } catch (err) {
      //console.error(err);
      customToast.error(err)
    }
  };

  return (
    <div className="flex flex-col gap-3 p-10">
      <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

      <Button onClick={handleLogin} className="bg-primary-500 hover:bg-primary-600 text-white p-2">
        Login
      </Button>

    </div>
  );
}
