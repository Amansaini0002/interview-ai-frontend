import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { InterviewProvider } from "./features/interview/interview.context.jsx";
import { SidebarProvider } from "./context/SidebarContext.jsx";
import { ToastProvider } from "./Toast/Toast.jsx";

function App() {

 return (
   <ToastProvider>
     <AuthProvider>
       <InterviewProvider>
         <SidebarProvider>
           <RouterProvider router={router} />
         </SidebarProvider>
       </InterviewProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App