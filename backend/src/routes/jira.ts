import { Router } from 'express'
import { JiraService } from '../services/jiraService'
import { 
  JiraSearchRequestSchema, 
  JiraLinkRequestSchema 
} from '../schemas'

const router = Router()
const jiraService = new JiraService()

// Search JIRA stories (structured request)
router.post('/search', async (req, res) => {
  try {
    const searchRequest = JiraSearchRequestSchema.parse(req.body)
    const results = await jiraService.searchStories(searchRequest)
    return res.json(results)
  } catch (error) {
    console.error('Error searching JIRA stories:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return res.status(400).json({ 
          error: 'Invalid request parameters',
          details: error.message 
        })
      }
      
      if (error.message.includes('JIRA API error')) {
        return res.status(502).json({ 
          error: 'JIRA service unavailable',
          details: error.message 
        })
      }
    }
    
    return res.status(500).json({ 
      error: 'Internal server error while searching stories' 
    })
  }
})

// Get specific JIRA issue by ID or key (JIRA v2-like path for compatibility)
router.get('/rest/api/2/issue/:issueidOrKey', async (req, res) => {
  try {
    const { issueidOrKey } = req.params
    
    if (!issueidOrKey) {
      return res.status(400).json({ 
        error: 'Issue ID or key is required' 
      })
    }
    
    const story = await jiraService.getStory(issueidOrKey)
    return res.json(story)
  } catch (error) {
    console.error('Error fetching JIRA story:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Story not found') {
        return res.status(404).json({ 
          error: 'Issue not found',
          details: `No issue found with ID or key: ${req.params.issueidOrKey}`
        })
      }
      
      if (error.message.includes('JIRA API error')) {
        return res.status(502).json({ 
          error: 'JIRA service unavailable',
          details: error.message 
        })
      }
    }
    
    return res.status(500).json({ 
      error: 'Internal server error while fetching issue' 
    })
  }
})

// JQL Search endpoint (JIRA v2-like path for compatibility)
router.get('/rest/api/2/search', async (req, res) => {
  try {
    const jqlRaw = req.query.jql
    const startAt = parseInt(String(req.query.startAt || 0), 10) || 0
    const maxResults = parseInt(String(req.query.maxResults || 50), 10) || 50

    if (!jqlRaw || typeof jqlRaw !== 'string' || !jqlRaw.trim()) {
      return res.status(400).json({ error: 'Query parameter "jql" is required' })
    }

    const results = await jiraService.searchByJql(jqlRaw, startAt, maxResults)
    return res.json(results)
  } catch (error) {
    console.error('Error performing JQL search:', error)
    if (error instanceof Error && error.message.includes('JIRA API error')) {
      return res.status(502).json({ error: 'JIRA service unavailable', details: error.message })
    }
    return res.status(500).json({ error: 'Internal server error while searching issues' })
  }
})

// Link test cases/BDD features to a JIRA story
router.post('/link', async (req, res) => {
  try {
    const linkRequest = JiraLinkRequestSchema.parse(req.body)
    const result = await jiraService.linkTests(linkRequest)
    
    if (result.success) {
      return res.json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error linking tests to JIRA story:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return res.status(400).json({ 
          error: 'Invalid request parameters',
          details: error.message 
        })
      }
      
      if (error.message.includes('JIRA API error')) {
        return res.status(502).json({ 
          error: 'JIRA service unavailable',
          details: error.message 
        })
      }
    }
    
    return res.status(500).json({ 
      error: 'Internal server error while linking tests' 
    })
  }
})

// Get available JIRA projects (JIRA-like path for convenience)
router.get('/rest/api/2/projects', async (req, res) => {
  try {
    const projects = await jiraService.getProjects()
    return res.json(projects)
  } catch (error) {
    console.error('Error fetching JIRA projects:', error)
    
    if (error instanceof Error && error.message.includes('JIRA API error')) {
      return res.status(502).json({ 
        error: 'JIRA service unavailable',
        details: error.message 
      })
    }
    
    return res.status(500).json({ 
      error: 'Internal server error while fetching projects' 
    })
  }
})

// Issue types endpoints (JIRA v2-like paths for compatibility)
router.get('/rest/api/2/issuetype', async (req, res) => {
  try {
    const types = await jiraService.getIssueTypes()
    return res.json(types)
  } catch (error) {
    console.error('Error fetching issue types:', error)
    if (error instanceof Error && error.message.includes('JIRA API error')) {
      return res.status(502).json({ error: 'JIRA service unavailable', details: error.message })
    }
    return res.status(500).json({ error: 'Internal server error while fetching issue types' })
  }
})

router.get('/rest/api/2/issuetype/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ error: 'Issue type id is required' })
    const type = await jiraService.getIssueType(id)
    return res.json(type)
  } catch (error) {
    console.error('Error fetching issue type:', error)
    if (error instanceof Error && error.message.includes('JIRA API error')) {
      return res.status(502).json({ error: 'JIRA service unavailable', details: error.message })
    }
    return res.status(500).json({ error: 'Internal server error while fetching issue type' })
  }
})

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Try to fetch projects as a simple health check
    await jiraService.getProjects()
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'JIRA integration'
    })
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'JIRA integration',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Compatibility routes for existing frontend usage
router.get('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ error: 'Story ID or key is required' })
    const story = await jiraService.getStory(id)
    return res.json(story)
  } catch (error) {
    if (error instanceof Error && error.message === 'Story not found') {
      return res.status(404).json({ error: 'Story not found' })
    }
    if (error instanceof Error && error.message.includes('JIRA API error')) {
      return res.status(502).json({ error: 'JIRA service unavailable', details: error.message })
    }
    return res.status(500).json({ error: 'Internal server error while fetching story' })
  }
})

router.get('/projects', async (req, res) => {
  try {
    const projects = await jiraService.getProjects()
    return res.json(projects)
  } catch (error) {
    if (error instanceof Error && error.message.includes('JIRA API error')) {
      return res.status(502).json({ error: 'JIRA service unavailable', details: error.message })
    }
    return res.status(500).json({ error: 'Internal server error while fetching projects' })
  }
})

export default router