import React, { useState } from 'react'
import { BddFeature, BddScenario, BddStep } from '../types'

interface GherkinSyntaxRendererProps {
  features: BddFeature[]
}

const GherkinSyntaxRenderer: React.FC<GherkinSyntaxRendererProps> = ({ features }) => {
  const [copiedFeature, setCopiedFeature] = useState<string | null>(null)

  const getKeywordColor = (keyword: string): string => {
    switch (keyword.toLowerCase()) {
      case 'feature':
        return '#8B5CF6' // Purple
      case 'scenario':
        return '#059669' // Green
      case 'given':
        return '#DC2626' // Red
      case 'when':
        return '#D97706' // Orange
      case 'then':
        return '#2563EB' // Blue
      case 'and':
      case 'but':
        return '#6B7280' // Gray
      default:
        return '#374151' // Default gray
    }
  }

  const renderStep = (step: BddStep, index: number) => (
    <div key={index} style={{ marginLeft: '20px', marginBottom: '4px' }}>
      <span style={{ color: getKeywordColor(step.keyword), fontWeight: 'bold' }}>
        {step.keyword}
      </span>
      <span style={{ marginLeft: '8px', color: '#374151' }}>
        {step.text}
      </span>
    </div>
  )

  const renderScenario = (scenario: BddScenario, index: number) => (
    <div key={index} style={{ marginBottom: '20px' }}>
      {scenario.tags && scenario.tags.length > 0 && (
        <div style={{ marginBottom: '4px' }}>
          {scenario.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              style={{
                color: '#6366F1',
                marginRight: '8px',
                fontSize: '14px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div style={{ marginBottom: '8px' }}>
        <span style={{ color: getKeywordColor('scenario'), fontWeight: 'bold' }}>
          Scenario:
        </span>
        <span style={{ marginLeft: '8px', color: '#374151' }}>
          {scenario.name}
        </span>
      </div>
      {scenario.description && (
        <div style={{ marginLeft: '20px', marginBottom: '8px', color: '#6B7280', fontStyle: 'italic' }}>
          {scenario.description}
        </div>
      )}
      {scenario.steps.map((step, stepIndex) => renderStep(step, stepIndex))}
    </div>
  )

  const generateGherkinText = (feature: BddFeature): string => {
    let text = `Feature: ${feature.name}\n`
    if (feature.description) {
      text += `  ${feature.description}\n`
    }
    text += '\n'

    feature.scenarios.forEach(scenario => {
      if (scenario.tags && scenario.tags.length > 0) {
        text += `  ${scenario.tags.join(' ')}\n`
      }
      text += `  Scenario: ${scenario.name}\n`
      if (scenario.description) {
        text += `    ${scenario.description}\n`
      }
      scenario.steps.forEach(step => {
        text += `    ${step.keyword} ${step.text}\n`
      })
      text += '\n'
    })

    return text
  }

  const copyToClipboard = (feature: BddFeature, featureIndex: number) => {
    const gherkinText = generateGherkinText(feature)
    navigator.clipboard.writeText(gherkinText).then(() => {
      setCopiedFeature(`feature-${featureIndex}`)
      setTimeout(() => setCopiedFeature(null), 2000)
    })
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}>
      {features.map((feature, featureIndex) => (
        <div
          key={featureIndex}
          style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: getKeywordColor('feature'), fontWeight: 'bold' }}>
                  Feature:
                </span>
                <span style={{ marginLeft: '8px', color: '#374151', fontWeight: '500' }}>
                  {feature.name}
                </span>
              </div>
              {feature.description && (
                <div style={{ marginLeft: '20px', color: '#6B7280', fontStyle: 'italic' }}>
                  {feature.description}
                </div>
              )}
            </div>
            <button
              onClick={() => copyToClipboard(feature, featureIndex)}
              style={{
                background: copiedFeature === `feature-${featureIndex}` ? '#10B981' : '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {copiedFeature === `feature-${featureIndex}` ? '✓ Copied!' : 'Copy .feature'}
            </button>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            {feature.scenarios.map((scenario, scenarioIndex) => 
              renderScenario(scenario, scenarioIndex)
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GherkinSyntaxRenderer