"use client";

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
export const useChatPageManager = (chatId: string, currentUser: any) => {


  // STATE
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");


  // VIDEO REFS
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);


  // WEBRTC REFS
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Queue to store ICE candidates before remoteDescription is set
  const iceQueueRef = useRef<RTCIceCandidate[]>([]);


  // FETCH MESSAGES (REAL-TIME)
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
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

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: currentUser?.uid,
      createdAt: Date.now(),
    });

    setText("");
  };

  // START CALL (CALLER SIDE)
  const startCall = async () => {
    const callId = crypto.randomUUID();

    const otherUserId = chatId
      .split("_")
      .find((id) => id !== currentUser?.uid);

    //1) Create new peer connection
    pcRef.current = createPeerConnection();
    const pc = pcRef.current;

    //2) Receive remote stream
    pc.ontrack = (event) => {

      //const remoteStream = event.streams[0];
      const remoteStream =
        remoteVideoRef.current?.srcObject instanceof MediaStream
          ? remoteVideoRef.current.srcObject
          : new MediaStream();

      remoteStream.addTrack(event.track);

      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = remoteStream;
      }


      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = remoteStream;

        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current?.play().catch(console.error);
        };
      }
    };


    const callDoc = doc(db, "calls", callId);

    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    //3) Send ICE candidates to Firestore
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    //4) Get local media (camera + mic)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Attach local stream to video element
    // if (localVideoRef.current) {
    //   localVideoRef.current.srcObject = stream;
    // }
    if (localVideoRef.current && !localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject = stream;
    }


    // Add tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Listen for answer
    onSnapshot(callDoc, async (docSnap) => {
      const data = docSnap.data();

      if (data?.answer && !pc.currentRemoteDescription) {
        // Apply answer //5)setup remote description
        await pc.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        // 6) Flush queued ICE candidates
        iceQueueRef.current.forEach(async (candidate) => {
          await pc.addIceCandidate(candidate);
        });

        iceQueueRef.current.length = 0;
      }
    });



    // Create offer and set local description
    //7) create answer
    const offer = await pc.createOffer();

    //8)setLocalDescription
    await pc.setLocalDescription(offer);

    // Save call document in Firestore
    //9)send answer
    await setDoc(callDoc, {
      callerId: currentUser?.uid,
      receiverId: otherUserId,
      offer,
      status: "ringing",
      createdAt: Date.now(),
    });



    // Listen for ICE candidates from receiver
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());

          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
          } else {
            iceQueueRef.current.push(candidate);
          }
        }
      });
    });

    pc.onconnectionstatechange = () => {
      console.log("Connection State:", pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE State:", pc.iceConnectionState);
    };

  };

  return {
    messages,
    text,
    setText,
    sendMessage,
    startCall,
    localVideoRef,
    remoteVideoRef,
  };
};
