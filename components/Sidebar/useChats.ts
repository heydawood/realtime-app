"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useChats = (userId: string | undefined) => {
  const [chats, setChats] = useState<any[]>([]);
  

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(data);
      console.log("Fetched chats for user:", data);
    });

    return () => unsub();
  }, [userId]);

  return { chats };
};
