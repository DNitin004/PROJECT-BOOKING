# NA-NI TICKETS - Quick Commands Reference

Keep this file handy for quick reference. All commands should be run from the project root directory.

## 🚀 Getting Started

### First Time Setup (5 minutes)

```bash
# 1. Navigate to project
cd c:\Users\nithi\OneDrive\Desktop\PROJECT-BOOKING\na-ni-tickets

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Start MongoDB (ensure it's running)
# If installed locally: mongod
# If using Atlas: skip this step

# 5. Start backend (Terminal 1)
cd backend && npm run dev

# 6. Start frontend (Terminal 2)
cd frontend && npm start

# 7. Open browser to http://localhost:3000
```

## 🛠️ Development Commands

### Backend Commands

#### Start development server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Start production server
```bash
cd backend
npm start
# Make sure NODE_ENV=production in .env
```

#### Install new package
```bash
cd backend
npm install package-name
```

#### Check installed packages
```bash
cd backend
npm list
```

#### Update dependencies
```bash
cd backend
npm update
```

### Frontend Commands

#### Start development server
```bash
cd frontend
npm start
# Opens http://localhost:3000 automatically
```

#### Build for production
```bash
cd frontend
npm run build
# Creates optimized build in build/ folder
```

#### Test application
```bash
cd frontend
npm test
# Runs unit tests
```

#### Install new package
```bash
cd frontend
npm install package-name
```

#### Check installed packages
```bash
cd frontend
npm list
```

## 🐳 Docker Commands

### Build and Run with Docker

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# View backend logs only
docker-compose logs backend

# View frontend logs only
docker-compose logs frontend

# View MongoDB logs only
docker-compose logs mongodb
```

### Docker Troubleshooting

```bash
# Stop all containers
docker-compose down

# Remove all containers
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Check if containers are running
docker ps

# Stop specific service
docker-compose stop backend
```

## 🗄️ MongoDB Commands

### Connect to Database

```bash
# Local MongoDB
mongosh
# Or: mongo (older versions)

# In MongoDB shell:
use nani-tickets
db.users.find()  # See all users
db.bookings.find()  # See all bookings
```

### Database Operations

```bash
# View all databases
show databases

# Select database
use nani-tickets

# Show all collections
show collections

# Count documents
db.users.count()

# Find all documents
db.users.find()

# Find one document
db.users.findOne()

# Delete all documents
db.users.deleteMany({})

# Drop collection
db.users.drop()

# Clear entire database
db.dropDatabase()
```

## 🧪 API Testing

### Using curl

```bash
# Get Movies
curl http://localhost:5000/api/items/movies

# Get Concerts
curl http://localhost:5000/api/items/concerts

# Test backend is running
curl http://localhost:5000/api/health

# Signup (POST)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"1234567890","password":"password123"}'
```

### Using Postman

1. Import API collection (if available)
2. Set base URL to `http://localhost:5000/api`
3. Create requests for each endpoint
4. Test authentication by adding Authorization header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## 📝 Environment Configuration

### Reset .env files

```bash
# Backend .env template
MONGODB_URI=mongodb://localhost:27017/nani-tickets
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
PORT=5000
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
OTP_EXPIRY=10

# Frontend .env template
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your-stripe-publishable-key
```

## 🐛 Debugging

### Backend Debugging

```bash
# With debug logs
DEBUG=* npm run dev

# With specific module debug
DEBUG=express:* npm run dev

# Check logs
tail -f logs/error.log
```

### Frontend Debugging

```bash
# Chrome DevTools (F12)
# - Console tab for errors
# - Network tab for API calls
# - Application tab for localStorage
# - React Developer Tools extension
```

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `netstat -ano \| findstr :5000` then kill process |
| Port 3000 in use | `netstat -ano \| findstr :3000` then kill process |
| MongoDB not running | Start MongoDB service or mongod |
| CORS errors | Check FRONTEND_URL in backend .env |
| Token errors | Clear localStorage and re-login |
| Module not found | Run `npm install` in the folder |
| npm install fails | Delete node_modules and package-lock.json, then `npm install` |

## 📦 Dependency Management

### Update All Dependencies

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### Check for Vulnerabilities

