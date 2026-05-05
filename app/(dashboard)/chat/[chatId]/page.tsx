"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatPageManager } from "./chatPageManager";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { useChats } from "@/components/Sidebar/useChats";
import { useUser } from "@/hooks/useUser";

export default function ChatPage() {
    const { chatId } = useParams();
    const currentUser = useAuthStore((s) => s.user);

    //finding the other user name to show in the header
    const { chats } = useChats(currentUser?.uid);
    const chat = chats.find((c) => c.id === chatId);

    const otherUserId = chat?.participants.find(
        (id: string) => id !== currentUser?.uid
    );

    const otherUser = useUser(otherUserId);


    const { messages, sendMessage, startCall } = useChatPageManager(chatId as string, currentUser);


    //to scroll down
    // const bottomRef = useRef<HTMLDivElement | null>(null);

    // useEffect(() => {
    //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [messages]);

    return (
        <div className="flex flex-col h-full">

            {/* HEADER */}
            <ChatHeader
                //name={otherUserId?.slice(0, 5)}
                name={otherUser?.username || otherUserId?.slice(0, 5)}
                isOnline={true}
                onCall={startCall}
            />

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse space-y-2 bg-muted/30">
                {messages.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm">
                        Loading...
                    </p>
                )}

                {[...messages].reverse().map((msg, i) => {
                    const isMe = msg.senderId === currentUser?.uid;

                    return (
                        <MessageBubble
                            key={i}
                            message={msg.text}
                            isMe={isMe}
                            time={new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        />
                    );
                })}
                {/* <div ref={bottomRef} /> */}
            </div>


            {/* INPUT */}
            <div className="border-t p-3 bg-background">
                <ChatInput onSend={sendMessage} />
            </div>

        </div>
    );
}