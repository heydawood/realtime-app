"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/users";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getChatId } from "@/lib/chat";

export default function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      const data = await getAllUsers();

      // remove current user from list
      const filtered = data.filter((u) => u.uid !== currentUser?.uid);

      setUsers(filtered);
    };

    fetchUsers();
  }, [currentUser]);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Users</h1>

      {users.map((user) => (
        <div
          key={user.uid}
          className="p-4 border rounded mb-2 cursor-pointer"
          onClick={() => {
            const chatId = getChatId(currentUser!.uid, user.uid);
            router.push(`/chat/${chatId}`);
          }}
        >
          {user.email}
        </div>
      ))}
    </div>
  );
}
