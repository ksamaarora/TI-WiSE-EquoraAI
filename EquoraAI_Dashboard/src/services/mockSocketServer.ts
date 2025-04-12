import { ChatMessage } from './socketService';

// Simple UUID generator function since we're having issues with the uuid package
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create a BroadcastChannel for cross-window communication
let broadcastChannel: any; // Use any type to avoid TypeScript errors
try {
  broadcastChannel = new BroadcastChannel('equora-chat');
} catch (error) {
  console.error('BroadcastChannel not supported in this browser', error);
  // Create a fallback mechanism if BroadcastChannel is not supported
  broadcastChannel = {
    postMessage: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    close: () => {}
  };
}

// A mock implementation of a socket server that runs in the browser
// In a real application, this would be a separate Node.js server

interface MockRoom {
  roomId: string;
  participants: Map<string, { id: string; name: string; avatar?: string }>;
  messages: ChatMessage[];
}

class MockSocketServer {
  private rooms: Map<string, MockRoom> = new Map();
  private listeners: Map<string, Set<(message: any) => void>> = new Map();
  private instanceId: string;
  
  constructor() {
    this.instanceId = generateUUID(); // Unique ID for this browser instance
    console.log('Mock socket server initialized with ID', this.instanceId);
    
    // Initialize rooms from localStorage if available
    this.initFromStorage();
    
    // Set up listener for broadcast messages from other tabs/windows
    broadcastChannel.addEventListener('message', (event) => {
      this.handleBroadcastMessage(event.data);
    });
    
    // Save rooms to localStorage when the window is closed
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }
  
  // Initialize from localStorage if available
  private initFromStorage(): void {
    try {
      const storedRooms = localStorage.getItem('equora-chat-rooms');
      if (storedRooms) {
        const roomsData = JSON.parse(storedRooms) as Record<string, any>;
        
        // Convert the plain objects back to Map instances
        for (const [roomId, roomData] of Object.entries(roomsData)) {
          const room: MockRoom = {
            roomId,
            participants: new Map(),
            messages: (roomData as any).messages || []
          };
          
          // Restore participants
          if ((roomData as any).participants) {
            for (const participant of (roomData as any).participants) {
              room.participants.set(participant.id, participant);
            }
          }
          
          this.rooms.set(roomId, room);
        }
        
        console.log('Loaded rooms from storage:', this.rooms.size);
      }
    } catch (error) {
      console.error('Error loading rooms from storage:', error);
    }
  }
  
  // Save rooms to localStorage
  private saveToStorage(): void {
    try {
      // Convert Map to serializable object
      const roomsData: Record<string, any> = {};
      
      this.rooms.forEach((room, roomId) => {
        roomsData[roomId] = {
          roomId,
          participants: Array.from(room.participants.values()),
          messages: room.messages
        };
      });
      
      localStorage.setItem('equora-chat-rooms', JSON.stringify(roomsData));
    } catch (error) {
      console.error('Error saving rooms to storage:', error);
    }
  }
  
  // Handle broadcast messages from other tabs/windows
  private handleBroadcastMessage(data: any): void {
    if (data.instanceId === this.instanceId) {
      // Ignore messages from our own instance
      return;
    }
    
    console.log('Received broadcast message:', data);
    
    // Handle different types of broadcast messages
    switch (data.type) {
      case 'chat:message':
        this.receiveExternalChatMessage(data.message);
        break;
        
      case 'room:join':
        this.receiveExternalJoinRoom(data.roomId, data.user);
        break;
        
      case 'room:leave':
        this.receiveExternalLeaveRoom(data.roomId, data.userId);
        break;
    }
  }
  
