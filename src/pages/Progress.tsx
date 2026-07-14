import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '@/AppContext'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Progress(){
  const {logs,profile}=useApp();const[range,setRange]=useState(30);const data=logs.slice(-range)
  const header=<div className="hidden gap-2 sm:flex">{[7,30,90].map(n=><Button key={n} size="sm" variant={range===n?'default':'outline'} onClick={()=>setRange(n)}>{n} days</Button>)}</div>
  return <><PageHeader eyebrow="Trends" title="Progress" description="Focus on trends, not single-day fluctuations." action={header}/><div className="grid gap-5 xl:grid-cols-2">
    <ChartCard title="Weight" description="Kilograms over time"><ResponsiveContainer width="100%" height={280}><AreaChart data={data.filter(l=>l.weightKg)}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="logDate" tickFormatter={v=>v.slice(5)} fontSize={11}/><YAxis domain={['dataMin - 1','dataMax + 1']} fontSize={11}/><Tooltip/><Area type="monotone" dataKey="weightKg" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={.12} strokeWidth={3}/></AreaChart></ResponsiveContainer></ChartCard>
    <ChartCard title="Body fat" description="Manual measurements"><ResponsiveContainer width="100%" height={280}><AreaChart data={data.filter(l=>l.bodyFatPercentage)}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="logDate" tickFormatter={v=>v.slice(5)} fontSize={11}/><YAxis domain={['dataMin - 1','dataMax + 1']} fontSize={11}/><Tooltip/><Area type="monotone" dataKey="bodyFatPercentage" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={.12} strokeWidth={3}/></AreaChart></ResponsiveContainer></ChartCard>
    <ChartCard title="Calories consumed vs burned" description="Your user-entered totals" className="xl:col-span-2"><ResponsiveContainer width="100%" height={320}><BarChart data={data}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="logDate" tickFormatter={v=>v.slice(5)} fontSize={11}/><YAxis fontSize={11}/><Tooltip/><Legend/><Bar dataKey="caloriesConsumed" name="Consumed" fill="var(--chart-1)" radius={[7,7,0,0]}/><Bar dataKey="totalCaloriesBurned" name="Burned" fill="var(--chart-3)" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
    <ChartCard title="Protein consistency" description={`Daily goal: ${profile.proteinTarget} g`} className="xl:col-span-2"><ResponsiveContainer width="100%" height={280}><BarChart data={data}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="logDate" tickFormatter={v=>v.slice(5)} fontSize={11}/><YAxis fontSize={11}/><Tooltip/><Bar dataKey="proteinGrams" name="Protein (g)" fill="var(--chart-1)" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
  </div></>
}

function ChartCard({title,description,className,children}:{title:string;description:string;className?:string;children:React.ReactNode}){return <Card className={className}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card>}
