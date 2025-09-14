import { GenerateRequest } from './schemas'

export const SYSTEM_PROMPT = `You are a senior QA engineer with expertise in creating comprehensive test cases from user stories. Your task is to analyze user stories and generate detailed test cases.

CRITICAL: You must return ONLY valid JSON matching this exact schema:

{
  "cases": [
    {
      "id": "TC-001",
      "title": "string",
      "steps": ["string", "..."],
      "testData": "string (optional)",
      "expectedResult": "string",
      "category": "string (Positive|Negative|Edge|Non-Functional)"
    }
  ],
  "model": "string (optional)",
  "promptTokens": 0,
  "completionTokens": 0
}

Guidelines:
- Generate test case IDs like TC-001, TC-002, etc.
- Write concise, imperative steps (e.g., "Click login button", "Enter valid email")
- Include only test cases for the requested categories
- Categories:
  * Positive: Testing expected behavior with valid inputs
  * Negative: Testing system behavior with invalid inputs
  * Edge: Testing boundary conditions and edge cases
  * Non-Functional: Performance, usability, and reliability tests
- Steps should be actionable and specific
- Expected results should be clear and measurable

Return ONLY the JSON object, no additional text or formatting.`

export function buildPrompt(request: GenerateRequest): string {
  const { storyTitle, acceptanceCriteria, description, additionalInfo, categories } = request;

  let userPrompt = `Generate comprehensive test cases for the following user story:

Story Title: ${storyTitle}

Acceptance Criteria:
${acceptanceCriteria}
`;

  if (description) {
    userPrompt += `\nDescription:
${description}
`;
  }

  if (additionalInfo) {
    userPrompt += `\nAdditional Information:
${additionalInfo}
`;
  }

  if (categories && categories.length > 0) {
    userPrompt += `\nSelected Test Categories: ${categories.join(", ")}`;
    userPrompt += `\nIMPORTANT: Generate test cases ONLY for the selected categories above. Each test case MUST be assigned to one of the selected categories. Return only the JSON response.`;
  } else {
    userPrompt += `\nGenerate a balanced mix of test cases covering positive scenarios, negative scenarios, edge cases, and non-functional requirements as applicable. Return only the JSON response.`;
  }

  return userPrompt;
}