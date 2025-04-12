// Simple UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Define ChatRoom interface
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdById: string;
  isActive: boolean;
}

// Mock storage for chat rooms
let chatRooms: Record<string, ChatRoom> = {};

// Functions to manage chat rooms
export const chatRoomService = {
  /**
   * Creates a new chat room
   * 
   * @param creatorId - ID of the user creating the room
   * @param name - Name of the chat room
   * @param description - Optional description of the chat room
   * @returns The created chat room
   */
  createRoom(creatorId: string, name: string, description?: string): ChatRoom {
    // Generate a unique ID for the room
    const roomId = generateUUID();
    
    // Create the room object
    const room: ChatRoom = {
      id: roomId,
      name,
      description,
      createdAt: new Date(),
      createdById: creatorId,
      isActive: true,
    };
    
    // Store the room
    chatRooms[roomId] = room;
    
    return room;
  },
  
  /**
   * Adds an existing room with a predefined ID
   * Useful for when a user navigates directly to a chat room URL
   * 
   * @param room - The room object to add
   * @returns The added room
   */
  addExistingRoom(room: ChatRoom): ChatRoom {
    // Only add if it doesn't already exist
    if (!chatRooms[room.id]) {
      chatRooms[room.id] = room;
    }
    return chatRooms[room.id];
  },
  
  /**
   * Gets a chat room by ID
   * 
   * @param roomId - ID of the room to get
   * @returns The chat room if found, undefined otherwise
   */
  getRoomById(roomId: string): ChatRoom | undefined {
    return chatRooms[roomId];
  },
  
  /**
   * Gets all active chat rooms
   * 
   * @returns Array of active chat rooms
   */
  getAllRooms(): ChatRoom[] {
    return Object.values(chatRooms).filter(room => room.isActive);
  },
  
  /**
   * Deactivates a chat room
   * 
   * @param roomId - ID of the room to deactivate
   * @returns true if successful, false otherwise
   */
  deactivateRoom(roomId: string): boolean {
    const room = chatRooms[roomId];
    if (room) {
      room.isActive = false;
      return true;
    }
    return false;
  },
  
  /**
   * Generates a shareable URL for the chat room
   * 
   * @param roomId - ID of the room to generate a URL for
   * @returns The shareable URL
   */
  getShareableUrl(roomId: string): string {
    return `${window.location.origin}/chat/${roomId}`;
  },
  
  /**
   * Opens the user's email client with a pre-composed message containing the room link
   * 
   * @param roomId - ID of the room to share
   * @param roomName - Name of the room
   * @param emailSubject - Subject of the email
   * @param emailBody - Body of the email
   */
  shareRoomViaEmail(
    roomId: string,
    roomName: string,
    emailSubject = 'Join my chat room on EquoraAI Dashboard',
    emailBody?: string
  ): void {
    const url = this.getShareableUrl(roomId);
    const body = emailBody || 
      `Hi there,\n\nI'd like to invite you to join my chat room "${roomName}" on EquoraAI Dashboard.\n\nJust click this link to join: ${url}\n\nBest regards,`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  },
  
  /**
   * Resets all chat rooms (useful for testing)
   */
  resetRooms(): void {
    chatRooms = {};
  }
};

// React hook for using chat rooms
export const useChatRooms = () => {
  const createRoom = (creatorId: string, name: string, description?: string): ChatRoom => {
    return chatRoomService.createRoom(creatorId, name, description);
  };
  
  const addExistingRoom = (room: ChatRoom): ChatRoom => {
    return chatRoomService.addExistingRoom(room);
  };
  
  const getRoomById = (roomId: string): ChatRoom | undefined => {
    return chatRoomService.getRoomById(roomId);
  };
  
  const getAllRooms = (): ChatRoom[] => {
    return chatRoomService.getAllRooms();
  };
  
  const getShareableUrl = (roomId: string): string => {
    return chatRoomService.getShareableUrl(roomId);
  };
  
  const shareRoomViaEmail = (
    roomId: string,
    roomName: string,
    emailSubject?: string,
    emailBody?: string
  ): void => {
    chatRoomService.shareRoomViaEmail(roomId, roomName, emailSubject, emailBody);
  };
  
  return {
    createRoom,
    addExistingRoom,
    getRoomById,
    getAllRooms,
    getShareableUrl,
    shareRoomViaEmail
  };
}; 