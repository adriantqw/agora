import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '../services/productService'

/**
 * Parse CSV content into array of objects
 * Handles quoted fields with commas inside
 */
const parseCSV = (content) => {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  // Parse header row
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue

    const row = {}
    headers.forEach((header, index) => {
      row[header.trim().toLowerCase()] = values[index]?.trim() || ''
    })
    rows.push(row)
  }
  return rows
}

/**
 * Parse a single CSV line, handling quoted fields
 */
const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

/**
 * Validate a parsed row and return status
 */
const validateRow = (row, rowIndex, existingSkus = []) => {
  const errors = []
  const warnings = []

  // Required field: name
  if (!row.name || row.name.trim() === '') {
    errors.push('Missing product name')
  }

  // Required field: SKU
  if (!row.sku || row.sku.trim() === '') {
    errors.push('Missing SKU')
  }

  // Required field: price (must be valid number >= 0)
  const price = parseFloat(row.price)
  if (isNaN(price)) {
    errors.push('Invalid price')
  } else if (price < 0) {
    errors.push('Price cannot be negative')
  }

  // Required field: quantity (must be valid integer >= 0)
  const quantity = parseInt(row.quantity, 10)
  if (isNaN(quantity)) {
    errors.push('Invalid quantity')
  } else if (quantity < 0) {
    errors.push('Quantity cannot be negative')
  }

  // Optional warning: missing image
  if (!row.image || row.image.trim() === '') {
    warnings.push('Missing image URL')
  }

  // Check for duplicate SKU
  const isDuplicate = existingSkus.includes(row.sku?.trim())

  let status = 'valid'
  let statusText = 'Ready to import'

  if (errors.length > 0) {
    status = 'error'
    statusText = errors[0]
  } else if (isDuplicate) {
    status = 'duplicate'
    statusText = 'SKU exists - will update'
  } else if (warnings.length > 0) {
    status = 'warning'
    statusText = warnings[0]
  }

  return {
    row: rowIndex + 1,
    name: row.name || '',
    sku: row.sku || '',
    price: isNaN(price) ? 0 : price,
    quantity: isNaN(quantity) ? 0 : quantity,
    tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    image: row.image || null,
    description: row.description || null,
    status,
    statusText
  }
}

