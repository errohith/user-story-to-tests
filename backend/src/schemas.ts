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

// JIRA related schemas
export const JiraStorySchema = z.object({
  id: z.string(),
  key: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  status: z.string(),
  assignee: z.string().optional(),
  reporter: z.string(),
  created: z.string(),
  updated: z.string(),
  priority: z.string(),
  storyPoints: z.number().optional(),
  labels: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  project: z.object({
    id: z.string(),
    key: z.string(),
    name: z.string()
  })
})

export const JiraProjectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  projectTypeKey: z.string(),
  avatarUrls: z.object({
    '24x24': z.string().optional(),
    '32x32': z.string().optional()
  }).optional()
})

export const JiraSearchRequestSchema = z.object({
  project: z.string().optional(),
  assignee: z.string().optional(),
  status: z.string().optional(),
  text: z.string().optional(),
  maxResults: z.number().min(1).max(100).optional().default(20),
  startAt: z.number().min(0).optional().default(0)
})

export const JiraSearchResponseSchema = z.object({
  stories: z.array(JiraStorySchema),
  total: z.number(),
  startAt: z.number(),
  maxResults: z.number()
})

export const JiraLinkRequestSchema = z.object({
  jiraStoryId: z.string(),
  testCases: z.array(TestCaseSchema).optional(),
  bddFeatures: z.array(BddFeatureSchema).optional(),
  linkType: z.enum(['test_coverage', 'traced_to']).optional().default('test_coverage')
})

export const JiraLinkResponseSchema = z.object({
  success: z.boolean(),
  linkId: z.string().optional(),
  message: z.string()
})

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type BddStep = z.infer<typeof BddStepSchema>
export type BddScenario = z.infer<typeof BddScenarioSchema>
export type BddFeature = z.infer<typeof BddFeatureSchema>
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>

// JIRA type exports
export type JiraStory = z.infer<typeof JiraStorySchema>
export type JiraProject = z.infer<typeof JiraProjectSchema>
export type JiraSearchRequest = z.infer<typeof JiraSearchRequestSchema>
export type JiraSearchResponse = z.infer<typeof JiraSearchResponseSchema>
export type JiraLinkRequest = z.infer<typeof JiraLinkRequestSchema>
export type JiraLinkResponse = z.infer<typeof JiraLinkResponseSchema>