"use client";

import { useAuthStore } from "@/store/useAuthStore";
import UsersList from "../Users/UsersList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react";

export default function NewChatModal({ children }: any) {
    const user = useAuthStore((s) => s.user);
    const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          <UsersList currentUser={user} onSelectUser={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}