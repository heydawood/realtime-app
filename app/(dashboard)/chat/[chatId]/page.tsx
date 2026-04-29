"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatPageManager } from "./chatPageManager";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
    const { chatId } = useParams();
    const currentUser = useAuthStore((s) => s.user);

    const {
        messages,
        text,
        setText,
        sendMessage,
        startCall,
        localVideoRef,
        remoteVideoRef,
    } = useChatPageManager(chatId as string, currentUser);

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
                        No messages yet
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
            {/* <div className="border-t p-3 flex gap-2 bg-background">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none"
                />

                <Button className="bg-primary-500" onClick={sendMessage}>
                    Send
                </Button>
            </div> */}
            <div className="border-t p-3 bg-background">
                <ChatInput onSend={sendMessage} />
            </div>


            {/* VIDEO OVERLAY */}
            {/* <div className="absolute bottom-20 right-4 flex flex-col gap-2">

                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-56 h-40 bg-black rounded-lg shadow"
                />

                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-32 h-24 bg-black rounded-lg self-end shadow"
                />

            </div> */}
        </div>
    );
}
