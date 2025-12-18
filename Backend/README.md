
## ⚡ Quick Start 

### 1. Clone & Setup Environment
```
python -m venv .venv
```
```
\.venv\Scripts\activate
```
```
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./{name}.db
```

### 3. Start Server
```
uvicorn app.main:app --reload 
```

**Server: http://127.0.0.1:8000**  
**API: http://127.0.0.1:8000/docs**

### Document Upload API

- Endpoint: `/upload`
- Method: POST
- Content-Type: `multipart/form-data`
- Field: `file`
- Auth: Bearer token in `Authorization` header

Example:
```js
const formData = new FormData();
formData.append('file', file);
fetch('http://localhost:8000/upload', {
	method: 'POST',
	headers: { Authorization: `Bearer ${token}` },
	body: formData,
}).then(r => r.json()).then(console.log);
```

Response:
```json
{
	"filename": "doc.pdf",
	"status": "uploaded",
	"session_id": "<active-session-id>",
	"document_id": 123
}
```

Notes:
- Files are stored only in SQLite, associated with the user's active chat session.
- Uploaded documents are NOT ingested into RAG and are NOT written to disk.
