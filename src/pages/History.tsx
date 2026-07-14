import { Edit3, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sileo } from 'sileo'
import { useApp } from '@/AppContext'
import { PageHeader } from '@/components/common/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function History(){
  const {logs,deleteLog}=useApp()
  const remove=(id:string)=>{ if (!window.confirm('Delete this daily log?')) return; deleteLog(id);sileo.success({title:'Log deleted'}) }
  return <><PageHeader eyebrow="Daily records" title="History" description={`${logs.length} total entries`}/><div className="space-y-3">{[...logs].reverse().map(log=><Card key={log.id} className="py-4"><CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="min-w-36"><p className="font-semibold">{format(new Date(`${log.logDate}T12:00:00`),'MMM d, yyyy')}</p><p className="text-xs text-muted-foreground">Balance {log.caloriesConsumed-log.totalCaloriesBurned>0?'+':''}{log.caloriesConsumed-log.totalCaloriesBurned} kcal</p></div><div className="grid flex-1 grid-cols-2 gap-4 text-sm md:grid-cols-4"><div><span className="text-muted-foreground">Consumed</span><strong className="block">{log.caloriesConsumed} kcal</strong></div><div><span className="text-muted-foreground">Protein</span><strong className="block">{log.proteinGrams} g</strong></div><div><span className="text-muted-foreground">Burned</span><strong className="block">{log.totalCaloriesBurned} kcal</strong></div><div><span className="text-muted-foreground">Weight</span><strong className="block">{log.weightKg??'—'} kg</strong></div></div><div className="flex gap-2"><Link className={cn(buttonVariants({variant:'secondary'}),'flex-1 sm:flex-none')} to={`/log?date=${log.logDate}`}><Edit3/>Edit</Link><Button variant="destructive" size="icon" aria-label="Delete log" onClick={()=>remove(log.id)}><Trash2/></Button></div></CardContent></Card>)}</div></>
}
