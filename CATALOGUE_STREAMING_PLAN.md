# Simple Catalogue Stream Integration Plan

## Goal
Show real-time updates during PDF catalogue processing:

```
┌─────────────────────────────────────────────┐
│  🔄 Processing Catalogue                    │
│                                             │
│  💭 "Analyzing product layout and..."      │
│                                             │
│  Processing page 3 of 10                   │
│  15 items found so far                     │
│                                             │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░ 30%                    │
└─────────────────────────────────────────────┘
```

**Three pieces of information displayed:**
1. **Thinking message** (e.g., "Analyzing product layout and details..." - truncated to ~60 chars)
2. **Page progress** (e.g., "Processing page 3 of 10")
3. **Items found** (e.g., "15 items found so far")

**Technical**: The AI model (Gemini) is configured with `thinking_level: low` and `include_thoughts: true` (see `backend/agent/config/agent.yml`), which means it returns thinking content in the response that we can capture and display.

---

## Current State

**Backend**: `backend/agent/main.py:38-63` has `ingest_catalogue_stream()` that yields LangGraph events, but not exposed via API.

**Frontend**: `frontend/src/pages/MerchantBulkImportPage.jsx:174-213` polls every 2 seconds with fake progress.

---

## Implementation Steps

### Step 1: Backend - Add Streaming Endpoint

**File**: `backend/app/routes/catalogues.py`

Add new streaming endpoint:

```python
from fastapi.responses import StreamingResponse
import json
import asyncio
from datetime import datetime

@router.get("/{catalogue_id}/stream")
async def stream_catalogue_processing(
    catalogue_id: str,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream real-time processing updates via SSE.

    Events sent:
    - thinking: AI thinking message (truncated to first 50 chars)
    - progress: Current page being processed
    - items_found: Total items extracted so far
    - complete: Processing finished
    - error: Processing failed
    """

    # Verify catalogue ownership
    catalogue = catalogue_service.get_catalogue_by_id(db, catalogue_id, current_user.id)
    if not catalogue:
        raise HTTPException(status_code=404, detail="Catalogue not found")

    async def event_generator():
        try:
            last_items_count = 0

            while True:
                # Refresh catalogue state
                db.refresh(catalogue)

                # Send progress update
                event = {
                    "type": "progress",
                    "status": catalogue.status,
                    "currentPage": catalogue.current_page or 0,
                    "totalPages": catalogue.total_pages or 0,
                    "itemsFound": catalogue.items_extracted or 0,
                    "thinkingMessage": catalogue.thinking_message or "",
                    "timestamp": datetime.utcnow().isoformat()
                }

                yield f"data: {json.dumps(event)}\n\n"

                # Check if completed
                if catalogue.status == "completed":
                    final_event = {
                        "type": "complete",
                        "itemsFound": catalogue.items_extracted or 0,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    yield f"data: {json.dumps(final_event)}\n\n"
                    break

                # Check if failed
                if catalogue.status == "failed":
                    error_event = {
                        "type": "error",
                        "message": catalogue.error_message or "Processing failed",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    yield f"data: {json.dumps(error_event)}\n\n"
                    break

                await asyncio.sleep(0.5)  # Poll every 500ms

        except Exception as e:
            error_event = {
                "type": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
```

---

### Step 2: Backend - Add Progress Fields to Database

**File**: `backend/app/models/catalogue.py`

Add fields to track progress:

```python
class Catalogue(Base):
    # ... existing fields ...

    # Progress tracking
    current_page = Column(Integer, default=0)
    total_pages = Column(Integer, default=0)
    thinking_message = Column(Text, nullable=True)  # Store latest AI thinking (truncated)
```

**Migration**:
```bash
cd backend
alembic revision --autogenerate -m "Add catalogue progress tracking fields"
alembic upgrade head
```

---

### Step 3: Backend - Update Processing to Track Progress

**File**: `backend/app/services/catalogue_service.py`

