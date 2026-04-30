"use client";

import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, Video, MicOff, VideoOff } from "lucide-react";
import { useCallContext } from "@/contexts/CallContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCallTimer } from "@/hooks/useCallTimer";

export default function CallUI() {
  const {
    activeCall,
    localVideoRef,
    remoteVideoRef,
    pcRef,
    setActiveCall,
    toggleCamera,
    toggleMute,
    isMuted,
    isCameraOff,
    callStatus,
    callStartTime
  } = useCallContext();
  const duration = useCallTimer(callStartTime);

  if (!activeCall) return null;

  const endCall = async () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (activeCall?.id) {
      await updateDoc(doc(db, "calls", activeCall.id), {
        status: "ended",
      });
    }

    setActiveCall(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">

      {/* REMOTE VIDEO (FULL SCREEN) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* LOCAL VIDEO (FLOATING) */}
      <div className="absolute top-4 right-4 w-32 h-44 rounded-xl overflow-hidden border shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* CALL INFO */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-70">
          {activeCall.role === "caller" ? "Outgoing" : "Incoming"}
        </p>

        <p className="text-sm text-muted-foreground">
          {callStatus === "connected" && duration}
        </p>

      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-10 w-full flex justify-center gap-6">

        {/* MUTE (placeholder) */}
        <Button
          onClick={toggleMute}
          size="icon"
          variant="secondary"
          className="rounded-full w-14 h-14"
        >
          {isMuted ? <MicOff /> : <Mic />}
        </Button>

        {/* END CALL */}
        <Button
          size="icon"
          className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
          onClick={endCall}
        >
          <PhoneOff />
        </Button>

        {/* VIDEO TOGGLE (placeholder) */}
        <Button
          onClick={toggleCamera}
          size="icon"
          variant="secondary"
          className="rounded-full w-14 h-14"
        >
          {isCameraOff ? <VideoOff /> : <Video />}
        </Button>

      </div>
    </div>
  );
}
