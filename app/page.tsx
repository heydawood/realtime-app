// "use client";

// import { useEffect, useState } from "react";
// import { getAllUsers } from "@/lib/users";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/store/useAuthStore";
// import { getChatId } from "@/lib/chat";

// export default function Dashboard() {
//   const [users, setUsers] = useState<any[]>([]);
//   const router = useRouter();

//   const currentUser = useAuthStore((s) => s.user);

//   useEffect(() => {
//     if (!currentUser) return;

//     const fetchUsers = async () => {
//       const data = await getAllUsers();

//       // remove current user from list
//       const filtered = data.filter((u) => u.uid !== currentUser?.uid);

//       setUsers(filtered);
//     };

//     fetchUsers();
//   }, [currentUser]);

//   return (
//     <div className="p-6">
//       <h1 className="text-xl mb-4">Users</h1>

//       <h2 className="mb-2">Select a user to chat with:</h2>

//       {users.map((user) => (
//         <div
//           key={user.uid}
//           className="p-4 border rounded mb-2 cursor-pointer"
//           onClick={() => {
//             const chatId = getChatId(currentUser!.uid, user.uid);
//             router.push(`/chat/${chatId}`);
//           }}
//         >
//           {user.email}
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import UsersList from "@/components/Users/UsersList";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  //NOT LOGGED IN UI
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            Welcome To RealTime App
          </h1>

          <p className="text-muted-foreground">
            Login or Signup to start chatting
          </p>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/login")}>
              Login
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/signup")}
            >
              Signup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 🟢 LOGGED IN UI
  return (
    <div className="flex-1 flex flex-col bg-chat">

      {/* HEADER */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <h2 className="font-semibold">Start New Chat</h2>
      </div>

      {/* USERS LIST */}
      <div className="flex-1 overflow-y-auto">
        <UsersList currentUser={user} />
      </div>

    </div>
  );
}