Modify `process_catalogue_background()` to update progress:

```python
async def process_catalogue_background(db: Session, catalogue_id: str, temp_pdf_path: str):
    """Process catalogue with progress tracking."""

    catalogue = db.query(Catalogue).filter(Catalogue.id == catalogue_id).first()

    try:
        # Get total pages first
        import pypdfium2 as pdfium
        pdf_doc = pdfium.PdfDocument(temp_pdf_path)
        total_pages = len(pdf_doc)
        pdf_doc.close()

        catalogue.total_pages = total_pages
        catalogue.current_page = 0
        db.commit()

        # Process with agent
        final_state = catalogue_ingestor.ingest(temp_pdf_path)

        # Extract items from final state
        catalogue_item_payloads = catalogue_ingestor.parse_final_state(final_state)

        # Update progress as we process items
        catalogue.current_page = total_pages
        catalogue.items_extracted = len(catalogue_item_payloads)
        db.commit()

        # ... rest of existing processing logic ...

        # Mark complete
        catalogue.status = "completed"
        db.commit()

    except Exception as e:
        catalogue.status = "failed"
        catalogue.error_message = str(e)
        db.commit()
        raise
```

**For page-by-page updates**, we need to modify the agent to accept a callback:

```python
# In catalogue_ingestor.py, modify _extract_items_from_images:

def _extract_items_from_images(self, state: CatalogueIngestorState):
    """Extract items with progress callback."""
    idx = state["current_page_idx"]

    # Notify progress (if callback provided)
    if hasattr(self, '_progress_callback') and self._progress_callback:
        self._progress_callback(idx + 1, state["total_pages"])

    # ... rest of extraction logic ...
```

**Simpler approach**: Update progress after agent completes each page by polling the state:

```python
# In catalogue_service.py
async def process_catalogue_background(db: Session, catalogue_id: str, temp_pdf_path: str):

    # ... get total pages ...

    # Process page by page and update progress
    final_state = {"catalogue_items": [], "current_page_idx": 0}

    for page_idx in range(total_pages):
        # Update current page
        catalogue.current_page = page_idx + 1
        db.commit()

        # This is pseudocode - actual implementation depends on agent structure
        # For now, just process all at once and update at end

    final_state = catalogue_ingestor.ingest(temp_pdf_path)

    # ... rest of processing ...
```

**Best approach: Use the streaming agent with progress updates**

We can use the existing `ingest_catalogue_stream()` to capture real-time events including thinking messages:

