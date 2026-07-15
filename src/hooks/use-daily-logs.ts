import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import {
  createDailyLog,
  deleteDailyLog,
  fetchDailyLogByDate,
  fetchDailyLogs,
  fetchDailyLogsByRange,
  updateDailyLog,
  upsertDailyLog,
} from '@/lib/daily-logs'
import { fetchDailyLogsForExport } from '@/lib/export-query'
import type { InclusiveDateRange } from '@/lib/calendar-date'
import type { ProgressRange } from '@/lib/progress-data'
import type { DailyLogInput } from '@/types/models'

export const dailyLogKeys = {
  all: ['daily-logs'] as const,
  user: (userId: string) => [...dailyLogKeys.all, userId] as const,
  allTime: (userId: string) => [...dailyLogKeys.user(userId), 'all'] as const,
  range: (userId: string, from: string, to: string) => [...dailyLogKeys.user(userId), 'range', from, to] as const,
  date: (userId: string, logDate: string) => [...dailyLogKeys.user(userId), 'date', logDate] as const,
  export: (userId: string, from: string | null, to: string) => [...dailyLogKeys.user(userId), 'export', from ?? 'all', to] as const,
}

export function useExportDailyLogs(from: string | null, to: string, enabled = true) {
  const { user, isLoading: isAuthLoading } = useAuth()
  return useQuery({
    queryKey: dailyLogKeys.export(user?.id ?? 'signed-out', from, to),
    queryFn: () => fetchDailyLogsForExport(from, to),
    enabled: enabled && !isAuthLoading && Boolean(user) && Boolean(to),
  })
}

export function useDailyLogs() {
  const { user, isLoading: isAuthLoading } = useAuth()
  return useQuery({
    queryKey: dailyLogKeys.allTime(user?.id ?? 'signed-out'),
    queryFn: fetchDailyLogs,
    enabled: !isAuthLoading && Boolean(user),
  })
}

export function useProgressDailyLogs(range: ProgressRange, boundaries: InclusiveDateRange | null) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const userId = user?.id ?? 'signed-out'
  const isAllTime = range === 'all'
  const from = boundaries?.from ?? ''
  const to = boundaries?.to ?? ''

  return useQuery({
    queryKey: isAllTime ? dailyLogKeys.allTime(userId) : dailyLogKeys.range(userId, from, to),
    queryFn: isAllTime ? fetchDailyLogs : () => fetchDailyLogsByRange(from, to),
    enabled: !isAuthLoading && Boolean(user) && (isAllTime || Boolean(from && to)),
  })
}

export function useDailyLogsByRange(from: string, to: string) {
  const { user, isLoading: isAuthLoading } = useAuth()
  return useQuery({
    queryKey: dailyLogKeys.range(user?.id ?? 'signed-out', from, to),
    queryFn: () => fetchDailyLogsByRange(from, to),
    enabled: !isAuthLoading && Boolean(user) && Boolean(from) && Boolean(to),
  })
}

export function useDailyLogByDate(logDate: string) {
  const { user, isLoading: isAuthLoading } = useAuth()
  return useQuery({
    queryKey: dailyLogKeys.date(user?.id ?? 'signed-out', logDate),
    queryFn: () => fetchDailyLogByDate(logDate),
    enabled: !isAuthLoading && Boolean(user) && Boolean(logDate),
  })
}

function useInvalidateDailyLogs() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return () => user
    ? queryClient.invalidateQueries({ queryKey: dailyLogKeys.user(user.id) })
    : Promise.resolve()
}

export function useCreateDailyLog() {
  const invalidate = useInvalidateDailyLogs()
  return useMutation({ mutationFn: createDailyLog, onSuccess: invalidate })
}

export function useUpdateDailyLog() {
  const invalidate = useInvalidateDailyLogs()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DailyLogInput }) => updateDailyLog(id, input),
    onSuccess: invalidate,
  })
}

export function useUpsertDailyLog() {
  const invalidate = useInvalidateDailyLogs()
  return useMutation({ mutationFn: upsertDailyLog, onSuccess: invalidate })
}

export function useDeleteDailyLog() {
  const invalidate = useInvalidateDailyLogs()
  return useMutation({ mutationFn: deleteDailyLog, onSuccess: invalidate })
}
