import { AlertDialogProvider } from "@/components/common/CustomAlert"

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