```python
async def process_catalogue_background(db: Session, catalogue_id: str, temp_pdf_path: str):
    """Process catalogue with real-time progress tracking using agent stream."""

    catalogue = db.query(Catalogue).filter(Catalogue.id == catalogue_id).first()

    try:
        # Get total pages
        import pypdfium2 as pdfium
        pdf_doc = pdfium.PdfDocument(temp_pdf_path)
        total_pages = len(pdf_doc)
        pdf_doc.close()

        catalogue.total_pages = total_pages
        catalogue.status = "processing"
        catalogue.current_page = 0
        db.commit()

        # Use streaming ingest to capture events
        from backend.agent.main import ingest_catalogue_stream

        current_page = 0
        items_count = 0

        async for event_json in await ingest_catalogue_stream(temp_pdf_path):
            event = json.loads(event_json)

            # Extract thinking message from AI response
            if 'input' in event and isinstance(event['input'], dict):
                content = event['input'].get('content', [])
                if isinstance(content, list):
                    for item in content:
                        if isinstance(item, dict) and item.get('type') == 'thinking':
                            thinking_text = item.get('thinking', '')
                            # Truncate to first 60 characters
                            if len(thinking_text) > 60:
                                thinking_text = thinking_text[:60] + '...'
                            catalogue.thinking_message = thinking_text
                            db.commit()

            # Track page progress from state updates
            if 'data' in event and 'current_page_idx' in event['data']:
                new_page = event['data']['current_page_idx']
                if new_page > current_page:
                    current_page = new_page
                    catalogue.current_page = current_page
                    db.commit()

            # Track items extracted
            if 'data' in event and 'catalogue_items' in event['data']:
                items = event['data']['catalogue_items']
                if isinstance(items, list):
                    items_count = len(items)
                    catalogue.items_extracted = items_count
                    db.commit()

        # After streaming completes, parse final state
        final_state = catalogue_ingestor.ingest(temp_pdf_path)
        catalogue_item_payloads = catalogue_ingestor.parse_final_state(final_state)

        # Upload images and create items (existing logic)
        # ... upload to R2 ...
        # ... create CatalogueItem records ...

        catalogue.status = "completed"
        catalogue.current_page = total_pages
        catalogue.processing_time = time.time() - start_time
        db.commit()

    except Exception as e:
        catalogue.status = "failed"
        catalogue.error_message = str(e)
        db.commit()
        raise


# Alternative simpler approach if streaming is too complex:
async def process_catalogue_background_simple(db: Session, catalogue_id: str, temp_pdf_path: str):
    """Simpler approach: Update progress incrementally without streaming."""

    catalogue = db.query(Catalogue).filter(Catalogue.id == catalogue_id).first()

    try:
        # Get total pages
        import pypdfium2 as pdfium
        pdf_doc = pdfium.PdfDocument(temp_pdf_path)
        total_pages = len(pdf_doc)
        pdf_doc.close()

        catalogue.total_pages = total_pages
        catalogue.status = "processing"
        db.commit()

        # Set a generic thinking message
        catalogue.thinking_message = "Analyzing catalogue layout and extracting items..."
        db.commit()

        # Process all pages (blocking call)
        final_state = catalogue_ingestor.ingest(temp_pdf_path)

        # Parse results
        catalogue_item_payloads = catalogue_ingestor.parse_final_state(final_state)

        catalogue.current_page = total_pages
        catalogue.items_extracted = len(catalogue_item_payloads)
        catalogue.thinking_message = "Processing complete"
        db.commit()

        # ... upload images to R2 ...
        # ... create catalogue items ...

        catalogue.status = "completed"
        catalogue.processing_time = time.time() - start_time
        db.commit()

    except Exception as e:
        catalogue.status = "failed"
        catalogue.error_message = str(e)
        db.commit()
```

**Recommendation**: Start with the **simple approach** for MVP (just show a static thinking message), then enhance later with real-time agent stream events if needed.

---

### Step 4: Frontend - Add EventSource Service

**File**: `frontend/src/services/productService.js`

Add streaming method:

```javascript
/**
 * Stream catalogue processing updates via SSE.
 *
 * @param {string} catalogueId - Catalogue ID
 * @param {Object} callbacks - Event callbacks
 * @returns {Function} Cleanup function
 */
streamCatalogueProcessing(catalogueId, callbacks) {
  const token = localStorage.getItem('token')
  const url = `${API_BASE_URL}/api/catalogues/${catalogueId}/stream`

  const eventSource = new EventSource(url, {
    withCredentials: true
  })

  // Add auth header (EventSource doesn't support custom headers directly)
  // We'll need to pass token as query param or use different approach

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'thinking':
          callbacks.onThinking?.(data.message)
          break
        case 'progress':
          callbacks.onProgress?.(data)
          break
        case 'items_found':
          callbacks.onItemsFound?.(data.itemsFound)
          break
        case 'complete':
          callbacks.onComplete?.(data)
          eventSource.close()
          break
        case 'error':
          callbacks.onError?.(data.message)
          eventSource.close()
          break
      }
    } catch (err) {
      console.error('Failed to parse SSE event:', err)
    }
  }

  eventSource.onerror = (err) => {
    console.error('EventSource error:', err)
    callbacks.onError?.('Connection lost')
    eventSource.close()
  }

  return () => eventSource.close()
}
```

