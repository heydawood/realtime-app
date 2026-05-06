"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useCurrentUser = (uid?: string) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setUserData(snap.data());
      }
    };

    fetchUser();
  }, [uid]);

  return userData;
};