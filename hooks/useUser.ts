"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useUser = (uid?: string) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!uid) return;

    const unsub = onSnapshot(doc(db, "users", uid), (docSnap) => {
      if (docSnap.exists()) {
        setUser(docSnap.data());
      }
    });

    return () => unsub();
  }, [uid]);

  return user;
};