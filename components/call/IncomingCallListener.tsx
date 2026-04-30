"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useIncomingCallManager } from "./incomingCallManager";
import { Button } from "../ui/button";

export default function IncomingCallListener() {
  const user = useAuthStore((s) => s.user);

  // FIX #1: Destructure the video refs so we can attach them to <video> elements
  const {
    incomingCall,
    acceptCall,
    rejectCall
  } = useIncomingCallManager(user);


  return (
    <>
      {/* FIX #1: Always render video elements so refs are attached to real DOM nodes.
          The call to acceptCall() will set srcObject on these elements correctly. */}

      {incomingCall && (
        <div className="fixed top-10 right-10 z-50 bg-white p-4 shadow rounded">
          <p>Incoming Call...</p>

          <Button
            onClick={acceptCall}
            className="bg-green-500 px-3 py-1 text-white mr-2"
          >
            Accept
          </Button>

          <Button onClick={rejectCall} variant="destructive" className="bg-red-500 px-3 py-1 text-white">
            Reject
          </Button>
        </div>
      )}
    </>
  );
}