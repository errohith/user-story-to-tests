import axios, { AxiosInstance, AxiosError } from 'axios'
import { 
  JiraStory, 
  JiraProject, 
  JiraSearchRequest, 
  JiraSearchResponse, 
  JiraLinkRequest, 
  JiraLinkResponse 
} from '../schemas'

export class JiraService {
  private client!: AxiosInstance
  private baseUrl!: string
  private isConfigured!: boolean

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    this.baseUrl = process.env.JIRA_BASE_URL || ''
    const username = process.env.JIRA_USERNAME || ''
    const apiToken = process.env.JIRA_API_TOKEN || ''
    
    this.isConfigured = !!(this.baseUrl && username && apiToken)
    
    if (!this.isConfigured) {
      console.warn('JIRA service not configured. Set JIRA_BASE_URL, JIRA_USERNAME, and JIRA_API_TOKEN environment variables.')
      // Create a dummy client to prevent errors
      this.client = axios.create({
        timeout: 1000
      })
      return
    }

    this.client = axios.create({
      baseURL: `${this.baseUrl}/rest/api/3`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username,
        password: apiToken
      },
      timeout: 10000 // 10 second timeout
    })

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`JIRA API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('JIRA API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`JIRA API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error: AxiosError) => {
        console.error('JIRA API Response Error:', error.response?.status, error.message)
        
        if (error.response?.status === 401) {
          throw new Error('JIRA API error: Unauthorized. Please check your credentials.')
        } else if (error.response?.status === 403) {
          throw new Error('JIRA API error: Forbidden. Insufficient permissions.')
        } else if (error.response?.status === 404) {
          throw new Error('JIRA API error: Resource not found.')
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('JIRA API error: Connection refused. Please check the JIRA base URL.')
        } else if (error.code === 'ETIMEDOUT') {
          throw new Error('JIRA API error: Request timeout. JIRA service may be slow or unavailable.')
        }
        
        throw new Error(`JIRA API error: ${error.message}`)
      }
    )
  }

  private ensureConfigured() {
    if (!this.isConfigured) {
      this.initializeService()
    }
    if (!this.isConfigured) {
      throw new Error('JIRA service not configured')
    }
  }

  /**
   * Check if JIRA service is properly configured
   */
  public isServiceConfigured(): boolean {
    return this.isConfigured
  }

  /**
   * Get a specific JIRA story by ID or key
   */
  async getStory(idOrKey: string): Promise<JiraStory> {
    this.ensureConfigured()

    try {
      const response = await this.client.get(`/issue/${idOrKey}`, {
        params: {
          fields: 'summary,description,status,priority,issuetype,assignee,created,updated,project'
        }
      })

      const issue = response.data

      return {
        id: issue.key,
        key: issue.key,
        title: issue.fields.summary,
        description: issue.fields.description?.content?.[0]?.content?.[0]?.text || issue.fields.description || '',
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'None',
        issueType: issue.fields.issuetype.name,
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        created: issue.fields.created,
        updated: issue.fields.updated,
        project: {
          key: issue.fields.project.key,
          name: issue.fields.project.name
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Resource not found')) {
        throw new Error('Story not found')
      }
      throw error
    }
  }

  /**
   * Search JIRA stories based on criteria
   */
  async searchStories(searchRequest: JiraSearchRequest): Promise<JiraSearchResponse> {
    this.ensureConfigured()

    try {
      // Build JQL query
      let jql = ''
      
      if (searchRequest.query) {
        // Search in summary and description
        jql += `(summary ~ "${searchRequest.query}" OR description ~ "${searchRequest.query}")`
      }
      
      if (searchRequest.projectKey) {
        if (jql) jql += ' AND '
        jql += `project = "${searchRequest.projectKey}"`
      }
      
      if (searchRequest.issueTypes?.length) {
        if (jql) jql += ' AND '
        jql += `issuetype IN (${searchRequest.issueTypes.map(type => `"${type}"`).join(', ')})`
      }
      
      if (searchRequest.statuses?.length) {
        if (jql) jql += ' AND '
        jql += `status IN (${searchRequest.statuses.map(status => `"${status}"`).join(', ')})`
      }
      
      // Default query if nothing specified
      if (!jql) {
        jql = 'issuetype IN (Story, Task, Bug) ORDER BY updated DESC'
      } else {
        jql += ' ORDER BY updated DESC'
      }

      const response = await this.client.post('/search', {
        jql,
        startAt: searchRequest.startAt || 0,
        maxResults: Math.min(searchRequest.maxResults || 50, 100), // Limit to 100
        fields: ['summary', 'description', 'status', 'priority', 'issuetype', 'assignee', 'created', 'updated', 'project']
      })

      const results = response.data

      return {
        issues: results.issues.map((issue: any) => ({
          id: issue.key,
          key: issue.key,
          title: issue.fields.summary,
          description: issue.fields.description?.content?.[0]?.content?.[0]?.text || issue.fields.description || '',
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name || 'None',
          issueType: issue.fields.issuetype.name,
          assignee: issue.fields.assignee?.displayName || 'Unassigned',
          created: issue.fields.created,
          updated: issue.fields.updated,
          project: {
            key: issue.fields.project.key,
            name: issue.fields.project.name
          }
        })),
        total: results.total,
        startAt: results.startAt,
        maxResults: results.maxResults
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Search by raw JQL string
   */
  async searchByJql(jql: string, startAt = 0, maxResults = 50): Promise<JiraSearchResponse> {
    this.ensureConfigured()

    const response = await this.client.post('/search', {
      jql,
      startAt,
      maxResults: Math.min(maxResults, 100),
      fields: ['summary', 'description', 'status', 'priority', 'issuetype', 'assignee', 'created', 'updated', 'project']
    })

    const results = response.data

    return {
      issues: results.issues.map((issue: any) => ({
        id: issue.key,
        key: issue.key,
        title: issue.fields.summary,
        description: issue.fields.description?.content?.[0]?.content?.[0]?.text || issue.fields.description || '',
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'None',
        issueType: issue.fields.issuetype.name,
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        created: issue.fields.created,
        updated: issue.fields.updated,
        project: {
          key: issue.fields.project.key,
          name: issue.fields.project.name
        }
      })),
      total: results.total,
      startAt: results.startAt,
      maxResults: results.maxResults
    }
  }

  /**
   * Get available JIRA projects
   */
  async getProjects(): Promise<JiraProject[]> {
    this.ensureConfigured()

    try {
      const response = await this.client.get('/project', {
        params: {
          expand: 'description,lead,issueTypes'
        }
      })

      return response.data.map((project: any) => ({
        key: project.key,
        name: project.name,
        description: project.description || '',
        lead: project.lead?.displayName || 'Unknown',
        issueTypes: project.issueTypes?.map((type: any) => ({
          id: type.id,
          name: type.name,
          description: type.description || ''
        })) || []
      }))
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all issue types
   */
  async getIssueTypes(): Promise<Array<{ id: string; name: string; description?: string }>> {
    this.ensureConfigured()
    const resp = await this.client.get('/issuetype')
    return resp.data.map((t: any) => ({ id: t.id, name: t.name, description: t.description }))
  }

  /**
   * Get an issue type by id
   */
  async getIssueType(id: string): Promise<{ id: string; name: string; description?: string }> {
    this.ensureConfigured()
    const resp = await this.client.get(`/issuetype/${id}`)
    const t = resp.data
    return { id: t.id, name: t.name, description: t.description }
  }

  /**
   * Link test cases or BDD features to a JIRA story
   * This creates a comment on the JIRA story with the test information
   */
  async linkTests(linkRequest: JiraLinkRequest): Promise<JiraLinkResponse> {
    this.ensureConfigured()

    try {
      // First, verify the story exists
      await this.getStory(linkRequest.storyId)

      // Create a formatted comment with the test information
      let commentBody = `*Automated Test Cases Generated*\n\n`
      
      if (linkRequest.testCases?.length) {
        commentBody += `*Manual Test Cases (${linkRequest.testCases.length}):*\n`
        linkRequest.testCases.forEach((testCase, index) => {
          commentBody += `${index + 1}. *${testCase.title}* (${testCase.category})\n`
          commentBody += `   Expected: ${testCase.expectedResult}\n\n`
        })
      }

      if (linkRequest.bddFeatures?.length) {
        commentBody += `*BDD Features (${linkRequest.bddFeatures.length}):*\n`
        linkRequest.bddFeatures.forEach((feature, index) => {
          commentBody += `${index + 1}. *Feature:* ${feature.name}\n`
          commentBody += `   Scenarios: ${feature.scenarios.length}\n\n`
        })
      }

      commentBody += `\n_Generated on ${new Date().toLocaleString()}_`

      // Add comment to the JIRA story
      await this.client.post(`/issue/${linkRequest.storyId}/comment`, {
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: commentBody
                }
              ]
            }
          ]
        }
      })

      return {
        success: true,
        message: 'Tests successfully linked to JIRA story',
        storyId: linkRequest.storyId,
        linkedTestsCount: (linkRequest.testCases?.length || 0) + (linkRequest.bddFeatures?.length || 0)
      }
    } catch (error) {
      console.error('Error linking tests to JIRA:', error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to link tests to JIRA story',
        storyId: linkRequest.storyId,
        linkedTestsCount: 0
      }
    }
  }

  /**
   * Test the JIRA connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    this.ensureConfigured()

    try {
      await this.client.get('/myself')
      return {
        success: true,
        message: 'JIRA connection successful'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to JIRA'
      }
    }
  }
}