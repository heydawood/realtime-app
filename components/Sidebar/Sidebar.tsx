"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, MoreVertical } from "lucide-react";
import ChatItem from "./ChatItem";
import { mockChats } from "./mockChats";
import { SidebarDropdown } from "../ui/dropdown/dropdown";
import { useChats } from "./useChats";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {

    const user = useAuthStore((s) => s.user);
    const { chats } = useChats(user?.uid);
    console.log("Chats in sidebar:", chats);

    return (
        <div className="w-[320px] h-full flex flex-col border-r bg-sidebar-custom">

            {/* HEADER */}
            <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">You</span>
                </div>

                {/* <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" /> */}
                <SidebarDropdown />
            </div>

            {/* SEARCH */}
            <div className="p-3 border-b">
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search or start new chat"
                        className="border-none focus-visible:ring-0 shadow-none p-0"
                    />
                </div>
            </div>

            {/* CHAT LIST */}
            <ScrollArea className="flex-1 h-1">
                <div className="flex flex-col ">

                    {chats.length === 0 && (
                        <p className="p-4 text-sm text-muted-foreground">
                           Loading...
                        </p>
                    )}

                    {/* Chat items will go here */}
                    {/* {mockChats.map((chat, i) => (
                            <ChatItem  key={i} {...chat} />
                        ))} */}
                    {chats.map((chat) => (
                        <ChatItem key={chat.id} chat={chat} currentUser={user} />
                    ))}

                </div>
            </ScrollArea>
        </div>
    );
}

// "use client";

// import { useAuthStore } from "@/store/useAuthStore";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import ChatItem from "./ChatItem";
// import { useChats } from "./useChats";

// export default function Sidebar() {
//   const user = useAuthStore((s) => s.user);
//   const { chats } = useChats(user?.uid);

//   return (
//     <div className="w-80 h-full border-r bg-sidebar-custom flex flex-col">

//       {/* HEADER */}
//       <div className="p-4 border-b flex items-center justify-between">
//         <h2 className="font-semibold text-lg">Chats</h2>
//       </div>

//       {/* CHAT LIST */}
//       <ScrollArea className="flex-1">
//         {chats.length === 0 && (
//           <p className="p-4 text-sm text-muted-foreground">
//             No chats yet
//           </p>
//         )}

//         {chats.map((chat) => (
//           <ChatItem key={chat.id} chat={chat} currentUser={user} />
//         ))}
//       </ScrollArea>
//     </div>
//   );
// }