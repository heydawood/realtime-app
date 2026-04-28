"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatPageManager } from "./chatPageManager";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
    const { chatId } = useParams();
    const currentUser = useAuthStore((s) => s.user);

    const {
        messages,
        text,
        setText,
        sendMessage,
        startCall,
        //joinCall,
        localVideoRef,
        remoteVideoRef,
    } = useChatPageManager(chatId as string, currentUser);

    return (
        <div className="p-6">
            <div className="h-[400px] overflow-y-auto border p-4 mb-4">
                <p>Chat ID: {chatId}</p>

                {messages.length === 0 && (
                    <p className="text-gray-400">No messages yet</p>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className="mb-2">
                        <strong>
                            {msg.senderId === currentUser?.uid ? "You" : "Other"}:
                        </strong>{" "}
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="border p-2 flex-1"
                />

                <Button
                variant={"secondary"}
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 rounded"
                >
                    Send
                </Button>

                <Button
                    onClick={startCall}
                    className="bg-green-500 px-4 py-2 text-white rounded"
                >
                    Call
                </Button>
            </div>

            {/* REMOTE VIDEO */}
            <div className="flex flex-col gap-4 mt-6">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={false}
                    className="w-full h-[300px] bg-black rounded"
                />

                {/*LOCAL VIDEO */}
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-40 h-28 bg-black rounded self-end"
                />
            </div>
        </div>
    );
}
