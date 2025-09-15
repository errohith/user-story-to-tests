import { z } from 'zod'

export const TestCategory = z.enum(['Positive', 'Negative', 'Edge', 'Non-Functional'])
export const TestFormat = z.enum(['Manual', 'BDD'])

export const GenerateRequestSchema = z.object({
  storyTitle: z.string().min(1, 'Story title is required'),
  acceptanceCriteria: z.string().min(1, 'Acceptance criteria is required'),
  description: z.string().optional(),
  additionalInfo: z.string().optional(),
  categories: z.array(TestCategory).min(1, 'At least one category must be selected'),
  testcaseCount: z.number().min(1).max(20).optional().default(5),
  formats: z.array(TestFormat).min(1, 'At least one format must be selected')
})

export const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(z.string()),
  testData: z.string().optional(),
  expectedResult: z.string(),
  category: TestCategory
})

export const BddStepSchema = z.object({
  keyword: z.enum(['Given', 'When', 'Then', 'And', 'But']),
  text: z.string()
})

export const BddScenarioSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(BddStepSchema),
  tags: z.array(z.string()).optional()
})

export const BddFeatureSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  scenarios: z.array(BddScenarioSchema)
})

export const GenerateResponseSchema = z.object({
  cases: z.array(TestCaseSchema).optional(),
  bddFeatures: z.array(BddFeatureSchema).optional(),
  model: z.string().optional(),
  promptTokens: z.number(),
  completionTokens: z.number()
})

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type BddStep = z.infer<typeof BddStepSchema>
export type BddScenario = z.infer<typeof BddScenarioSchema>
export type BddFeature = z.infer<typeof BddFeatureSchema>
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>