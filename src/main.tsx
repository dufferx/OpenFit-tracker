import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { ThemeProvider } from '@/components/theme/theme-provider'
import './index.css'
import 'sileo/styles.css'

registerSW({ immediate: true })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
})
createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange><QueryClientProvider client={queryClient}><App /></QueryClientProvider></ThemeProvider></StrictMode>)
