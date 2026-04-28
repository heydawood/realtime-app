"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createPeerConnection } from "@/lib/webrtc";

export default function ChatPage() {

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    //const iceQueue: RTCIceCandidate[] = [];
    const iceQueueRef = useRef<RTCIceCandidate[]>([]);



    const { chatId } = useParams();

    const currentUser = useAuthStore((s) => s.user);

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");

    // REAL-TIME LISTENER
    useEffect(() => {
        const q = query(
            collection(db, "chats", chatId as string, "messages"),
            orderBy("createdAt")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => doc.data());
            setMessages(msgs);
        });

        return () => unsub();
    }, [chatId]);

    // SEND MESSAGE
    const sendMessage = async () => {
        if (!text.trim()) return;

        await addDoc(collection(db, "chats", chatId as string, "messages"), {
            text,
            senderId: currentUser?.uid,
            createdAt: Date.now(),
        });

        setText("");
    };


    //call
    const pcRef = useRef<RTCPeerConnection | null>(null);


    const startCall = async () => {
        const callId = crypto.randomUUID();

        const otherUserId = (chatId as string).split("_").find(
            (id) => id !== currentUser?.uid
        );

        pcRef.current = createPeerConnection();
        const pc = pcRef.current;





        const callDoc = doc(db, "calls", callId);

        // subcollections
        const offerCandidates = collection(callDoc, "offerCandidates");
        const answerCandidates = collection(callDoc, "answerCandidates");

        // SEND ICE
        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                await addDoc(offerCandidates, event.candidate.toJSON());
            }
        };





        //  get media (for later, but needed now)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });


        //showing local video
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
        };



        //  create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        //  save call
        await setDoc(doc(db, "calls", callId), {
            callerId: currentUser?.uid,
            receiverId: otherUserId,
            offer,
            status: "ringing",
            createdAt: Date.now(),
        });

        //  listen for answer
        onSnapshot(callDoc, async (docSnap) => {
            const data = docSnap.data();

            //if (!data) return;

            if (data?.answer && !pc.currentRemoteDescription) {
                await pc.setRemoteDescription(
                    new RTCSessionDescription(data.answer)
                );

                console.log("ANSWER RECEIVED");

                // 🔥 flush queued ICE HERE
                iceQueueRef.current.forEach(async (candidate) => {
                    await pc.addIceCandidate(candidate);
                });
                iceQueueRef.current.length = 0;
            }
        });


        //ice candidates from callee
        onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === "added") {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    //pc.addIceCandidate(candidate);
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(candidate);
                    } else {
                        iceQueueRef.current.push(candidate);
                    }
                }
            });
        });
    };

    return (
        <div className="p-6">
            <div className="h-[400px] overflow-y-auto border p-4 mb-4">


                <p>Chat ID: {chatId}</p>

                {messages.length === 0 && (
                    <p className="text-gray-400">No messages yet</p>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className="mb-2">
                        <strong>{msg.senderId === currentUser?.uid ? "You" : "Other"}:</strong> {msg.text}
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="border p-2 flex-1"
                />

                <button onClick={sendMessage} className="bg-blue-500 text-white px-4">
                    Send
                </button>
                <button
                    onClick={() => startCall()}
                    className="bg-green-500 px-4 py-2 text-white rounded"
                >
                    Call
                </button>
            </div>

            <div className="flex flex-col gap-4">

                {/* REMOTE VIDEO */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-[300px] bg-black rounded"
                />

                {/* 🎥 LOCAL VIDEO */}
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
