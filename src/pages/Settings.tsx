import { useEffect, useState, type FormEvent } from 'react'
import { useTheme } from 'next-themes'
import { sileo } from 'sileo'
import { useApp } from '@/AppContext'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { Profile } from '@/types/models'

export function SettingsPage(){
  const {profile,updateProfile}=useApp();const[form,setForm]=useState(profile);const{setTheme}=useTheme()
  useEffect(()=>setTheme(form.theme),[form.theme,setTheme])
  const set=(key:keyof Profile,value:string)=>setForm(c=>({...c,[key]:key==='displayName'||key==='theme'?value:Number(value)} as Profile))
  const submit=(e:FormEvent)=>{e.preventDefault();updateProfile(form);sileo.success({title:'Settings saved',description:'Your targets have been updated.'})}
  return <><PageHeader eyebrow="Preferences" title="Settings" description="Adjust your personal targets and profile."/><form onSubmit={submit} className="grid gap-5 xl:grid-cols-2"><Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent className="grid gap-5"><div className="grid gap-2"><Label htmlFor="display-name">Display name</Label><Input id="display-name" value={form.displayName} onChange={e=>set('displayName',e.target.value)}/></div><div className="grid gap-2"><Label htmlFor="theme">Interface theme</Label><Select id="theme" value={form.theme} onChange={e=>set('theme',e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select></div></CardContent></Card><Card><CardHeader><CardTitle>Daily targets</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{[['calorieTarget','Calories','kcal'],['proteinTarget','Protein','g'],['targetWeight','Target weight','kg'],['targetBodyFat','Target body fat','%']].map(([key,label,unit])=><div key={key} className="grid gap-2"><Label htmlFor={key}>{label}</Label><div className="relative"><Input id={key} type="number" step="0.1" value={form[key as keyof Profile] as number??''} onChange={e=>set(key as keyof Profile,e.target.value)} className="pr-12"/><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span></div></div>)}</CardContent></Card><div className="xl:col-span-2"><Button size="lg" className="w-full sm:w-auto">Save settings</Button></div></form></>
}
