import React, { useState } from 'react';
import { useChatRooms, ChatRoom as ChatRoomType } from '@/services/chatRoomService';

// Import UI components
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import icons
import { PlusCircle, Users, Clock, ArrowRight, MessageCircle } from 'lucide-react';

interface ChatRoomCardProps {
  room: ChatRoomType;
  onClick: () => void;
}

// Component to display a single chat room card
const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ room, onClick }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(room.createdAt);
  
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <MessageCircle className="h-4 w-4 mr-2 text-primary" />
          {room.name}
        </CardTitle>
        {room.description && (
          <CardDescription className="text-xs">{room.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Created {formattedDate}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center border-t">
        <Badge variant="outline" className="px-2 py-0.5 text-xs">
          Real-time chat
        </Badge>
        <Button size="sm" variant="ghost" className="h-8">
          <span>Join</span>
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ChatRoomCreateFormProps {
  userId: string;
  onSubmit: (room: ChatRoomType) => void;
  onCancel: () => void;
}

// Create room form component
const ChatRoomCreateForm: React.FC<ChatRoomCreateFormProps> = ({ userId, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createRoom } = useChatRooms();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newRoom = createRoom(userId, name, description || undefined);
    onSubmit(newRoom);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room-name">Room Name</Label>
        <Input
          id="room-name"
          placeholder="Enter a name for your chat room"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="room-description">Description (Optional)</Label>
        <Textarea
          id="room-description"
          placeholder="Describe what this chat room is about..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Create Chat Room
        </Button>
      </DialogFooter>
    </form>
  );
};

interface ChatRoomListProps {
  userId: string;
  onSelectRoom: (room: ChatRoomType) => void;
}

// Main component to list all chat rooms
const ChatRoomList: React.FC<ChatRoomListProps> = ({ userId, onSelectRoom }) => {
  const { getAllRooms } = useChatRooms();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoomType[]>(getAllRooms());
  
  const handleCreateRoom = (room: ChatRoomType) => {
    setRooms(getAllRooms());
    setIsCreateDialogOpen(false);
    onSelectRoom(room); // Automatically select the newly created room
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Chat Rooms</h2>
          <p className="text-sm text-muted-foreground">
            Join or create real-time chat rooms to discuss with others
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Chat Room</DialogTitle>
              <DialogDescription>
                Create a room for real-time discussion. You'll get a shareable link to invite others.
              </DialogDescription>
            </DialogHeader>
            <ChatRoomCreateForm 
              userId={userId} 
              onSubmit={handleCreateRoom} 
              onCancel={() => setIsCreateDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Room list */}
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <ChatRoomCard 
              key={room.id} 
              room={room} 
              onClick={() => onSelectRoom(room)} 
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center text-center py-10">
          <MessageCircle className="h-12 w-12 mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-lg font-medium mb-2">No chat rooms yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first chat room to start real-time conversations with others.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create a Room
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ChatRoomList; 