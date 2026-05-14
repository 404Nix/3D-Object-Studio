# Client File Flow & Architecture

This document breaks down the React/Vite frontend for 3D Object Studio, explaining how the UI interacts with Redux state and the Three.js abstraction layer.

## 1. Entry & Global Setup

### `src/main.jsx`
Standard React 19 entry point. It wraps the `App` component in the Redux `<Provider>`, injecting the global store into the application.

### `src/index.css`
The main stylesheet. It imports Tailwind CSS and defines all the raw CSS variables (`--bg-primary`, `--accent-purple`, etc.) used throughout the app for the dark glassmorphic theme. It also defines custom utility classes (`.btn-primary`, `.glass`) and keyframe animations.

### `src/App.jsx`
Handles high-level routing using `react-router-dom`. 
- Sets up `<ProtectedRoute>` wrappers around private routes like `/dashboard` and `/viewer`.
- Contains the `AuthInit` component: a silent boot-strap mechanism that runs on mount. It attempts to fetch the user profile (`/auth/me`). If it gets a 401, it attempts a silent token refresh (`/auth/refresh` via HttpOnly cookie) before deciding if the user should be kicked back to the login screen.

---

## 2. API & Networking (`src/services/`)

### `api.js`
The core Axios instance used by the entire frontend. 
- **Request Interceptor**: Automatically attaches the JWT `accessToken` from `sessionStorage` to every outgoing request.
- **Response Interceptor (The Retry Queue)**: The most complex part of the networking layer. If an API request fails with a `401 Unauthorized` (access token expired), it intercepts the failure. It puts all incoming requests into a "failed queue", attempts a silent refresh request to the backend, and if successful, replays all the failed queued requests with the new token automatically. This makes token refreshing entirely invisible to the user.

---

## 3. State Management (`src/store/`)

Uses Redux Toolkit to manage global state across the app.

### `authSlice.js`
Manages the user's session state (`user`, `isAuthenticated`, `accessToken`). Contains async thunks (`loginUser`, `registerUser`, `refreshToken`) that make API calls and update the state automatically upon success or failure.

### `modelsSlice.js`
Manages the list of 3D models the user has uploaded. Handles fetching the paginated list of models and tracks the `isUploading` state when a user drops a new `.glb` file into the modal.

### `viewerSlice.js`
Stores the current 3D interaction state (`cameraPosition`, `zoom`, `wireframe` toggle). This acts as a bridge between the React UI toolbar and the Three.js canvas.

---

## 4. Custom Hooks (`src/hooks/`)

### `useAuth.js`
A simple convenience hook. Instead of components manually running `useDispatch()` and `useSelector(state => state.auth)`, they just call `const { login, user } = useAuth()`.

### `useStateSync.js`
Handles saving the 3D viewer state to the database without spamming the API. When the user rotates the 3D model, the Redux `viewerSlice` updates rapidly. This hook watches that Redux state and sets a 2-second debounce timer. If the user stops rotating for 2 seconds, it automatically fires an API request to save their current camera angle to the database.

### `useThreeScene.js`
The critical bridge between React's declarative world and Three.js's imperative world. 
- Instantiates the raw `SceneManager` and `ModelLoader` classes.
- Tracks model loading progress percentage for the UI to display.
- Exposes clean React-friendly functions like `loadModel`, `resetCamera`, and `setWireframe` that internally call the vanilla Three.js methods.

---

## 5. Three.js Engine (`src/three/`)

These files have zero knowledge of React. They are pure vanilla JS/Three.js classes.

### `SceneManager.js`
Responsible for the WebGL canvas. It sets up the `THREE.Scene`, `PerspectiveCamera`, `WebGLRenderer`, and `OrbitControls`. It manages lighting, grid helpers, and the requestAnimationFrame render loop. It exposes methods to `applyState()` (move the camera to a saved position) and `getState()` (read current camera position for saving).

### `ModelLoader.js`
A wrapper around Three's `GLTFLoader`. It handles the async downloading of `.glb` files, computes loading percentages for the UI, applies shadow casting to all loaded meshes, and critically, handles `.dispose()` logic to cleanly clear materials/geometries from memory when a model is swapped out to prevent memory leaks.

---

## 6. User Interface & Flow (`src/pages/` & `src/components/`)

### Login / Register Flow (`LoginPage.jsx`, `RegisterPage.jsx`)
Standard form components. They validate user input locally, then dispatch `login` or `register` auth thunks. On success, the global `App.jsx` router redirects them to the Dashboard.

### Dashboard Flow (`DashboardPage.jsx`, `ModelCard.jsx`, `UploadModal.jsx`)
- Mounts and triggers a fetch for all models via `modelsSlice`.
- Displays them in a grid of `ModelCard` components.
- Clicking "Upload" opens `UploadModal.jsx`, which handles drag-and-drop logic and dispatches the multipart form data file upload to the API.

### Viewer Flow (`ViewerPage.jsx`, `ViewerToolbar.jsx`)
- Reads the `:id` from the URL.
- Fetches the specific model details and its saved interaction state (camera angles) from the API.
- Passes the `.glb` URL to the `useThreeScene` hook to start downloading.
- Displays `LoadingOverlay.jsx` using the download progress percentage.
- Once loaded, initializes the `useStateSync` hook to begin tracking user rotations for auto-saving.
- Connects the buttons in `ViewerToolbar.jsx` (e.g., "Toggle Wireframe") to the Three.js scene manager via the `useThreeScene` hook.
