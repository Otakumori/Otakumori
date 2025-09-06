import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

export const FriendChat: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'KawaiiOtaku', avatar: '🌸', status: 'online' },
    { id: '2', name: 'GamingSenpai', avatar: '🎮', status: 'away' },
    {
      id: '3',
      name: 'AnimeLover',
      avatar: '🌟',
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000),
    },
    { id: '4', name: 'CosplayQueen', avatar: '👑', status: 'online' },
  ]);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (selectedFriend && Math.random() > 0.7) {
      setIsTyping(true);
      const timer = setTimeout(
        () => {
          setIsTyping(false);
          // Simulate receiving a message
          if (Math.random() > 0.5) {
            const responses = [
              "That's so cool! 😊",
              'I totally agree!',
              'Have you seen the latest episode?',
              "Let's play together sometime!",
              'Thanks for the recommendation!',
              "That's hilarious! 😂",
              "I'm so jealous!",
              "Can't wait to see more!",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(selectedFriend.id, selectedFriend.name, randomResponse, false);
          }
        },
        2000 + Math.random() * 3000,
      );
      return () => clearTimeout(timer);
    }
  }, [selectedFriend, messages.length]);

  const addMessage = (senderId: string, senderName: string, content: string, isOwn: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      content,
      timestamp: new Date(),
      isOwn,
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return;

    addMessage('me', 'You', newMessage, true);
    setNewMessage('');

    // Simulate friend typing
    setIsTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online':
        return '#4CAF50';
      case 'away':
        return '#FF9800';
      case 'offline':
        return '#666';
      default:
        return '#666';
    }
  };

  const getStatusText = (friend: Friend) => {
    switch (friend.status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return friend.lastSeen
          ? `Last seen ${friend.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className="friend-chat-container"
      style={{
        background: '#1a1a2e',
        borderRadius: '12px',
        border: '2px solid #FF69B4',
        overflow: 'hidden',
        height: '500px',
        display: 'flex',
      }}
    >
      {/* Friends List */}
      <div
        style={{
          width: '250px',
          background: '#16213e',
          borderRight: '1px solid #333',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #333',
            background: '#FF69B4',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          Friends ({friends.filter((f) => f.status === 'online').length} online)
        </div>

        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => setSelectedFriend(friend)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #333',
              background: selectedFriend?.id === friend.id ? '#FF69B4' : 'transparent',
              color: selectedFriend?.id === friend.id ? '#fff' : '#ccc',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedFriend?.id !== friend.id) {
                e.currentTarget.style.background = '#333';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFriend?.id !== friend.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>{friend.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{friend.name}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: selectedFriend?.id === friend.id ? '#fff' : '#999',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getStatusColor(friend.status),
                    }}
                  />
                  {getStatusText(friend)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid #333',
                background: '#16213e',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '24px' }}>{selectedFriend.avatar}</div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>{selectedFriend.name}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getStatusColor(selectedFriend.status),
                    }}
                  />
                  {getStatusText(selectedFriend)}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                background: '#1a1a2e',
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#666',
                    marginTop: '50px',
                    fontSize: '14px',
                  }}
                >
                  Start a conversation with {selectedFriend.name}! 💬
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: message.isOwn ? '#FF69B4' : '#333',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    <div style={{ marginBottom: '4px' }}>{message.content}</div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: message.isOwn ? 'rgba(255,255,255,0.7)' : '#999',
                        textAlign: message.isOwn ? 'right' : 'left',
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: '#333',
                      color: '#999',
                      fontSize: '14px',
                    }}
                  >
                    {selectedFriend.name} is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div
              style={{
                padding: '16px',
                borderTop: '1px solid #333',
                background: '#16213e',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${selectedFriend.name}...`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    background: '#1a1a2e',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '100px',
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: newMessage.trim() ? '#FF69B4' : '#666',
                    color: '#fff',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '16px',
            }}
          >
            Select a friend to start chatting! 💬
          </div>
        )}
      </div>
    </div>
  );
};
