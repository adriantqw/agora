import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '../services/productService'
import PDFPreviewTable from '../components/PDFPreviewTable'

export default function PDFImportPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Step management
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Upload state
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // Step 2: Extraction & Preview state
  const [jobId, setJobId] = useState(null)
  const [extractionStatus, setExtractionStatus] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const [extractedProducts, setExtractedProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [skipDuplicates, setSkipDuplicates] = useState(false)

  // Step 3: Import results state
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  // Step 1: Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file) => {
    setUploadError(null)

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please upload a PDF file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError('File size exceeds 10MB limit')
      return
    }

    setUploadedFile(file)
  }

  const handleProcessPDF = async () => {
    if (!uploadedFile) return

    try {
      setUploadError(null)
      const result = await productService.uploadPDF(uploadedFile)
      setJobId(result.jobId)
      setCurrentStep(2)
      setIsPolling(true)
    } catch (error) {
      setUploadError(error.message || 'Failed to upload PDF')
    }
  }

  // Step 2: Poll extraction status
  useEffect(() => {
    if (!isPolling || !jobId) return

    const pollInterval = setInterval(async () => {
      try {
        const status = await productService.getPDFExtractionStatus(jobId)
        setExtractionStatus(status)

        if (status.status === 'completed') {
          setIsPolling(false)
          setExtractedProducts(status.products || [])
          // Select all products by default
          setSelectedProducts(new Set((status.products || []).map(p => p.id)))
        } else if (status.status === 'failed') {
          setIsPolling(false)
          setUploadError('PDF extraction failed: ' + status.message)
        }
      } catch (error) {
        setIsPolling(false)
        setUploadError('Failed to check extraction status: ' + error.message)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [isPolling, jobId])

  // Step 2: Product editing handlers
  const handleProductChange = (productId, changes) => {
    setExtractedProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, ...changes } : p)
    )
  }

  const handleProductDelete = (productId) => {
    setExtractedProducts(prev => prev.filter(p => p.id !== productId))
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  const handleSelectionChange = (newSelection) => {
    setSelectedProducts(newSelection)
  }

  const handleImportProducts = async () => {
    const selectedProductsList = extractedProducts.filter(p => selectedProducts.has(p.id))

    if (selectedProductsList.length === 0) {
      setUploadError('Please select at least one product to import')
      return
    }

    // Validate all selected products
    const hasErrors = selectedProductsList.some(p => {
      return !p.name || !p.sku || p.price < 0 || p.quantity < 0
    })

    if (hasErrors) {
      setUploadError('Please fix validation errors before importing')
      return
    }

    setIsImporting(true)
    setImportError(null)

    try {
      const result = await productService.importPDFProducts(
        jobId,
        selectedProductsList,
        skipDuplicates
      )
      setImportResult(result)
      setCurrentStep(3)
    } catch (error) {
      setImportError(error.message || 'Failed to import products')
    } finally {
      setIsImporting(false)
    }
  }

  // Step 3: Actions
  const handleImportMore = () => {
    setCurrentStep(1)
    setUploadedFile(null)
    setJobId(null)
    setExtractionStatus(null)
    setExtractedProducts([])
    setSelectedProducts(new Set())
    setImportResult(null)
    setImportError(null)
    setUploadError(null)
  }

  const handleViewInventory = () => {
    navigate('/merchant/inventory')
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1a2e', color: '#e2e8f0', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#a0aec0' }}>
          <span
            onClick={() => navigate('/merchant')}
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = '#63b3ed'}
            onMouseOut={e => e.currentTarget.style.color = '#a0aec0'}
          >
            Home
          </span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span
            onClick={() => navigate('/merchant/inventory')}
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = '#63b3ed'}
            onMouseOut={e => e.currentTarget.style.color = '#a0aec0'}
          >
            Inventory
          </span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#e2e8f0' }}>PDF Import</span>
        </div>

        {/* Header */}
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>
          Import from PDF Catalogue
        </h1>
        <p style={{ fontSize: '15px', color: '#a0aec0', marginBottom: '32px' }}>
          Upload product catalogues and let AI extract your inventory data
        </p>

        {/* Step Progress */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          {[
            { step: 1, label: 'Upload PDF' },
            { step: 2, label: 'Review & Edit' },
            { step: 3, label: 'Results' }
          ].map(({ step, label }) => (
            <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: currentStep >= step ? '#4299e1' : '#1a202c',
                color: currentStep >= step ? '#fff' : '#718096',
                border: currentStep === step ? '2px solid #63b3ed' : 'none'
              }}>
                {step}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                color: currentStep >= step ? '#e2e8f0' : '#718096'
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{
          backgroundColor: '#1a2b4a',
          borderRadius: '10px',
          padding: '32px',
          minHeight: '400px'
        }}>
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#fff' }}>
                Upload PDF Catalogue
              </h2>

              {/* File Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '3px dashed #63b3ed' : '2px dashed #4a5568',
                  borderRadius: '8px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#1a2b4a' : '#0f1a2e',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginBottom: '20px'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                  {uploadedFile ? uploadedFile.name : 'Drop PDF file here or click to browse'}
                </p>
                <p style={{ fontSize: '14px', color: '#a0aec0' }}>
                  {uploadedFile
                    ? `${formatFileSize(uploadedFile.size)}`
                    : 'Maximum file size: 10MB'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </div>

              {uploadError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #feb2b2',
                  borderRadius: '6px',
                  color: '#c53030',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {uploadError}
                </div>
              )}

              {/* Continue Button */}
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate('/merchant/inventory')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: '2px solid #4a5568',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#63b3ed'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#4a5568'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPDF}
                  disabled={!uploadedFile}
                  style={{
                    padding: '12px 32px',
                    background: uploadedFile
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#4a5568',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: uploadedFile ? 'pointer' : 'not-allowed',
                    boxShadow: uploadedFile ? '0 4px 6px rgba(102, 126, 234, 0.3)' : 'none',
                    transition: 'all 0.3s',
                    opacity: uploadedFile ? 1 : 0.6
                  }}
                  onMouseOver={e => {
                    if (uploadedFile) e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={e => {
                    if (uploadedFile) e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Process PDF
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview & Edit */}
          {currentStep === 2 && (
            <div>
              {isPolling ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #1a202c',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    margin: '0 auto 24px',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                    {extractionStatus?.message || 'Processing PDF...'}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#a0aec0' }}>
                    Progress: {extractionStatus?.progress || 0}%
                  </p>
                  <div style={{
                    width: '300px',
                    height: '6px',
                    backgroundColor: '#1a202c',
                    borderRadius: '3px',
                    margin: '16px auto 0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${extractionStatus?.progress || 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <style>
                    {`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}
                  </style>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>
                      Review Extracted Products
                    </h2>
                    <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '16px' }}>
                      {extractionStatus?.metadata && (
                        <>
                          Found {extractionStatus.metadata.productsFound} products from{' '}
                          {extractionStatus.metadata.totalPages} pages
                        </>
                      )}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={skipDuplicates}
                          onChange={(e) => setSkipDuplicates(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>
                          Skip duplicate SKUs (don't update existing products)
                        </span>
                      </label>
                    </div>
                  </div>

                  {uploadError && (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#fff5f5',
                      border: '1px solid #feb2b2',
                      borderRadius: '6px',
                      color: '#c53030',
                      marginBottom: '20px',
                      fontSize: '14px'
                    }}>
                      {uploadError}
                    </div>
                  )}

                  {extractedProducts.length > 0 ? (
                    <>
                      <PDFPreviewTable
                        products={extractedProducts}
                        onProductChange={handleProductChange}
                        onProductDelete={handleProductDelete}
                        onSelectionChange={handleSelectionChange}
                        selectedIds={selectedProducts}
                      />

                      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '14px', color: '#a0aec0' }}>
                          {selectedProducts.size} of {extractedProducts.length} products selected
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => setCurrentStep(1)}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: 'transparent',
                              border: '2px solid #4a5568',
                              borderRadius: '6px',
                              color: '#e2e8f0',
                              fontSize: '15px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#63b3ed'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#4a5568'}
                          >
                            Back
                          </button>
                          <button
                            onClick={handleImportProducts}
                            disabled={isImporting || selectedProducts.size === 0}
                            style={{
                              padding: '12px 32px',
                              background: (isImporting || selectedProducts.size === 0)
                                ? '#4a5568'
                                : 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '15px',
                              fontWeight: 600,
                              cursor: (isImporting || selectedProducts.size === 0) ? 'not-allowed' : 'pointer',
                              boxShadow: (isImporting || selectedProducts.size === 0)
                                ? 'none'
                                : '0 4px 6px rgba(66, 153, 225, 0.3)',
                              transition: 'all 0.3s',
                              opacity: (isImporting || selectedProducts.size === 0) ? 0.6 : 1
                            }}
                          >
                            {isImporting ? 'Importing...' : 'Import Products'}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a0aec0' }}>
                      <p style={{ fontSize: '16px', fontWeight: 500 }}>No products extracted</p>
                      <p style={{ fontSize: '14px', marginTop: '8px' }}>
                        Please try a different PDF file
                      </p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        style={{
                          marginTop: '24px',
                          padding: '12px 24px',
                          backgroundColor: '#4299e1',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                Import Complete!
              </h2>

              {importResult && (
                <div style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#10b98120',
                      borderRadius: '8px',
                      border: '1px solid #10b981'
                    }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                        {importResult.created}
                      </div>
                      <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500 }}>
                        Created
                      </div>
                    </div>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#4299e120',
                      borderRadius: '8px',
                      border: '1px solid #4299e1'
                    }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#4299e1', marginBottom: '4px' }}>
                        {importResult.updated}
                      </div>
                      <div style={{ fontSize: '13px', color: '#4299e1', fontWeight: 500 }}>
                        Updated
                      </div>
                    </div>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#a0aec020',
                      borderRadius: '8px',
                      border: '1px solid #a0aec0'
                    }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#a0aec0', marginBottom: '4px' }}>
                        {importResult.skipped}
                      </div>
                      <div style={{ fontSize: '13px', color: '#a0aec0', fontWeight: 500 }}>
                        Skipped
                      </div>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#fff5f5',
                      border: '1px solid #feb2b2',
                      borderRadius: '6px',
                      marginBottom: '24px',
                      textAlign: 'left'
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#c53030', marginBottom: '8px' }}>
                        {importResult.errors.length} error(s) occurred:
                      </p>
                      {importResult.errors.slice(0, 5).map((error, idx) => (
                        <p key={idx} style={{ fontSize: '13px', color: '#c53030', marginBottom: '4px' }}>
                          Row {error.row}: {error.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {importError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #feb2b2',
                  borderRadius: '6px',
                  color: '#c53030',
                  marginBottom: '24px',
                  fontSize: '14px',
                  maxWidth: '500px',
                  margin: '0 auto 24px'
                }}>
                  {importError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={handleImportMore}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: '2px solid #4a5568',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#63b3ed'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#4a5568'}
                >
                  Import More
                </button>
                <button
                  onClick={handleViewInventory}
                  style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(66, 153, 225, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  View Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
