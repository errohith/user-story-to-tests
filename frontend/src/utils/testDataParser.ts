import { TestCase, TestDataField, TestCondition, ParsedTestData, TestDataFieldType, TestCategory } from '../types'

function inferFieldType(value: string): TestDataFieldType {
  // Check if it's a valid email format
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'email'
  }
  
  // Check if it's a valid date
  if (!isNaN(Date.parse(value))) {
    return 'date'
  }
  
  // Check if it's a number (but not a phone number starting with +)
  if (!isNaN(Number(value)) && !/^\+/.test(value)) {
    return 'number'
  }

  // Check if it's a phone number (basic check)
  if (/^\+?[\d\s-()]+$/.test(value)) {
    return 'phone'
  }

  // Check if it's a boolean
  if (['true', 'false', 'yes', 'no'].includes(value.toLowerCase())) {
    return 'boolean'
  }

  // Default to string
  return 'string'
}

function extractConditionsFromStep(step: string): TestCondition[] {
  const conditions: TestCondition[] = []
  
  // Define condition patterns with their corresponding constraint types
  interface ConditionPattern {
    pattern: RegExp;
    constraint: string;
  }

  const conditionPatterns: ConditionPattern[] = [
    {
      pattern: /(\w+(?:\s+\w+)*?)\s+(?:should|must)\s+be\s+(\w+)/i,
      constraint: 'equals'
    },
    {
      pattern: /(\w+(?:\s+\w+)*?)\s+(?:greater than|more than|above|over)\s+(\d+)/i,
      constraint: 'min'
    },
    {
      pattern: /(\w+(?:\s+\w+)*?)\s+(?:less than|under|below)\s+(\d+)/i,
      constraint: 'max'
    },
    {
      pattern: /(\w+(?:\s+\w+)*?)\s+(?:between)\s+(\d+)\s+(?:and)\s+(\d+)/i,
      constraint: 'range'
    },
    {
      pattern: /(\w+(?:\s+\w+)*?)\s+(?:matches|follows pattern)\s+([^\s]+)/i,
      constraint: 'pattern'
    },
    {
      pattern: /(\w+(?:\s+\w+)*?)\s+(?:is|should be|must be)\s+(?:valid|a valid)\s+(\w+)/i,
      constraint: 'format'
    }
  ]

  conditionPatterns.forEach(({ pattern, constraint }) => {
    const match = step.match(pattern)
    if (match) {
      const [, field, value, value2] = match
      const fieldName = field.toLowerCase().trim()
      
      if (constraint === 'range' && value2) {
        conditions.push({
          field: fieldName,
          type: 'number',
          constraint: 'min',
          value: Number(value)
        })
        conditions.push({
          field: fieldName,
          type: 'number',
          constraint: 'max',
          value: Number(value2)
        })
      } else {
        conditions.push({
          field: fieldName,
          type: inferFieldType(value),
          constraint,
          value: constraint === 'min' || constraint === 'max' ? Number(value) : value
        })
      }
    }
  })

  return conditions
}

export function parseTestCasesForDataFields(testCases: TestCase[]): ParsedTestData {
  const fields = new Map<string, TestDataField>();
  const allConditions = new Map<string, TestCondition[]>();

  testCases.forEach((testCase: TestCase) => {
    // Extract fields and conditions from test steps
    testCase.steps.forEach(step => {
      // Look for field mentions in the step using more specific patterns
      const fieldPatterns = [
        /(?:enter|input|fill|set|with|when)\s+(?:the\s+)?(\w+(?:\s+\w+)*?)(?:\s+(?:field|input|value|data))/i,
        /(?:field|input|value|data)\s+(?:is|as|to|should be)\s+(\w+(?:\s+\w+)*)/i,
        /validate\s+(?:the\s+)?(\w+(?:\s+\w+)*?)(?:\s+(?:field|input|value|data))/i
      ]

      fieldPatterns.forEach(pattern => {
        const match = step.match(pattern)
        if (match) {
          const fieldName = match[1].trim().toLowerCase()
          // Skip common words that aren't likely to be field names
          const commonWords = ['the', 'and', 'or', 'if', 'then', 'when', 'should', 'must']
          if (!commonWords.includes(fieldName) && !fields.has(fieldName)) {
            // Try to extract a sample value from the step for better type inference
            const valueMatch = step.match(new RegExp(`${fieldName}\\s+(?:is|as|to|should be)\\s+([\\w@.\\s-]+)`, 'i'))
            const sampleValue = valueMatch ? valueMatch[1] : ''
            
            fields.set(fieldName, {
              name: fieldName,
              type: inferFieldType(sampleValue || fieldName),
              sourceTestCase: testCase.id,
              category: testCase.category as TestCategory,
              constraints: {
                description: `Extracted from test case ${testCase.id}`,
                conditions: []
              }
            })
          }
        }
      });

      // Extract conditions from the step
      const stepConditions = extractConditionsFromStep(step);
      stepConditions.forEach((condition: TestCondition) => {
        const existingConditions = allConditions.get(condition.field) || []
        allConditions.set(condition.field, [...existingConditions, condition])
      })
    })

    // Extract fields from test data if present
    if (testCase.testData) {
      const dataFields = testCase.testData.split(',').map(f => f.trim())
      dataFields.forEach(field => {
        const [fieldName, value] = field.split(':').map(f => f.trim())
        if (fieldName && !fields.has(fieldName.toLowerCase())) {
          fields.set(fieldName.toLowerCase(), {
            name: fieldName,
            type: inferFieldType(value || ''),
            sourceTestCase: testCase.id,
            category: testCase.category as TestCategory,
            constraints: {
              description: `Extracted from test case ${testCase.id} test data`,
              conditions: []
            }
          })
        }
      })
    }
  })

  // Update fields with their conditions
  allConditions.forEach((fieldConditions: TestCondition[], fieldName: string) => {
    const field = fields.get(fieldName)
    if (field && field.constraints) {
      field.constraints.conditions = fieldConditions
    }
  })

  return {
    fields: Array.from(fields.values()),
    conditions: allConditions
  }
}