**Note**: EventSource doesn't support custom headers (like Authorization). We need to either:
1. Pass token as query parameter
2. Use fetch with ReadableStream instead
3. Rely on cookies for auth

**Better approach using fetch**:

```javascript
/**
 * Stream catalogue processing using fetch + ReadableStream.
 */
async streamCatalogueProcessing(catalogueId, callbacks) {
  const token = localStorage.getItem('token')
  const url = `${API_BASE_URL}/api/catalogues/${catalogueId}/stream`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream'
      }
    })

    if (!response.ok) {
      throw new Error('Stream failed')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Split by double newline (SSE format)
      const events = buffer.split('\n\n')
      buffer = events.pop() || '' // Keep incomplete event in buffer

      for (const event of events) {
        if (!event.trim()) continue

        // Parse SSE event (format: "data: {...}")
        const dataMatch = event.match(/^data: (.*)$/m)
        if (!dataMatch) continue

        try {
          const data = JSON.parse(dataMatch[1])

          switch (data.type) {
            case 'progress':
              callbacks.onProgress?.(data)
              break
            case 'complete':
              callbacks.onComplete?.(data)
              return // Exit stream
            case 'error':
              callbacks.onError?.(data.message)
              return
          }
        } catch (err) {
          console.error('Failed to parse event:', err)
        }
      }
    }
  } catch (err) {
    callbacks.onError?.(err.message)
  }
}
```

---

### Step 5: Frontend - Update UI Component

**File**: `frontend/src/pages/MerchantBulkImportPage.jsx`

Replace polling logic (lines 174-213) with streaming:

```javascript
// Remove old state
// const [isPolling, setIsPolling] = useState(false)
// const [extractionStatus, setExtractionStatus] = useState(null)

// Add new state
const [streamingStatus, setStreamingStatus] = useState({
  currentPage: 0,
  totalPages: 0,
  itemsFound: 0,
  thinkingMessage: '',
  isStreaming: false
})

// Replace polling useEffect with streaming
useEffect(() => {
  if (!jobId || uploadType !== 'pdf') return

  setStreamingStatus(prev => ({ ...prev, isStreaming: true }))

  const cleanup = productService.streamCatalogueProcessing(jobId, {
    onProgress: (data) => {
      setStreamingStatus({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        itemsFound: data.itemsFound,
        thinkingMessage: data.thinkingMessage || '',
        isStreaming: true
      })
    },

    onComplete: async (data) => {
      setStreamingStatus(prev => ({ ...prev, isStreaming: false }))

      // Fetch final items
      const status = await productService.getPDFExtractionStatus(jobId)

      const transformedProducts = status.products.map((product, index) => ({
        ...product,
        row: index + 1,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        tags: product.tags || [],
        image: product.image || null,
        description: product.description || null,
        status: 'valid',
        statusText: `Confidence: ${(product.confidence * 100).toFixed(0)}%`,
        confidence: product.confidence
      }))

      setParsedData(transformedProducts)
    },

    onError: (message) => {
      setStreamingStatus(prev => ({ ...prev, isStreaming: false }))
      alert('PDF extraction failed: ' + message)
    }
  })

  return cleanup
}, [jobId, uploadType])
```

**Update the UI display** (replace lines 472-505):

