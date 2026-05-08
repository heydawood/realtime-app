"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useActiveCallsListener = (userId: string | undefined) => {
  const [activeCallIds, setActiveCallIds] = useState<string[]>([]);
  const [usersInCall, setUsersInCall] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    // Query for calls where this user is either caller or receiver AND status is "accepted" or "connected"
    const q = query(
      collection(db, "calls"),
      where("status", "in", ["accepted", "connected"])
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const callIds: string[] = [];
      const usersInActiveCalls = new Set<string>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        callIds.push(doc.id);

        // Track all users who are in active calls
        if (data.callerId) usersInActiveCalls.add(data.callerId);
        if (data.receiverId) usersInActiveCalls.add(data.receiverId);
      });

      setActiveCallIds(callIds);
      setUsersInCall(usersInActiveCalls);
    });

    return () => unsub();
  }, [userId]);

  return { activeCallIds, usersInCall };
};