# Server File Flow & Architecture

This document breaks down the Express.js backend for 3D Object Studio, explaining the exact role of every file and how data moves through the application.

## 1. Entry Point

### `src/index.js`
This is the main entry point of the server. When you run `node src/index.js`, this file is executed.
- **Initialization**: It connects to MongoDB by calling `connectDB()` from `config/db.js`.
- **Middleware Pipeline**: It sets up essential Express middlewares: `helmet` (security), `cors` (cross-origin access), `express.json` (parsing JSON bodies), `cookie-parser` (reading HTTP-only cookies), and `morgan` (logging).
- **Routing**: It registers `/api/auth` and `/api/models` to handle all incoming API traffic, delegating to the respective route files.
- **Error Handling**: It registers the global error handler middleware (`errorHandler.js`) at the very end of the pipeline.
- **Graceful Shutdown**: It catches `SIGTERM` and `SIGINT` signals to safely close the server instead of crashing instantly.

---

## 2. Configuration (`src/config/`)

### `env.js`
Loads environment variables from the `.env` file using the `dotenv` package. It validates that critical variables (like `JWT_ACCESS_SECRET`) are present. If anything is missing, it crashes the app immediately on startup, preventing unexpected runtime errors. It exports a centralized `env` object used everywhere else.

### `db.js`
Exports the `connectDB` function. It connects to MongoDB using Mongoose and sets up event listeners to log disconnects or reconnects. 

### `s3.js`
Initializes and exports an AWS `S3Client` instance using credentials from `env.js`. If S3 credentials aren't provided, it gracefully exports `null` so the app knows to fall back to local file storage.

---

## 3. Data Models (`src/models/`)

These files define the structure of data saved in MongoDB.

### `User.js`
Defines the user schema.
- **Hashing**: Uses a Mongoose `pre('save')` hook to automatically hash user passwords using `bcrypt` before they are saved to the database.
- **Refresh Tokens**: Contains an array of hashed refresh tokens to allow multi-device logins and invalidate sessions if token theft is detected. Includes a helper method `cleanExpiredTokens()` to prevent this array from growing infinitely.

### `Model.js`
Defines the schema for uploaded 3D files.
- **Metadata**: Stores file size, original name, and the S3/local file URL.
- **Interaction State**: Embeds a sub-document schema (`interactionStateSchema`) that tracks the user's last camera position, zoom, and wireframe preference for that specific 3D object.

---

## 4. Routing & Controllers

### Auth Flow
- **`src/routes/authRoutes.js`**: Defines the endpoints (`/register`, `/login`, `/logout`, `/refresh`, `/me`). It applies rate-limiting and uses `express-validator` chains to ensure passwords and emails meet formatting requirements before hitting the controller.
- **`src/controllers/authController.js`**:
  - **Register/Login**: Verifies credentials, generates JWT access and refresh tokens via `tokenService`, hashes the refresh token, stores it in the DB, and sets an `httpOnly` cookie for the refresh token.
  - **Refresh**: Reads the `httpOnly` cookie. If the token is valid, it checks if it exists in the user's DB array. If a used/missing token is presented, it flags it as token reuse and nukes all sessions for that user for security. Otherwise, it rotates the refresh token and returns a new short-lived access token.

### Model Flow
- **`src/routes/modelRoutes.js`**: Defines endpoints for uploading (`/upload`), fetching lists (`/`), deleting (`/:id`), and state saving (`/:id/state`). All routes are protected by the `auth.js` middleware.
- **`src/controllers/modelController.js`**:
  - **Upload**: Intercepts the file from Multer, passes it to `uploadService` to save to S3/Disk, and saves the resulting URL to MongoDB.
  - **State Sync**: Handles `saveState` (merging new camera angles into the existing DB object) and `getState` to return it to the frontend.

---

## 5. Middleware (`src/middleware/`)

### `auth.js`
The gatekeeper. It intercepts requests, extracts the Bearer token from the `Authorization` header, and verifies it using `tokenService`. If valid, it attaches the `user` document to `req.user` so controllers know who is making the request.

### `errorHandler.js`
A centralized catch-all for errors thrown anywhere in the app. It intercepts Mongoose validation errors, duplicate key errors, or custom `AppError` throws, formatting them into a standard `{ success: false, message: ... }` JSON response.

### `rateLimiter.js`
Uses `express-rate-limit` to prevent spam/DDoS. Exports separate limiters (e.g., stricter limits for auth/login endpoints, softer limits for general API requests).

### `upload.js`
Configures `multer`. It accepts only `.glb` files and stores the uploaded file directly in memory (`memoryStorage()`) so `uploadService.js` can process it as a raw buffer (required for S3 uploads).

### `validate.js`
A helper that runs the `express-validator` chains defined in the route files. If validation fails, it throws an `AppError` before the controller logic is executed.

---

## 6. Services (`src/services/`)

### `tokenService.js`
A pure utility wrapper around `jsonwebtoken`. It handles creating short-lived access tokens (15m) and long-lived refresh tokens (7d), verifying them, and hashing the refresh tokens for database storage.

### `uploadService.js`
Abstracts file storage logic. 
- Receives the raw file buffer from the `upload.js` Multer middleware.
- Checks if S3 is configured. If yes, it streams the buffer directly to AWS S3 using `@aws-sdk/lib-storage` and returns the public S3 URL.
- If S3 is not configured, it writes the buffer to the local `server/uploads/` directory and returns a local `/uploads/` URL. 
- It handles file deletion in the exact same dual-mode manner.
