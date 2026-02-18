# NA-NI TICKETS - Installation & Verification Checklist

Complete this checklist to ensure your project is properly set up and working.

## ✅ Pre-Installation

- [ ] Node.js (v14+) installed - `node --version`
- [ ] npm installed - `npm --version`
- [ ] MongoDB installed or MongoDB Atlas account created
- [ ] Git installed
- [ ] VS Code or preferred code editor installed

## ✅ Backend Setup

- [ ] Navigated to `backend` folder: `cd na-ni-tickets/backend`
- [ ] Installed dependencies: `npm install` (completed successfully)
- [ ] `.env` file exists with configuration
- [ ] MONGODB_URI configured (local or Atlas)
- [ ] JWT_SECRET configured
- [ ] SMTP settings configured (optional)
- [ ] Backend starts without errors: `npm run dev`
- [ ] Server message shows: "MongoDB Connected" and "Server running on port 5000"
- [ ] Can access: `http://localhost:5000/api/health`
- [ ] Health endpoint returns: `{"success": true, "message": "Server is running"}`

## ✅ Frontend Setup

- [ ] Navigated to `frontend` folder: `cd na-ni-tickets/frontend`
- [ ] Installed dependencies: `npm install` (completed successfully)
- [ ] `.env` file exists with `REACT_APP_API_URL=http://localhost:5000/api`
- [ ] Frontend starts without errors: `npm start`
- [ ] Browser automatically opened to `http://localhost:3000`
- [ ] Navbar displays with "NA-NI TICKETS" logo
- [ ] Home page loads with category cards
- [ ] Navigation links work (Movies, Concerts, Buses, etc.)
- [ ] Sign Up / Login buttons visible in navbar

## ✅ Database Verification

- [ ] MongoDB service running
- [ ] Can connect to MongoDB:

  ```bash
  # Local: mongosh
  # Atlas: Check connection in compass
  ```

- [ ] Database `nani-tickets` created
- [ ] Collections appear in database

## ✅ Feature Testing

### Authentication

- [ ] Sign up page accessible at `/signup`
- [ ] Login page accessible at `/login`
- [ ] Forgot password page accessible at `/forgot-password`
- [ ] Form validation working (try invalid email)
- [ ] OTP verification page appears after signup
- [ ] Can create new user account

### Navigation

- [ ] Navbar appears on all pages
- [ ] Home link works and returns to home page
- [ ] All category links work (Movies, Concerts, Buses, Trains, Flights, Cars)
- [ ] User menu appears when logged in
- [ ] Logout button works

### Pages

- [ ] Home page displays with hero section
- [ ] Home page shows 6 category cards
- [ ] Movies page displays "Movie Tickets" header
- [ ] Concerts page displays "Concert Tickets" header
- [ ] Bus/Train/Flight/Cars pages show "Coming Soon" message
- [ ] All pages are responsive (test in mobile view)

### Styling