```bash
# Backend
cd backend
npm audit

# Fix vulnerabilities
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

### Install Specific Version

```bash
npm install package-name@version
# Example: npm install react@18.2.0
```

## 🚢 Deployment

### Build for Production

```bash
# Backend
cd backend
npm install --production

# Frontend
cd frontend
npm run build
```

### Deploy with Docker

```bash
# Build Docker image
docker-compose build

# Push to registry (if configured)
docker tag na-ni-tickets:latest your-registry/na-ni-tickets:latest
docker push your-registry/na-ni-tickets:latest

# Run on server
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Useful Inspection Commands

### Check Directory Structure

```bash
# View backend structure
tree backend

# View frontend structure
tree frontend

# List all files
dir /s
```

### Check Running Ports

```bash
# Windows
netstat -ano

# Check specific port
netstat -ano | findstr :5000
```

### Environment Variables

```bash
# View all environment variables
set

# View specific variable
echo %MONGODB_URI%
```

## 🔍 Git Commands (if using version control)

```bash
# Initialize repository
git init

# Add files
git add .

# Commit changes
git commit -m "Initial commit"

# Check status
git status

# View changes
git diff

# View log
git log

# Create branch
git branch feature/seat-booking

# Switch branch
git checkout feature/seat-booking

# Merge branch
git merge feature/seat-booking
```

## 🧹 Cleanup Commands

### Remove Generated Files

```bash
# Remove node_modules and reinstall
cd backend && rm -r node_modules && npm install && cd ..
cd frontend && rm -r node_modules && npm install && cd ..

# Remove build artifacts
cd frontend && rm -r build && cd ..

# Clear npm cache
npm cache clean --force
```

### Database Cleanup

```bash
# Backup database
mongodump --db nani-tickets --out ./backup

# Restore database
mongorestore --db nani-tickets ./backup/nani-tickets
```

## 📱 Mobile Testing

```bash
# Test frontend on mobile
# Find your computer IP: ipconfig
# On mobile device, visit: http://YOUR-IP:3000

# Toggle device mode (DevTools)
# Chrome: F12, then Ctrl+Shift+M (or Cmd+Shift+M on Mac)
```

## 💡 Pro Tips

### Disable Notifications (reduce console noise)
```bash
# Set environment variable
set DEBUG=
```

### Run Frontend without browser opening
```bash
set BROWSER=none
npm start
```

### Run on Different Port
```bash
set PORT=3001
npm start
```

### Skip npm audit warnings
```bash
npm install --legacy-peer-deps
```

## 🆘 Emergency Commands

### Kill all node processes (Windows)
```bash
taskkill /F /IM node.exe
```

### Kill specific port (Windows)
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Hard reset project
```bash
# Remove all node_modules and dependencies
cd backend && rm -r node_modules package-lock.json
cd ../frontend && rm -r node_modules package-lock.json
cd ..

# Reinstall clean
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start fresh
cd backend && npm run dev
# In new terminal
cd frontend && npm start
```

## 📞 Project Contact

- **Project Name:** NA-NI TICKETS
- **Admin Email:** dogiparthynitindatta@gmail.com
- **Backend Port:** 5000
- **Frontend Port:** 3000
- **Database:** MongoDB

## 🎯 Command Cheat Sheet

| Task | Command |
|------|---------|
| Start development | `cd backend && npm run dev` (Terminal 1) + `cd frontend && npm start` (Terminal 2) |
| Build production | `cd frontend && npm run build` |
| Run with Docker | `docker-compose up` |
| Install packages | `npm install package-name` |
| Check ports | `netstat -ano` |
| View logs | `docker-compose logs` |
| Database shell | `mongosh` |
| Stop servers | `Ctrl+C` in terminals |
| Clear cache | `npm cache clean --force` |
| Test API | `curl http://localhost:5000/api/health` |

---

## Quick Start (Copy & Paste)

```bash
# For first time setup
cd c:\Users\nithi\OneDrive\Desktop\PROJECT-BOOKING\na-ni-tickets
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm start
```

**Done!** Open http://localhost:3000 in your browser.

---

*Save this file and refer back whenever you need a command!* 📚
