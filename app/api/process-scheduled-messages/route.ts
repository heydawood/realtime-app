import { NextRequest, NextResponse } from "next/server";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function GET(req: NextRequest) {

  // SECURITY CHECK
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {

    // GET ALL PENDING SCHEDULED MESSAGES
    const q = query(
      collection(db, "scheduledMessages"),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    for (const scheduledDoc of snapshot.docs) {

      const data = scheduledDoc.data();

      // SKIP IF NOT YET TIME
      if (data.scheduledFor > Date.now()) {
        continue;
      }

      // SEND MESSAGE
      await addDoc(
        collection(db, "chats", data.chatId, "messages"),
        {
          text: data.text,
          senderId: data.senderId,
          createdAt: Date.now(),
          scheduled: true,
        }
      );

      // UPDATE CHAT
      const chatRef = doc(db, "chats", data.chatId);

      await updateDoc(chatRef, {
        lastMessage: data.text,
        lastMessageAt: Date.now(),
        lastMessageSenderId: data.senderId,
        [`unreadCount.${data.receiverId}`]: increment(1),
      });

      // MARK MESSAGE AS SENT
      await updateDoc(
        doc(db, "scheduledMessages", scheduledDoc.id),
        {
          status: "sent",
          sentAt: Date.now(),
        }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}