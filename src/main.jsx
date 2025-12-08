import { ThemeProvider } from "@/components/theme-provider"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "@/lib/AuthContext";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
