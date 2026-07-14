import { useEffect, useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { sileo } from 'sileo'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '@/AppContext'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function LogPage() {
  const { logs, upsertLog } = useApp()
  const [params] = useSearchParams()
  const initialDate = params.get('date') ?? new Date().toISOString().slice(0,10)
  const [date, setDate] = useState(initialDate)
  const existing = logs.find(l=>l.logDate===date)
  const [form, setForm] = useState({ caloriesConsumed:'', proteinGrams:'', totalCaloriesBurned:'', weightKg:'', bodyFatPercentage:'', notes:'' })
  useEffect(()=>setForm({ caloriesConsumed: existing?.caloriesConsumed?.toString() ?? '', proteinGrams: existing?.proteinGrams?.toString() ?? '', totalCaloriesBurned: existing?.totalCaloriesBurned?.toString() ?? '', weightKg: existing?.weightKg?.toString() ?? '', bodyFatPercentage: existing?.bodyFatPercentage?.toString() ?? '', notes: existing?.notes ?? '' }), [date, existing])
  const set = (key:string, value:string)=>setForm(current=>({...current,[key]:value}))
  const submit=(event:FormEvent)=>{event.preventDefault(); if(!form.caloriesConsumed||!form.proteinGrams||!form.totalCaloriesBurned){sileo.error({title:'Missing required fields',description:'Calories, protein, and burned calories are required.'});return} upsertLog({id:existing?.id,logDate:date,caloriesConsumed:Number(form.caloriesConsumed),proteinGrams:Number(form.proteinGrams),totalCaloriesBurned:Number(form.totalCaloriesBurned),weightKg:form.weightKg?Number(form.weightKg):undefined,bodyFatPercentage:form.bodyFatPercentage?Number(form.bodyFatPercentage):undefined,notes:form.notes||undefined});sileo.success({title: existing?'Daily log updated':'Daily log saved',description:'Your progress has been updated.'})}
  return <><PageHeader eyebrow="Quick entry" title={existing?'Edit daily log':'Log your day'} description="Keep it simple. Enter the totals you already know."/><Card className="mx-auto max-w-3xl"><CardContent><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="log-date">Date</Label><Input id="log-date" type="date" value={date} max={new Date().toISOString().slice(0,10)} onChange={e=>setDate(e.target.value)}/></div>{[
    ['caloriesConsumed','Calories consumed','kcal'],['proteinGrams','Protein consumed','g'],['totalCaloriesBurned','Total calories burned','kcal'],['weightKg','Weight (optional)','kg'],['bodyFatPercentage','Body fat (optional)','%']
  ].map(([key,label,unit])=><div key={key} className="grid gap-2"><Label htmlFor={key}>{label}</Label><div className="relative"><Input id={key} inputMode="decimal" type="number" step="0.1" min="0" value={form[key as keyof typeof form]} onChange={e=>set(key,e.target.value)} placeholder="0" className="pr-14"/><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span></div></div>)}<div className="grid gap-2 sm:col-span-2"><Label htmlFor="notes">Notes (optional)</Label><Textarea id="notes" value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Anything worth remembering about today?"/></div><div className="sm:col-span-2"><Button size="lg" className="w-full"><Save/>{existing?'Update daily log':'Save daily log'}</Button></div></form></CardContent></Card></>
}
