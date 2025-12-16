import { useState } from 'react';
import { Box, Avatar, Typography, Modal, Button, Checkbox } from '@mui/material';

const UserSelectorModal = ({ modalLabel, openModal, setOpenModal, userList, confirmCallback }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Modal open={openModal} onClose={() => setOpenModal(false)}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50%',
        backgroundColor: 'gray',
        padding: 4,
        width: '50%',
        margin: 'auto',
        borderRadius: '25px',
      }}>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          { modalLabel}
        </Typography>

        {/* Display all users with checkboxes */}
        <Box sx={{ maxHeight: '50vh', overflowY: 'auto', width: '100%', marginBottom: 2 }}>
          {userList.map((userItem) => (
            <Box key={userItem.id} sx={{ display: 'flex', alignItems: 'center', padding: 1, marginBottom: 1 }}>
              <Checkbox
                checked={selectedUsers.includes(userItem.id)}
                onChange={() => handleCheckboxChange(userItem.id)}
              />
              <Avatar src={userItem.profilePicture} sx={{ marginRight: 2 }} />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>{userItem.username}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="outlined" onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              confirmCallback(selectedUsers)
            }}
            disabled={selectedUsers.length === 0}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserSelectorModal;