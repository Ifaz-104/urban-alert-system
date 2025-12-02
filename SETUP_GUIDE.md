# Urban Alert System - Setup Guide

Welcome to the Urban Alert System project! This guide will help you set up the project on your local machine and start contributing.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Cloning the Repository](#cloning-the-repository)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [VS Code Extensions](#vs-code-extensions)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v18 or higher recommended)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Git**
   - Download from: https://git-scm.com/
   - Verify installation:
     ```bash
     git --version
     ```

3. **VS Code** (Recommended IDE)
   - Download from: https://code.visualstudio.com/

---

## 📥 Cloning the Repository

1. **Open your terminal** (Command Prompt, PowerShell, or Git Bash on Windows)

2. **Navigate to your desired directory:**
   ```bash
   cd C:\Users\YourUsername\Documents
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/Ifaz-104/urban-alert-system.git
   ```
   
   > **Note:** Replace the URL with your actual GitHub repository URL if different.

4. **Navigate into the project directory:**
   ```bash
   cd urban-alert-system
   ```

5. **Open the project in VS Code:**
   ```bash
   code .
   ```

---

## 🔙 Backend Setup

### 1. Navigate to the backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

This will install the following packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables
- `nodemon` - Development server (dev dependency)

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory (if not already present):

```env
MONGO_URI=mongodb+srv://ifaztazwarahmed_db_user:gunners%409711@cluster0.kg31okf.mongodb.net/urban-alert?appName=Cluster0&retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this_in_production
PORT=5000
```

> **Important:** The `.env` file should already exist in the repository. If not, create it with the above content.

### 4. Verify Backend Setup

Test the backend server:
```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster0.kg31okf.mongodb.net
```

Press `Ctrl+C` to stop the server.

---

## 🎨 Frontend Setup

### 1. Open a new terminal and navigate to the frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

This will install the following packages:
- `react` & `react-dom` - React library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `leaflet` & `react-leaflet` - Interactive maps
- `vite` - Build tool and dev server

### 3. Verify Frontend Setup

Test the frontend development server:
```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Press `Ctrl+C` to stop the server.

---

## 🚀 Running the Application

You need to run **both** the backend and frontend servers simultaneously.

### Option 1: Using Two Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using VS Code Integrated Terminal

1. Open VS Code
2. Open the integrated terminal (`Ctrl + ~`)
3. Click the `+` icon to create a new terminal
4. Run backend in Terminal 1, frontend in Terminal 2

### Accessing the Application

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:5000/api/
- **Health Check:** http://localhost:5000/api/health

---

## 🔌 VS Code Extensions

Install these extensions for the best development experience:

### Essential Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`
   - Provides React code snippets

2. **ESLint**
   - ID: `dbaeumer.vscode-eslint`
   - JavaScript linting

3. **Prettier - Code formatter**
   - ID: `esbenp.prettier-vscode`
   - Code formatting

4. **Auto Rename Tag**
   - ID: `formulahendry.auto-rename-tag`
   - Auto rename paired HTML/JSX tags

5. **Path Intellisense**
   - ID: `christian-kohler.path-intellisense`
   - Auto-complete file paths

6. **GitLens**
   - ID: `eamodio.gitlens`
   - Enhanced Git capabilities

7. **Thunder Client** (Optional)
   - ID: `rangav.vscode-thunder-client`
   - API testing tool (alternative to Postman)

### Installing Extensions

**Method 1: Via VS Code UI**
1. Open VS Code
2. Click Extensions icon (or press `Ctrl+Shift+X`)
3. Search for the extension name
4. Click "Install"

**Method 2: Via Command Line**
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension eamodio.gitlens
code --install-extension rangav.vscode-thunder-client
```

---

## 📁 Project Structure

```
urban-alert-system/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── reportController.js  # Report handling logic
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── IncidentReport.js    # Incident report schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── reportRoutes.js      # Report endpoints
│   ├── .env                     # Environment variables
│   ├── server.js                # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── MapLocationPicker.jsx
│   │   │   └── ...
│   │   ├── pages/               # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ReportHazard.jsx
│   │   │   ├── HazardReports.jsx
│   │   │   ├── ReportDetails.jsx
│   │   │   └── ...
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
│
└── SETUP_GUIDE.md               # This file
```

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. **Port Already in Use**

**Error:** `Port 5000 is already in use` or `Port 5173 is already in use`

**Solution:**
- **Windows:** Find and kill the process
  ```bash
  # For backend (port 5000)
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # For frontend (port 5173)
  netstat -ano | findstr :5173
  taskkill /PID <PID> /F
  ```

#### 2. **MongoDB Connection Error**

**Error:** `MongooseServerSelectionError: Could not connect to any servers`

**Solution:**
- Check your internet connection
- Verify the `MONGO_URI` in `.env` file is correct
- Ensure MongoDB Atlas allows connections from your IP address

#### 3. **Module Not Found**

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. **CORS Errors**

**Error:** `Access to fetch at 'http://localhost:5000' has been blocked by CORS policy`

**Solution:**
- Ensure the backend server is running
- Check that CORS is enabled in `backend/server.js`

#### 5. **React/Vite Build Errors**

**Solution:**
```bash
# Clear Vite cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

---

## 📚 Additional Resources

- **React Documentation:** https://react.dev/
- **Express.js Documentation:** https://expressjs.com/
- **MongoDB Documentation:** https://docs.mongodb.com/
- **Leaflet Documentation:** https://leafletjs.com/
- **Vite Documentation:** https://vitejs.dev/

---

## 🤝 Contributing

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

3. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

---

## 📞 Support

If you encounter any issues not covered in this guide, please:
1. Check the existing GitHub Issues
2. Create a new issue with detailed information about the problem
3. Contact the project maintainer

---

## ✅ Quick Start Checklist

- [ ] Node.js installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] `.env` file configured in backend/
- [ ] VS Code extensions installed
- [ ] Backend server running (http://localhost:5000)
- [ ] Frontend server running (http://localhost:5173)
- [ ] Application accessible in browser

---

**Happy Coding! 🚀**
