"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

type FormData = {
  message: string;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const { register, handleSubmit, reset, watch } = useForm<FormData>();

  const message = watch("message");

  const onSubmit = (data: FormData) => {
    if (!data.message.trim()) return;

    onSend(data.message);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-2"
    >
      {/* INPUT WRAPPER */}
      <div className="flex-1 relative">
        <Input
          placeholder="Type a message..."
          className="pr-12 p-5 rounded-full bg-muted border-none focus-visible:ring-0"
          {...register("message")}
        />

        {/* SEND BUTTON INSIDE INPUT */}
        <Button
          type="submit"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded-full h-8 w-8"
          disabled={!message || !message.trim()}
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      </div>
    </form>
  );
}