- [ ] Colors match brand (Orange #ff6b35, Navy #004e89)
- [ ] Buttons are styled correctly
- [ ] Cards have hover effects
- [ ] Layout is responsive on small screens
- [ ] No console errors visible

## ✅ API Testing

**Using Postman or curl:**

### Health Check

```
GET http://localhost:5000/api/health
✅ Response: 200 OK with success message
```

### Get Movies

```
GET http://localhost:5000/api/items/movies
✅ Response: 200 OK (may show empty array)
```

### Get Concerts

```
GET http://localhost:5000/api/items/concerts
✅ Response: 200 OK (may show empty array)
```

## ✅ Troubleshooting Completed

- [ ] No "MongoDB connection refused" error
- [ ] No "Port 5000 already in use" error
- [ ] No "Module not found" errors
- [ ] No CORS errors in console
- [ ] No "Cannot GET /api" errors
- [ ] Backend and frontend communicate successfully

## ✅ Environment Variables

### Backend .env

- [ ] MONGODB_URI set correctly
- [ ] JWT_SECRET is not default
- [ ] PORT=5000
- [ ] FRONTEND_URL=http://localhost:3000
- [ ] Email settings configured (optional)

### Frontend .env

- [ ] REACT_APP_API_URL=http://localhost:5000/api
- [ ] Stripe key set (optional)

## ✅ Code Quality

- [ ] No TypeScript errors (if using)
- [ ] No console errors in browser DevTools (F12)
- [ ] No "Unused" warnings
- [ ] API responses are properly formatted JSON
- [ ] All imports are resolved

## ✅ Documentation

- [ ] Main README.md reviewed
- [ ] backend/README.md reviewed
- [ ] frontend/README.md reviewed
- [ ] QUICK_START.md reviewed
- [ ] SETUP_COMPLETE.md reviewed
- [ ] API endpoints understood

## ✅ Optional Enhancements (Complete Later)

- [ ] Email service configured with Gmail SMTP
- [ ] Stripe keys added for payment testing
- [ ] Sample data added to database
- [ ] Booking pages implemented
- [ ] Payment flow implemented
- [ ] Notification emails tested

## ✅ Data Validation

### Backend Validation

- [ ] Email format validation works
- [ ] Phone number 10-digit validation works
- [ ] Password min 6 characters validation works
- [ ] Required field validation works
- [ ] Duplicate email prevention works (if tested)

### Frontend Validation

- [ ] Form shows validation errors
- [ ] Error messages are user-friendly
- [ ] Submit button disabled on invalid input
- [ ] Success messages show after valid input

## ✅ Performance

- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 500ms
- [ ] No memory leaks visible
- [ ] Network requests visible in DevTools
- [ ] Database queries completing successfully

## 🎯 Final Verification

Run this complete test sequence:

1. **Start Backend:**
   ```bash
   cd backend && npm run dev
   ```
   ✅ Should show: "NA-NI TICKETS SERVER" and "MongoDB Connected"

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend && npm start
   ```
   ✅ Should automatically open browser to localhost:3000

3. **Visit Pages:**
   - [ ] `http://localhost:3000/` - Home page
   - [ ] `http://localhost:3000/login` - Login page
   - [ ] `http://localhost:3000/signup` - Signup page
   - [ ] `http://localhost:3000/movies` - Movies page
   - [ ] `http://localhost:3000/concerts` - Concerts page

4. **Test Features:**
   - [ ] Try invalid signup → Should show error
   - [ ] Try valid signup → Should request OTP
   - [ ] Use the OTP sent to your email → Should complete signup
   - [ ] Try login → Should work
   - [ ] Can view all pages without errors

## ✅ Deployment Readiness

- [ ] Docker files present (Dockerfile, docker-compose.yml)
- [ ] .env files in .gitignore
- [ ] Sensitive keys not in code
- [ ] All dependencies in package.json
- [ ] Build process working: `npm run build`
- [ ] Environment-specific configs ready

## 📊 Summary

### Completion Status

- **Backend:** ✅ Complete
- **Frontend:** ✅ Complete
- **Database:** ✅ Ready
- **Documentation:** ✅ Complete
- **Features:** ✅ 70% Implemented*

*Remaining: Booking flow, Payments, Email (optional for initial testing)

### Files Created

- Backend: 10 models, 4 controllers, 4 routes, 3 utilities
- Frontend: 10+ pages, 3 stores, Navbar, ProtectedRoute
- Configuration: .env files, docker-compose, Dockerfiles
- Documentation: 5 README files, setup guides

### Ready For

- ✅ Development
- ✅ Testing
- ⬜ Production* (*after environment configuration)

## 🚀 Next Steps

1. **Immediate:**
   - [ ] Run both servers
   - [ ] Test signup/login
   - [ ] Verify all pages load

2. **Short Term (This Week):**
   - [ ] Add sample booking data
   - [ ] Implement booking UI
   - [ ] Test booking flow

3. **Medium Term (This Month):**
   - [ ] Complete payment integration
   - [ ] Set up email notifications
   - [ ] User testing

4. **Long Term (Before Launch):**
   - [ ] Deploy to staging
   - [ ] Security audit
   - [ ] Performance optimization
   - [ ] User acceptance testing

## 🎓 Learning Resources

Bookmark these for reference:
- Express.js: https://expressjs.com/
- React: https://react.dev/
- MongoDB: https://docs.mongodb.com/
- Postman: https://www.postman.com/
- Stripe Docs: https://stripe.com/docs

## 🆘 If Something's Wrong

### Check in this order:

1. Backend terminal for errors
2. Frontend console (F12 in browser)
3. Network tab in DevTools
4. `.env` file configuration
5. MongoDB connection status
6. Try restarting both servers

### Still stuck?

- Review error messages carefully
- Check spelling of .env variables
- Verify ports 5000 and 3000 are free
- Clear browser cache (Ctrl+Shift+Del)
- Restart npm servers

## ✅ FINAL CHECKLIST

All items checked below = Ready to develop! 🎉

- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Can navigate between pages
- [ ] No fatal errors in console
- [ ] Database is connected
- [ ] All documentation reviewed
- [ ] Ready to start development

---

**If you've checked all items above, you're ready to build! 🚀**

For deployment guidance, see the main README.md file.

---

**Congratulations!** 🎉  
Your NA-NI TICKETS platform is successfully installed!

Happy coding! 💻
