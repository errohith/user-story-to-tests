import { 
  TestCategory as TestCategoryEnum,
  TestDataField,
  TestDataRecord,
  TestDataFieldType
} from '../schemas/testData'

type TestCategory = typeof TestCategoryEnum._type
import { faker } from '@faker-js/faker'

export class TestDataGenerator {
  private generateValue(field: TestDataField): any {
    const { type, constraints = {} } = field

    switch (type) {
      case 'string':
        if (constraints.pattern) {
          // Use regex pattern to generate matching string
          try {
            return faker.string.alphanumeric({ length: constraints.max || 10 })
          } catch {
            return faker.word.sample()
          }
        }
        return faker.string.alpha({
          length: constraints.max || 20
        })

      case 'number':
        return faker.number.int({
          min: constraints.min || 0,
          max: constraints.max || 1000
        })

      case 'boolean':
        return faker.datatype.boolean()

      case 'date':
        return faker.date.recent().toISOString()

      case 'email':
        return faker.internet.email()

      case 'phone':
        return faker.phone.number()

      default:
        return faker.string.sample()
    }
  }

  private generateRecordForCategory(
    fields: TestDataField[],
    category: TestCategory,
    index: number
  ): TestDataRecord {
    const data: Record<string, any> = {}

    fields.forEach(field => {
      let value = this.generateValue(field)

      // Modify value based on category
      switch (category) {
        case 'Negative':
          // Generate invalid data for negative tests
          if (field.type === 'email') {
            value = 'invalid-email'
          } else if (field.type === 'number' && field.constraints?.min) {
            value = field.constraints.min - 1
          }
          break

        case 'Edge':
          // Generate boundary values for edge cases
          if (field.type === 'number') {
            value = field.constraints?.max || Number.MAX_SAFE_INTEGER
          } else if (field.type === 'string') {
            value = ''
          }
          break

        case 'Non-Functional':
          // Generate data for performance/load testing
          if (field.type === 'string') {
            value = faker.string.sample({ min: 1000, max: 5000 })
          }
          break
      }

      data[field.name] = value
    })

    return {
      id: `TD-${String(index + 1).padStart(3, '0')}`,
      category,
      data
    }
  }

  public generateTestData(
    categories: TestCategory[],
    fields: TestDataField[],
    recordCount: number
  ): TestDataRecord[] {
    const records: TestDataRecord[] = []
    let currentIndex = 0

    // Distribute records evenly across categories
    const recordsPerCategory = Math.max(1, Math.floor(recordCount / categories.length))
    const remainingRecords = recordCount % categories.length

    categories.forEach((category, categoryIndex) => {
      const categoryRecordCount = categoryIndex < remainingRecords 
        ? recordsPerCategory + 1 
        : recordsPerCategory

      for (let i = 0; i < categoryRecordCount; i++) {
        records.push(this.generateRecordForCategory(fields, category, currentIndex))
        currentIndex++
      }
    })

    return records
  }
}