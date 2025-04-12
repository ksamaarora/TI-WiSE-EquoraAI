import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatRoom from '@/components/chat/ChatRoom';
import { useChatRooms, ChatRoom as ChatRoomType } from '@/services/chatRoomService';
import { useDiscussions } from '@/services/discussionService';
import { clearChatData } from '@/services/socketService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useDiscussions();
  const { getRoomById, createRoom, addExistingRoom } = useChatRooms();
  
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | undefined>(
    roomId ? getRoomById(roomId) : undefined
  );
  
  // Create a placeholder room if roomId is provided but not found
  // This handles the case when someone opens a direct link in a new session
  useEffect(() => {
    if (roomId && !selectedRoom) {
      // Create a placeholder room with the given ID
      const room: ChatRoomType = {
        id: roomId,
        name: `Chat Room ${roomId.substring(0, 8)}`,
        createdAt: new Date(),
        createdById: 'system',
        isActive: true
      };
      
      // Add it to the chatRoomService so it will be available
      // This is a workaround for our in-memory implementation
      const addedRoom = addExistingRoom(room);
      
      // Set as the selected room
      setSelectedRoom(addedRoom);
    }
  }, [roomId, selectedRoom, addExistingRoom]);
  
  // Update the selected room when the URL parameter changes
  useEffect(() => {
    if (roomId) {
      const room = getRoomById(roomId);
      setSelectedRoom(room);
    } else {
      setSelectedRoom(undefined);
    }
  }, [roomId, getRoomById]);
  
  // Handle selecting a room
  const handleSelectRoom = (room: ChatRoomType) => {
    setSelectedRoom(room);
    navigate(`/chat/${room.id}`);
  };
  
  // Handle back button
  const handleBack = () => {
    setSelectedRoom(undefined);
    navigate('/chat');
  };
  
  // Convert currentUser to the format expected by ChatRoom
  const userForChat = {
    id: currentUser.id,
    name: currentUser.name,
    avatar: currentUser.avatar
  };
  
  // Handle clearing all chat data (for testing)
  const handleClearData = () => {
    if (window.confirm('This will clear all chat data for testing purposes. Are you sure?')) {
      clearChatData();
      window.location.reload(); // Reload the page to reflect changes
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        {selectedRoom ? (
          <ChatRoom 
            room={selectedRoom}
            user={userForChat}
            onBack={handleBack}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Chat Rooms</h1>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearData}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash className="h-4 w-4 mr-2" />
                Reset Chat Data
              </Button>
            </div>
            <ChatRoomList 
              userId={currentUser.id}
              onSelectRoom={handleSelectRoom}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatPage; 