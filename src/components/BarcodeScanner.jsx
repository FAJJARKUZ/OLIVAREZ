import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from './ui/Button'

export function BarcodeScanner({ onScan, onClose }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning()) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  async function startScan() {
    setError('')
    if (!ref.current) return
    try {
      const scanner = new Html5Qrcode(ref.current.id)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText)
          scanner.stop().then(() => setScanning(false)).catch(() => {})
        }
      )
      setScanning(true)
    } catch (e) {
      setError(e.message || 'Could not start camera')
    }
  }

  async function stopScan() {
    if (scannerRef.current?.isScanning()) {
      await scannerRef.current.stop().catch(() => {})
      setScanning(false)
    }
  }

  async function handleClose() {
    await stopScan()
    onClose?.()
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Scan barcode / QR</h3>
        <Button variant="ghost" onClick={handleClose}>Close</Button>
      </div>
      <div id="barcode-reader" ref={ref} className="rounded-xl overflow-hidden bg-gray-100 min-h-[240px]" />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        {!scanning ? (
          <Button onClick={startScan}>Start camera</Button>
        ) : (
          <Button variant="secondary" onClick={stopScan}>Stop</Button>
        )}
      </div>
    </div>
  )
}
