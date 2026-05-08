"use client";

import { useRouter, useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "../ui/avatar";
import clsx from "clsx";
import { useUser } from "@/hooks/useUser";
import { useCallStore } from "@/store/useAuthStore";
import { PhoneCall } from "lucide-react";

export default function ChatItem({ chat, currentUser }: any) {
  const usersInCall = useCallStore((s) => s.usersInCall);

  const router = useRouter();
  const params = useParams();

  const activeChatId = params?.chatId;

  const isActive = activeChatId === chat.id;

  const otherUserId = chat.participants.find(
    (id: string) => id !== currentUser?.uid
  );

  const otherUser = useUser(otherUserId);

  const handleClick = () => {
    router.push(`/chat/${chat.id}`);
  };

  const isInCall = usersInCall.has(otherUserId);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "flex items-center gap-3 p-3 cursor-pointer transition",
        "hover:bg-muted",
        isActive && "bg-muted"
      )}
    >
      {/* AVATAR */}
      <Avatar>
        <AvatarFallback>
          {otherUser?.username?.[0]?.toUpperCase() || otherUserId?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* TEXT */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {otherUser?.username || otherUserId?.slice(0, 5)}
        </p>

        <p className="text-sm text-muted-foreground truncate">
          {chat.lastMessage || "No messages yet"}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col items-end gap-1">


        {/* to show if user is in call or not */}
        <div className="flex flex-col items-end gap-1">
          {isInCall && (
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <PhoneCall className="w-3 h-3" />
              <span>In call</span>
            </div>
          )}

          <span className="text-xs text-muted-foreground">
            {chat.lastMessageAt
              ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              : ""}
          </span>



          {chat.unreadCount?.[currentUser?.uid] > 0 && (
            <div className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
              {chat.unreadCount[currentUser?.uid]}
            </div>
          )}

        </div>
      </div>
      </div>
      );
}
