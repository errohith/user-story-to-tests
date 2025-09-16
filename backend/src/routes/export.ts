import express from 'express'
import { ExportRequestSchema } from '../schemas'
import { buildCsv, buildExcel, buildFeatureFile } from '../services/exportService'

function safeFileName(name?: string, ext?: string) {
  const base = (name || 'export').replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '_') || 'export'
  return ext ? `${base}.${ext}` : base
}

export const exportRouter = express.Router()

exportRouter.post('/csv', async (req: express.Request, res: express.Response): Promise<void> => {
  const parsed = ExportRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message })
    return
  }
  const { cases, fileName } = parsed.data
  if (!cases || !cases.length) {
    res.status(400).json({ error: 'cases are required for CSV export' })
    return
  }
  const csv = buildCsv(cases)
  const fname = safeFileName(fileName, 'csv')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
  res.send(csv)
  return
})

exportRouter.post('/feature', async (req: express.Request, res: express.Response): Promise<void> => {
  const parsed = ExportRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message })
    return
  }
  const { bddFeatures, fileName } = parsed.data
  if (!bddFeatures || !bddFeatures.length) {
    res.status(400).json({ error: 'bddFeatures are required for Feature export' })
    return
  }
  const text = buildFeatureFile(bddFeatures)
  const fname = safeFileName(fileName, 'feature')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
  res.send(text)
  return
})

exportRouter.post('/excel', async (req: express.Request, res: express.Response): Promise<void> => {
  const parsed = ExportRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message })
    return
  }
  const { cases, bddFeatures, fileName } = parsed.data
  if ((!cases || !cases.length) && (!bddFeatures || !bddFeatures.length)) {
    res.status(400).json({ error: 'cases or bddFeatures are required for Excel export' })
    return
  }
  try {
    const buf = await buildExcel(cases, bddFeatures)
    const fname = safeFileName(fileName, 'xlsx')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
    res.send(buf)
    return
  } catch (e: any) {
    console.error('Excel export error:', e)
    res.status(500).json({ error: 'Failed to generate Excel file' })
    return
  }
})
