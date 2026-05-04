"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "../ui/avatar";

export default function UserItem({ user, currentUser }: any) {
  const router = useRouter();

  const handleClick = () => {
    const chatId =
      currentUser.uid < user.id
        ? `${currentUser.uid}_${user.id}`
        : `${user.id}_${currentUser.uid}`;

    router.push(`/chat/${chatId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-4 hover:bg-muted cursor-pointer transition border-b"
    >
      <Avatar>
        <AvatarFallback>
          {user.email?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div>
        <p className="font-medium">{user.email}</p>
      </div>
    </div>
  );
}
