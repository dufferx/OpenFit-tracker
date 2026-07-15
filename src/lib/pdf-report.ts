import { jsPDF } from 'jspdf'
import { formatCalendarDate } from '@/lib/calendar-date'
import { calculateExportSummary, toExportDailyLogs, type ExportRange } from '@/lib/export-data'
import type { DailyLog, Profile } from '@/types/models'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 42
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const GREEN = [28, 107, 69] as const
const DARK = [31, 41, 35] as const
const MUTED = [98, 109, 102] as const
const LIGHT = [232, 238, 234] as const

type PdfProfile = Profile & { timezone: string }
type Point = { label: string; value: number }

function value(value: number | null, unit = '') {
  return value === null ? 'Not recorded' : `${Math.round(value * 10) / 10}${unit ? ` ${unit}` : ''}`
}

function signedValue(number: number | null) {
  if (number === null) return 'Not recorded'
  const rounded = Math.round(number)
  return `${rounded > 0 ? '+' : ''}${rounded} kcal`
}

function periodLabel(range: ExportRange) {
  return range.from ? `${formatCalendarDate(range.from)} – ${formatCalendarDate(range.to)}` : `All records through ${formatCalendarDate(range.to)}`
}

function sample(points: Point[], maximum = 30) {
  if (points.length <= maximum) return points
  return Array.from({ length: maximum }, (_, index) => points[Math.round(index * (points.length - 1) / (maximum - 1))])
}

