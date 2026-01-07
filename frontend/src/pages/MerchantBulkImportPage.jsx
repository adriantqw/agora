import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const simulatedParsedData = [
  { row: 1, name: 'Canvas Backpack', sku: 'BG001', price: 59.99, quantity: 40, status: 'valid', statusText: 'Ready to import' },
  { row: 2, name: 'Leather Wallet', sku: 'AC010', price: 34.99, quantity: 100, status: 'valid', statusText: 'Ready to import' },
  { row: 3, name: 'Running Shoes', sku: 'SH012', price: 89.99, quantity: 25, status: 'warning', statusText: 'Missing image URL' },
  { row: 4, name: 'Summer Hat', sku: '', price: 24.99, quantity: 30, status: 'error', statusText: 'Missing SKU' },
  { row: 5, name: 'Yoga Mat', sku: 'SP001', price: -15.00, quantity: 50, status: 'error', statusText: 'Invalid price' },
  { row: 6, name: 'Cotton Socks Pack', sku: 'AC011', price: 12.99, quantity: 200, status: 'valid', statusText: 'Ready to import' },
  { row: 7, name: 'Denim Shorts', sku: 'PA003', price: 44.99, quantity: 35, status: 'valid', statusText: 'Ready to import' },
  { row: 8, name: 'Silk Tie', sku: 'AC012', price: 29.99, quantity: 45, status: 'duplicate', statusText: 'SKU exists - will update' },
]

export default function BulkImportPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedData, setParsedData] = useState([])
  const [skipErrors, setSkipErrors] = useState(true)
  const fileInputRef = useRef(null)

  const validCount = parsedData.filter(r => r.status === 'valid').length
  const warningCount = parsedData.filter(r => r.status === 'warning' || r.status === 'duplicate').length
  const errorCount = parsedData.filter(r => r.status === 'error').length
  const importableCount = validCount + warningCount

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]) }

  const handleFileSelect = (file) => {
    const validExtensions = ['.csv', '.xlsx', '.xls', '.pdf']
    if (validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setUploadedFile(file)
    } else {
      alert('Please upload a CSV, Excel, or PDF file')
    }
  }

  const handleContinueToPreview = () => {
    setIsProcessing(true)
    setTimeout(() => { setParsedData(simulatedParsedData); setIsProcessing(false); setCurrentStep(2) }, 1500)
  }

  const handleConfirmImport = () => {
    setIsProcessing(true)
    setTimeout(() => { setIsProcessing(false); setCurrentStep(4) }, 2000)
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
          <span style={{ fontWeight: '700', fontSize: '18px', color: '#1a202c' }}>MerchantHub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>JS</div>
          <div><div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>John's Store</div><div style={{ fontSize: '12px', color: '#718096' }}>demo@merchant.com</div></div>
        </div>
      </header>

      <main style={{ padding: '24px 32px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px' }}>
          <span onClick={() => navigate('/')} style={{ color: '#4299e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </span>
          <span style={{ color: '#cbd5e0' }}>/</span>
          <span onClick={() => navigate('/')} style={{ color: '#4299e1', cursor: 'pointer' }}>Inventory</span>
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
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>Import products from a CSV, Excel, or PDF catalogue</p>
              </div>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${isDragging ? '#4299e1' : '#e2e8f0'}`, borderRadius: '12px', padding: '48px', textAlign: 'center', cursor: 'pointer', background: isDragging ? '#ebf8ff' : '#f7fafc' }}>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
                {!uploadedFile ? (
                  <>
                    <div style={{ width: '72px', height: '72px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#1a202c', margin: '0 0 8px' }}>Drag and drop your file here</p>
                    <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 16px' }}>or click to browse from your computer</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      {['CSV', 'Excel', 'PDF'].map(format => <span key={format} style={{ padding: '6px 12px', fontSize: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#718096' }}>{format}</span>)}
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
                <span style={{ color: '#cbd5e0' }}>|</span>
                <a href="#" style={{ fontSize: '14px', color: '#4299e1', textDecoration: 'none', fontWeight: '500' }}>Excel</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => navigate('/')} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
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
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#38a169' }}>{validCount}</div><div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>Added</div></div>
                <div style={{ width: '1px', background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#4299e1' }}>{parsedData.filter(r => r.status === 'duplicate').length}</div><div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>Updated</div></div>
                <div style={{ width: '1px', background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#a0aec0' }}>{errorCount}</div><div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>Skipped</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => { setCurrentStep(1); setUploadedFile(null); setParsedData([]) }} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Import More</button>
                <button onClick={() => navigate('/')} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>Go to Inventory<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
