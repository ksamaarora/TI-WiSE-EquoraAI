import { useState, useEffect, useCallback } from 'react';
import { createMockSocket, mockSocketServer } from './mockSocketServer';

// Define Socket interface for our mock implementation
interface Socket {
  on: (event: string, callback: (message: any) => void) => void;
  off: (event: string, callback: (message: any) => void) => void;
  emit: (event: string, message: any) => void;
  disconnect: () => void;
  connected: boolean;
}

// Define message interface for chat
export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  username: string;
  roomId: string;
  timestamp: Date;
  avatar?: string;
}

// Interface for the socket event handlers
interface SocketEvents {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onJoinRoom?: (room: string) => void;
  onLeaveRoom?: (room: string) => void;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: any) => void;
}

// User interface
interface User {
  id: string;
  name: string;
  avatar?: string;
}

// Socket service
export const useSocketService = (events?: SocketEvents) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Create a new socket connection using our mock implementation
    const socketInstance = createMockSocket();
    setIsConnected(socketInstance.connected);

    // Set up socket event listeners
    if (socketInstance.connected) {
      setIsConnected(true);
      events?.onConnect?.();
    }

    socketInstance.on('room:joined', (room: string) => {
      setCurrentRoom(room);
      events?.onJoinRoom?.(room);
    });

    socketInstance.on('room:left', (room: string) => {
      setCurrentRoom(null);
      events?.onLeaveRoom?.(room);
    });

    socketInstance.on('chat:message', (message: ChatMessage) => {
      if (message && message.roomId) {
        // Process the message only if it's for the current room
        events?.onMessage?.(message);
      }
    });

    setSocket(socketInstance);

    // Clean up connection when component unmounts
    return () => {
      if (currentUser && currentRoom) {
        socketInstance.emit('room:leave', { roomId: currentRoom, userId: currentUser.id });
      }
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
      setCurrentRoom(null);
    };
  }, []);

  // Join a specific chat room
  const joinRoom = useCallback((roomId: string, user: User) => {
    if (socket && isConnected) {
      // Leave current room if already in one
      if (currentRoom && currentUser) {
        socket.emit('room:leave', { roomId: currentRoom, userId: currentUser.id });
      }
      
      // Set current user
      setCurrentUser(user);
      
      // Join the new room
      socket.emit('room:join', { roomId, user });
      
      console.log(`Joining room: ${roomId} as user: ${user.name}`);
      return true;
    }
    return false;
  }, [socket, isConnected, currentRoom, currentUser]);

  // Leave current chat room
  const leaveRoom = useCallback(() => {
    if (socket && isConnected && currentRoom && currentUser) {
      socket.emit('room:leave', { roomId: currentRoom, userId: currentUser.id });
      setCurrentRoom(null);
      return true;
    }
    return false;
  }, [socket, isConnected, currentRoom, currentUser]);

  // Send a message to the current room
  const sendMessage = useCallback((content: string, user: User) => {
    if (socket && isConnected && currentRoom) {
      // Update current user if not already set
      if (!currentUser) {
        setCurrentUser(user);
      }
      
      const messageData = {
        content,
        userId: user.id,
        username: user.name,
        avatar: user.avatar,
        roomId: currentRoom,
        timestamp: new Date()
      };
      
      socket.emit('chat:message', messageData);
      return true;
    }
    return false;
  }, [socket, isConnected, currentRoom, currentUser]);

  return {
    socket,
    isConnected,
    currentRoom,
    joinRoom,
    leaveRoom,
    sendMessage
  };
};

// Function to clear all chat data (for testing purposes)
export const clearChatData = () => {
  mockSocketServer.clearAllData();
  console.log('All chat data cleared');
}; 