  // Add an event listener
  public on(event: string, callback: (message: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }
  
  // Remove an event listener
  public off(event: string, callback: (message: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }
  
  // Emit an event
  public emit(event: string, message: any): void {
    // In a real server, this would send to all connected clients
    // For our mock, we'll just simulate the server receiving the message
    // and then trigger the appropriate response
    
    switch (event) {
      case 'room:join':
        this.handleJoinRoom(message);
        break;
        
      case 'room:leave':
        this.handleLeaveRoom(message);
        break;
        
      case 'chat:message':
        this.handleChatMessage(message);
        break;
        
      default:
        console.log(`Unhandled event: ${event}`, message);
    }
  }
  
  // Disconnect the socket
  public disconnect(): void {
    // Clear all listeners
    this.listeners.clear();
    
    // Close the BroadcastChannel
    broadcastChannel.close();
  }
  
  // Trigger event callbacks
  private trigger(event: string, message: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        setTimeout(() => callback(message), 50); // Add a small delay to simulate network latency
      });
    }
  }
  
  // ---- External event handlers (from other browser windows) ----
  
  private receiveExternalChatMessage(message: ChatMessage): void {
    const { roomId } = message;
    const room = this.rooms.get(roomId);
    
    if (room) {
      // Check if this message already exists in the room (by content and userId)
      // to prevent duplicates
      const isDuplicate = room.messages.some(
        existingMsg => 
          existingMsg.id === message.id || 
          (existingMsg.content === message.content && 
           existingMsg.userId === message.userId &&
           Math.abs(new Date(existingMsg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 3000)
      );
      
      if (!isDuplicate) {
        // Add the message to the room
        room.messages.push(message);
        
        // Notify all clients in the room about the new message
        this.trigger('chat:message', message);
        
        // Update storage with the new message
        this.saveToStorage();
      }
    }
  }
  
  private receiveExternalJoinRoom(roomId: string, user: { id: string; name: string; avatar?: string }): void {
    // Ensure the room exists
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        participants: new Map(),
        messages: []
      });
    }
    
    // Add the participant to the room
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.set(user.id, user);
      
      // We don't trigger 'room:joined' here because this tab didn't join the room
      // but we could trigger a 'participant:joined' event if we want to show that to the user
    }
  }
  
  private receiveExternalLeaveRoom(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.delete(userId);
      
      // We could trigger a 'participant:left' event here if needed
    }
  }
  
  // ---- Local event handlers ----
  
  // Handler for joining a room
  private handleJoinRoom({ roomId, user }: { roomId: string; user: { id: string; name: string; avatar?: string } }): void {
    // Create the room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        participants: new Map(),
        messages: []
      });
    }
    
    // Add the participant to the room
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.set(user.id, user);
      
      // Notify the client that they have joined the room
      this.trigger('room:joined', roomId);
      
      // Send existing messages for this room to the new participant
      // We're not sending messages here anymore to avoid duplication
      // since they'll be loaded from localStorage by the ChatRoom component
      
      // Broadcast to other tabs/windows that a new user has joined
      broadcastChannel.postMessage({
        instanceId: this.instanceId,
        type: 'room:join',
        roomId,
        user
      });
      
      console.log(`User ${user.name} joined room ${roomId}`);
    }
  }
  
  // Handler for leaving a room
  private handleLeaveRoom({ roomId, userId }: { roomId: string; userId?: string }): void {
    const room = this.rooms.get(roomId);
    if (room) {
      // In a real implementation, we'd identify the user by their socket
      // Here we'll just use the userId if provided
      if (userId) {
        room.participants.delete(userId);
        
        // Broadcast to other tabs/windows
        broadcastChannel.postMessage({
          instanceId: this.instanceId,
          type: 'room:leave',
          roomId,
          userId
        });
      }
      
      this.trigger('room:left', roomId);
      console.log(`A user left room ${roomId}`);
    }
  }
  
  // Handler for chat messages
  private handleChatMessage(messageData: Omit<ChatMessage, 'id'>): void {
    const { roomId } = messageData;
    const room = this.rooms.get(roomId);
    
    if (room) {
      // Create a new message with a unique ID and timestamp
      const message: ChatMessage = {
        ...messageData,
        id: generateUUID(),
        timestamp: new Date()
      };
      
      // Add the message to the room
      room.messages.push(message);
      
      // Notify local clients about the new message
      this.trigger('chat:message', message);
      
      // Save to localStorage to persist messages
      this.saveToStorage();
      
      // Broadcast to other tabs/windows with a priority flag
      broadcastChannel.postMessage({
        instanceId: this.instanceId,
        type: 'chat:message',
        message,
        priority: true // Add priority flag for important messages
      });
      
      console.log(`New message in room ${roomId}: ${message.content}`);
    }
  }

  // Clear all stored data - useful for testing or resetting
  public clearAllData(): void {
    this.rooms.clear();
    try {
      localStorage.removeItem('equora-chat-rooms');
    } catch (error) {
      console.error('Error clearing chat data from storage:', error);
    }
  }
}

// Export a singleton instance
export const mockSocketServer = new MockSocketServer();

// Function to create a mock Socket.IO socket instance
export const createMockSocket = () => {
  return {
    on: (event: string, callback: (message: any) => void) => mockSocketServer.on(event, callback),
    off: (event: string, callback: (message: any) => void) => mockSocketServer.off(event, callback),
    emit: (event: string, message: any) => mockSocketServer.emit(event, message),
    disconnect: () => mockSocketServer.disconnect(),
    connected: true
  };
}; 