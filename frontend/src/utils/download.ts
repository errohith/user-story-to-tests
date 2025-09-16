export function sanitizeFileName(input: string, fallback = 'export'): string {
  const base = (input || fallback).replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '_')
  return base || fallback
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
