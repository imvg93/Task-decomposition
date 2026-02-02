# Frontend Start Guide

## 🚀 Quick Start Commands

### Development Mode (Hot Reload)
```bash
cd frontend/frontend
npm start
```
- Opens at: `http://localhost:3000`
- Auto-reloads on file changes
- Press `Ctrl+C` to stop

### Production Build
```bash
cd frontend/frontend
npm run build
```
- Creates optimized production build in `frontend/frontend/build/`
- Build is ready to deploy to any static hosting

### Serve Production Build Locally
```bash
# Install serve globally (one time)
npm install -g serve

# Serve the build
cd frontend/frontend
serve -s build
```
- Opens at: `http://localhost:3000` (or another port if 3000 is busy)

## 📁 Project Structure

```
frontend/frontend/
├── public/          # Static files
├── src/            # Source code
│   ├── App.js      # Main component
│   ├── App.css     # Main styles
│   ├── components/ # React components
│   └── index.js    # Entry point
└── build/          # Production build (after npm run build)
```

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## 🌐 Backend Connection

The frontend connects to the backend at:
- **Development**: `http://localhost:5000/api`

Make sure your backend is running before using the frontend!

## ✅ Build Status

✅ Production build completed successfully!
- Main JS: 76.62 kB (gzipped)
- Main CSS: 3.65 kB (gzipped)
- Build location: `frontend/frontend/build/`
