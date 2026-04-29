"use client";

interface MessageBubbleProps {
  message: string;
  isMe: boolean;
  time?: string;
}

export default function MessageBubble({
  message,
  isMe,
  time,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      
      <div
        className={`
          max-w-xs px-4 py-2 rounded-2xl text-sm relative
          ${isMe
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-background border rounded-bl-sm"
          }
        `}
      >
        {/* MESSAGE TEXT */}
        <p>{message}</p>

        {/* TIME (optional) */}
        {time && (
          <span
            className={`
              text-[10px] mt-1 block text-right
              ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}
            `}
          >
            {time}
          </span>
        )}
      </div>

    </div>
  );
}
