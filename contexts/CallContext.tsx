"use client";

import { createContext, useContext, useRef, useState, ReactNode } from "react";

interface CallContextType {
  pcRef: React.MutableRefObject<RTCPeerConnection | null>;

  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;

  // localVideoRef : useRef<HTMLVideoElement | null>(null);
  // remoteVideoRef : useRef<HTMLVideoElement | null>(null);

  iceQueueRef: React.MutableRefObject<RTCIceCandidate[]>;
  activeCall: { id: string; role: "caller" | "receiver" } | null;
  setActiveCall: (call: { id: string; role: "caller" | "receiver" } | null) => void;
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const iceQueueRef = useRef<RTCIceCandidate[]>([]);
  const [activeCall, setActiveCall] = useState<{ id: string; role: "caller" | "receiver" } | null>(null);

  return (
    <CallContext.Provider
      value={{
        pcRef,
        localVideoRef,
        remoteVideoRef,
        iceQueueRef,
        activeCall,
        setActiveCall,
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