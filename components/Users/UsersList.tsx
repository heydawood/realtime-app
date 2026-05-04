"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import UserItem from "./UserItem";

export default function UsersList({ currentUser }: any) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(data);
    });

    return () => unsub();
  }, []);

  return (
    <div>
      {users
        .filter((u) => u.id !== currentUser?.uid)
        .map((user) => (
          <UserItem key={user.id} user={user} currentUser={currentUser} />
        ))}
    </div>
  );
}
