import { GenerateRequest, GenerateResponse, GenerateTestDataRequest, GenerateTestDataResponse } from './types'

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