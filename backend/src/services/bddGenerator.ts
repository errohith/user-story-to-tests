import { GroqClient } from '../llm/groqClient'
import { BddFeature, BddScenario, BddStep, GenerateRequest } from '../schemas'

export class BddGeneratorService {
  private groqClient: GroqClient

  constructor() {
    this.groqClient = new GroqClient()
  }

  public async generateBddFeatures(request: GenerateRequest): Promise<BddFeature[]> {
    const systemPrompt = this.createBddSystemPrompt()
    const userPrompt = this.createBddUserPrompt(request)

    try {
      const groqResponse = await this.groqClient.generateTests(systemPrompt, userPrompt)
      const parsedResponse = JSON.parse(groqResponse.content)
      
      // Validate and return the BDD features
      if (parsedResponse.features && Array.isArray(parsedResponse.features)) {
        return parsedResponse.features as BddFeature[]
      }
      
      throw new Error('Invalid BDD response format')
    } catch (error) {
      console.error('Error generating BDD features:', error)
      throw error
    }
  }

  private createBddSystemPrompt(): string {
    return `You are an expert QA engineer specializing in Behavior-Driven Development (BDD) and Gherkin syntax.

Your task is to convert user stories into comprehensive BDD scenarios using proper Gherkin format.

Guidelines:
1. Create well-structured Feature files with clear Feature, Scenario, Given, When, Then steps
2. Include realistic test data within the steps (use specific examples, not placeholders)
3. Follow BDD best practices:
   - Each scenario should test one specific behavior
   - Given steps establish context/preconditions
   - When steps describe the action being tested
   - Then steps verify the expected outcome
   - Use And/But for additional steps when needed
4. Include appropriate tags for categorization (@positive, @negative, @edge, etc.)
5. Make scenarios readable and focused on user behavior
6. Include data examples directly in the steps (not as separate tables initially)

Response format: JSON object with a "features" array containing BDD features.

Example response structure:
{
  "features": [
    {
      "name": "User Authentication",
      "description": "As a user, I want to authenticate securely",
      "scenarios": [
        {
          "name": "Successful login with valid credentials",
          "tags": ["@positive", "@authentication"],
          "steps": [
            {
              "keyword": "Given",
              "text": "I am on the login page"
            },
            {
              "keyword": "And", 
              "text": "I have a valid account with email 'user@example.com' and password 'SecurePass123'"
            },
            {
              "keyword": "When",
              "text": "I enter 'user@example.com' in the email field"
            },
            {
              "keyword": "And",
              "text": "I enter 'SecurePass123' in the password field"
            },
            {
              "keyword": "And",
              "text": "I click the 'Login' button"
            },
            {
              "keyword": "Then",
              "text": "I should be redirected to the dashboard"
            },
            {
              "keyword": "And",
              "text": "I should see 'Welcome back!' message"
            }
          ]
        }
      ]
    }
  ]
}`
  }

  private createBddUserPrompt(request: GenerateRequest): string {
    let prompt = `Convert the following user story into BDD scenarios:\n\n`
    
    prompt += `**Story Title:** ${request.storyTitle}\n\n`
    prompt += `**Acceptance Criteria:**\n${request.acceptanceCriteria}\n\n`
    
    if (request.description) {
      prompt += `**Description:**\n${request.description}\n\n`
    }
    
    if (request.additionalInfo) {
      prompt += `**Additional Information:**\n${request.additionalInfo}\n\n`
    }

    prompt += `**Categories to focus on:** ${request.categories.join(', ')}\n\n`
    
    prompt += `Generate ${request.testcaseCount || 5} BDD scenarios covering the specified categories. `
    prompt += `Include realistic test data and make scenarios copy-paste ready for .feature files.\n\n`
    
    prompt += `Each scenario should:\n`
    prompt += `- Test a specific aspect of the user story\n`
    prompt += `- Include concrete examples and test data\n`
    prompt += `- Follow proper Gherkin syntax\n`
    prompt += `- Be tagged appropriately based on test category\n`
    prompt += `- Focus on user behavior and business value\n\n`
    
    prompt += `Return only the JSON response with the features array.`

    return prompt
  }

  private convertCategoryToTag(category: string): string {
    return `@${category.toLowerCase()}`
  }
}