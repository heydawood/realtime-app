"use client";

import { Clock3 } from "lucide-react";

interface MessageBubbleProps {
  message: string;
  isMe: boolean;
  time?: string;

  scheduled?: boolean;
  pending?: boolean;
  scheduledFor?: number;
}

export default function MessageBubble({
  message,
  isMe,
  time,
  scheduled,
  pending,
}: MessageBubbleProps) {

  // SHOW CLOCK ONLY FOR:
  // scheduled messages sent by ME
  const showScheduledIcon =
    isMe && scheduled;

  return (
    <div
      className={`flex ${
        isMe
          ? "justify-end"
          : "justify-start"
      }`}
    >

      <div
        className={`
          max-w-xs px-4 py-2 rounded-2xl text-sm relative

          ${
            isMe
              ? "bg-primary text-white rounded-br-sm"
              : "bg-background border rounded-bl-sm"
          }

          ${
            pending
              ? "opacity-80"
              : ""
          }
        `}
      >

        {/* MESSAGE TEXT */}
        <p>{message}</p>

        {/* TIME */}
        {time && (
          <div
            className={`
              text-[10px] mt-1 flex items-center justify-end gap-1

              ${
                isMe
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }
            `}
          >

            {/* CLOCK ICON */}
            {showScheduledIcon && (
              <Clock3 className="h-3 w-3" />
            )}

            <span>{time}</span>

          </div>
        )}

      </div>

    </div>
  );
}