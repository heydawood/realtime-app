"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatPageManager } from "./chatPageManager";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
    const { chatId } = useParams();
    const currentUser = useAuthStore((s) => s.user);


    const { messages, sendMessage, startCall } = useChatPageManager(chatId as string, currentUser);

    return (
        <div className="flex flex-col h-full">

            {/* HEADER */}
            <ChatHeader
                name="John Doe"
                isOnline={true}
                onCall={startCall}
            />

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/30">
                {messages.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm">
                         Loading...
                    </p>
                )}

                {messages.map((msg, i) => {
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
            </div>


            {/* INPUT */}
            <div className="border-t p-3 bg-background">
                <ChatInput onSend={sendMessage} />
            </div>

        </div>
    );
}