export function createProgressReportPdf(profile: PdfProfile, logs: DailyLog[], range: ExportRange, generatedAt = new Date()) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const records = toExportDailyLogs(logs)
  const summary = calculateExportSummary(logs, range)
  let y = MARGIN

  const setText = (size: number, color: readonly [number, number, number] = DARK, style: 'normal' | 'bold' = 'normal') => {
    pdf.setFont('helvetica', style)
    pdf.setFontSize(size)
    pdf.setTextColor(color[0], color[1], color[2])
  }
  const pageBreak = (height: number) => {
    if (y + height <= PAGE_HEIGHT - MARGIN) return
    pdf.addPage()
    y = MARGIN
  }
  const heading = (text: string) => {
    pageBreak(34)
    setText(14, DARK, 'bold')
    pdf.text(text, MARGIN, y)
    y += 22
  }
  const twoColumnRows = (rows: Array<[string, string]>) => {
    for (let index = 0; index < rows.length; index += 2) {
      pageBreak(38)
      const pair = rows.slice(index, index + 2)
      pair.forEach(([label, display], column) => {
        const x = MARGIN + column * (CONTENT_WIDTH / 2)
        setText(8, MUTED, 'bold')
        pdf.text(label.toUpperCase(), x, y)
        setText(11)
        pdf.text(display, x, y + 15)
      })
      y += 38
    }
  }

  pdf.setFillColor(GREEN[0], GREEN[1], GREEN[2])
  pdf.roundedRect(MARGIN, y, 34, 34, 7, 7, 'F')
  setText(20, DARK, 'bold')
  pdf.text('OpenFit Tracker', MARGIN + 46, y + 17)
  setText(9, MUTED)
  pdf.text('Private progress report', MARGIN + 46, y + 31)
  y += 56
  if (profile.displayName) {
    setText(12, DARK, 'bold')
    pdf.text(profile.displayName, MARGIN, y)
    y += 19
  }
  setText(10, MUTED)
  pdf.text(periodLabel(range), MARGIN, y)
  y += 16
  pdf.text(`Timezone: ${profile.timezone}`, MARGIN, y)
  y += 16
  const generatedLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: profile.timezone,
  }).format(generatedAt)
  pdf.text(`Generated: ${generatedLabel}`, MARGIN, y)
  y += 26

  heading('Current targets')
  twoColumnRows([
    ['Calorie target', value(profile.calorieTarget, 'kcal')],
    ['Protein target', value(profile.proteinTarget, 'g')],
    ['Target weight', value(profile.targetWeight, 'kg')],
    ['Target body fat', value(profile.targetBodyFat, '%')],
  ])

  heading('Period summary')
  twoColumnRows([
    ['Logged days', String(summary.loggedDays)],
    ['Calendar-day coverage', `${summary.loggedDays} of ${summary.totalCalendarDays}`],
    ['Average calories consumed', value(summary.averageCaloriesConsumed, 'kcal')],
    ['Average protein', value(summary.averageProteinGrams, 'g')],
    ['Average calories burned', value(summary.averageCaloriesBurned, 'kcal')],
    ['Average estimated balance', signedValue(summary.averageEstimatedBalance)],
    ['Latest weight', value(summary.latestWeightKg, 'kg')],
    ['Latest body fat', value(summary.latestBodyFatPercentage, '%')],
  ])
  setText(8, MUTED)
  pdf.text('Estimated balance is calculated as calories consumed minus user-entered calories burned.', MARGIN, y)
  y += 24

  const drawLineChart = (title: string, points: Point[], unit: string, target: number | null = null) => {
    if (points.length < 2) return
    pageBreak(170)
    setText(11, DARK, 'bold')
    pdf.text(title, MARGIN, y)
    y += 14
    const chart = { x: MARGIN, y, width: CONTENT_WIDTH, height: 116 }
    const values = points.map(point => point.value).concat(target === null ? [] : [target])
    let minimum = Math.min(...values)
    let maximum = Math.max(...values)
    if (minimum === maximum) { minimum -= 1; maximum += 1 }
    const xAt = (index: number) => chart.x + index * chart.width / (points.length - 1)
    const yAt = (number: number) => chart.y + chart.height - ((number - minimum) / (maximum - minimum)) * chart.height
    pdf.setDrawColor(LIGHT[0], LIGHT[1], LIGHT[2])
    pdf.setLineWidth(.8)
    pdf.line(chart.x, chart.y, chart.x, chart.y + chart.height)
    pdf.line(chart.x, chart.y + chart.height, chart.x + chart.width, chart.y + chart.height)
    if (target !== null) {
      pdf.setDrawColor(98, 109, 102)
      pdf.setLineDashPattern([4, 3], 0)
      pdf.line(chart.x, yAt(target), chart.x + chart.width, yAt(target))
      pdf.setLineDashPattern([], 0)
    }
    pdf.setDrawColor(GREEN[0], GREEN[1], GREEN[2])
    pdf.setLineWidth(2)
    points.slice(1).forEach((point, index) => pdf.line(xAt(index), yAt(points[index].value), xAt(index + 1), yAt(point.value)))
    pdf.setFillColor(GREEN[0], GREEN[1], GREEN[2])
    points.forEach((point, index) => pdf.circle(xAt(index), yAt(point.value), 2.3, 'F'))
    setText(8, MUTED)
    pdf.text(`${Math.round(maximum * 10) / 10} ${unit}`, chart.x, chart.y - 3)
    pdf.text(`${Math.round(minimum * 10) / 10} ${unit}`, chart.x, chart.y + chart.height + 12)
    pdf.text(points[0].label, chart.x, chart.y + chart.height + 25)
    pdf.text(points.at(-1)?.label ?? '', chart.x + chart.width, chart.y + chart.height + 25, { align: 'right' })
    y += 153
  }

  const drawBarChart = (title: string, first: Point[], second: Point[] | null, labels: [string, string?], target: number | null = null) => {
    if (!first.length) return
    const primary = sample(first)
    const secondary = second ? sample(second) : null
    pageBreak(180)
    setText(11, DARK, 'bold')
    pdf.text(title, MARGIN, y)
    y += 14
    const chart = { x: MARGIN, y, width: CONTENT_WIDTH, height: 116 }
    const allValues = primary.map(point => point.value).concat(secondary?.map(point => point.value) ?? [], target ?? [])
    const maximum = Math.max(1, ...allValues)
    const groupWidth = chart.width / primary.length
    const barWidth = Math.max(2, Math.min(7, groupWidth * (secondary ? .32 : .55)))
    if (target !== null) {
      const targetY = chart.y + chart.height - (target / maximum) * chart.height
      pdf.setDrawColor(98, 109, 102)
      pdf.setLineDashPattern([4, 3], 0)
      pdf.line(chart.x, targetY, chart.x + chart.width, targetY)
      pdf.setLineDashPattern([], 0)
    }
    primary.forEach((point, index) => {
      const x = chart.x + index * groupWidth + groupWidth / 2
      const height = point.value / maximum * chart.height
      pdf.setFillColor(GREEN[0], GREEN[1], GREEN[2])
      pdf.rect(x - (secondary ? barWidth : barWidth / 2), chart.y + chart.height - height, barWidth, height, 'F')
      if (secondary) {
        const secondaryHeight = secondary[index].value / maximum * chart.height
        pdf.setFillColor(123, 151, 134)
        pdf.rect(x + 1, chart.y + chart.height - secondaryHeight, barWidth, secondaryHeight, 'F')
      }
    })
    setText(8, MUTED)
    pdf.text(`${Math.round(maximum)} ${title.includes('Protein') ? 'g' : 'kcal'}`, chart.x, chart.y - 3)
    pdf.text(`${primary[0].label} – ${primary.at(-1)?.label}`, chart.x, chart.y + chart.height + 13)
    pdf.text(secondary ? `${labels[0]} / ${labels[1]}` : `${labels[0]}${target === null ? '' : ' / target'}`, chart.x + chart.width, chart.y + chart.height + 13, { align: 'right' })
    if (first.length > primary.length) pdf.text(`Chart uses ${primary.length} evenly spaced records from the selected period.`, chart.x, chart.y + chart.height + 27)
    y += 160
  }

  heading('Progress visuals')
  const weight = records.flatMap(record => record.weightKg === null ? [] : [{ label: record.date, value: record.weightKg }])
  const bodyFat = records.flatMap(record => record.bodyFatPercentage === null ? [] : [{ label: record.date, value: record.bodyFatPercentage }])
  drawLineChart('Weight trend', sample(weight), 'kg', profile.targetWeight)
  drawLineChart('Body-fat trend', sample(bodyFat), '%', profile.targetBodyFat)
  drawBarChart(
    'Calories consumed vs burned',
    records.map(record => ({ label: record.date, value: record.caloriesConsumed })),
    records.map(record => ({ label: record.date, value: record.totalCaloriesBurned })),
    ['Consumed', 'Burned'],
  )
  drawBarChart('Protein values and target', records.map(record => ({ label: record.date, value: record.proteinGrams })), null, ['Protein'], profile.proteinTarget)
  if (weight.length < 2 && bodyFat.length < 2 && records.length === 0) {
    setText(9, MUTED)
    pdf.text('No chart data is available for this period.', MARGIN, y)
    y += 18
  }

  heading('Daily records')
  const selectedRecords = records.length <= 60 ? records : records.slice(-30)
  if (records.length > selectedRecords.length) {
    setText(9, MUTED)
    pdf.text(`Showing the 30 most recent records from ${records.length} selected records.`, MARGIN, y)
    y += 18
  }
  const widths = [84, 82, 82, 72, 70, 70]
  const headers = ['Date', 'Consumed', 'Burned', 'Protein', 'Weight', 'Body fat']
  const tableHeader = () => {
    pageBreak(34)
    pdf.setFillColor(238, 243, 240)
    pdf.rect(MARGIN, y, CONTENT_WIDTH, 22, 'F')
    let x = MARGIN + 4
    setText(8, DARK, 'bold')
    headers.forEach((header, index) => { pdf.text(header, x, y + 14); x += widths[index] })
    y += 22
  }
  tableHeader()
  selectedRecords.forEach(record => {
    if (y + 22 > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; tableHeader() }
    let x = MARGIN + 4
    setText(8)
    const cells = [record.date, String(record.caloriesConsumed), String(record.totalCaloriesBurned), `${record.proteinGrams} g`, value(record.weightKg, 'kg'), value(record.bodyFatPercentage, '%')]
    cells.forEach((cell, index) => { pdf.text(cell, x, y + 14, { maxWidth: widths[index] - 6 }); x += widths[index] })
    pdf.setDrawColor(LIGHT[0], LIGHT[1], LIGHT[2])
    pdf.line(MARGIN, y + 22, MARGIN + CONTENT_WIDTH, y + 22)
    y += 22
  })

  const pages = pdf.getNumberOfPages()
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page)
    setText(8, MUTED)
    pdf.text('OpenFit Tracker · Private fitness information', MARGIN, PAGE_HEIGHT - 18)
    pdf.text(`${page} / ${pages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 18, { align: 'right' })
  }

  return pdf.output('blob')
}
