import { AlertDialogProvider } from "@/components/common/CustomAlert"
import Sidebar from "@/components/Sidebar/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full flex overflow-hidden">
      <AlertDialogProvider>

        <SidebarProvider>
          <Sidebar />


          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col bg-chat">
            {children}
          </div>


        </SidebarProvider>

      </AlertDialogProvider>
    </div>
  )
}

export default layout