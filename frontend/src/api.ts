import { 
  GenerateRequest, 
  GenerateResponse, 
  GenerateTestDataRequest, 
  GenerateTestDataResponse,
  JiraStory,
  JiraSearchRequest,
  JiraSearchResponse,
  JiraProject,
  JiraLinkRequest,
  JiraLinkResponse
} from './types'

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

// JIRA API Functions
export async function fetchJiraStory(storyId: string): Promise<JiraStory> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/stories/${encodeURIComponent(storyId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('JIRA story not found. Please check the ID.')
      } else if (response.status === 502) {
        throw new Error('JIRA service unavailable. Please check your JIRA configuration.')
      }
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: JiraStory = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching JIRA story:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function searchJiraStories(searchRequest: JiraSearchRequest): Promise<JiraSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchRequest),
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error('JIRA service unavailable. Please check your JIRA configuration.')
      }
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: JiraSearchResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error searching JIRA stories:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function fetchJiraProjects(): Promise<JiraProject[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error('JIRA service unavailable. Please check your JIRA configuration.')
      }
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: JiraProject[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching JIRA projects:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function linkTestsToJira(linkRequest: JiraLinkRequest): Promise<JiraLinkResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(linkRequest),
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error('JIRA service unavailable. Please check your JIRA configuration.')
      }
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: JiraLinkResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error linking tests to JIRA:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function checkJiraHealth(): Promise<{ status: string; service: string; timestamp: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error checking JIRA health:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}