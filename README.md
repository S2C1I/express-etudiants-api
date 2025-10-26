# Express Student Management API

A full-featured REST API with real-time features built with Express, MongoDB, Socket.IO, and JWT authentication.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access (user/admin)
- **Student Management**: CRUD operations for students (Étudiants)
- **User Management**: User registration, login, and profile management
- **Real-time Chat**: WebSocket-based messaging system with read status
- **Online Presence**: Track and broadcast online users via Socket.IO
- **Real-time Notifications**: Live updates for student changes
- **MongoDB Atlas**: Cloud database integration
- **CORS**: Configurable for multi-origin frontend support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: MongoDB (Atlas or local)
- **Real-time**: Socket.IO 4
- **Auth**: JWT + bcrypt
- **Validation**: Mongoose 8

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/s2c1i/express-etudiants-api.git
cd express-etudiants-api
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:4200
JWT_SECRET=your_super_secret_key
MONGODB_URI=mongodb+srv://user:pass@cluster/database?retryWrites=true&w=majority
```

### 3. Run Locally

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /users/register` - Register new user
- `POST /users/login` - Login (returns JWT)

### Students (Protected)

- `GET /etudiants` - List all students
- `GET /etudiants/:id` - Get student by ID
- `POST /etudiants` - Create student (admin only)
- `PUT /etudiants/:id` - Update student (admin only)
- `DELETE /etudiants/:id` - Delete student (admin only)

### Messages (Protected)

- `GET /messages/conversations` - List all conversations
- `GET /messages/:userId` - Get conversation with user
- `POST /messages` - Send message
- `PATCH /messages/:messageId/read` - Mark as read

### Users (Protected)

- `GET /users` - List all users (admin only)
- `GET /users/:id` - Get user by ID

## Socket.IO Events

### Client → Server

- `userOnline` - User comes online (send userId)
- `typing` - User is typing
- `chat-message` - Send chat message

### Server → Client

- `userOnline` - User came online
- `userOffline` - User went offline
- `onlineUsers` - List of all online user IDs
- `notification` - Student CRUD notification
- `newMessage` - New chat message received

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:

- Render (recommended)
- Railway
- Fly.io
- Koyeb

## Project Structure

```
.
├── Controllers/         # Request handlers
│   ├── controller.js           # Student CRUD
│   ├── controllerUser.js       # User auth & management
│   └── controllerMessage.js    # Chat logic
├── Middleware/          # Express middleware
│   ├── tokenVerification.js    # JWT guard
│   ├── roleVerification.js     # Role-based access
│   └── errorHandler.js          # Global error handler
├── Model/               # Mongoose schemas
│   ├── DBConnect.js             # MongoDB connection
│   ├── Etudiant.js              # Student model
│   ├── User.js                  # User model
│   └── Message.js               # Message model
├── Routes/              # Express routers
│   ├── router.js                # Student routes
│   ├── routerUser.js            # User routes
│   └── routerMessage.js         # Message routes
├── Test/                # Jest tests
├── index.js             # App setup, CORS, Socket.IO
├── server.js            # Entry point
└── package.json

```

## Testing

```bash
npm test
```

Tests use an in-memory MongoDB instance (mongodb-memory-server).

## Environment Variables

| Variable          | Description               | Example                        |
| ----------------- | ------------------------- | ------------------------------ |
| `PORT`            | Server port               | `3000`                         |
| `MONGODB_URI`     | MongoDB connection string | `mongodb+srv://...`            |
| `JWT_SECRET`      | Secret for signing tokens | `super_secret_key`             |
| `FRONTEND_ORIGIN` | CORS allowed origins      | `http://localhost:4200` or `*` |

## License

ISC

## Author

Amine Touhami
