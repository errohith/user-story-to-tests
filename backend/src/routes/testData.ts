import express from 'express'
import { 
  GenerateTestDataRequestSchema, 
  GenerateTestDataResponseSchema,
  TestCategory,
  TestDataField,
  TestDataRecord
} from '../schemas/testData'

type TestCategoryType = typeof TestCategory._type
import { TestDataGenerator } from '../services/testDataGenerator'

export const testDataRouter = express.Router()
const testDataGenerator = new TestDataGenerator()

testDataRouter.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = GenerateTestDataRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`
      })
      return
    }

    const request = validationResult.data
    
    try {
      // Generate test data
      const records = testDataGenerator.generateTestData(
        request.categories,
        request.fields,
        request.recordCount
      )

      // Validate response format
      const response = {
        records,
        totalCount: records.length
      }

      const responseValidation = GenerateTestDataResponseSchema.safeParse(response)
      if (!responseValidation.success) {
        res.status(502).json({
          error: 'Generated data does not match expected schema'
        })
        return
      }

      res.json(responseValidation.data)
    } catch (generationError) {
      console.error('Test data generation error:', generationError)
      res.status(502).json({
        error: 'Failed to generate test data'
      })
      return
    }
  } catch (error) {
    console.error('Error in generate test data route:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})