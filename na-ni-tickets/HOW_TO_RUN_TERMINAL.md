# How to Run the Project in Terminal

To run this full-stack application properly, you need to start both the backend server and the frontend React application in separate terminal windows.

## 1. Start the Backend Server
Open a new terminal window and run the following commands:

```bash
# Navigate to the backend directory
cd na-ni-tickets/backend

# Install dependencies (only needed once)
npm install

# Start the Node/Express backend server
npm start
```
*The backend should now run and listen to database connections (usually on port 5000).*

## 2. Start the Frontend Application
Open **another new terminal window** (keep the backend one running) and run:

```bash
# Navigate to the frontend directory
cd na-ni-tickets/frontend

# Install dependencies (only needed once)
npm install

# Start the React frontend
npm start
```
*The React app should now start at http://localhost:3000 and automatically open in your default browser.*