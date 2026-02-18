# NA-NI TICKETS - Quick Start Guide

Get NA-NI TICKETS running in 10 minutes!

## ⚡ Prerequisites

Ensure you have installed:
- Node.js (v14+)
- MongoDB (local or Atlas)
- Git
- A code editor (VS Code recommended)

## 🚀 Setup in 5 Easy Steps

### Step 1: Navigate to Project Directory
```bash
cd na-ni-tickets
```

### Step 2: Start MongoDB

**Option A: Local MongoDB**
```bash
# In a new terminal
mongod
```

**Option B: Use MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Skip to Step 3

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Update .env file with:
# - MONGODB_URI
# - JWT_SECRET (any random string)
# - Email credentials (Gmail SMTP)
# - Stripe keys (optional for testing)

# Or use defaults for quick testing
# Just ensure MongoDB is running

# Start backend
npm run dev

# Backend running on http://localhost:5000
```

Keep this terminal open!

### Step 4: Setup Frontend

Open **NEW terminal**:
```bash
cd frontend

# Install dependencies
npm install

# Update .env if needed (API URL should work as-is)
# REACT_APP_API_URL=http://localhost:5000/api

# Start frontend
npm start

# Frontend opens on http://localhost:3000
```

### Step 5: Access Application

Open browser and go to:
```
http://localhost:3000
```

✅ Done! Your application is running!

## 📋 Testing the Application

### Create a Test Account

1. Click **Sign Up**
2. Fill in details:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: 9876543210
   - Password: Test@123

3. Enter OTP: 
   - Check console (since email might not work without SMTP setup)
  - The OTP will be sent to your email (check logs if delivery fails)

4. ✅ Account created!

### Browse Bookings

1. Click **Movies** or **Concerts**
2. View available items (sample data might be empty initially)
3. Explore the interface

## 🔧 Common Issues & Solutions

### "MongoDB connection failed"
```
❌ Problem: MongoDB not running
✅ Solution: 
  - Local: Run `mongod` in terminal
  - Atlas: Check connection string in .env
```

### "Cannot GET /api/items/movies"
```
❌ Problem: Backend not running
✅ Solution: Start backend with `npm run dev` in backend folder
```

### "API_URL not working"
```
❌ Problem: Wrong API URL
✅ Solution: Check frontend/.env has correct REACT_APP_API_URL
```

### "Email not sending"
```
❌ Problem: SMTP credentials incorrect
✅ Solution: 
  - Use Gmail app password (not account password)
  - Enable 2FA on Google account first
  - The OTP will be sent to your email (check terminal/logs if delivery fails)
```

## 📱 Features to Test

- ✅ Signup/Login (no email needed for testing)
- ✅ Browse Movies/Concerts
- ✅ View Home page
- ✅ Responsive design (resize browser)
- ✅ Navbar navigation
- ✅ Logout functionality

## 📊 Add Sample Data

### Add Sample Movies

```bash
# Terminal in any directory
curl -X POST http://localhost:5000/api/items/movies/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Movie",
    "genre": ["Action", "Drama"],
    "language": "English",
    "rating": 8.5,
    "duration": 120,
    "posterUrl": "https://via.placeholder.com/250x350",
    "shows": [{
      "time": "09:00 AM",
      "theater": "PVR Cinema",
      "price": 250,
      "totalSeats": 120
    }]
  }'
```

Or use **Postman** app for easier testing!

## 🎯 Next Steps

### To Continue Development:

1. **Implement Booking UI** - Create seat selection interface
2. **Add Payment Flow** - Integrate Stripe payment modal
3. **Email Service** - Configure Gmail/Nodemailer
4. **Sample Data** - Populate database with more items
5. **UI Enhancements** - Improve styling and animations

### To Deploy:

1. **Backend:**
   - Use cloud service (Heroku, Railway, Render)
   - Setup environment variables
   - Deploy mongoDB Atlas database

2. **Frontend:**
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or GitHub Pages

## 📚 Documentation

- **Main README**: See main README.md for detailed architecture
- **Backend README**: See backend/README.md
- **Frontend README**: See frontend/README.md
- **API Docs**: Use Postman to explore endpoints

## 🆘 Need Help?

### Check Logs
```bash
# Backend logs show in terminal where npm run dev is running
# Frontend logs in browser console (F12)
```

### Verify Connections
```bash
# Check if MongoDB is running
mongosh  # or mongo

# Check if backend is responding
curl http://localhost:5000/api/health

# Check browser console for frontend errors
```

### GitHub/Issues
Document any issues and check existing solutions

## 🎓 Learning Path

1. Understand the project structure
2. Test authentication flow
3. Explore booking endpoints
4. Study booking implementation
5. Implement payment processing
6. Deploy to production

## 📝 Important Files to Review

- `backend/server.js` - Backend entry point
- `frontend/src/App.js` - Frontend routing
- `backend/models/` - Database schemas
- `frontend/src/services/api.js` - API integration
- `backend/.env` - Environment configuration

## ✅ Verification Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can signup/login
- [ ] Can view home page
- [ ] Can navigate to movie page
- [ ] Responsive menu works

Once all checked, you're ready to build! 🚀

---

**Need the app running without email setup?**

For quick testing without email:
- Skip email setup initially
- Use the OTP sent to your email (or check terminal/logs for generated OTP)
- Implement email later

**Ready to make this production-ready?**

Follow the main README.md for detailed setup with all services!

**Happy Coding! 🎉**
