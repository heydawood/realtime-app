// "use client";

// import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// interface ChatItemProps {
//   name: string;
//   lastMessage: string;
//   time: string;
//   unread?: number;
//   active?: boolean;
// }

// export default function ChatItem({
//   name,
//   lastMessage,
//   time,
//   unread,
//   active,
// }: ChatItemProps) {
//   return (
//     <div
//       className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
//       ${active ? "bg-primary-100" : "hover:bg-muted"}`}
//     >
//       {/* Avatar */}
      // <Avatar>
      //   <AvatarFallback>{name[0]}</AvatarFallback>
      // </Avatar>

//       {/* Content */}
//       <div className="flex-1 min-w-0">
//         <div className="flex justify-between items-center">
//           <span className="font-medium truncate ">{name}</span>
//           <span className="text-xs text-muted-foreground">{time}</span>
//         </div>

//         <div className="flex justify-between items-center">
//           <span className="text-sm text-muted-foreground truncate">
//             {lastMessage}
//           </span>

//           {unread && (
//             <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
//               {unread}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useRouter, useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "../ui/avatar";
import clsx from "clsx";

export default function ChatItem({ chat, currentUser }: any) {
  const router = useRouter();
  const params = useParams();

  const activeChatId = params?.chatId;

  const isActive = activeChatId === chat.id;

  const otherUserId = chat.participants.find(
    (id: string) => id !== currentUser?.uid
  );

  const handleClick = () => {
    router.push(`/chat/${chat.id}`);
  };

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
          {otherUserId?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* TEXT */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {otherUserId?.slice(0, 5)}
        </p>

        <p className="text-sm text-muted-foreground truncate">
          {chat.lastMessage || "No messages yet"}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">
          {chat.lastMessageAt
            ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>

        {/* {chat.unreadCount?.[currentUser?.uid] > 0 && (
          <div className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
            {chat.unreadCount[currentUser?.uid]}
          </div>
        )} */}
      </div>
    </div>
  );
}
