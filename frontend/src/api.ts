import { GenerateRequest, GenerateResponse, GenerateTestDataRequest, GenerateTestDataResponse, TestCase, BddFeature } from './types'
import { downloadBlob, sanitizeFileName } from './utils/download'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

export async function generateTestData(request: GenerateTestDataRequest): Promise<GenerateTestDataResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-test-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateTestDataResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating test data:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function generateTests(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating tests:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function exportAsCsv(payload: { cases: TestCase[], fileName?: string, storyTitle?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/export/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cases: payload.cases, fileName: payload.fileName })
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  const blob = await response.blob()
  const base = sanitizeFileName(payload.fileName || payload.storyTitle || 'test_cases')
  downloadBlob(blob, `${base}.csv`)
}

export async function exportAsExcel(payload: { cases?: TestCase[], bddFeatures?: BddFeature[], fileName?: string, storyTitle?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/export/excel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cases: payload.cases, bddFeatures: payload.bddFeatures, fileName: payload.fileName })
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  const blob = await response.blob()
  const base = sanitizeFileName(payload.fileName || payload.storyTitle || 'test_export')
  downloadBlob(blob, `${base}.xlsx`)
}

export async function exportAsFeature(payload: { bddFeatures: BddFeature[], fileName?: string, storyTitle?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/export/feature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bddFeatures: payload.bddFeatures, fileName: payload.fileName })
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  const blob = await response.blob()
  const base = sanitizeFileName(payload.fileName || payload.storyTitle || 'features')
  downloadBlob(blob, `${base}.feature`)
}