import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { AppProvider } from './AppContext'
import { ThemeProvider } from '@/components/theme/theme-provider'
import './index.css'
import 'sileo/styles.css'

registerSW({ immediate: true })
const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange><QueryClientProvider client={queryClient}><AppProvider><App/></AppProvider></QueryClientProvider></ThemeProvider></StrictMode>)
