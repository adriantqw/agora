import { useState } from 'react'

export default function PDFPreviewTable({ products, onProductChange, onProductDelete, onSelectionChange, selectedIds }) {
  const [editingField, setEditingField] = useState(null) // { productId, field }
  const [tempValue, setTempValue] = useState('')

  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(products.map(p => p.id)))
    }
  }

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    onSelectionChange(newSelected)
  }

  const startEdit = (productId, field, currentValue) => {
    setEditingField({ productId, field })
    setTempValue(currentValue || '')
  }

  const saveEdit = (product) => {
    if (editingField) {
      const { field } = editingField
      let value = tempValue

      // Type conversion
      if (field === 'price' || field === 'quantity') {
        value = field === 'price' ? parseFloat(tempValue) || 0 : parseInt(tempValue) || 0
      }

      onProductChange(product.id, { [field]: value })
      setEditingField(null)
      setTempValue('')
    }
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleKeyDown = (e, product) => {
    if (e.key === 'Enter') {
      saveEdit(product)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) {
      return { label: 'High', color: '#10b981' }
    } else if (confidence >= 0.7) {
      return { label: 'Medium', color: '#f59e0b' }
    } else {
      return { label: 'Low', color: '#ef4444' }
    }
  }

  const validateProduct = (product) => {
    const errors = {}
    if (!product.name || product.name.length < 1) errors.name = true
    if (!product.sku || product.sku.length < 1) errors.sku = true
    if (product.price < 0) errors.price = true
    if (product.quantity < 0) errors.quantity = true
    return errors
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', textAlign: 'left', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th style={{ padding: '12px', textAlign: 'left', width: '80px', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                Image
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left', width: '120px', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                SKU
              </th>
              <th style={{ padding: '12px', textAlign: 'left', width: '100px', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                Price
              </th>
              <th style={{ padding: '12px', textAlign: 'left', width: '100px', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                Quantity
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                Tags
              </th>
              <th style={{ padding: '12px', textAlign: 'left', width: '100px', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                Confidence
              </th>
              <th style={{ padding: '12px', textAlign: 'center', width: '80px', fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const errors = validateProduct(product)
              const hasErrors = Object.keys(errors).length > 0
              const confidenceBadge = getConfidenceBadge(product.confidence)

              return (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: hasErrors ? '#fff5f5' : 'white'
                  }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => handleSelectItem(product.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>

                  {/* Image */}
                  <td style={{ padding: '12px' }}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#a0aec0'
                      }}>
                        No image
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td style={{ padding: '12px' }}>
                    {editingField?.productId === product.id && editingField?.field === 'name' ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveEdit(product)}
                        onKeyDown={(e) => handleKeyDown(e, product)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '2px solid #4299e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(product.id, 'name', product.name)}
                        style={{
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px',
                          border: errors.name ? '2px solid #c53030' : '2px solid transparent',
                          backgroundColor: errors.name ? '#fff5f5' : 'transparent'
                        }}
                      >
                        {product.name || <span style={{ color: '#a0aec0' }}>Click to edit</span>}
                      </div>
                    )}
                  </td>

                  {/* SKU */}
                  <td style={{ padding: '12px' }}>
                    {editingField?.productId === product.id && editingField?.field === 'sku' ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveEdit(product)}
                        onKeyDown={(e) => handleKeyDown(e, product)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '2px solid #4299e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(product.id, 'sku', product.sku)}
                        style={{
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          border: errors.sku ? '2px solid #c53030' : '2px solid transparent',
                          backgroundColor: errors.sku ? '#fff5f5' : 'transparent'
                        }}
                      >
                        {product.sku || <span style={{ color: '#a0aec0' }}>Click to edit</span>}
                      </div>
                    )}
                  </td>

                  {/* Price */}
                  <td style={{ padding: '12px' }}>
                    {editingField?.productId === product.id && editingField?.field === 'price' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveEdit(product)}
                        onKeyDown={(e) => handleKeyDown(e, product)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '2px solid #4299e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(product.id, 'price', product.price?.toString())}
                        style={{
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px',
                          border: errors.price ? '2px solid #c53030' : '2px solid transparent',
                          backgroundColor: errors.price ? '#fff5f5' : 'transparent'
                        }}
                      >
                        ${product.price?.toFixed(2) || '0.00'}
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td style={{ padding: '12px' }}>
                    {editingField?.productId === product.id && editingField?.field === 'quantity' ? (
                      <input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveEdit(product)}
                        onKeyDown={(e) => handleKeyDown(e, product)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '2px solid #4299e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(product.id, 'quantity', product.quantity?.toString())}
                        style={{
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px',
                          border: errors.quantity ? '2px solid #c53030' : '2px solid transparent',
                          backgroundColor: errors.quantity ? '#fff5f5' : 'transparent'
                        }}
                      >
                        {product.quantity || 0}
                      </div>
                    )}
                  </td>

                  {/* Tags */}
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {product.tags && product.tags.length > 0 ? (
                        product.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#edf2f7',
                              color: '#4a5568',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 500
                            }}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#a0aec0', fontSize: '12px' }}>No tags</span>
                      )}
                    </div>
                  </td>

                  {/* Confidence */}
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      backgroundColor: `${confidenceBadge.color}20`,
                      color: confidenceBadge.color,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {confidenceBadge.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => onProductDelete(product.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        color: '#e53e3e',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f5'
                        e.currentTarget.style.borderColor = '#e53e3e'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff'
                        e.currentTarget.style.borderColor = '#e2e8f0'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#a0aec0'
        }}>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>No products to preview</p>
        </div>
      )}
    </div>
  )
}
