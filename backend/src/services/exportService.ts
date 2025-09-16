import { Workbook } from 'exceljs'
import { BddFeature, TestCase } from '../schemas'

function sanitize(val: string): string {
  return val.replace(/[\r\n\t]+/g, ' ').trim()
}

export function buildCsv(cases: TestCase[]): string {
  const header = ['TestCaseID', 'Title', 'Category', 'StepNumber', 'Step', 'ExpectedResult', 'TestData']
  const rows: string[] = []
  rows.push(header.join(','))

  cases.forEach((tc) => {
    const steps = tc.steps && tc.steps.length ? tc.steps : ['']
    steps.forEach((step, idx) => {
      const rec = [
        sanitize(tc.id),
        '"' + sanitize(tc.title).replace(/"/g, '""') + '"',
        sanitize(String(tc.category)),
        String(idx + 1),
        '"' + sanitize(step).replace(/"/g, '""') + '"',
        '"' + sanitize(idx === steps.length - 1 ? tc.expectedResult : 'Step completed successfully').replace(/"/g, '""') + '"',
        tc.testData ? '"' + sanitize(tc.testData).replace(/"/g, '""') + '"' : ''
      ]
      rows.push(rec.join(','))
    })
  })

  return rows.join('\n') + '\n'
}

export function buildFeatureFile(features: BddFeature[]): string {
  const parts: string[] = []
  features.forEach((feature, i) => {
    parts.push(`Feature: ${feature.name}`)
    if (feature.description) {
      parts.push(`  ${feature.description}`)
    }
    parts.push('')
    feature.scenarios.forEach((sc) => {
      if (sc.tags && sc.tags.length) {
        parts.push(`  ${sc.tags.join(' ')}`)
      }
      parts.push(`  Scenario: ${sc.name}`)
      if (sc.description) {
        parts.push(`    ${sc.description}`)
      }
      sc.steps.forEach((st) => {
        parts.push(`    ${st.keyword} ${st.text}`)
      })
      parts.push('')
    })
    if (i < features.length - 1) parts.push('')
  })
  return parts.join('\n')
}

export async function buildExcel(cases?: TestCase[], bddFeatures?: BddFeature[]): Promise<Buffer> {
  const wb = new Workbook()
  // Manual Test Cases sheet
  if (cases && cases.length) {
    const ws = wb.addWorksheet('Manual Test Cases')
    ws.columns = [
      { header: 'TestCaseID', key: 'id', width: 18 },
      { header: 'Title', key: 'title', width: 50 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'StepNumber', key: 'stepNumber', width: 12 },
      { header: 'Step', key: 'step', width: 60 },
      { header: 'ExpectedResult', key: 'expected', width: 50 },
      { header: 'TestData', key: 'testData', width: 40 }
    ]
    cases.forEach((tc) => {
      const steps = tc.steps && tc.steps.length ? tc.steps : ['']
      steps.forEach((step, idx) => {
        ws.addRow({
          id: tc.id,
          title: tc.title,
          category: String(tc.category),
          stepNumber: idx + 1,
          step,
          expected: idx === steps.length - 1 ? tc.expectedResult : 'Step completed successfully',
          testData: tc.testData || ''
        })
      })
    })
    ws.getRow(1).font = { bold: true }
  }

  // BDD Scenarios sheet
  if (bddFeatures && bddFeatures.length) {
    const ws = wb.addWorksheet('BDD Scenarios')
    ws.columns = [
      { header: 'Feature', key: 'feature', width: 30 },
      { header: 'Scenario', key: 'scenario', width: 40 },
      { header: 'Tag(s)', key: 'tags', width: 30 },
      { header: 'Description', key: 'desc', width: 50 },
      { header: 'StepKeyword', key: 'kw', width: 14 },
      { header: 'StepText', key: 'text', width: 70 }
    ]
    bddFeatures.forEach((f) => {
      f.scenarios.forEach((sc) => {
        sc.steps.forEach((st) => {
          ws.addRow({
            feature: f.name,
            scenario: sc.name,
            tags: sc.tags ? sc.tags.join(' ') : '',
            desc: sc.description || '',
            kw: st.keyword,
            text: st.text
          })
        })
      })
    })
    ws.getRow(1).font = { bold: true }
  }

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}
