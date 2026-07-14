import { ArrowDownRight, Flame, Scale, Target, TrendingDown } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useApp } from '@/AppContext'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatNumber } from '@/lib/utils'

export function Dashboard() {
  const { logs, profile } = useApp()
  const today = new Date().toISOString().slice(0,10)
  const latest = [...logs].reverse()[0]
  const todayLog = logs.find(l => l.logDate === today) ?? latest
  const recent = logs.slice(-7)
  const balance = todayLog ? todayLog.caloriesConsumed - todayLog.totalCaloriesBurned : 0
  const avg = (key: 'caloriesConsumed'|'proteinGrams'|'totalCaloriesBurned') => recent.length ? recent.reduce((sum,l)=>sum+l[key],0)/recent.length : 0
  const statCards = [
    { label:'Calories consumed', value: formatNumber(todayLog?.caloriesConsumed), unit:'kcal', icon: Flame, hint:`${Math.round((todayLog?.caloriesConsumed ?? 0)/profile.calorieTarget*100)}% of target`, progress:(todayLog?.caloriesConsumed??0)/profile.calorieTarget*100 },
    { label:'Protein', value: formatNumber(todayLog?.proteinGrams), unit:'g', icon: Target, hint:`Goal ${profile.proteinTarget} g`, progress:(todayLog?.proteinGrams??0)/profile.proteinTarget*100 },
    { label:'Energy balance', value: `${balance > 0 ? '+' : ''}${formatNumber(balance)}`, unit:'kcal', icon: TrendingDown, hint:'Estimated daily balance' },
    { label:'Latest weight', value: formatNumber([...logs].reverse().find(l=>l.weightKg)?.weightKg,1), unit:'kg', icon: Scale, hint:`Target ${profile.targetWeight ?? '—'} kg` },
  ]
  return <>
    <PageHeader eyebrow="Daily overview" title={`Good evening, ${profile.displayName}`} description="A clear snapshot of your body recomposition progress." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(({label,value,unit,icon:Icon,hint,progress})=><Card key={label} className="gap-4"><CardHeader className="flex-row items-center justify-between"><CardDescription>{label}</CardDescription><span className="rounded-lg bg-accent p-2 text-primary"><Icon size={18}/></span></CardHeader><CardContent><div className="flex items-baseline gap-2"><strong className="text-3xl font-semibold">{value}</strong><span className="text-sm text-muted-foreground">{unit}</span></div><p className="mt-2 text-xs text-muted-foreground">{hint}</p>{progress!==undefined&&<Progress value={progress} className="mt-4"/>}</CardContent></Card>)}</section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <Card className="min-h-[340px]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Weight trend</CardTitle><CardDescription className="mt-1">Last recorded measurements</CardDescription></div><Badge variant="secondary">Last 14 days</Badge></CardHeader><CardContent><ResponsiveContainer width="100%" height={240}><AreaChart data={logs.filter(l=>l.weightKg).slice(-14)}><defs><linearGradient id="weight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-1)" stopOpacity={.25}/><stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="logDate" tickFormatter={v=>v.slice(5)} axisLine={false} tickLine={false} fontSize={11}/><Tooltip/><Area type="monotone" dataKey="weightKg" stroke="var(--chart-1)" strokeWidth={3} fill="url(#weight)"/></AreaChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle>Weekly summary</CardTitle><CardDescription>Average of your last seven logs</CardDescription></CardHeader><CardContent><div className="space-y-5">{[
        ['Calories consumed',`${formatNumber(avg('caloriesConsumed'))} kcal`, `${formatNumber(avg('caloriesConsumed')-profile.calorieTarget)} vs target`],
        ['Protein',`${formatNumber(avg('proteinGrams'))} g`, `${Math.round(avg('proteinGrams')/profile.proteinTarget*100)}% target adherence`],
        ['Calories burned',`${formatNumber(avg('totalCaloriesBurned'))} kcal`, 'User-entered estimate'],
      ].map(([label,value,sub])=><div key={label} className="flex items-center justify-between border-b pb-4 last:border-0"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground/75">{sub}</p></div><strong>{value}</strong></div>)}</div><div className="mt-3 flex items-center gap-2 rounded-lg bg-accent p-4 text-sm text-accent-foreground"><ArrowDownRight size={18}/><span>Your estimated average balance is <strong>{formatNumber(avg('caloriesConsumed')-avg('totalCaloriesBurned'))} kcal</strong>.</span></div></CardContent></Card>
    </section>
  </>
}
