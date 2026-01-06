# 📦 Inventory Management App

A full-stack inventory management application built with React, TypeScript, and Express.

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Running the Application

```bash
# Build and start all services (frontend, backend, MongoDB)
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

**Access the Application:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server && npm install && cd ..
   ```

4. Configure environment variables:

   **Backend (.env)** - Create or edit `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/inventory
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

### Running Locally

**Option 1: Run Both Servers (Recommended)**

Start both frontend and backend in development mode:
```bash
npm run dev
```
This runs the frontend on `http://localhost:5173` and backend on `http://localhost:5000`

**Option 2: Run Servers Separately**

Terminal 1 - Backend:
```bash
cd server && npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Database Setup

1. Ensure MongoDB is running locally or use MongoDB Atlas
2. For local MongoDB:
   ```bash
   # If MongoDB is installed locally
   mongod --dbpath /path/to/data/directory
   ```
3. Or use Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. (Optional) Seed the database with test data:
   ```bash
   cd server && npm run seed
   ```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### Available Scripts

**Docker:**
- `docker compose up --build -d` - Build and start all services
- `docker compose down` - Stop all services
- `docker compose logs -f` - View live logs

**Frontend (root directory):**
- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

**Backend (server/ directory):**
- `cd server && npm run dev` - Start backend development server
- `cd server && npm run build` - Build backend
- `cd server && npm run start` - Start backend for production
- `cd server && npm run seed` - Seed database with test data
- `cd server && npm run test` - Run backend tests

## 📋 Project Structure

```
inventory-management-app/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Basic UI components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── pages/                # Page components
│   ├── hooks/                # Custom React hooks
│   ├── store/                # State management (Zustand)
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   ├── styles/               # Styling and theme
│   └── data/                 # Mock data
├── server/                   # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utility functions
│   │   ├── config/           # Configuration
│   │   └── __tests__/        # Backend tests
│   ├── .env                  # Environment variables
│   └── package.json
└── package.json              # Frontend dependencies
```

## 🎨 Design System

This application uses Material Design principles with Material-UI components:

- **Primary Color:** #1976D2 (Blue)
- **Secondary Color:** #DC004E (Pink)
- **Success Color:** #2E7D32 (Green)
- **Warning Color:** #ED6C02 (Orange)
- **Error Color:** #D32F2F (Red)

## 🧪 Testing

**Frontend Tests:**
```bash
npm run test              # Run tests
npm run test:run          # Run tests without UI
npm run test:coverage     # Run tests with coverage
```

**Backend Tests:**
```bash
cd server && npm run test
cd server && npm run test:run
```

## 📱 Features

- **Dashboard:** Overview with KPIs and charts
- **Product Management:** CRUD operations for products
- **Stock Management:** Track stock levels and transactions
- **Reports:** Generate inventory reports
- **Settings:** Application configuration
- **Authentication:** Login/Register with JWT

## 🔧 Technology Stack

**Frontend:**
- React 18 + TypeScript
- Material-UI v5
- React Router v6
- Zustand (State Management)
- Vite (Build Tool)
- Chart.js

**Backend:**
- Express.js + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Helmet + CORS (Security)

## 📈 Current Status

**Phase 1:** ✅ Foundation & Setup - **Completed**

**Next Phase:** Phase 2 - Core Components & Design System

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

*Last Updated: January 6, 2026*
