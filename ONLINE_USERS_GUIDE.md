# Online Users Tracking - Frontend Integration Guide

## Backend Changes

The backend now tracks online users and emits the following socket.io events:

- `userOnline` - When a user comes online
- `userOffline` - When a user goes offline
- `onlineUsers` - List of all currently online user IDs

## Angular Frontend Integration

### 1. Socket Service Setup

```typescript
// chat.service.ts or socket.service.ts
import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private socket: Socket;
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  public onlineUsers$: Observable<string[]> =
    this.onlineUsersSubject.asObservable();

  constructor() {
    this.socket = io("http://192.168.31.106:3000", {
      transports: ["websocket"],
      autoConnect: false,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Listen for the initial list of online users
    this.socket.on("onlineUsers", (userIds: string[]) => {
      console.log("Online users:", userIds);
      this.onlineUsersSubject.next(userIds);
    });

    // Listen for when a user comes online
    this.socket.on("userOnline", (userId: string) => {
      console.log("User came online:", userId);
      const currentUsers = this.onlineUsersSubject.value;
      if (!currentUsers.includes(userId)) {
        this.onlineUsersSubject.next([...currentUsers, userId]);
      }
    });

    // Listen for when a user goes offline
    this.socket.on("userOffline", (userId: string) => {
      console.log("User went offline:", userId);
      const currentUsers = this.onlineUsersSubject.value.filter(
        (id) => id !== userId
      );
      this.onlineUsersSubject.next(currentUsers);
    });
  }

  // Connect and identify user
  connectUser(userId: string) {
    this.socket.connect();
    this.socket.emit("userOnline", userId);
  }

  // Disconnect user
  disconnectUser() {
    this.socket.disconnect();
  }

  // Check if a specific user is online
  isUserOnline(userId: string): boolean {
    return this.onlineUsersSubject.value.includes(userId);
  }
}
```

### 2. Component Usage

```typescript
// chat-list.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ChatService } from "./chat.service";

@Component({
  selector: "app-chat-list",
  template: `
    <div class="chat-list">
      <h3>Conversations</h3>
      <div *ngFor="let conversation of conversations" class="conversation-item">
        <div class="user-info">
          <!-- Online indicator -->
          <span
            class="online-indicator"
            [class.online]="isUserOnline(conversation.user._id)"
            [class.offline]="!isUserOnline(conversation.user._id)"
          >
          </span>

          <span
            >{{ conversation.user.prenom }} {{ conversation.user.nom }}</span
          >

          <!-- Show "Online" text -->
          <span *ngIf="isUserOnline(conversation.user._id)" class="status-text">
            Online
          </span>
        </div>
        <div class="last-message">
          {{ conversation.lastMessage.content }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .online-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
      }
      .online-indicator.online {
        background-color: #4caf50;
      }
      .online-indicator.offline {
        background-color: #9e9e9e;
      }
      .status-text {
        margin-left: 8px;
        color: #4caf50;
        font-size: 12px;
      }
    `,
  ],
})
export class ChatListComponent implements OnInit, OnDestroy {
  conversations: any[] = [];
  onlineUsers: string[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Get logged-in user ID (from JWT token or localStorage)
    const userId = this.getLoggedInUserId();

    // Connect to socket and identify user
    this.chatService.connectUser(userId);

    // Subscribe to online users
    this.chatService.onlineUsers$.subscribe((userIds) => {
      this.onlineUsers = userIds;
      console.log("Online users updated:", userIds);
    });

    // Load conversations
    this.loadConversations();
  }

  ngOnDestroy() {
    this.chatService.disconnectUser();
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.includes(userId);
  }

  getLoggedInUserId(): string {
    // Decode JWT token to get user ID
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    }
    return "";
  }

  loadConversations() {
    // Your existing code to load conversations
  }
}
```

### 3. App Component (Global Connection)

If you want to maintain socket connection throughout the app:

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ChatService } from "./services/chat.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Connect user when app starts (after login)
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      this.chatService.connectUser(payload.id);
    }
  }

  ngOnDestroy() {
    this.chatService.disconnectUser();
  }
}
```

### 4. Login Component Integration

Connect user after successful login:

```typescript
// login.component.ts
login(email: string, password: string) {
  this.authService.login(email, password).subscribe({
    next: (response) => {
      localStorage.setItem('token', response.token);

      // Decode token to get user ID
      const payload = JSON.parse(atob(response.token.split('.')[1]));

      // Connect to socket
      this.chatService.connectUser(payload.id);

      this.router.navigate(['/dashboard']);
    },
    error: (err) => console.error('Login failed', err)
  });
}
```

### 5. Logout - Disconnect Socket

```typescript
// logout method
logout() {
  this.chatService.disconnectUser();
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}
```

## Socket.io Events Summary

### Events Backend Listens To:

- `userOnline` - Client sends with userId to identify themselves

### Events Backend Emits:

- `onlineUsers` - Array of all online user IDs (sent immediately on connection)
- `userOnline` - Broadcast when a user comes online (sends userId)
- `userOffline` - Broadcast when a user goes offline (sends userId)

## Example Flow:

1. **User logs in** → Frontend gets JWT token with user ID
2. **Frontend connects socket** → `socket.connect()`
3. **Frontend emits userOnline** → `socket.emit('userOnline', userId)`
4. **Backend adds to onlineUsers map** → Broadcasts `userOnline` to all clients
5. **Backend sends onlineUsers list** → New client receives all online user IDs
6. **User navigates away or closes tab** → Socket disconnects
7. **Backend detects disconnect** → Removes from map, broadcasts `userOffline`

## Testing

In browser console:

```javascript
// Check online users
socket.emit("userOnline", "YOUR_USER_ID");

// Listen for events
socket.on("onlineUsers", (users) => console.log("Online:", users));
socket.on("userOnline", (userId) => console.log("User online:", userId));
socket.on("userOffline", (userId) => console.log("User offline:", userId));
```

## Notes

- User IDs are MongoDB ObjectIds (strings)
- The map is in-memory, so it resets when server restarts
- For production, consider using Redis to persist online users across server instances
