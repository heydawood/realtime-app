"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useIncomingCallManager } from "./incomingCallManager";
import { Button } from "../ui/button";

export default function IncomingCallListener() {
  const user = useAuthStore((s) => s.user);

  const {
    incomingCall,
    acceptCall,
  } = useIncomingCallManager(user);

  if (!incomingCall) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow rounded">
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
  );
}
