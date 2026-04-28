"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { doc, updateDoc } from "firebase/firestore";
import { createPeerConnection } from "@/lib/webrtc";
import { customToast } from "../common/ShowToast";

export default function IncomingCallListener() {

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const iceQueue: RTCIceCandidate[] = [];




    const user = useAuthStore((s) => s.user);
    const [incomingCall, setIncomingCall] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "calls"),
            where("receiverId", "==", user.uid),
            where("status", "==", "ringing")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const callDoc = snapshot.docs[0];
            if (callDoc) {
                const call = callDoc.data();
                setIncomingCall({
                    ...call,
                    id: callDoc.id,  // extrcting id
                });
            } else {
                setIncomingCall(null);
            }
        });

        return () => unsub();
    }, [user]);

    //call logic RTC
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const acceptCall = async () => {
        try {
            // Validate incoming call data
            if (!incomingCall || !incomingCall.offer || !incomingCall.offer.sdp) {
                customToast.error("Invalid call data received");
                console.error("Invalid offer structure:", incomingCall?.offer);
                return;
            }

            // pc = createPeerConnection();
            pcRef.current = createPeerConnection();
            const pc = pcRef.current;


            const callRef = doc(db, "calls", incomingCall.id);

            const offerCandidates = collection(callRef, "offerCandidates");
            const answerCandidates = collection(callRef, "answerCandidates");

            // 🔥 SEND ICE (receiver side)
            pc.onicecandidate = async (event) => {
                if (event.candidate) {
                    await addDoc(answerCandidates, event.candidate.toJSON());
                }
            };

            onSnapshot(offerCandidates, (snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === "added") {
                        const candidate = new RTCIceCandidate(change.doc.data());


                        //pc.addIceCandidate(candidate);

                        if (pc.remoteDescription) {
                            await pc.addIceCandidate(candidate);
                        } else {
                            iceQueue.push(candidate);
                        }
                    }
                });
            });


            // get media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });



            // show local
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // receive remote
            pc.ontrack = (event) => {
                const remoteStream = event.streams[0];

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            };




            // set remote offer - create a proper SessionDescription object
            const offerDescription = new RTCSessionDescription({
                type: "offer",
                sdp: incomingCall.offer.sdp,
            });

            await pc.setRemoteDescription(offerDescription);



            // flush queued ICE
            iceQueue.forEach(async (candidate) => {
                await pc.addIceCandidate(candidate);
            });
            iceQueue.length = 0;


            // create answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // save answer with proper structure
            await updateDoc(callRef, {
                answer: {
                    type: answer.type,
                    sdp: answer.sdp,
                },
                status: "accepted",
            });

            console.log("CALL ACCEPTED");
            customToast.success("Call Accepted! Implement UI to show stream :)");
        } catch (error) {
            console.error("Error accepting call:", error);
            customToast.error(
                `Failed to accept call: ${error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }

    };

    if (!incomingCall) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 shadow rounded">
            <p>Incoming Call...</p>

            <video ref={remoteVideoRef} autoPlay playsInline className="w-60 h-40 bg-black" />
            <video ref={localVideoRef} autoPlay playsInline muted className="w-40 h-28 bg-black mt-2" />

            <button
                onClick={acceptCall}
                className="bg-green-500 px-3 py-1 text-white mr-2"
            >
                Accept
            </button>

            <button className="bg-red-500 px-3 py-1 text-white">
                Reject
            </button>
        </div>
    );
}
