# 3D Object Studio

A full-stack MERN application for uploading, viewing, and interacting with 3D models in the browser.

## Features

- **Authentication** — JWT access + refresh token flow with HttpOnly cookies
- **File Uploads** — Upload .glb files to AWS S3 (or local storage fallback)
- **3D Viewer** — Three.js with OrbitControls, wireframe, and auto-rotation
- **State Persistence** — Camera position, zoom, and rotation are automatically saved per model
- **Docker** — Full Docker Compose setup (MongoDB, API, Nginx)

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Redux Toolkit
- **3D Engine**: Three.js (vanilla), GLTFLoader, OrbitControls
- **Backend**: Node.js 20, Express.js, Mongoose
- **Database**: MongoDB
- **Auth**: JWT, bcrypt, HttpOnly cookies
- **Storage**: AWS S3 (with local fallback)
- **Deployment**: Docker, Nginx

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB
- npm

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
cp .env.example .env
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment
Update the `server/.env` file with your MongoDB URI and JWT secrets. 
AWS S3 credentials are optional; if not provided, files will be saved to `server/uploads/` locally.

### 3. Start Development Servers
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Navigate to `http://localhost:5173`.

## Docker Deployment

To run the entire stack (React, Express, MongoDB) via Docker Compose:

```bash
cp server/.env.example server/.env
# Edit server/.env with production values, ensuring MONGODB_URI points to the mongo container if using the included database.

docker-compose up --build -d
```

The application will be accessible at `http://localhost`.

## Project Structure

- `client/` - React frontend
  - `src/components/` - Reusable UI components
  - `src/hooks/` - Custom React hooks (`useAuth`, `useThreeScene`, etc.)
  - `src/pages/` - Main page components
  - `src/store/` - Redux Toolkit slices
  - `src/three/` - Three.js `SceneManager` and `ModelLoader` classes
- `server/` - Express backend
  - `src/config/` - Environment, database, and S3 config
  - `src/controllers/` - Route handlers
  - `src/middleware/` - Auth, validation, upload, and error handling middleware
  - `src/models/` - Mongoose schemas (`User`, `Model`)
  - `src/routes/` - Express route definitions
  - `src/services/` - JWT and file upload services

## License

MIT
