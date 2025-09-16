export type TestCategory = 'Positive' | 'Negative' | 'Edge' | 'Non-Functional'

export type TestFormat = 'Manual' | 'BDD'

export type TestDataFieldType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone'

export interface TestCondition {
  field: string
  type: TestDataFieldType
  constraint: string
  value: string | number | boolean
}

export interface TestDataFieldConstraints {
  min?: number
  max?: number
  pattern?: string
  format?: string
  conditions?: TestCondition[]
  description?: string
}

export interface TestDataField {
  name: string
  type: TestDataFieldType
  constraints?: TestDataFieldConstraints
  sourceTestCase?: string
  category?: TestCategory
}

export interface ParsedTestData {
  fields: TestDataField[]
  conditions: Map<string, TestCondition[]>
}

// JIRA Integration Types
export interface JiraProject {
  key: string
  name: string
  description?: string
  lead?: string
  issueTypes?: Array<{
    id: string
    name: string
    description?: string
  }>
}

export interface JiraStory {
  id: string
  key: string
  title: string
  description?: string
  status: string
  priority?: string
  issueType: string
  assignee?: string
  created?: string
  updated?: string
  project: {
    key: string
    name: string
  }
}

export interface JiraSearchRequest {
  query?: string
  projectKey?: string
  issueTypes?: string[]
  statuses?: string[]
  startAt?: number
  maxResults?: number
}

export interface JiraSearchResponse {
  issues: JiraStory[]
  total: number
  startAt: number
  maxResults: number
}

export interface JiraLinkRequest {
  storyId: string
  testCases?: TestCase[]
  bddFeatures?: BddFeature[]
}

export interface JiraLinkResponse {
  success: boolean
  message: string
  storyId: string
  linkedTestsCount: number
}

export interface GenerateRequest {
  storyTitle: string
  jiraId?: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string,
  categories: TestCategory[]
  testcaseCount?: number
  formats: TestFormat[]
}

/* Duplicate TestDataField interface removed to resolve type conflict. */

export interface GenerateTestDataRequest {
  storyTitle: string
  categories: TestCategory[]
  fields: TestDataField[]
  recordCount: number
}

export interface TestDataRecord {
  id: string
  category: TestCategory
  data: Record<string, any>
}

export interface GenerateTestDataResponse {
  records: TestDataRecord[]
  totalCount: number
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export interface BddStep {
  keyword: 'Given' | 'When' | 'Then' | 'And' | 'But'
  text: string
}

export interface BddScenario {
  name: string
  description?: string
  steps: BddStep[]
  tags?: string[]
}

export interface BddFeature {
  name: string
  description?: string
  scenarios: BddScenario[]
}

export interface GenerateResponse {
  cases: TestCase[]
  bddFeatures?: BddFeature[]
  model?: string
  promptTokens: number
  completionTokens: number
  note?: string
  requestedCount?: number
}