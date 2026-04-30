"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatItemProps {
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  active?: boolean;
}

export default function ChatItem({
  name,
  lastMessage,
  time,
  unread,
  active,
}: ChatItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
      ${active ? "bg-primary-100" : "hover:bg-muted"}`}
    >
      {/* Avatar */}
      <Avatar>
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-medium truncate ">{name}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground truncate">
            {lastMessage}
          </span>

          {unread && (
            <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
