"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useChats = (userId: string | undefined, activeChatId?: string) => {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        let chatData: any = {
          id: doc.id,
          ...doc.data(),
        };

        // If this is the currently active chat, force unreadCount to 0 on UI
        if (activeChatId && doc.id === activeChatId && userId) {
          chatData.unreadCount = {
            ...chatData.unreadCount,
            [userId]: 0,
          };
        }
       

        return chatData;
      });

      setChats(data);
      // console.log("Fetched chats for user:", data);
    });

    return () => unsub();
  }, [userId, activeChatId]); // Add activeChatId to dependency array

  // Mark active chat as read in Firestore (in background)
  useEffect(() => {
    if (!activeChatId || !userId) return;

    const chatRef = doc(db, "chats", activeChatId);
    updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
    }).catch((err) => console.log("Failed to mark chat as read", err));
  }, [activeChatId, userId]);

  return { chats };
};