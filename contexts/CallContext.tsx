"use client";

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useRef, useState, ReactNode, useEffect } from "react";

interface CallContextType {
  pcRef: React.RefObject<RTCPeerConnection | null>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  iceQueueRef: React.RefObject<RTCIceCandidate[]>;
  activeCall: { id: string; role: "caller" | "receiver" } | null;
  setActiveCall: (call: { id: string; role: "caller" | "receiver" } | null) => void;

  toggleMute: () => void;
  toggleCamera: () => void;
  isMuted: boolean;
  isCameraOff: boolean;


  callStatus: "idle" | "calling" | "ringing" | "connected" | "ended";
  setCallStatus: (status: any) => void;

  callStartTime: number | null;
  setCallStartTime: (t: number | null) => void;
  cleanupCall: () => void
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {


  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const iceQueueRef = useRef<RTCIceCandidate[]>([]);
  const [activeCall, setActiveCall] = useState<{ id: string; role: "caller" | "receiver" } | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const [callStatus, setCallStatus] = useState<CallContextType["callStatus"]>("idle");
  const [callStartTime, setCallStartTime] = useState<number | null>(null);




  useEffect(() => {
    if (!activeCall?.id) return;

    const callRef = doc(db, "calls", activeCall.id);

    const unsub = onSnapshot(callRef, (snap) => {
      const data = snap.data();

      if (!data) return;

      if (data.status === "ended") {
        // CLEAN EVERYTHING

        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }

        // Stop local stream
        if (localVideoRef.current?.srcObject) {
          (localVideoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach((track) => track.stop());
          localVideoRef.current.srcObject = null;
        }

        // Clear remote stream
        if (remoteVideoRef.current?.srcObject) {
          (remoteVideoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach((track) => track.stop());
          remoteVideoRef.current.srcObject = null;
        }

        iceQueueRef.current = [];

        setActiveCall(null);
      }
    });

    return () => unsub();
  }, [activeCall]);

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsMuted(prev => !prev);
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff(prev => !prev);
  };



  const cleanupCall = () => {
    // 1. Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // 2. Stop local stream
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach(track => track.stop());
    }

    // 3. Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 4. Reset ICE queue
    iceQueueRef.current = [];

    // 5. Reset state
    setActiveCall(null);
    setCallStatus("idle");
    setCallStartTime(null);
  };



  return (
    <CallContext.Provider
      value={{
        pcRef,
        localVideoRef,
        remoteVideoRef,
        iceQueueRef,
        activeCall,
        setActiveCall,
        toggleMute,
        toggleCamera,
        isMuted,
        isCameraOff,
        callStatus,
        setCallStatus,
        callStartTime,
        setCallStartTime,
        cleanupCall
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCallContext() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within CallProvider");
  }
  return context;
}