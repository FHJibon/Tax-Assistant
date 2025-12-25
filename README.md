## ⚡ Quick Start

### 1. Clone & Setup Environment  
```
git clone https://github.com/FHJibon/Tax-Assistant.git
```
```
cd backend
```

```
python -m venv .venv
```
```
.venv\Scripts\activate
```
```
pip install -r requirements.txt
```

### 2. Configure Environment
```
Create a .env file
```
### 3. Backend
```
uvicorn app.main:app --reload
```
 
#### Server: http://127.0.0.1:8000  
#### API's: http://127.0.0.1:8000/docs  

##  4. Frontend
#### In New Terminal:  
```
cd Frontend
```
```
npm install
```
```
npm run dev
```
#### Visit: http://localhost:3000  
#