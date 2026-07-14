import { Activity } from 'lucide-react'
import { Navigate } from 'react-router-dom'
export function Login(){return <Navigate to="/" replace/>}
export function AuthPreview(){return <div className="grid min-h-screen place-items-center bg-[#f5f7f5] p-4"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><div className="mb-8 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[#1c6b45] text-white"><Activity/></div><div><h1 className="font-semibold">OpenFit Tracker</h1><p className="text-sm text-black/45">Supabase authentication placeholder</p></div></div><p className="text-sm text-black/55">Add your Supabase environment variables to enable email/password and Google authentication. Demo mode currently opens the app directly.</p></div></div>}
