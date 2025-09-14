import React, { useState, useEffect, useMemo } from 'react'
import { parseTestCasesForDataFields } from './utils/testDataParser'
import { generateTests, generateTestData } from './api'
import { 
  GenerateRequest, 
  GenerateResponse, 
  TestCase, 
  TestCategory,
  GenerateTestDataRequest, 
  GenerateTestDataResponse
} from './types'

function App() {
  const [activeTab, setActiveTab] = useState<'test-cases' | 'test-data'>('test-cases')
  const [formData, setFormData] = useState<GenerateRequest>({
    storyTitle: '',
    acceptanceCriteria: '',
    description: '',
    additionalInfo: '',
    categories: []
  })

  const [testDataForm, setTestDataForm] = useState<Omit<GenerateTestDataRequest, 'categories'>>({
    storyTitle: '',
    fields: [],
    recordCount: 5
  })

  const CATEGORIES = ['Positive', 'Negative', 'Edge', 'Non-Functional'] as const
  type CategoryType = typeof CATEGORIES[number]
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([])
  const [testDataResults, setTestDataResults] = useState<GenerateTestDataResponse | null>(null)
  const [isGeneratingData, setIsGeneratingData] = useState(false)

  // keep formData.categories in sync when selectedCategories changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, categories: selectedCategories as TestCategory[] }))
  }, [selectedCategories])
  const [results, setResults] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set())

  // Parse test cases for data fields whenever results change
  const parsedTestData = useMemo(() => {
    if (!results?.cases.length) return null
    return parseTestCasesForDataFields(results.cases)
  }, [results])

  // Update test data form when parsed data changes
  useEffect(() => {
    if (parsedTestData) {
      setTestDataForm(prev => ({
        ...prev,
        fields: parsedTestData.fields
      }))
    }
  }, [parsedTestData])

  const toggleTestCaseExpansion = (testCaseId: string) => {
    const newExpanded = new Set(expandedTestCases)
    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId)
    } else {
      newExpanded.add(testCaseId)
    }
    setExpandedTestCases(newExpanded)
  }

  const handleInputChange = (field: keyof GenerateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerateTestData = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one category')
      return
    }

    setIsGeneratingData(true)
    setError(null)
    
    try {
      const response = await generateTestData({
        ...testDataForm,
        categories: selectedCategories,
        storyTitle: formData.storyTitle
      })
      setTestDataResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test data')
    } finally {
      setIsGeneratingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.storyTitle.trim() || !formData.acceptanceCriteria.trim()) {
      setError('Story Title and Acceptance Criteria are required')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await generateTests(formData)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #bbeac5ff;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 95%;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 90%;
            padding: 30px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 85%;
            padding: 40px;
          }
        }
        
        @media (min-width: 1440px) {
          .container {
            max-width: 1800px;
            padding: 50px;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .title {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .form-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .submit-btn {
          background: #df171bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #2980b9;
        }
        
        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .error-banner {
          background: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }
        
        .results-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .results-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1e8ed;
        }
        
        .results-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .results-meta {
          color: #666;
          font-size: 14px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .results-table th,
        .results-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .results-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .results-table tr:hover {
          background: #f8f9fa;
        }
        
        .category-positive { color: #27ae60; font-weight: 600; }
        .category-negative { color: #e74c3c; font-weight: 600; }
        .category-edge { color: #f39c12; font-weight: 600; }
        .category-authorization { color: #9b59b6; font-weight: 600; }
        .category-non-functional { color: #34495e; font-weight: 600; }
        
        .nav-menu {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .nav-button {
          padding: 12px 24px;
          background: transparent;
          border: 2px solid #df171bff;
          border-radius: 6px;
          color: #df171bff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          background: rgba(223, 23, 27, 0.1);
        }

        .nav-button.active {
          background: #df171bff;
          color: white;
        }
        
        .test-case-id {
          cursor: pointer;
          color: #3498db;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .test-case-id:hover {
          background: #f8f9fa;
        }
        
        .test-case-id.expanded {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .expand-icon {
          font-size: 10px;
          transition: transform 0.2s;
        }
        
        .expand-icon.expanded {
          transform: rotate(90deg);
        }
        
        .expanded-details {
          margin-top: 15px;
          background: #fafbfc;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 20px;
        }
        
        .step-item {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .step-header {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          align-items: start;
        }
        
        .step-id {
          font-weight: 600;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
        }
        
        .step-description {
          color: #2c3e50;
          line-height: 1.5;
        }
        
        .step-test-data {
          color: #666;
          font-style: italic;
          font-size: 14px;
        }
        
        .step-expected {
          color: #27ae60;
          font-weight: 500;
          font-size: 14px;
        }
        
        .step-labels {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .category-chip-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
        .category-chip {
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:6px 12px;
          border-radius:999px;
          background:#f3f6fb;
          border:1px solid #e6edf6;
          cursor:pointer;
          font-weight:500;
          color:#222;
          transition:all 120ms ease;
        }
        .category-chip:hover { transform:translateY(-1px); box-shadow: 0 4px 10px rgba(15,23,42,0.06); }
        .category-chip.selected {
          background: linear-gradient(180deg, #2563eb 0%, #1e40af 100%);
          color: white;
          border-color: rgba(30,64,175,0.9);
        }
        .category-chip .chip-check { font-weight:700; margin-left:6px; }

        .section-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .section-description {
          color: #666;
          margin-bottom: 30px;
          font-size: 1.1rem;
          line-height: 1.5;
        }

        .help-text {
          color: #666;
          font-size: 0.9rem;
          margin-top: 8px;
          font-style: italic;
        }

        .field-config {
          background: #f8f9fa;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .field-type {
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .field-constraints {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.9rem;
          color: #666;
          margin-top: 8px;
        }

        .field-metadata {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .field-category {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .field-description {
          color: #666;
          font-size: 0.9rem;
          margin: 8px 0;
          font-style: italic;
        }

        .field-condition {
          background: #f3f6fb;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.85rem;
          border: 1px solid #e6edf6;
        }

        .test-data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .test-data-card {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          overflow: hidden;
        }

        .test-data-header {
          background: #f8f9fa;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e1e8ed;
        }

        .record-id {
          color: #666;
          font-size: 0.9rem;
        }

        .test-data-body {
          padding: 15px;
        }

        .data-field {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .data-field:last-child {
          border-bottom: none;
        }

        .field-name {
          color: #666;
          font-weight: 500;
        }

        .field-value {
          color: #2c3e50;
          font-family: monospace;
        }
      `}</style>
      
      <div className="container">
        <div className="header">
          <h1 className="title">User Story to Tests</h1>
          <p className="subtitle">Generate comprehensive test cases from your user stories</p>
          <div className="nav-menu">
            <button 
              className={`nav-button ${activeTab === 'test-cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('test-cases')}
            >
              Generate Test Cases
            </button>
            <button 
              className={`nav-button ${activeTab === 'test-data' ? 'active' : ''}`}
              onClick={() => setActiveTab('test-data')}
            >
              Generate Test Data
            </button>
          </div>
        </div>
        
        {activeTab === 'test-cases' ? (
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label htmlFor="storyTitle" className="form-label">
                Story Title *
              </label>
            <input
              type="text"
              id="storyTitle"
              className="form-input"
              value={formData.storyTitle}
              onChange={(e) => handleInputChange('storyTitle', e.target.value)}
              placeholder="Enter the user story title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional description (optional)..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="acceptanceCriteria" className="form-label">
              Acceptance Criteria *
            </label>
            <textarea
              id="acceptanceCriteria"
              className="form-textarea"
              value={formData.acceptanceCriteria}
              onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
              placeholder="Enter the acceptance criteria..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Info
            </label>
            <textarea
              id="additionalInfo"
              className="form-textarea"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional information (optional)..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Test Category
            </label>
            <div className="category-chip-row" role="list" aria-label="Test categories">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    role="listitem"
                    aria-pressed={isSelected}
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCategories(prev =>
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat as CategoryType]
                      )
                    }}
                    style={{ marginRight: 8 }}
                  >
                    <span className="chip-label">{cat}</span>
                    <span className="chip-check" aria-hidden>{isSelected ? '✓' : ''}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
              Select one or more categories. If none selected, all categories will be generated.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="testcaseCount" className="form-label">
              Number of Test Cases
            </label>
            <select
              id="testcaseCount"
              className="form-input"
              value={String(formData.testcaseCount ?? 5)}
              onChange={(e) => setFormData(prev => ({ ...prev, testcaseCount: Number(e.target.value) }))}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
              Select how many test cases you want (max 20).
            </div>
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>
        ) : (
          <div className="form-container">
            <h2 className="section-title">Generate Test Data</h2>
            <p className="section-description">
              Create sample test data for your test cases. Choose the type of data you need and customize the generation options.
            </p>
            
            <div className="form-group">
              <label className="form-label">Data Categories</label>
              <div className="category-chip-row">
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategories.includes(cat as TestCategory)
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`category-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(cat as TestCategory) 
                            ? prev.filter(c => c !== cat) 
                            : [...prev, cat as TestCategory]
                        )
                      }}
                    >
                      <span className="chip-label">{cat}</span>
                      <span className="chip-check">{isSelected ? '✓' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Extracted Data Fields</label>
              {testDataForm.fields.length === 0 ? (
                <div className="help-text">
                  Generate test cases first to automatically extract required data fields.
                </div>
              ) : (
                testDataForm.fields.map((field, index) => (
                  <div key={index} className="field-config">
                    <div className="field-name">{field.name}</div>
                    <div className="field-metadata">
                      <div 
                        className="field-category" 
                        style={{ 
                          background: field.type === 'date' ? '#e6f3ff' : 
                                     field.type === 'string' ? '#e6ffe6' : 
                                     field.type === 'number' ? '#fff0e6' : '#f3f6fb'
                        }}
                      >
                        {field.type}
                      </div>
                      <div className="field-description">{field.constraints?.description}</div>
                    </div>
                    {field.constraints?.conditions && field.constraints.conditions.length > 0 && (
                      <div className="field-constraints">
                        {field.constraints.conditions.map((condition, idx) => (
                          <div key={idx} className="field-condition">
                            {condition.constraint}: {String(condition.value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="form-group">
              <label htmlFor="recordCount" className="form-label">
                Number of Records
              </label>
              <input
                type="number"
                id="recordCount"
                className="form-input"
                value={testDataForm.recordCount}
                onChange={(e) => setTestDataForm(prev => ({
                  ...prev,
                  recordCount: Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                }))}
                min="1"
                max="100"
              />
            </div>

            <button
              type="button"
              className="submit-btn"
              disabled={isGeneratingData || selectedCategories.length === 0}
              onClick={handleGenerateTestData}
            >
              {isGeneratingData ? 'Generating...' : 'Generate Test Data'}
            </button>

            {testDataResults && (
              <div className="results-container" style={{ marginTop: '20px' }}>
                <h3>Generated Test Data</h3>
                <div className="test-data-grid">
                  {testDataResults.records.map((record, index) => (
                    <div key={record.id} className="test-data-card">
                      <div className="test-data-header">
                        <span className={`category-${record.category.toLowerCase()}`}>
                          {record.category}
                        </span>
                        <span className="record-id">#{index + 1}</span>
                      </div>
                      <div className="test-data-body">
                        {Object.entries(record.data).map(([key, value]) => (
                          <div key={key} className="data-field">
                            <span className="field-name">{key}:</span>
                            <span className="field-value">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading">
            Generating test cases...
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="results-header">
              <h2 className="results-title">Generated Test Cases</h2>
              <div className="results-meta">
                {results.cases.length} test case(s) generated
                {typeof formData.testcaseCount === 'number' && ` • Requested: ${formData.testcaseCount}`}
                {results.model && ` • Model: ${results.model}`}
                {results.promptTokens > 0 && ` • Tokens: ${results.promptTokens + results.completionTokens}`}
                {results.note && (
                  <div style={{ marginTop: 8, color: '#c0392b' }}>{results.note}</div>
                )}
              </div>
            </div>
            
            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Test Case ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.cases.map((testCase: TestCase) => (
                    <React.Fragment key={`case-${testCase.id}`}>
                      <tr>
                        <td>
                          <div 
                            className={`test-case-id ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}
                            onClick={() => toggleTestCaseExpansion(testCase.id)}
                          >
                            <span className={`expand-icon ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}>
                              ▶
                            </span>
                            {testCase.id}
                          </div>
                        </td>
                        <td>{testCase.title}</td>
                        <td>
                          <span className={`category-${testCase.category.toLowerCase()}`}>
                            {testCase.category}
                          </span>
                        </td>
                        <td>{testCase.expectedResult}</td>
                      </tr>
                      {expandedTestCases.has(testCase.id) && (
                        <tr key={`${testCase.id}-details`}>
                          <td colSpan={4}>
                            <div className="expanded-details">
                              <h4 style={{marginBottom: '15px', color: '#2c3e50'}}>Test Steps for {testCase.id}</h4>
                              <div className="step-labels">
                                <div>Step ID</div>
                                <div>Step Description</div>
                                <div>Test Data</div>
                                <div>Expected Result</div>
                              </div>
                              {testCase.steps.map((step, index) => (
                                <div key={index} className="step-item">
                                  <div className="step-header">
                                    <div className="step-id">S{String(index + 1).padStart(2, '0')}</div>
                                    <div className="step-description">{step}</div>
                                    <div className="step-test-data">{testCase.testData || 'N/A'}</div>
                                    <div className="step-expected">
                                      {index === testCase.steps.length - 1 ? testCase.expectedResult : 'Step completed successfully'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App