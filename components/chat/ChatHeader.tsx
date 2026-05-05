"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video } from "lucide-react";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  onCall?: () => void;
}

export default function ChatHeader({
  name,
  avatar,
  isOnline,
  onCall,
}: ChatHeaderProps) {
  return (
    <div className="h-16 border-b flex items-center justify-between px-4 bg-background">
      
      {/* LEFT SIDE (USER INFO) */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} />
          <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="font-medium">{name}</span>

          <span className="text-xs text-muted-foreground">
            {isOnline ? "Online" : "Last seen recently"}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE (ACTIONS) */}
      <div className="flex items-center gap-2">

        <Button variant="ghost" size="icon" onClick={onCall}>
          <Video className="h-5 w-5" />
        </Button>

      </div>
    </div>
  );
}
