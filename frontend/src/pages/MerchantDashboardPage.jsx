import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import EditModal from '../components/EditModal'

const initialInventory = [
  { id: '1', name: 'Blue Cotton Shirt', sku: 'SH001', price: 29.99, quantity: 50, tags: ['summer', 'new', 'cotton'], image: null, description: 'A comfortable blue cotton shirt.' },
  { id: '2', name: 'Black Slim Pants', sku: 'PA002', price: 49.99, quantity: 30, tags: ['formal', 'bestseller'], image: null, description: 'Classic black slim-fit pants.' },
  { id: '3', name: 'Red Summer Dress', sku: 'DR003', price: 79.99, quantity: 15, tags: ['summer', 'sale'], image: null, description: 'Elegant red dress for summer.' },
  { id: '4', name: 'White Basic Tee', sku: 'TE004', price: 19.99, quantity: 100, tags: ['basic', 'cotton'], image: null, description: 'Essential white t-shirt.' },
  { id: '5', name: 'Denim Jacket', sku: 'JK005', price: 89.99, quantity: 25, tags: ['winter', 'new'], image: null, description: 'Classic denim jacket.' },
  { id: '6', name: 'Floral Skirt', sku: 'SK006', price: 39.99, quantity: 40, tags: ['summer', 'floral'], image: null, description: 'Beautiful floral print skirt.' },
  { id: '7', name: 'Navy Blazer', sku: 'BL007', price: 129.99, quantity: 20, tags: ['formal', 'premium'], image: null, description: 'Professional navy blazer.' },
  { id: '8', name: 'Striped Polo', sku: 'PO008', price: 34.99, quantity: 60, tags: ['casual', 'cotton'], image: null, description: 'Casual striped polo shirt.' },
  { id: '9', name: 'Leather Belt', sku: 'AC009', price: 24.99, quantity: 80, tags: ['accessories', 'leather'], image: null, description: 'Genuine leather belt.' },
  { id: '10', name: 'Wool Sweater', sku: 'SW010', price: 69.99, quantity: 35, tags: ['winter', 'wool'], image: null, description: 'Warm wool sweater.' },
]

const getAllTags = (inventory) => {
  const tags = new Set()
  inventory.forEach(item => item.tags.forEach(tag => tags.add(tag)))
  return Array.from(tags).sort()
}

