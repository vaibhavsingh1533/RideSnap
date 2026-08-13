import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const ChatBox = ({ rideId, isOpen, onClose }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Fetch past messages on mount
  useEffect(() => {
    if (!rideId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/rides/${rideId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ridesnap_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data.ride.messages || []);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    fetchMessages();

    // Listen for real-time messages
    if (socket) {
      socket.emit('join_ride', { rideId });

      socket.on('message_received', (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (socket) {
        socket.emit('leave_ride', { rideId });
        socket.off('message_received');
      }
    };
  }, [rideId, socket]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !rideId) return;

    socket.emit('send_message', {
      rideId,
      senderId: user.id,
      content: inputText
    });

    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      right: '20px',
      bottom: '100px',
      width: '320px',
      height: '420px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1001,
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(99, 102, 241, 0.15)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} className="text-primary" style={{ color: 'var(--primary)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Ride Support Chat</h4>
        </div>
        <button 
          onClick={onClose} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages list */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            margin: 'auto 0'
          }}>
            Send a message to coordinate pickup location.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === user.id;
            return (
              <div 
                key={msg.id || index} 
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: isMe ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255, 255, 255, 0.06)',
                  color: 'white',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  boxShadow: isMe ? '0 4px 12px rgba(99,102,241,0.2)' : 'none'
                }}>
                  {msg.content}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  padding: '0 4px'
                }}>
                  {isMe ? 'You' : msg.sender?.name || 'Driver'}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSendMessage} 
        style={{
          padding: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 11, 18, 0.4)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="input-field"
          style={{
            padding: '10px 12px',
            fontSize: '0.85rem',
            borderRadius: '8px'
          }}
        />
        <button 
          type="submit" 
          className="btn-primary"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            boxShadow: 'none'
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
