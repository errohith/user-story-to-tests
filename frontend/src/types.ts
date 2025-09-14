export type TestCategory = 'Positive' | 'Negative' | 'Edge' | 'Non-Functional'

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

export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string,
  categories: TestCategory[]
  testcaseCount?: number
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

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
  note?: string
  requestedCount?: number
}