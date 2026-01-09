# Backend Integration Guide

This document outlines the requirements for integrating the Agora MerchantHub frontend with a real backend API.

## Overview

Currently, the frontend uses:
- Mock authentication (boolean state)
- Static inventory data (hardcoded array)
- Simulated API delays with `setTimeout`

This needs to be replaced with real HTTP requests to backend API endpoints.

---

## 1. Authentication Integration

### Files to Modify

- `src/pages/MerchantLoginPage.jsx`
- `src/App.jsx`
- Create new: `src/contexts/AuthContext.jsx`
- Create new: `src/services/authService.js`

### API Endpoint

**POST** `/api/auth/login`

**Request Payload:**
```json
{
  "email": "demo@merchant.com",
  "password": "password123"
}
```

**Response Payload (Success - 200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "demo@merchant.com",
      "storeName": "John's Store",
      "role": "merchant"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

**Response Payload (Error - 401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### Implementation Changes

**Create `src/services/authService.js`:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Login failed')
    }

    const data = await response.json()

    // Store token in localStorage
    localStorage.setItem('authToken', data.data.token)
    localStorage.setItem('refreshToken', data.data.refreshToken)

    return data.data
  },

  async logout() {
    const token = localStorage.getItem('authToken')

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
  },

  getToken() {
    return localStorage.getItem('authToken')
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}
```

**Update `MerchantLoginPage.jsx` handleSubmit:**
```javascript
import { authService } from '../services/authService'

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!isFormValid) return

  setIsLoading(true)
  setError('')

  try {
    await authService.login(email, password)
    onLogin()
    navigate('/')
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}
```

### Additional Endpoints Needed

**POST** `/api/auth/logout`
- Headers: `Authorization: Bearer {token}`
- Response: 204 No Content

**POST** `/api/auth/refresh`
- Request: `{ "refreshToken": "..." }`
- Response: `{ "token": "new_jwt_token" }`

**GET** `/api/auth/me`
- Headers: `Authorization: Bearer {token}`
- Response: User object

---

## 2. Inventory Management Integration

### Files to Modify

- `src/pages/MerchantDashboardPage.jsx`
- Create new: `src/services/inventoryService.js`
- Create new: `src/hooks/useInventory.js`

### API Endpoints

#### 2.1 Get Inventory

**GET** `/api/inventory`

**Query Parameters:**
```
?page=1
&limit=5
&search=shirt
&tags=summer,new
&sortBy=name
&sortOrder=asc
```

**Response Payload (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prod_abc123",
        "name": "Blue Cotton Shirt",
        "sku": "SH001",
        "price": 29.99,
        "quantity": 50,
        "tags": ["summer", "new", "cotton"],
        "image": "https://example.com/images/sh001.jpg",
        "description": "A comfortable blue cotton shirt.",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-08T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 12,
      "itemsPerPage": 5
    }
  }
}
```

#### 2.2 Update Product

**PUT** `/api/inventory/{productId}`

**Request Payload:**
```json
{
  "name": "Blue Cotton Shirt",
  "price": 29.99,
  "quantity": 50,
  "tags": ["summer", "new", "cotton"],
  "image": "https://example.com/images/sh001.jpg",
  "description": "A comfortable blue cotton shirt."
}
```

**Response Payload (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "name": "Blue Cotton Shirt",
    "sku": "SH001",
    "price": 29.99,
    "quantity": 50,
    "tags": ["summer", "new", "cotton"],
    "image": "https://example.com/images/sh001.jpg",
    "description": "A comfortable blue cotton shirt.",
    "updatedAt": "2026-01-08T12:34:56Z"
  }
}
```

#### 2.3 Bulk Delete Products

**DELETE** `/api/inventory/bulk`

**Request Payload:**
```json
{
  "productIds": ["prod_abc123", "prod_def456", "prod_ghi789"]
}
```

**Response Payload (200):**
```json
{
  "success": true,
  "data": {
    "deletedCount": 3,
    "deletedIds": ["prod_abc123", "prod_def456", "prod_ghi789"]
  }
}
```

#### 2.4 Get All Tags

**GET** `/api/inventory/tags`

**Response Payload (200):**
```json
{
  "success": true,
  "data": {
    "tags": [
      { "name": "summer", "count": 15 },
      { "name": "winter", "count": 8 },
      { "name": "new", "count": 12 }
    ]
  }
}
```

### Implementation Changes

**Create `src/services/inventoryService.js`:**
```javascript
import { authService } from './authService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function fetchWithAuth(url, options = {}) {
  const token = authService.getToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (response.status === 401) {
    // Token expired, redirect to login
    authService.logout()
    window.location.href = '/login'
    throw new Error('Authentication required')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Request failed')
  }

  return response.json()
}

