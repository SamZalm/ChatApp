import { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import ContactsComp from './ContactsComp';
import ConversationComp from './ConversationComp';

let socket;

export const ChatComp = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detects screen size for mobile view

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socket = io('http://localhost:3000/', {
        query: { token } // Pass token as a query parameter
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/auth/me/', {
          headers: { 'x-access-token': token }
        });
        setUser({
          id: response.data.id,
          username: response.data.username,
          profilePic: response.data.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?20200418092106",
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Define the transforms based on mobile status and activeConversation
  const contactsTransform = isMobile && activeConversation ? 'translateX(-100%)' : 'translateX(0)';
  const conversationTransform = isMobile && !activeConversation ? 'translateX(100%)' : 'translateX(0)';

  return (
    user ? (
      <Box sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: isMobile ? 'column' : 'row', // Stack vertically on mobile, side-by-side on desktop
        overflow: 'hidden', // Ensure no scrollbars appear due to gaps
      }}>
        {/* Contacts Component */}
        <Box
          sx={{
            width: isMobile ? '100%' : '30%', // Full width on mobile, 30% on desktop
            height: '100%',
            transition: isMobile ? 'transform 0.3s ease-in-out' : 'none', // Only slide on mobile
            // Use the calculated transform
            transform: contactsTransform, 
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: (theme) => theme.palette.background.paper,
            zIndex: 1, 
            padding: 0, 
            // Important for desktop: position contacts absolutely relative to its container
            position: isMobile ? 'relative' : 'initial',
            // Added flexShrink: 0 to ensure it takes its set width on desktop
            flexShrink: 0,
          }}
        >
          <ContactsComp
            socket={socket}
            user={user}
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
          />
        </Box>

        {/* Conversation Component */}
        <Box
          sx={{
            width: isMobile ? '100%' : '70%', // Full width on mobile, 70% on desktop
            height: '100%',
            transition: isMobile ? 'transform 0.3s ease-in-out' : 'none', // Only slide on mobile
            transform: conversationTransform, 
            display: 'flex',
            flexDirection: 'column',
            padding: 0, 
            position: isMobile ? 'absolute' : 'initial',
            flexGrow: isMobile ? 0 : 1, 
            right: 0,
            ...(isMobile && { 
              width: '100%', 
              height: '100%',
              top: 0,
              bottom: 0,
              backgroundColor: (theme) => theme.palette.background.default,
              zIndex: 2, // Ensure it's above the contacts list
            }),
          }}
        >
          {activeConversation ? (
            <ConversationComp
              socket={socket}
              user={user}
              conversation={activeConversation}
              setConversation={setActiveConversation}
            />
          ) : (
            <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: '5px' }}>
              <Typography variant="h6">Select a conversation to start chatting</Typography>
            </Box>
          )}
        </Box>
      </Box>
    ) : (
      <Navigate to="/login" replace />
    )
  );
};