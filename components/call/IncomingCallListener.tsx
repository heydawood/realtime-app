"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useIncomingCallManager } from "./incomingCallManager";
import { Button } from "../ui/button";
import { useCallContext } from "@/contexts/CallContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function IncomingCallListener() {
  const user = useAuthStore((s) => s.user);

  // FIX #1: Destructure the video refs so we can attach them to <video> elements
  const {
    incomingCall,
    acceptCall,
  } = useIncomingCallManager(user);

  // const { activeCall, pcRef, } = useCallContext();

  // if (!incomingCall) return null;

  // const endCall = async () => {
  //   if (pcRef.current) {
  //     pcRef.current.close();
  //     pcRef.current = null;
  //   }

  //   if (activeCall?.id) {
  //     await updateDoc(doc(db, "calls", activeCall.id), {
  //       status: "ended",
  //     });
  //   }
  // }

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

          <Button variant="destructive" className="bg-red-500 px-3 py-1 text-white">
            Reject
          </Button>
        </div>
      )}
    </>
  );
}