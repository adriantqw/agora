import { useState } from 'react'

export default function EditModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...item })
  const [newTag, setNewTag] = useState('')

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <nav style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>
              Home / Inventory / <span style={{ color: '#1a202c' }}>Edit Item</span>
            </nav>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>Edit Product</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              border: 'none',
              background: '#f7fafc',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Image Upload */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{
              width: '160px',
              height: '160px',
              background: '#f7fafc',
              borderRadius: '12px',
              border: '2px dashed #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              cursor: 'pointer'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#a0aec0', marginTop: '8px' }}>No image</span>
            </div>
            <button type="button" style={{
              padding: '8px 16px',
              fontSize: '13px',
              color: '#4299e1',
              background: 'none',
              border: '1px solid #4299e1',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Change Image
            </button>
          </div>

          {/* Product Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
              Product Name <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* SKU */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
              SKU <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.sku}
              disabled
              style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f7fafc', color: '#718096', boxSizing: 'border-box' }}
            />
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a0aec0' }}>SKU cannot be changed</p>
          </div>

          {/* Price & Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                Price <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '12px 12px 12px 28px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                Quantity <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {formData.tags.map(tag => (
                <span key={tag} style={{ padding: '6px 12px', fontSize: '13px', background: '#edf2f7', color: '#4a5568', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#718096' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                style={{ flex: 1, padding: '10px 12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
              />
              <button type="button" onClick={handleAddTag} style={{ padding: '10px 16px', fontSize: '14px', color: '#4299e1', background: 'white', border: '1px solid #4299e1', borderRadius: '8px', cursor: 'pointer' }}>Add</button>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(66, 153, 225, 0.3)' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}
