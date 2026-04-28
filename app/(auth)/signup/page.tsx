"use client";

import { useState } from "react";
import { signup } from "@/lib/auth";
import { customToast } from "@/components/common/ShowToast";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await signup(email, password);
      //alert("User created");
      customToast.success('User created')
    } catch (err) {
      //console.error(err);
      customToast.error(err)
    }
  };

  return (
    <div className="flex flex-col gap-3 p-10">
      <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

      <button onClick={handleSignup} className="bg-blue-500 text-white p-2">
        Signup
      </button>
    </div>
  );
}
