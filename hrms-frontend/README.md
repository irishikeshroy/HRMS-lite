# HRMS Frontend Application

A high-fidelity React frontend for the HRMS system, styled with Material UI (MUI).

## 🛠️ Prerequisites
- **Node.js 18+**
- **npm** or **yarn**

## ⚙️ Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd hrms-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## 🏃 Zero to Hero: Fresh Frontend Setup

Follow these exact steps to set up the frontend on a brand new computer.

### Step 1: Install Node.js
Download and install **Node.js 18 or higher** from [nodejs.org](https://nodejs.org/). This will also install `npm`.

### Step 2: Install Dependencies
Open your terminal inside the `hrms-frontend` folder and run:
```bash
# This downloads all the required libraries (MUI, React, etc.)
npm install
```

### Step 3: Configure Environment
Ensure the file `.env.dev` exists in the folder and contains:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Step 4: Start the App
```bash
npm run dev
```
The app is now live at [http://localhost:5173](http://localhost:5173).

---

### 🚀 Production Mode
Builds a highly optimized static bundle for deployment.

1. **Configure Environment**:
   Ensure `.env.prod` points to your production backend URL:
   ```env
   VITE_API_URL=https://your-backend-url.com/api/v1
   ```

2. **Build and Preview**:
   ```bash
   npm run build
   npm run preview
   ```

---

## ✨ Key Features
- **High-Fidelity Dashboard**: Interactive stat cards and attendance logs.
- **Employee Directory**: Full CRUD support with debounced search and filtering.
- **Attendance Tracking**: 
    - Paginated attendance history.
    - Clickable status chips to toggle Present/Absent.
    - Future-date validation on all pickers.
- **Modern UI**: Dark-mode ready design with skeleton loaders for smooth UX.

## 📦 Dependencies
- **React 19**
- **MUI 6**: For premium components and icons.
- **React Hook Form**: For efficient, accessible forms.
- **Axios**: For backend communication.
- **React Router 7**: For seamless client-side navigation.
