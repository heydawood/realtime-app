import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewChatModal from "../chat/NewChatModal";

export default function SidebarFooter() {

    

  return (
    <div className="p-3 border-t">
      <NewChatModal>
        <Button className="w-full flex gap-2 text-white">
          <Plus size={18} />
          New Chat
        </Button>
      </NewChatModal>
    </div>
  );
}