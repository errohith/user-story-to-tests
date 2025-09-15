import { Router } from 'express'
import { JiraService } from '../services/jiraService'
import { 
  JiraSearchRequestSchema, 
  JiraLinkRequestSchema 
} from '../schemas'

const router = Router()
const jiraService = new JiraService()

// Search JIRA stories
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

// Get specific JIRA story by ID or key
router.get('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Story ID or key is required' 
      })
    }
    
    const story = await jiraService.getStory(id)
    res.json(story)
  } catch (error) {
    console.error('Error fetching JIRA story:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Story not found') {
        return res.status(404).json({ 
          error: 'Story not found',
          details: `No story found with ID or key: ${req.params.id}`
        })
      }
      
      if (error.message.includes('JIRA API error')) {
        return res.status(502).json({ 
          error: 'JIRA service unavailable',
          details: error.message 
        })
      }
    }
    
    res.status(500).json({ 
      error: 'Internal server error while fetching story' 
    })
  }
})

// Link test cases/BDD features to a JIRA story
router.post('/link', async (req, res) => {
  try {
    const linkRequest = JiraLinkRequestSchema.parse(req.body)
    const result = await jiraService.linkTests(linkRequest)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
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
    
    res.status(500).json({ 
      error: 'Internal server error while linking tests' 
    })
  }
})

// Get available JIRA projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await jiraService.getProjects()
    res.json(projects)
  } catch (error) {
    console.error('Error fetching JIRA projects:', error)
    
    if (error instanceof Error && error.message.includes('JIRA API error')) {
      return res.status(502).json({ 
        error: 'JIRA service unavailable',
        details: error.message 
      })
    }
    
    res.status(500).json({ 
      error: 'Internal server error while fetching projects' 
    })
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

export default router