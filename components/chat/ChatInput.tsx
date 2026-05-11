"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Clock3 } from "lucide-react";
import { useState } from "react";
import { customToast } from "../common/ShowToast";

interface ChatInputProps {
  onSend: (message: string) => void;
  onSchedule: (message: string, scheduledFor: number) => void;
}

type FormData = {
  message: string;
};

export default function ChatInput({ onSend, onSchedule }: ChatInputProps) {

  const { register, handleSubmit, reset, watch, getValues } = useForm<FormData>();

  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  const message = watch("message");

  //normal send
  const onSubmit = (data: FormData) => {
    if (!data.message.trim()) return;

    onSend(data.message);
    reset();
  };

  // SCHEDULE SEND
  const handleSchedule = () => {

    const message = getValues("message");

    if (!message?.trim()) return;

    if (!scheduledTime) return;

    const timestamp = new Date(scheduledTime).getTime();

    // prevent past scheduling
    if (timestamp < Date.now()) {
      customToast.error("Please select a future time. Message sent directly.");
      return;
    }

    onSchedule(message, timestamp);

    reset();

    setScheduledTime("");
    setShowScheduler(false);
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

        {/* SCHEDULE BUTTON */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowScheduler(prev => !prev)}
          className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
        >
          <Clock3 className="h-4 w-4" />
        </Button>

      </div>
      {/* SCHEDULER UI */}
      {showScheduler && (
        <div className="flex items-center gap-2">

          <Input
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            value={scheduledTime}
            onChange={(e) =>
              setScheduledTime(e.target.value)
            }
          />

          <Button
            onClick={handleSchedule}
            disabled={!scheduledTime}
          >
            Schedule
          </Button>

        </div>
      )}
    </form>
  );

}
