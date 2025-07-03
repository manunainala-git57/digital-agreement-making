// src/components/Profile.jsx
import React, { useContext, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import api from '../api/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.fullName);

  const handleSave = async () => {
    try {
      const res = await api.patch('/auth/update-profile', {
        fullName: editedName,
      });

      const updatedUser = { ...user, fullName: res.data.fullName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  return (
    <Container  maxWidth="sm" sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          p: 4,
          width: '100%',
          bgcolor: '#fefefe',
          boxShadow: 4,
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: '#1565c0',
              fontSize: 40,
              boxShadow: 2,
            }}
            src={user.profileImage || ''}
          >
            {!user.profileImage && <AccountCircleIcon fontSize="inherit" />}
          </Avatar>

          <Typography variant="h5" fontWeight="bold" color="primary">
            {user.fullName}
          </Typography>
        </Box>

        <CardContent>
          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isEditing ? (
              <>
                <TextField
                  label="Full Name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={user.email}
                  disabled
                  fullWidth
                />
              </>
            ) : (
              <>
                <Typography variant="body1" color="text.secondary">
                  <strong>Full Name:</strong> {user.fullName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Email:</strong> {user.email}
                </Typography>
              </>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            {isEditing ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outlined" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </Box>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default Profile;
