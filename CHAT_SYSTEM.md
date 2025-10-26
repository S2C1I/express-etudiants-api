# Chat System Documentation

## Overview

This chat system allows Users and Etudiants to send messages to each other with real-time socket.io notifications.

## API Endpoints

### 1. Get All Conversations

**GET** `/messages/conversations`

- **Auth**: Required (JWT token)
- **Description**: Get list of all users you've chatted with
- **Response**:

```json
[
  {
    "user": {
      "_id": "123",
      "prenom": "John",
      "nom": "Doe",
      "email": "john@example.com"
    },
    "lastMessage": {
      "content": "Hello!",
      "timestamp": "2025-10-24T10:30:00Z",
      "from": "them"
    },
    "unreadCount": 2
  }
]
```

### 2. Get Conversation with Specific User

**GET** `/messages/:userId?userModel=User`

- **Auth**: Required (JWT token)
- **Params**:
  - `userId`: MongoDB ObjectId of the other person
- **Query**:
  - `userModel`: Either "User" or "Etudiant"
- **Description**: Get all messages between you and this user
- **Response**:

```json
[
  {
    "_id": "msg1",
    "sender": {
      "_id": "123",
      "prenom": "John",
      "nom": "Doe",
      "email": "john@example.com"
    },
    "recipient": {
      "_id": "456",
      "prenom": "Jane",
      "nom": "Smith",
      "email": "jane@example.com"
    },
    "content": "Hello!",
    "read": false,
    "createdAt": "2025-10-24T10:30:00Z"
  }
]
```

### 3. Send Message

**POST** `/messages`

- **Auth**: Required (JWT token)
- **Body**:

```json
{
  "recipientId": "456",
  "recipientModel": "User",
  "content": "Hello there!"
}
```

- **Description**: Send a message to another user
- **Response**: The created message object
- **Socket Event**: Emits `newMessage` to all connected clients

### 4. Mark Message as Read

**PATCH** `/messages/:messageId/read`

- **Auth**: Required (JWT token)
- **Params**: `messageId` - MongoDB ObjectId of the message
- **Description**: Mark a specific message as read
- **Response**: Updated message object

## Socket.io Events

### Event: `newMessage`

Emitted when a new message is sent.

**Payload**:

```javascript
{
  _id: "msg123",
  sender: {
    _id: "user1",
    prenom: "John",
    nom: "Doe",
    email: "john@example.com"
  },
  recipient: {
    _id: "user2",
    prenom: "Jane",
    nom: "Smith",
    email: "jane@example.com"
  },
  content: "Hello!",
  timestamp: "2025-10-24T10:30:00Z",
  read: false
}
```

## Frontend Integration (Angular Example)

### 1. Setup Socket Connection

```typescript
import { io, Socket } from 'socket.io-client';

private socket: Socket;

ngOnInit() {
  this.socket = io('http://192.168.31.106:3000', {
    transports: ['websocket'],
    auth: {
      token: localStorage.getItem('token')
    }
  });

  // Listen for new messages
  this.socket.on('newMessage', (message) => {
    console.log('New message received:', message);
    // Add to your messages array or show notification
  });
}

ngOnDestroy() {
  this.socket.disconnect();
}
```

### 2. Send Message

```typescript
sendMessage(recipientId: string, recipientModel: 'User' | 'Etudiant', content: string) {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.post('http://192.168.31.106:3000/messages', {
    recipientId,
    recipientModel,
    content
  }, { headers });
}
```

### 3. Get Conversations List

```typescript
getConversations() {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get('http://192.168.31.106:3000/messages/conversations', { headers });
}
```

### 4. Get Conversation with User

```typescript
getConversation(userId: string, userModel: 'User' | 'Etudiant') {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get(
    `http://192.168.31.106:3000/messages/${userId}?userModel=${userModel}`,
    { headers }
  );
}
```

## Important Notes

1. **JWT Token**: Now includes `userModel` field ("User" or "Etudiant") to identify the logged-in user type
2. **Authentication**: All message endpoints require JWT token in Authorization header
3. **Real-time Updates**: Use socket.io to listen for `newMessage` events
4. **User Models**: The system supports both User and Etudiant as senders/recipients
5. **Unread Count**: Automatically tracks unread messages per conversation

## Testing

### Test Sending a Message (using curl or Postman):

```bash
curl -X POST http://192.168.31.106:3000/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "67123abc456def789",
    "recipientModel": "User",
    "content": "Test message"
  }'
```

### Test Getting Conversations:

```bash
curl http://192.168.31.106:3000/messages/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