export default function DashboardPage({ onLogout }) {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState(initialInventory)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [toast, setToast] = useState(null)

  const itemsPerPage = 5
  const allTags = useMemo(() => getAllTags(inventory), [inventory])

  const filteredInventory = useMemo(() => {
    let result = [...inventory]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
      )
    }
    if (selectedTags.length > 0) {
      result = result.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      )
    }
    result.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [inventory, searchQuery, selectedTags, sortConfig])

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedInventory.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(paginatedInventory.map(item => item.id)))
    }
  }

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleDelete = () => {
    setInventory(prev => prev.filter(item => !selectedItems.has(item.id)))
    showToast(`${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} deleted successfully`)
    setSelectedItems(new Set())
    setShowDeleteDialog(false)
  }

  const handleSaveEdit = (updatedItem) => {
    setInventory(prev => prev.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ))
    showToast('Product updated successfully')
    setEditingItem(null)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>
    }
    return <span style={{ marginLeft: '4px' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px', color: '#1a202c' }}>Agora MerchantHub</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              JS
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>John's Store</div>
              <div style={{ fontSize: '12px', color: '#718096' }}>demo@merchant.com</div>
            </div>
          </div>
          <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }} />
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#718096',
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px' }}>
          <span style={{ color: '#4299e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </span>
          <span style={{ color: '#cbd5e0' }}>/</span>
          <span style={{ color: '#1a202c', fontWeight: '500' }}>Inventory</span>
        </nav>

        {/* Page Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', margin: '0 0 4px' }}>Inventory</h1>
            <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
              {filteredInventory.length} product{filteredInventory.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => navigate('/import')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(66, 153, 225, 0.3)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Bulk Import
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Tag Filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              style={{
                padding: '10px 36px 10px 12px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '180px',
                position: 'relative'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span style={{ color: selectedTags.length > 0 ? '#1a202c' : '#718096' }}>
                {selectedTags.length === 0 ? 'Filter by Tags' : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ position: 'absolute', right: '10px', transform: isTagDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {isTagDropdownOpen && (
              <>
                <div onClick={() => setIsTagDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  width: '280px',
                  background: 'white',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search tags..."
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px 8px 34px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }}
                        autoFocus
                      />
                    </div>
                  </div>
                  {selectedTags.length > 0 && (
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', background: '#f7fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase' }}>Selected ({selectedTags.length})</span>
                        <button onClick={() => { setSelectedTags([]); setCurrentPage(1) }} style={{ fontSize: '12px', color: '#4299e1', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedTags.map(tag => (
                          <span key={tag} style={{ padding: '4px 8px', fontSize: '12px', background: '#4299e1', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {tag}
                            <button onClick={() => { setSelectedTags(prev => prev.filter(t => t !== tag)); setCurrentPage(1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'white' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {allTags.filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase())).map(tag => {
                      const isSelected = selectedTags.includes(tag)
                      return (
                        <div
                          key={tag}
                          onClick={() => { isSelected ? setSelectedTags(prev => prev.filter(t => t !== tag)) : setSelectedTags(prev => [...prev, tag]); setCurrentPage(1) }}
                          style={{ padding: '10px 12px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: isSelected ? '#ebf8ff' : 'white' }}
                        >
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: isSelected ? 'none' : '2px solid #cbd5e0', background: isSelected ? '#4299e1' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span style={{ color: isSelected ? '#2b6cb0' : '#4a5568', fontWeight: isSelected ? '500' : '400' }}>{tag}</span>
                          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#a0aec0' }}>{inventory.filter(item => item.tags.includes(tag)).length}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {(searchQuery || selectedTags.length > 0) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedTags([]); setTagSearchQuery(''); setIsTagDropdownOpen(false); setCurrentPage(1) }}
              style={{ padding: '10px 16px', fontSize: '14px', color: '#718096', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear filters
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: '#ebf8ff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bee3f8' }}>
            <span style={{ fontSize: '14px', color: '#2b6cb0', fontWeight: '500' }}>{selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected</span>
            <button onClick={() => setShowDeleteDialog(true)} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: 'white', background: '#e53e3e', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete Selected
            </button>
            <button onClick={() => setSelectedItems(new Set())} style={{ padding: '8px 16px', fontSize: '14px', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>Clear Selection</button>
          </div>
        )}

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                <th style={{ width: '48px', padding: '14px 16px', textAlign: 'left' }}>
                  <input type="checkbox" checked={paginatedInventory.length > 0 && selectedItems.size === paginatedInventory.length} onChange={handleSelectAll} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                </th>
                <th onClick={() => handleSort('name')} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  Product Name <SortIcon column="name" />
                </th>
                <th onClick={() => handleSort('sku')} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', width: '120px' }}>
                  SKU <SortIcon column="sku" />
                </th>
                <th onClick={() => handleSort('price')} style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', width: '100px' }}>
                  Price <SortIcon column="price" />
                </th>
                <th onClick={() => handleSort('quantity')} style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', width: '80px' }}>
                  Qty <SortIcon column="quantity" />
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', width: '200px' }}>Tags</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 16px', textAlign: 'center' }}>
                    <div style={{ color: '#a0aec0' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }}>
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                      <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '500' }}>No products found</p>
                      <p style={{ margin: 0, fontSize: '14px' }}>{searchQuery || selectedTags.length > 0 ? 'Try adjusting your filters' : 'Import products to get started'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInventory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={(e) => { if (e.target.type !== 'checkbox') setEditingItem(item) }}
                    style={{ borderTop: '1px solid #e2e8f0', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleSelectItem(item.id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#edf2f7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <span style={{ fontWeight: '500', color: '#1a202c' }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#718096' }}>{item.sku}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '500', color: '#1a202c' }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <span style={{ color: item.quantity < 20 ? '#c53030' : item.quantity < 50 ? '#d69e2e' : '#38a169', fontWeight: '500' }}>{item.quantity}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ padding: '4px 10px', fontSize: '12px', background: '#edf2f7', color: '#4a5568', borderRadius: '12px' }}>{tag}</span>
                        ))}
                        {item.tags.length > 3 && <span style={{ padding: '4px 10px', fontSize: '12px', background: '#e2e8f0', color: '#718096', borderRadius: '12px' }}>+{item.tags.length - 3}</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f7fafc' }}>
              <span style={{ fontSize: '14px', color: '#718096' }}>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: '8px 14px', fontSize: '14px', border: '1px solid', borderColor: page === currentPage ? '#4299e1' : '#e2e8f0', borderRadius: '6px', background: page === currentPage ? '#4299e1' : 'white', color: page === currentPage ? 'white' : '#4a5568', cursor: 'pointer', fontWeight: page === currentPage ? '600' : '400' }}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#fed7d7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c53030" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a202c' }}>Confirm Deletion</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>This action cannot be undone</p>
              </div>
            </div>
            <div style={{ background: '#f7fafc', borderRadius: '8px', padding: '12px', marginBottom: '20px', maxHeight: '150px', overflowY: 'auto' }}>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#4a5568' }}>You are about to delete {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}:</p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {inventory.filter(item => selectedItems.has(item.id)).map(item => (
                  <li key={item.id} style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>{item.name} ({item.sku})</li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteDialog(false)} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500', color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500', color: 'white', background: '#e53e3e', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Delete {selectedItems.size} Item{selectedItems.size > 1 ? 's' : ''}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && <EditModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEdit} />}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '14px 20px', background: toast.type === 'success' ? '#38a169' : '#e53e3e', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'slideIn 0.3s ease' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {toast.message}
        </div>
      )}
    </div>
  )
}
