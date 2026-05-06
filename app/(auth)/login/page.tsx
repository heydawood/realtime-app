"use client";

import { login } from "@/lib/auth";
import { customToast } from "@/components/common/ShowToast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import Input from "@/components/ui/input/Input";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const methods = useForm<FormValues>();
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);
      customToast.success("Log in successful");
      router.push("/chat/start");
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
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">

            <Input
              name="email"
              type="email"
              placeholder="Email"
              label="Email"
              allowAsterisk
              rules={{ required: "Email is required" }}
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              label="Password"
              allowAsterisk
              rules={{ required: "Password is required" }}
            />

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              Login
            </Button>

          </form>
        </FormProvider>

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