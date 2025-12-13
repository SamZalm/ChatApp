import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const MessageComp = ({ socket, conversationId, user, message }) => {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content); // Link the editContent to message.content initially
  const isMine = message.sender.id === user.id;
  const isEdited = message.version > 0;

  // Delete message handler
  const handleDelete = () => {
    socket.emit("delete_message", {
      id: message.id,
      sender: user.id,
      conversationId,
    });
  };

  // Start editing
  const handleEdit = () => {
    setEditMode(true);
    setEditContent(message.content); // Reset to original content in case it's not fresh
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditContent(message.content); // Reset the content if the user cancels
    setEditMode(false);
  };

  // Confirm edit (send the new message content)
  const confirmEdit = () => {
    if (editContent.trim() !== message.content) {
      socket.emit("edit_message", {
        id: message.id,
        content: editContent,
        //attachment
        sender: user.id,
        conversationId,
      });
    }
    setEditMode(false); // Exit edit mode after confirmation
  };

  // Handle content change in the edit field
  const handleEditChange = (e) => {
    setEditContent(e.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMine ? 'flex-end' : 'flex-start',
        marginBottom: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: isMine
            ? (theme) => theme.palette.background.default // own message
            : (theme) => theme.palette.primary.main, // others
          padding: 1,
          borderRadius: 2,
          maxWidth: '60%',
          textAlign: 'left',
        }}
      >
        {editMode ? (
          <Box>
            <TextField
              value={editContent} // This should be linked to editContent state
              onChange={handleEditChange} // Update editContent state as the user types
              fullWidth
              variant="outlined"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
              <IconButton onClick={confirmEdit}>
                <Typography>Confirm</Typography>
              </IconButton>
              <IconButton onClick={cancelEdit}>
                <Typography>Cancel</Typography>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1">
            {message.sender.username} : {message.deleted ? 'Message deleted' : message.content}
            {isEdited && <i style={{ fontSize: '0.8em' }}> (edited)</i>}
          </Typography>
        )}
        <Typography variant="caption" color="textSecondary" align="right">
          {new Date(message.timestamp).toLocaleString()}
        </Typography>
        {isMine && !message.deleted && !editMode && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleEdit}>
              <Edit />
            </IconButton>
            <IconButton onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageComp;