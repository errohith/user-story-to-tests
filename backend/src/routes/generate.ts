import express from 'express'
import { GroqClient } from '../llm/groqClient'
import { GenerateRequestSchema, GenerateResponseSchema, GenerateResponse, BddFeature, TestCase } from '../schemas'
import { SYSTEM_PROMPT, buildPrompt } from '../prompt'
import { BddGeneratorService } from '../services/bddGenerator'

export const generateRouter = express.Router()

generateRouter.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = GenerateRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`
      })
      return
    }

    const request = validationResult.data

    // Initialize response object
    let responseData: Partial<GenerateResponse> = {
      promptTokens: 0,
      completionTokens: 0
    }

    // Generate Manual test cases if requested
    if (request.formats.includes('Manual')) {
      try {
        const userPrompt = buildPrompt(request)
        const groqClient = new GroqClient()
        
        const groqResponse = await groqClient.generateTests(SYSTEM_PROMPT, userPrompt)
        
        // Parse the JSON content for manual tests
        let parsedManualResponse: { cases: TestCase[] }
        try {
          parsedManualResponse = JSON.parse(groqResponse.content)
        } catch (parseError) {
          res.status(502).json({
            error: 'LLM returned invalid JSON format for manual tests'
          })
          return
        }

        responseData.cases = parsedManualResponse.cases
        responseData.model = groqResponse.model
        responseData.promptTokens = (responseData.promptTokens || 0) + groqResponse.promptTokens
        responseData.completionTokens = (responseData.completionTokens || 0) + groqResponse.completionTokens
      } catch (manualError) {
        console.error('Error generating manual tests:', manualError)
        res.status(502).json({
          error: 'Failed to generate manual tests from LLM service'
        })
        return
      }
    }

    // Generate BDD scenarios if requested
    if (request.formats.includes('BDD')) {
      try {
        const bddGenerator = new BddGeneratorService()
        const bddFeatures = await bddGenerator.generateBddFeatures(request)
        
        responseData.bddFeatures = bddFeatures
        // Note: BDD service handles its own token counting
      } catch (bddError) {
        console.error('Error generating BDD scenarios:', bddError)
        res.status(502).json({
          error: 'Failed to generate BDD scenarios from LLM service'
        })
        return
      }
    }

    // Validate the final response schema
    const responseValidation = GenerateResponseSchema.safeParse(responseData)
    if (!responseValidation.success) {
      res.status(502).json({
        error: 'Generated response does not match expected schema'
      })
      return
    }

    res.json(responseValidation.data)
  } catch (error) {
    console.error('Error in generate route:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})