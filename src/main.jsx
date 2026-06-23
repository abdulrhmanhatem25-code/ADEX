import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/app/providers/i18n.js' // <-- Add i18n import
import App from '@/app/App.jsx'
import { ThemeProvider } from "@/app/providers/ThemeProvider"
import ErrorBoundary from "@/shared/components/ErrorBoundary"

createRoot(document.getElementById('root')).render(
  
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  ,
)