/**
 * Read file contents as text using FileReader API
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export default function BulkImportPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedData, setParsedData] = useState([])
  const [skipErrors, setSkipErrors] = useState(true)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState(null)
  const [isTagging, setIsTagging] = useState(false)
  const [taggingResult, setTaggingResult] = useState(null)
  const [importedProducts, setImportedProducts] = useState([])
  const fileInputRef = useRef(null)

  // PDF-specific state
  const [uploadType, setUploadType] = useState('csv') // 'csv' | 'pdf'
  const [jobId, setJobId] = useState(null) // PDF extraction job ID
  const [extractionStatus, setExtractionStatus] = useState(null) // PDF progress
  const [isPolling, setIsPolling] = useState(false) // PDF polling flag

  const validCount = parsedData.filter(r => r.status === 'valid').length
  const warningCount = parsedData.filter(r => r.status === 'warning' || r.status === 'duplicate').length
  const errorCount = parsedData.filter(r => r.status === 'error').length
  const importableCount = validCount + warningCount

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]) }

  const handleFileSelect = (file) => {
    if (file.name.toLowerCase().endsWith('.csv')) {
      setUploadedFile(file)
    } else {
      alert('Please upload a CSV file')
    }
  }

  const handleContinueToPreview = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)

    try {
      const content = await readFileAsText(uploadedFile)
      const rawRows = parseCSV(content)

      // Validate each row
      const validatedRows = rawRows.map((row, index) => validateRow(row, index))

      setParsedData(validatedRows)
      setCurrentStep(2)
    } catch (error) {
      alert('Failed to parse file: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmImport = async () => {
    setIsProcessing(true)
    setImportError(null)
    try {
      // Filter to only import valid/warning/duplicate rows (skip errors if skipErrors is true)
      const rowsToImport = parsedData.filter(row => {
        if (row.status === 'error' && skipErrors) return false
        if (row.status === 'error') return false // Always skip error rows
        return true
      })

      const productsToImport = rowsToImport.map(row => ({
        name: row.name,
        sku: row.sku,
        price: row.price,
        quantity: row.quantity,
        tags: row.tags || [],
        image: row.image || null,
        description: row.description || null
      }))

      const result = await productService.bulkImport(productsToImport, false)
      setImportResult(result)

      // Fetch products to get their IDs for AI tagging
      const importedSkus = rowsToImport.map(r => r.sku)
      const productsResponse = await productService.list({ limit: 100 })
      const imported = productsResponse.items.filter(p => importedSkus.includes(p.sku))
      setImportedProducts(imported)

      setCurrentStep(4)
    } catch (err) {
      setImportError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAITagging = async () => {
    if (importedProducts.length === 0) return

    setIsTagging(true)
    try {
      const productIds = importedProducts.map(p => p.id)
      const result = await productService.generateAITags(productIds)
      setTaggingResult(result)
    } catch (err) {
      console.error('Failed to generate AI tags:', err)
    } finally {
      setIsTagging(false)
    }
  }

  const getFileIcon = (filename) => {
    if (filename.endsWith('.csv')) return '\u{1F4C4}'
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) return '\u{1F4CA}'
    if (filename.endsWith('.pdf')) return '\u{1F4D5}'
    return '\u{1F4C1}'
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const steps = [{ number: 1, label: 'Upload' }, { number: 2, label: 'Preview' }, { number: 3, label: 'Confirm' }, { number: 4, label: 'Complete' }]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px', color: '#1a202c' }}>Agora MerchantHub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>JS</div>
          <div><div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>John's Store</div><div style={{ fontSize: '12px', color: '#718096' }}>demo@merchant.com</div></div>
        </div>
      </header>

      <main style={{ padding: '24px 32px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px' }}>
          <span onClick={() => navigate('/merchant/inventory')} style={{ color: '#4299e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </span>
          <span style={{ color: '#cbd5e0' }}>/</span>
          <span onClick={() => navigate('/merchant/inventory')} style={{ color: '#4299e1', cursor: 'pointer' }}>Inventory</span>
          <span style={{ color: '#cbd5e0' }}>/</span>
          <span style={{ color: '#1a202c', fontWeight: '500' }}>Bulk Import</span>
        </nav>

        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', margin: '0 0 32px' }}>Bulk Import Products</h1>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', left: '60px', right: '60px', height: '2px', background: '#e2e8f0', zIndex: 0 }}>
            <div style={{ height: '100%', background: '#4299e1', width: `${((currentStep - 1) / 3) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
          {steps.map((step) => (
            <div key={step.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: currentStep >= step.number ? '#4299e1' : 'white', border: currentStep >= step.number ? 'none' : '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentStep >= step.number ? 'white' : '#a0aec0', fontWeight: '600', fontSize: '14px' }}>
                {currentStep > step.number ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> : step.number}
              </div>
              <span style={{ fontSize: '13px', fontWeight: currentStep === step.number ? '600' : '400', color: currentStep >= step.number ? '#1a202c' : '#a0aec0' }}>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div style={{ padding: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', margin: '0 0 8px' }}>Upload Your File</h2>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>Import products from a CSV file</p>
              </div>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${isDragging ? '#4299e1' : '#e2e8f0'}`, borderRadius: '12px', padding: '48px', textAlign: 'center', cursor: 'pointer', background: isDragging ? '#ebf8ff' : '#f7fafc' }}>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
                {!uploadedFile ? (
                  <>
                    <div style={{ width: '72px', height: '72px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#1a202c', margin: '0 0 8px' }}>Drag and drop your file here</p>
                    <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 16px' }}>or click to browse from your computer</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <span style={{ padding: '6px 12px', fontSize: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#718096' }}>CSV</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>{getFileIcon(uploadedFile.name)}</div>
                    <div style={{ textAlign: 'left' }}><p style={{ fontSize: '15px', fontWeight: '500', color: '#1a202c', margin: '0 0 4px' }}>{uploadedFile.name}</p><p style={{ fontSize: '13px', color: '#718096', margin: 0 }}>{formatFileSize(uploadedFile.size)}</p></div>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null) }} style={{ width: '36px', height: '36px', border: 'none', background: '#fed7d7', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c53030" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', padding: '16px', background: '#f7fafc', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span style={{ fontSize: '14px', color: '#718096' }}>Download template:</span>
                <a href="#" style={{ fontSize: '14px', color: '#4299e1', textDecoration: 'none', fontWeight: '500' }}>CSV</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => navigate('/merchant/inventory')} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleContinueToPreview} disabled={!uploadedFile || isProcessing} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: 'white', background: uploadedFile ? 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' : '#cbd5e0', border: 'none', borderRadius: '8px', cursor: uploadedFile ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isProcessing ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Processing...</> : <>Continue<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {currentStep === 2 && (
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}><h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', margin: '0 0 8px' }}>Preview & Validate</h2><p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>Review the data before importing</p></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '20px' }}>{getFileIcon(uploadedFile?.name || 'file.csv')}</span><span style={{ fontSize: '14px', fontWeight: '500', color: '#1a202c' }}>{uploadedFile?.name || 'products.csv'}</span></div>
                <button onClick={() => { setCurrentStep(1); setUploadedFile(null); setParsedData([]) }} style={{ fontSize: '13px', color: '#4299e1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Change File</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: '#f0fff4', borderRadius: '10px', border: '1px solid #c6f6d5' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span style={{ fontSize: '13px', fontWeight: '500', color: '#276749' }}>Ready</span></div><span style={{ fontSize: '28px', fontWeight: '700', color: '#22543d' }}>{validCount}</span></div>
                <div style={{ padding: '16px', background: '#fffaf0', borderRadius: '10px', border: '1px solid #fbd38d' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d69e2e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span style={{ fontSize: '13px', fontWeight: '500', color: '#975a16' }}>Warnings</span></div><span style={{ fontSize: '28px', fontWeight: '700', color: '#744210' }}>{warningCount}</span></div>
                <div style={{ padding: '16px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #feb2b2' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span style={{ fontSize: '13px', fontWeight: '500', color: '#c53030' }}>Errors</span></div><span style={{ fontSize: '28px', fontWeight: '700', color: '#742a2a' }}>{errorCount}</span></div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f7fafc' }}><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', width: '60px' }}>Row</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase' }}>Name</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', width: '100px' }}>SKU</th><th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', width: '80px' }}>Price</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', width: '180px' }}>Status</th></tr></thead>
                  <tbody>
                    {parsedData.map((row) => (
                      <tr key={row.row} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#718096' }}>{row.row}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#1a202c' }}>{row.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#718096' }}>{row.sku || <span style={{ color: '#e53e3e' }}>—</span>}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', color: row.price < 0 ? '#e53e3e' : '#1a202c' }}>${row.price.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px' }}><div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: row.status === 'valid' ? '#f0fff4' : row.status === 'warning' || row.status === 'duplicate' ? '#fffaf0' : '#fff5f5', color: row.status === 'valid' ? '#276749' : row.status === 'warning' || row.status === 'duplicate' ? '#975a16' : '#c53030' }}>{row.status === 'valid' && '✓'}{(row.status === 'warning' || row.status === 'duplicate') && '⚠'}{row.status === 'error' && '✕'}{row.statusText}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errorCount > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#fff5f5', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
                  <input type="checkbox" checked={skipErrors} onChange={(e) => setSkipErrors(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                  <div><span style={{ fontSize: '14px', fontWeight: '500', color: '#1a202c' }}>Skip rows with errors</span><p style={{ fontSize: '13px', color: '#718096', margin: '2px 0 0' }}>Import only valid rows ({importableCount} of {parsedData.length} items)</p></div>
                </label>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => setCurrentStep(1)} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Back</button>
                <button onClick={() => setCurrentStep(3)} disabled={importableCount === 0} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: 'white', background: importableCount > 0 ? 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' : '#cbd5e0', border: 'none', borderRadius: '8px', cursor: importableCount > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>Continue<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === 3 && (
            <div style={{ padding: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '72px', height: '72px', background: '#ebf8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a202c', margin: '0 0 8px' }}>Ready to Import</h2>
                <p style={{ fontSize: '15px', color: '#718096', margin: 0 }}>Review the summary and confirm your import</p>
              </div>
              <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px' }}>Import Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '32px', height: '32px', background: '#c6f6d5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span style={{ fontSize: '15px', color: '#1a202c' }}><strong>{validCount}</strong> new products will be added</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '32px', height: '32px', background: '#bee3f8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b6cb0" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div><span style={{ fontSize: '15px', color: '#1a202c' }}><strong>{parsedData.filter(r => r.status === 'duplicate').length}</strong> existing products will be updated</span></div>
                  {errorCount > 0 && skipErrors && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '32px', height: '32px', background: '#fed7d7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c53030" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></div><span style={{ fontSize: '15px', color: '#1a202c' }}><strong>{errorCount}</strong> rows will be skipped (errors)</span></div>}
                </div>
              </div>
              {importError && (
                <div style={{ padding: '16px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c53030' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    <span style={{ fontWeight: '500' }}>Import failed: {importError}</span>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => setCurrentStep(2)} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Back</button>
                <button onClick={handleConfirmImport} disabled={isProcessing} style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(72, 187, 120, 0.3)' }}>
                  {isProcessing ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Importing...</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Import Now</>}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ width: '88px', height: '88px', background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 24px rgba(72, 187, 120, 0.3)' }}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', margin: '0 0 12px' }}>Import Successful!</h2>
              <p style={{ fontSize: '16px', color: '#718096', margin: '0 0 36px' }}>Your products have been imported to your inventory</p>
              <div style={{ display: 'inline-flex', gap: '32px', padding: '24px 40px', background: '#f7fafc', borderRadius: '12px', marginBottom: '36px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#38a169' }}>{importResult?.created || 0}</div><div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>Added</div></div>
                <div style={{ width: '1px', background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#4299e1' }}>{importResult?.updated || 0}</div><div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>Updated</div></div>
                <div style={{ width: '1px', background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#a0aec0' }}>{importResult?.skipped || 0}</div><div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>Skipped</div></div>
              </div>

              {/* AI Tagging Section */}
              {importedProducts.length > 0 && (
                <div style={{ maxWidth: '500px', margin: '0 auto 36px', textAlign: 'left' }}>
                  {!taggingResult ? (
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        <span style={{ fontSize: '16px', fontWeight: '600' }}>AI-Powered Tagging</span>
                      </div>
                      <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 16px' }}>Automatically generate relevant tags for your {importedProducts.length} imported products using AI</p>
                      <button onClick={handleAITagging} disabled={isTagging} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#667eea', background: 'white', border: 'none', borderRadius: '8px', cursor: isTagging ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isTagging ? (
                          <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(102, 126, 234, 0.3)', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating Tags...</>
                        ) : (
                          <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>Generate AI Tags</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', background: '#f0fff4', borderRadius: '12px', border: '1px solid #c6f6d5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#276749' }}>AI Tags Generated for {taggingResult.processed} Products</span>
                      </div>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {taggingResult.results.map((result, idx) => {
                          const product = importedProducts.find(p => p.id === result.productId)
                          return (
                            <div key={result.productId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', borderBottom: idx < taggingResult.results.length - 1 ? '1px solid #c6f6d5' : 'none' }}>
                              <span style={{ fontSize: '13px', color: '#4a5568', minWidth: '140px', fontWeight: '500' }}>{product?.name?.slice(0, 20) || 'Product'}...</span>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {result.suggestedTags.map(tag => (
                                  <span key={tag} style={{ padding: '4px 10px', fontSize: '11px', background: '#c6f6d5', color: '#276749', borderRadius: '12px' }}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => { setCurrentStep(1); setUploadedFile(null); setParsedData([]); setImportResult(null); setTaggingResult(null); setImportedProducts([]) }} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Import More</button>
                <button onClick={() => navigate('/merchant/inventory')} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>Go to Inventory<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
