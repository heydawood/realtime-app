"use client";

import { signup } from "@/lib/auth";
import { customToast } from "@/components/common/ShowToast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import Input from "@/components/ui/input/Input";

type FormValues = {
  username: string;
  email: string;
  password: string;
};

export default function SignupPage() {
  const methods = useForm<FormValues>();
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    try {
      await signup(data.email, data.password, data.username);
      customToast.success("Account created");
      router.push("/chat/start");
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
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">

            <Input
              name="username"
              placeholder="Username"
              label="Username"
              allowAsterisk
              rules={{ required: "Username is required" }}
            />

            <Input
              name="email"
              type="email"
              placeholder="Email"
              label="Email"
              allowAsterisk
              rules={{
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email",
                },
              }}
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              label="Password"
              allowAsterisk
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Minimum 6 characters",
                },
              }}
            />

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              Sign up
            </Button>

          </form>
        </FormProvider>

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