import { useRef } from 'react'
import { Button } from './ui/Button'

export function PrintLetter({ title, children, className = '' }) {
  const printRef = useRef(null)

  function handlePrint() {
    if (!printRef.current) return
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Olivarez College</title>
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
          <style>
            body { font-family: 'DM Sans', sans-serif; padding: 2rem; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            .letterhead { border-bottom: 3px solid #4f5c3d; padding-bottom: 1rem; margin-bottom: 2rem; }
            .letterhead h1 { color: #3f4a32; font-size: 1.5rem; margin: 0; }
            .letterhead p { color: #65734d; font-size: 0.875rem; margin: 0.25rem 0 0 0; }
            .content { line-height: 1.6; }
            .footer { margin-top: 3rem; font-size: 0.875rem; color: #65734d; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
    }, 250)
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <Button variant="outline" onClick={handlePrint}>Print letter</Button>
      </div>
      <div
        ref={printRef}
        className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-800"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div className="letterhead border-b-2 border-school-600 pb-4 mb-8">
          <h1 className="text-xl font-bold text-school-700">Olivarez College</h1>
          <p className="text-sm text-school-600 mt-1">Inventory Management</p>
        </div>
        <div className="content">
          {children}
        </div>
        <div className="mt-12 text-sm text-gray-600">
          — Olivarez College Inventory Management System
        </div>
      </div>
    </div>
  )
}
