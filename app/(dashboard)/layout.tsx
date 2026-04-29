import { AlertDialogProvider } from "@/components/common/CustomAlert"
import { CallProvider } from "@/contexts/CallContext"

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <AlertDialogProvider>
        

        {children}
        
      </AlertDialogProvider>
    </div>
  )
}

export default layout