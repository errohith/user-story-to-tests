import { z } from 'zod'

export const TestCategory = z.enum(['Positive', 'Negative', 'Edge', 'Non-Functional'])
export const TestFormat = z.enum(['Manual', 'BDD'])

export const GenerateRequestSchema = z.object({
  storyTitle: z.string().min(1, 'Story title is required'),
  jiraId: z.string().optional(),
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

// JIRA Integration Schemas
export const JiraProjectSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  lead: z.string().optional(),
  issueTypes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional()
  })).optional()
})

export const JiraStorySchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string().optional(),
  issueType: z.string(),
  assignee: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  project: z.object({
    key: z.string(),
    name: z.string()
  })
})

export const JiraSearchRequestSchema = z.object({
  query: z.string().optional(),
  projectKey: z.string().optional(),
  issueTypes: z.array(z.string()).optional(),
  statuses: z.array(z.string()).optional(),
  startAt: z.number().optional().default(0),
  maxResults: z.number().optional().default(50).refine(val => val <= 100, {
    message: "maxResults cannot exceed 100"
  })
})

export const JiraSearchResponseSchema = z.object({
  issues: z.array(JiraStorySchema),
  total: z.number(),
  startAt: z.number(),
  maxResults: z.number()
})

export const JiraLinkRequestSchema = z.object({
  storyId: z.string(),
  testCases: z.array(TestCaseSchema).optional(),
  bddFeatures: z.array(BddFeatureSchema).optional()
})

export const JiraLinkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  storyId: z.string(),
  linkedTestsCount: z.number()
})

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type BddStep = z.infer<typeof BddStepSchema>
export type BddScenario = z.infer<typeof BddScenarioSchema>
export type BddFeature = z.infer<typeof BddFeatureSchema>
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>

// JIRA Type exports
export type JiraProject = z.infer<typeof JiraProjectSchema>
export type JiraStory = z.infer<typeof JiraStorySchema>
export type JiraSearchRequest = z.infer<typeof JiraSearchRequestSchema>
export type JiraSearchResponse = z.infer<typeof JiraSearchResponseSchema>
export type JiraLinkRequest = z.infer<typeof JiraLinkRequestSchema>
export type JiraLinkResponse = z.infer<typeof JiraLinkResponseSchema>