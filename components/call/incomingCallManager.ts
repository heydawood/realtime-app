"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createPeerConnection } from "@/lib/webrtc";

export const useIncomingCallManager = (user: any) => {

  // STATE
  const [incomingCall, setIncomingCall] = useState<any>(null);


  // VIDEO REFS
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);


  // WEBRTC REFS
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Queue ICE candidates until remote description is set
  const iceQueueRef = useRef<RTCIceCandidate[]>([]);


  // LISTEN FOR INCOMING CALLS
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
        setIncomingCall({
          ...callDoc.data(),
          id: callDoc.id,
        });
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsub();
  }, [user]);


  // ACCEPT CALL (CALLEE SIDE)
  const acceptCall = async () => {
    if (!incomingCall?.offer?.sdp) {
      console.error("Invalid offer");
      return;
    }

    // 1) create pc
    pcRef.current = createPeerConnection();
    const pc = pcRef.current;

    const callRef = doc(db, "calls", incomingCall.id);

    const offerCandidates = collection(callRef, "offerCandidates");
    const answerCandidates = collection(callRef, "answerCandidates");

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


    // 3)Send ICE candidates to Firestore
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // Listen for ICE from caller
    onSnapshot(offerCandidates, (snapshot) => {
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

    // 4) Get local media (camera + mic)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });


    if (localVideoRef.current && !localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject = stream;
    }


    // Add tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });



    // 5)Set remote offer
    await pc.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer)
    );

    // 6)Flush queued ICE candidates
    iceQueueRef.current.forEach(async (candidate) => {
      await pc.addIceCandidate(candidate);
    });
    iceQueueRef.current.length = 0;

    // 7) Create answer
    const answer = await pc.createAnswer();

    //8) setLocalDescription
    await pc.setLocalDescription(answer);

    // Save answer to Firestore //9)send answer
    await updateDoc(callRef, {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
      status: "accepted",
    });

    pc.onconnectionstatechange = () => {
      console.log("Connection State:", pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE State:", pc.iceConnectionState);
    };

  };

  return {
    incomingCall,
    acceptCall,
    localVideoRef,
    remoteVideoRef,
  };
};