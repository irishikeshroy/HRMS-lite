# HRMS Backend Service

The core API for the Human Resource Management System, built with FastAPI.

## 🛠️ Prerequisites
- **Python 3.10+** (Recommended 3.14 for latest features)
- **Virtual Environment** (`venv`)
- **pip**

## ⚙️ Installation

1. **Navigate to the backend directory**:
   ```bash
   cd hrms-backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## 🏃 Zero to Hero: Fresh Backend Setup

Follow these exact steps to set up the backend on a brand new computer.

### Step 1: Install Python
Download and install **Python 3.10 or higher** from [python.org](https://www.python.org/downloads/).
> [!IMPORTANT]
> During installation, you **MUST** check the box that says **"Add Python to PATH"**.

### Step 2: Set Up Virtual Environment
Open your terminal inside the `hrms-backend` folder and run:
```bash
# This creates a folder named 'venv' to keep your libraries separate
python -m venv venv
```

### Step 3: Activate & Install
```bash
# Activate the environment (Windows)
.\venv\Scripts\activate

# Activate the environment (macOS/Linux)
source venv/bin/activate

# Install all required libraries
pip install -r requirements.txt
```

### Step 4: Run the Server
```bash
uvicorn app.main:app --reload
```
The server is now live at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 🏗️ Configuration & Customization

### 🌍 Switching Environments
The environment and config source are controlled in `app/core/config.py`. To switch, modify the `ENVIRONMENT` and `env_file` values:

```python
# app/core/config.py

class Settings(BaseSettings):
    # Change to "dev" or "prod"
    ENVIRONMENT: str = "dev"  

    class Config:
        case_sensitive = True
        # Change to ".env" for dev or ".env.prod" for production
        env_file = ".env"  
```

### 🗄️ Configuring Your Own Database
To use your own database (PostgreSQL, MySQL, etc.), simply update the `DATABASE_URL` in your `.env` file:

1.  **SQLite**: `sqlite:///./your_db_name.db`
2.  **PostgreSQL**: `postgresql://user:password@localhost:5432/your_db`
3.  **Neon/Cloud**: `postgresql://user:password@host/dbname?sslmode=require`

---

## 📡 API Reference & Documentation

Once the server is running, you can access the following:

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Swagger UI** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive API documentation & testing |
| **ReDoc** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Alternative clean API documentation |
| **Health Check** | [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) | API status & uptime check |

---

## 🏗️ Technical Details

- **FastAPI**: Asynchronous API framework.
- **SQLAlchemy 2.0**: Modern ORM with typing support.
- **Pool Management**: Includes `pool_pre_ping=True` and `pool_recycle=3600` specifically tuned for cloud databases like Neon to prevent stale connection hangs.
- **Auto-Migrations**: Tables are initialized via `Base.metadata.create_all` in `app/main.py`.

## 📡 API Endpoints
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: `/health`
- **Prefix**: `/api/v1/`
