import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, AppBar, Toolbar, Avatar, useMediaQuery, useTheme } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import MessageComp from './MessageComp';
import axios from 'axios';

let token = null;

const ConversationComp = ({ socket, user, conversation, setConversation }) => { 
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Detect mobile view to show the back button
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  const fetchMessages = async (page) => {
    try {
      setLoading(true);
      token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/chat/messages/${conversation.id}/${page}`, {
        headers: { 'x-access-token': token }
      });
      if (response && response.data) {
        setMessages((prevMessages) => [...response.data.reverse(), ...prevMessages]); 
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleGoBack = () => {
      setConversation(null);
  };

  // fetch messages when the conversation is reset
  useEffect(() => {
    setMessages([]);
    if (conversation?.id) {
      fetchMessages(1);
    }

    socket.on('new_message', (conversationId, messageData) => {
      if (conversationId === conversation.id) {
        setMessages((prevMessages) => [...prevMessages, messageData]); 
      }
    });

    socket.on('message_updated', (conversationId, messageData) => {
      if (conversationId === conversation.id) {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === messageData.id) {
              if (messageData.deleted) {
                return { ...msg, deleted: true };
              }
              return { ...msg, content: messageData.content, version: messageData.version };
            }
            return msg;
          });
        });
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('message_updated');
    };
  }, [conversation?.id, socket]);

  const getConversationName = (conversationData) => {
    if (conversationData.participants.length === 2) {
      const otherParticipant = conversationData.participants.find((p) => p.id !== user.id);
      return otherParticipant.username;
    } else {
      return conversationData.name;
    }
  };

  const getConversationPicture = (conversationData) => {
    if (conversationData.participants.length === 2) {
      const otherParticipant = conversationData.participants.find((p) => p.id !== user.id);
      return otherParticipant.profilePicture;
    } else {
      return conversationData.picture;
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        content: newMessage,
        sender: user.id,
        conversationId: conversation.id,
      };
      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

      if (scrollTop === 0 && !loading) {
        const nextPage = Math.ceil(messages.length / 100) + 1;
        fetchMessages(nextPage);
      }
    }
  };

  // scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: (theme) => theme.palette.background.default }}>
      
      {/* conversation bar */}
      <AppBar position="static" sx={{ backgroundColor: (theme) => theme.palette.primary.main, zIndex: 1100 }}>
        <Toolbar>
          <IconButton 
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleGoBack}
            sx={{ 
                marginRight: 2, 
                display: isMobile ? 'inline-flex' : 'none'
            }}
          >
            <ArrowBack />
          </IconButton>
          
          <Avatar src={getConversationPicture(conversation)} sx={{ marginRight: 2 }} />
          <Typography variant="h6" sx={{ color: (theme) => theme.palette.background.paper }}>
            {getConversationName(conversation)}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRadius: '10px',
          border: (theme) => `1px solid ${theme.palette.border.main}`,
        }}
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loading && <Typography align="center" variant="body2">Loading more messages...</Typography>}
        {messages.map((message) => (
          <MessageComp
            key={message.id}
            socket={socket}
            conversationId={conversation.id}
            user={user}
            message={message}
          />
        ))}
        {/* the ref that will be scrolled to the bottom */}
        <div ref={messagesEndRef} />
      </Box>

      {/* input bar */}
      <Box 
        sx={{ 
          padding: 2, 
          display: 'flex', 
          backgroundColor: (theme) => theme.palette.background.paper, 
          borderTop: (theme) => `1px solid ${theme.palette.border.main}` 
        }}
      >
        <TextField
          variant="outlined"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          sx={{
            backgroundColor: (theme) => theme.palette.background.default,
            borderRadius: '10px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: (theme) => `1px solid ${theme.palette.border.main}`,
              },
            },
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <IconButton
          sx={{
            marginLeft: 2,
            color: (theme) => theme.palette.background.paper,
            backgroundColor: (theme) => theme.palette.primary.main,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.primary.dark,
            },
          }}
          onClick={sendMessage}
        >
          <svg style={{width: 24, height: 24}} viewBox="0 0 24 24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </IconButton>
      </Box>
    </Box>
  );
};

export default ConversationComp;