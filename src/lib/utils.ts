import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
export const formatNumber = (value?: number, digits = 0) => value == null ? '—' : value.toLocaleString('en-US', { maximumFractionDigits: digits })
