# How to Run NA-NI TICKETS

To run this project, you need to start both the backend server and the frontend React application in separate terminals.

## Prerequisites
- Node.js installed
- MongoDB installed and running locally (or configured in backend/.env)

## 1. Start the Backend Server

Open your first terminal and run the following commands:

```bash
cd na-ni-tickets/backend
npm install
npm run dev
```
*This will start the Node.js server with nodemon (usually on port 5000).*

## 2. Start the Frontend Application

Open a second terminal window and run:

```bash
cd na-ni-tickets/frontend
npm install
npm start
```
*This will start the React UI and automatically open it in your browser (usually on port 3000).*
