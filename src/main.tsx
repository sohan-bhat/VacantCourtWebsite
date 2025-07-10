import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './components/auth/AuthContext.tsx'
import { HelmetProvider } from 'react-helmet-async'


createRoot(document.getElementById('root')!).render(
    <HelmetProvider>
        <AuthProvider>
            <App />
        </AuthProvider>
    </HelmetProvider>
)