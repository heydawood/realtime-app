"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createPeerConnection } from "@/lib/webrtc";
import { useCallContext } from "@/contexts/CallContext";
import { customToast } from "@/components/common/ShowToast";

export const useChatPageManager = (chatId: string, currentUser: any) => {

  // STATE
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  // Get shared references from CallContext instead of creating local ones
  // This ensures caller and receiver use the SAME peer connection
  const { pcRef, localVideoRef, remoteVideoRef, iceQueueRef, setActiveCall, setCallStatus, setCallStartTime } = useCallContext();

  // FETCH MESSAGES (REAL-TIME)
  useEffect(() => {
    if (!chatId) return;

    // 1) Create query to fetch messages from this chat, ordered by creation time
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    // 2) Set up real-time listener to automatically update messages
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      setMessages(msgs);
    });

    // 3) Clean up listener when component unmounts
    return () => unsub();
  }, [chatId]);

  // SEND MESSAGE
  
  // const sendMessage = async (message: string) => {
  //   // 1) Don't send empty messages
  //   if (!message.trim()) return;

  //   // 2) Add message to Firestore
  //   await addDoc(collection(db, "chats", chatId, "messages"), {
  //     text: message,
  //     senderId: currentUser?.uid,
  //     createdAt: Date.now(),
  //   });

  //   // 3) Clear the input field
  //   setText("");
  // };

  const sendMessage = async (message: string) => {
    // 1) Don't send empty messages
    if (!message.trim()) return;

    const otherUserId = chatId
      .split("_")
      .find((id) => id !== currentUser?.uid);

    const chatRef = doc(db, "chats", chatId);

    // 2) Add message to Firestore
    //ALWAYS add message
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message,
      senderId: currentUser?.uid,
      createdAt: Date.now(),
    });

    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      // CREATE CHAT DOC (FIRST MESSAGE)
      await setDoc(chatRef, {
        participants: [currentUser?.uid, otherUserId],
        lastMessage: message,
        lastMessageAt: Date.now(),
        lastMessageSenderId: currentUser?.uid,
        unreadCount: {
          [currentUser?.uid]: 0,
          [otherUserId!]: 1,
        },
      });

    } else {
      // UPDATE CHAT DOC
      await updateDoc(chatRef, {
        lastMessage: message,
        lastMessageAt: Date.now(),
        lastMessageSenderId: currentUser?.uid,
        [`unreadCount.${otherUserId}`]: increment(1),
        [`unreadCount.${currentUser?.uid}`]: 0,
      });
    }
  };






  // START CALL (CALLER/INITIATOR SIDE)
  const startCall = async () => {
    // 0) Generate unique ID for this call
    const callId = crypto.randomUUID();

    // 1) Extract the other user's ID from chatId (format: "userId_otherUserId")
    const otherUserId = chatId
      .split("_")
      .find((id) => id !== currentUser?.uid);

    // 2) Close any existing peer connection to avoid resource leaks
    if (pcRef.current) {
      pcRef.current.close();
    }

    // 3) Create a NEW peer connection (shared via context)
    pcRef.current = createPeerConnection();
    const pc = pcRef.current;

    // 4) Mark this call as active with role "caller"
    setActiveCall({ id: callId, role: "caller" });
    setCallStatus("calling"); // when starting call


    // 5) Monitor peer connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection State:", pc.connectionState);
    };

    // 6) Monitor ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log("ICE State:", pc.iceConnectionState);
    };

    // 7) Handle incoming remote tracks (video/audio from receiver)
    pc.ontrack = (event) => {
      // Only process if we have a video element reference
      if (!remoteVideoRef.current) return;

      // Create empty MediaStream if it doesn't exist yet
      if (!remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = new MediaStream();
      }

      // Add the remote track to the video stream
      (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
    };

    // 8) Reference to the call document in Firestore
    const callDoc = doc(db, "calls", callId);

    // 9) Collections for ICE candidates
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    // 10) Send our ICE candidates to Firestore (receiver will receive these)
    // IMPORTANT: Register BEFORE adding tracks to capture all candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    // 11) Get local media (camera + microphone)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // 12) Display local video in the video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // 13) Add local media tracks to peer connection (send to receiver)
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // 14) Create an offer describing what we want to send/receive
    const offer = await pc.createOffer();

    // 15) Set the offer as our local description
    // This tells our peer connection what we want to send
    await pc.setLocalDescription(offer);

    // 16) Save the offer to Firestore so receiver can see it
    // Mark status as "ringing" (waiting for receiver to answer)
    await setDoc(callDoc, {
      callerId: currentUser?.uid,
      receiverId: otherUserId,
      offer,
      status: "ringing",
      createdAt: Date.now(),
    });

    // 17) Listen for the receiver's answer in the call document
    onSnapshot(callDoc, async (docSnap) => {
      const data = docSnap.data();

      if (!data) return;

      // HANDLE REJECT (independent of answer)
      if (data.status === "rejected") {
        console.log("Call rejected");
        customToast.warning('Call rejected')

        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }

        setActiveCall(null);
        setCallStatus("ended");

        setTimeout(() => {
          setCallStatus("idle");
        }, 1500);

        return; // stop further execution
      }

      //HANDLE CALL ENDED (other user hung up)
      if (data.status === "ended") {
        console.log("Call ended");
        customToast.info('Call ended')

        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }

        setActiveCall(null);
        setCallStatus("idle");

        return;
      }

      //HANDLE ANSWER (normal flow)
      // When answer arrives AND we haven't set remote description yet
      if (data?.answer && !pc.currentRemoteDescription) {

        // 18) Set the receiver's answer as our remote description
        // This tells our peer connection what the receiver wants to send
        await pc.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setCallStatus("connected");
        setCallStartTime(Date.now());

        // 19) Now that remote description is set, add any queued ICE candidates
        for (const candidate of iceQueueRef.current) {
          await pc.addIceCandidate(candidate);
        }
        iceQueueRef.current = [];
      }

    });

    // 20) Listen for ICE candidates from the receiver
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());

          // If remote description is already set, add candidate immediately
          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
          } else {
            // Otherwise, queue it for later
            iceQueueRef.current.push(candidate);
          }
        }
      });
    });
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