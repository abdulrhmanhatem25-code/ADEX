import { BrowserRouter } from "react-router-dom"
import AppRoutes from "@/app/routing/AppRoutes"
import { AuthProvider } from "@/app/providers/AuthProvider"
import { ProfileProvider } from "@/app/providers/ProfileProvider"
import ToastContainer from "@/shared/components/ToastContainer"
import ApiErrorToastHandler from "@/shared/components/ApiErrorToastHandler"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <AppRoutes />
          <ApiErrorToastHandler />
          <ToastContainer />
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

