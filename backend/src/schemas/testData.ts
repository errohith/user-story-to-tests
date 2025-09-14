import { z } from 'zod'

export const TestDataFieldType = z.enum([
  'string',
  'number',
  'boolean',
  'date',
  'email',
  'phone'
]) as z.ZodEnum<['string', 'number', 'boolean', 'date', 'email', 'phone']>

export const TestDataFieldConstraints = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  format: z.string().optional()
})

export const TestDataField = z.object({
  name: z.string(),
  type: TestDataFieldType,
  constraints: TestDataFieldConstraints.optional()
})

export const TestCategory = z.enum([
  'Positive',
  'Negative',
  'Edge',
  'Non-Functional'
]) as z.ZodEnum<['Positive', 'Negative', 'Edge', 'Non-Functional']>

export const GenerateTestDataRequestSchema = z.object({
  storyTitle: z.string().min(1, 'Story title is required'),
  categories: z.array(TestCategory).min(1, 'At least one category must be selected'),
  fields: z.array(TestDataField),
  recordCount: z.number().min(1).max(100)
})

export const TestDataRecordSchema = z.object({
  id: z.string(),
  category: TestCategory,
  data: z.record(z.string(), z.any())
})

export const GenerateTestDataResponseSchema = z.object({
  records: z.array(TestDataRecordSchema),
  totalCount: z.number()
})

// Type exports
export type TestDataFieldType = z.infer<typeof TestDataFieldType>
export type TestDataFieldConstraints = z.infer<typeof TestDataFieldConstraints>
export type TestDataField = z.infer<typeof TestDataField>
export type GenerateTestDataRequest = z.infer<typeof GenerateTestDataRequestSchema>
export type TestDataRecord = z.infer<typeof TestDataRecordSchema>
export type GenerateTestDataResponse = z.infer<typeof GenerateTestDataResponseSchema>