export const inventoryService = {
  async getInventory({ page = 1, limit = 5, search = '', tags = [], sortBy = 'name', sortOrder = 'asc' }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    })

    if (search) params.append('search', search)
    if (tags.length > 0) params.append('tags', tags.join(','))

    const data = await fetchWithAuth(`${API_BASE_URL}/inventory?${params}`)
    return data.data
  },

  async updateProduct(productId, updates) {
    const data = await fetchWithAuth(`${API_BASE_URL}/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
    return data.data
  },

  async bulkDelete(productIds) {
    const data = await fetchWithAuth(`${API_BASE_URL}/inventory/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ productIds })
    })
    return data.data
  },

  async getTags() {
    const data = await fetchWithAuth(`${API_BASE_URL}/inventory/tags`)
    return data.data.tags
  }
}
```

**Create `src/hooks/useInventory.js`:**
```javascript
import { useState, useEffect } from 'react'
import { inventoryService } from '../services/inventoryService'

export function useInventory() {
  const [inventory, setInventory] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    search: '',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const fetchInventory = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await inventoryService.getInventory(filters)
      setInventory(data.items)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [filters])

  return {
    inventory,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchInventory
  }
}
```

**Update `MerchantDashboardPage.jsx`:**
```javascript
import { useInventory } from '../hooks/useInventory'
import { inventoryService } from '../services/inventoryService'

