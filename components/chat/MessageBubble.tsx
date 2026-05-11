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
  scheduledFor,
}: MessageBubbleProps) {

  // SHOW CLOCK ONLY AFTER MESSAGE IS SENT
  const showScheduledIcon =
    isMe &&
    scheduled &&
    !pending;

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

        {/* TIME / SCHEDULE INFO */}
        {(time || scheduledFor) && (
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

            {/* PENDING SCHEDULED MESSAGE */}
            {pending && scheduledFor ? (

              <span>
                {/* <Clock3 className="h-3 w-3" /> */}
                  Scheduled for{" "}
                {new Date(scheduledFor).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

            ) : (

              <>
                {/* CLOCK ICON AFTER SENT */}
                {showScheduledIcon && (
                  <Clock3 className="h-3 w-3" />
                )}

                <span>{time}</span>
              </>

            )}

          </div>
        )}

      </div>

    </div>
  );
}