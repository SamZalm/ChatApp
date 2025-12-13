import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import UserSelectorModal from './UserSelectorModal';

let token = null;

const ContactsComp = ({ socket, user, activeConversation, setActiveConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

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

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) {
        token = localStorage.getItem('token');
      }
      try {
        const response = await axios.get('http://localhost:3000/api/chat/', {
          headers: { 'x-access-token': token }
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (user) {
      fetchConversations();
    }
    
    socket.on('conversation_updated', (conversationId, newMsg) => {
      if(activeConversation && activeConversation.id != conversationId) {
        let updatedConversations = conversations.map(conv => 
  conv.id === conversationId ? { ...conv, lastMessage: newMsg, isNew: true } : conv)
        setConversations(updatedConversations);
      }
    });

    return () => {
      socket.off('conversation_updated');
    }

  }, [user]);

  const selectConversation = (conversation) => {
    // Emit 'set_active_conversation' to the server to handle the room join logic
    socket.emit('set_active_conversation', conversation);
    setActiveConversation(conversation);

    // Mark conversation as no longer new
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, isNew: false } : c))
    );
  };

  const openNewConversationModal = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/', {
        headers: { 'x-access-token': token }
      });
      const userList = response.data.filter((userData) => userData.id !== user.id);
      setAllUsers(userList);
      setOpenModal(true);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateGroup = async (selectedUsers) => {
    if (selectedUsers?.length > 0) {
      try {
        const response = await axios.post('http://localhost:3000/api/chat/new', { participants: selectedUsers }, {
          headers: { 'x-access-token': token }
        });
        const newConversation = response.data;
        setConversations((prevConversations) => [newConversation, ...prevConversations]);
        selectConversation(newConversation);
        setOpenModal(false);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: (theme) => theme.palette.background.paper, borderRadius: '10px' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Box
              key={conversation.id || conversation._id}
              onClick={() => selectConversation(conversation)}
              sx={{
                display: 'flex',
                padding: 2,
                cursor: 'pointer',
                borderBottom: '1px solid #ddd',
                backgroundColor: conversation.isNew ? (theme) => theme.palette.primary.default : 'transparent',
              }}
            >
              <Avatar src={getConversationPicture(conversation)} sx={{ marginRight: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1">{getConversationName(conversation)}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {conversation.lastMessage || 'No messages yet'}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ flexGrow: 1, backgroundColor: 'white', textAlign: 'center' }}>
            <Typography variant="body2" color="textPrimary">
              Press on the + button below to start a conversation!
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', padding: 2, borderTop: (theme) => `3px solid ${theme.palette.border.main}`, alignItems: 'center', backgroundColor: (theme) => theme.palette.background.default, borderRadius: '10px' }}>
        <Avatar src={user.profilePic} sx={{ marginRight: 2 }} />
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {user.username}
        </Typography>
        <IconButton onClick={openNewConversationModal} color="secondary">
          <Add />
        </IconButton>
      </Box>

      {/* User Selector Modal */}
      <UserSelectorModal
        modalLabel="Create a new group"
        openModal={openModal}
        setOpenModal={setOpenModal}
        userList={allUsers}
        confirmCallback={handleCreateGroup}
      />
    </Box>
  );
};

export default ContactsComp;