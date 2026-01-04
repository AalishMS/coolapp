import React, { useRef, useEffect } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeGeneratorProps {
  value: string
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14'
  width?: number
  height?: number
  displayValue?: boolean
  background?: string
  lineColor?: string
  margin?: number
  fontSize?: number
  onError?: (error: Error) => void
}

const BarcodeGenerator = ({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  background = '#ffffff',
  lineColor = '#000000',
  margin = 10,
  fontSize = 20,
  onError,
}: BarcodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    try {
      JsBarcode(canvasRef.current, value, {
        format,
        width,
        height,
        displayValue,
        background,
        lineColor,
        margin,
        fontSize,
      })
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error)
      } else {
        console.error('Barcode generation error:', error)
      }
    }
  }, [value, format, width, height, displayValue, background, lineColor, margin, fontSize, onError])

  const downloadBarcode = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `barcode-${value}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <canvas ref={canvasRef} />
      <button
        onClick={downloadBarcode}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#1976D2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Download Barcode
      </button>
    </div>
  )
}

export default BarcodeGenerator