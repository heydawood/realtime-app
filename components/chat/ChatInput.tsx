"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Clock3 } from "lucide-react";
import { useState } from "react";
import { customToast } from "../common/ShowToast";

interface ChatInputProps {
  onSend: (message: string) => void;

  onSchedule: (
    message: string,
    scheduledFor: number
  ) => void;
}

type FormData = {
  message: string;
};

export default function ChatInput({
  onSend,
  onSchedule,
}: ChatInputProps) {

  const { register, handleSubmit, reset, watch, getValues, } = useForm<FormData>();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [time, setTime] = useState("12:00");

  const message = watch("message");

  // NORMAL SEND
  const onSubmit = (data: FormData) => {

    if (!data.message.trim()) return;
    onSend(data.message);
    reset();
  };

  // SCHEDULE SEND
  const handleSchedule = () => {

    const message = getValues("message");

    if (!message?.trim()) {
      customToast.error("Please type a message");
      return;
    }

    if (!selectedDate) {
      customToast.error("Please select a date");
      return;
    }

    const [hours, minutes] = time.split(":");

    const finalDate = new Date(selectedDate);

    finalDate.setHours(Number(hours));
    finalDate.setMinutes(Number(minutes));
    finalDate.setSeconds(0);

    // BLOCK PAST TIME
    if (finalDate.getTime() <= Date.now()) {
      customToast.error(
        "Please select future time"
      );
      return;
    }

    onSchedule(
      message,
      finalDate.getTime()
    );

    customToast.success(
      "Message scheduled successfully"
    );

    reset();
    setSelectedDate(undefined);
    setTime("12:00");
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
          className="pr-20 p-5 rounded-full bg-muted border-none focus-visible:ring-0"
          {...register("message")}
        />

        {/* SCHEDULE BUTTON */}
        <Popover>

          <PopoverTrigger asChild>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            >
              <Clock3 className="h-4 w-4" />
            </Button>

          </PopoverTrigger>

          <PopoverContent className="w-60 space-y-4">

            {/* CALENDAR */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}

              disabled={(date) =>
                date <
                new Date(
                  new Date().setHours(0, 0, 0, 0)
                )
              }
            />

            {/* TIME PICKER */}
            <div className="space-y-2">

              <label className="text-sm font-medium">
                Select Time
              </label>

              <Input
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
              />

            </div>

            {/* ACTION BUTTON */}
            <Button
              type="button"
              className="w-full text-white"
              onClick={handleSchedule}
            >
              Schedule Message
            </Button>

          </PopoverContent>

        </Popover>

        {/* SEND BUTTON */}
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