```javascript
{/* Step 2: Preview - PDF Streaming UI */}
{currentStep === 2 && uploadType === 'pdf' && streamingStatus.isStreaming ? (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    {/* Spinner */}
    <div style={{
      width: '60px',
      height: '60px',
      border: `4px solid ${colors.border.light}`,
      borderTopColor: colors.primary.purple,
      borderRadius: '50%',
      margin: '0 auto 24px',
      animation: 'spin 1s linear infinite'
    }} />

    {/* Thinking Message */}
    {streamingStatus.thinkingMessage && (
      <div style={{
        padding: '12px 20px',
        background: colors.card.backgroundAlt,
        borderRadius: '8px',
        marginBottom: '16px',
        maxWidth: '500px',
        margin: '0 auto 16px'
      }}>
        <p style={{
          fontSize: '13px',
          color: colors.text.secondary,
          fontStyle: 'italic',
          margin: 0
        }}>
          💭 {streamingStatus.thinkingMessage}
        </p>
      </div>
    )}

    {/* Progress Message */}
    <h3 style={{
      fontSize: '18px',
      fontWeight: 600,
      color: colors.text.primary,
      marginBottom: '8px'
    }}>
      {streamingStatus.totalPages > 0
        ? `Processing page ${streamingStatus.currentPage} of ${streamingStatus.totalPages}`
        : 'Starting extraction...'}
    </h3>

    {/* Items Found */}
    <p style={{
      fontSize: '14px',
      color: colors.text.secondary,
      marginBottom: '24px'
    }}>
      {streamingStatus.itemsFound} items found so far
    </p>

    {/* Progress Bar */}
    {streamingStatus.totalPages > 0 && (
      <div style={{
        width: '100%',
        maxWidth: '400px',
        height: '8px',
        background: colors.border.light,
        borderRadius: '4px',
        overflow: 'hidden',
        margin: '0 auto'
      }}>
        <div style={{
          width: `${(streamingStatus.currentPage / streamingStatus.totalPages) * 100}%`,
          height: '100%',
          background: colors.gradient.purple,
          transition: 'width 0.3s ease'
        }} />
      </div>
    )}
  </div>
) : (
  // ... existing preview table UI ...
)}
```

---

## Summary

### What the user sees:

1. **Upload PDF** → Immediately shows "Starting extraction..."
2. **During processing**:
   - 💭 "Analyzing product layout and extracting items..." (thinking message, truncated)
   - "Processing page 3 of 10" (page progress)
   - "15 items found so far" (items count)
   - Progress bar fills up as pages complete
3. **On completion**: Shows item preview table

### Changes needed:

**Backend**:
1. Add streaming endpoint: `GET /api/catalogues/{id}/stream`
2. Add DB fields: `current_page`, `total_pages`, `thinking_message`
3. Update processing to track progress and capture thinking messages
4. Run migration

**Frontend**:
1. Add `streamCatalogueProcessing()` method using fetch + ReadableStream
2. Replace polling useEffect with streaming
3. Update UI to show:
   - Thinking message (💭 with truncated text)
   - Current page / total pages
   - Items found count
   - Progress bar

### Estimated effort: 4-6 hours

### Files to modify:
- `backend/app/routes/catalogues.py` - Add streaming endpoint
- `backend/app/models/catalogue.py` - Add progress fields
- `backend/app/services/catalogue_service.py` - Update progress tracking
- `frontend/src/services/productService.js` - Add streaming method
- `frontend/src/pages/MerchantBulkImportPage.jsx` - Replace polling with streaming

---

## Implementation Notes

### Two Approaches for Capturing Thinking Messages:

**Approach 1: Static thinking message (SIMPLER - RECOMMENDED FOR MVP)**
- Set a generic message like "Analyzing catalogue layout and extracting items..."
- Update it to "Processing complete" when done
- No need to parse agent stream events
- Faster to implement

**Approach 2: Real-time thinking from agent stream (MORE COMPLEX)**
- Use `ingest_catalogue_stream()` to capture LangGraph events
- Parse AI response to extract thinking content from `content[].type == 'thinking'`
- Update database with truncated thinking message (first ~60 chars)
- More accurate but requires handling async streaming in background task

**Recommendation**: Start with **Approach 1** for MVP, add Approach 2 later if needed.

---

## Testing

1. Upload a multi-page PDF
2. Watch real-time updates:
   - Thinking message appears at top
   - Progress shows "Processing page X of Y"
   - Items count increases
   - Progress bar fills up
3. Verify thinking message truncates properly (max ~60 chars)
4. Test error handling (corrupt PDF)
5. Test connection loss (kill backend mid-stream, verify frontend reconnects)