export default function MerchantDashboardPage({ onLogout }) {
  const { inventory, pagination, loading, error, filters, setFilters, refetch } = useInventory()

  // Update filters when user searches/filters/sorts
  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }))
  }

  const handleSort = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleDelete = async () => {
    try {
      const idsToDelete = Array.from(selectedItems)
      await inventoryService.bulkDelete(idsToDelete)
      showToast(`${idsToDelete.length} items deleted successfully`)
      setSelectedItems(new Set())
      setShowDeleteDialog(false)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSaveEdit = async (updatedItem) => {
    try {
      await inventoryService.updateProduct(updatedItem.id, {
        name: updatedItem.name,
        price: updatedItem.price,
        quantity: updatedItem.quantity,
        tags: updatedItem.tags,
        description: updatedItem.description,
        image: updatedItem.image
      })
      showToast('Product updated successfully')
      setEditingItem(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Use pagination from API instead of local pagination
  // Use inventory from API instead of local state
}
```

---

## 3. Bulk Import Integration

### Files to Modify

- `src/pages/MerchantBulkImportPage.jsx`
- Create new: `src/services/importService.js`

### API Endpoints

#### 3.1 Upload and Parse File

**POST** `/api/import/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field

**Response Payload (200):**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_abc123",
    "parsedData": [
      {
        "row": 1,
        "name": "Canvas Backpack",
        "sku": "BG001",
        "price": 59.99,
        "quantity": 40,
        "tags": ["bags", "new"],
        "image": "https://example.com/bg001.jpg",
        "description": "Durable canvas backpack",
        "status": "valid",
        "statusText": "Ready to import"
      },
      {
        "row": 2,
        "name": "Summer Hat",
        "sku": "",
        "price": 24.99,
        "quantity": 30,
        "tags": ["accessories"],
        "image": "",
        "description": "Wide brim summer hat",
        "status": "error",
        "statusText": "Missing SKU"
      }
    ],
    "summary": {
      "totalRows": 10,
      "validCount": 6,
      "warningCount": 2,
      "errorCount": 2
    }
  }
}
```

#### 3.2 Confirm Import

**POST** `/api/import/confirm`

**Request Payload:**
```json
{
  "uploadId": "upload_abc123",
  "skipErrors": true
}
```

**Response Payload (200):**
```json
{
  "success": true,
  "data": {
    "importId": "import_xyz789",
    "results": {
      "added": 5,
      "updated": 1,
      "skipped": 2,
      "failed": 0
    },
    "errors": [
      {
        "row": 4,
        "error": "Missing required field: SKU"
      }
    ]
  }
}
```

### Implementation Changes

**Create `src/services/importService.js`:**
```javascript
import { authService } from './authService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const importService = {
  async uploadFile(file) {
    const token = authService.getToken()
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/import/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Upload failed')
    }

    const data = await response.json()
    return data.data
  },

  async confirmImport(uploadId, skipErrors = true) {
    const token = authService.getToken()

    const response = await fetch(`${API_BASE_URL}/import/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uploadId, skipErrors })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Import failed')
    }

    const data = await response.json()
    return data.data
  }
}
```

**Update `MerchantBulkImportPage.jsx`:**
```javascript
import { importService } from '../services/importService'

const [uploadId, setUploadId] = useState(null)

const handleContinueToPreview = async () => {
  setIsProcessing(true)

  try {
    const result = await importService.uploadFile(uploadedFile)
    setUploadId(result.uploadId)
    setParsedData(result.parsedData)
    setCurrentStep(2)
  } catch (err) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}

const handleConfirmImport = async () => {
  setIsProcessing(true)

  try {
    const result = await importService.confirmImport(uploadId, skipErrors)
    // Store result for step 4 display
    setImportResults(result)
    setCurrentStep(4)
  } catch (err) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}
```

---

## 4. Environment Configuration

### Create `.env` file

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### Create `.env.production` file

```bash
VITE_API_BASE_URL=https://api.agora.com/v1
```

---

## 5. Error Handling

### Global Error Handler

**Create `src/utils/errorHandler.js`:**
```javascript
export function handleApiError(error) {
  // Log to error tracking service (e.g., Sentry)
  console.error('API Error:', error)

  // Map common errors to user-friendly messages
  const errorMessages = {
    'NETWORK_ERROR': 'Unable to connect to server. Please check your internet connection.',
    'UNAUTHORIZED': 'Your session has expired. Please log in again.',
    'FORBIDDEN': 'You do not have permission to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'SERVER_ERROR': 'An unexpected error occurred. Please try again later.'
  }

  return errorMessages[error.code] || error.message || 'An error occurred'
}
```

---

## 6. Loading States

### Add Loading Indicators

**Update components to show:**
- Skeleton loaders for table rows during initial load
- Spinner overlays during mutations (save, delete)
- Disabled states for buttons during API calls

---

## 7. Image Upload

### API Endpoint

**POST** `/api/upload/image`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `image` field

**Response Payload (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.agora.com/images/prod_abc123.jpg",
    "thumbnail": "https://cdn.agora.com/images/prod_abc123_thumb.jpg"
  }
}
```

### Implementation

Add image upload to `EditModal.jsx`:
```javascript
const handleImageUpload = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    body: formData
  })

  const data = await response.json()
  handleChange('image', data.data.url)
}
```

---

## 8. WebSocket for Real-time Updates (Optional)

For real-time inventory updates across multiple users:

**WebSocket Connection:**
```javascript
// src/services/websocketService.js
export class WebSocketService {
  connect() {
    const token = authService.getToken()
    this.ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`)

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === 'INVENTORY_UPDATE') {
        // Refresh inventory
      }
    }
  }
}
```

---

## Summary Checklist

### Authentication
- [ ] Implement login API call
- [ ] Store JWT token in localStorage
- [ ] Add token to all API requests
- [ ] Implement logout
- [ ] Handle token refresh
- [ ] Redirect on 401 errors

### Inventory
- [ ] Fetch inventory with pagination
- [ ] Implement search/filter/sort
- [ ] Update product API call
- [ ] Bulk delete API call
- [ ] Get tags API call

### Bulk Import
- [ ] File upload with multipart/form-data
- [ ] Parse and validate file
- [ ] Confirm import with uploadId
- [ ] Display import results

### General
- [ ] Add .env files for API URL configuration
- [ ] Implement global error handling
- [ ] Add loading states to all async operations
- [ ] Add image upload functionality
- [ ] Test all API integrations
- [ ] Handle network errors gracefully
- [ ] Add request/response logging for debugging
