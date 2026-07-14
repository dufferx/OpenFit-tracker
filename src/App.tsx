import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sileo'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { LogPage } from '@/pages/LogPage'
import { Progress } from '@/pages/Progress'
import { History } from '@/pages/History'
import { SettingsPage } from '@/pages/Settings'

export default function App(){return <BrowserRouter><Routes><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="log" element={<LogPage/>}/><Route path="progress" element={<Progress/>}/><Route path="history" element={<History/>}/><Route path="settings" element={<SettingsPage/>}/></Route></Routes><Toaster position="top-center"/></BrowserRouter>}
