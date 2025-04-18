import React, { useState, useContext } from 'react';
import { Container, Typography, TextField, Button, Stack } from '@mui/material';
import api from '../api/api.js';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateAgreement = () => {
  const [title, setTitle] = useState('');
  const [partyBEmail, setPartyBEmail] = useState('');
  const [content, setContent] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/agreements/create', {
        title,
        content,
        inviteeEmails: [partyBEmail],
      });

      toast.success('Agreement created successfully!');
      navigate('/my-agreements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating agreement');
    }
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        ✍️ Create New Agreement
      </Typography>
      <form onSubmit={handleCreate}>
        <Stack spacing={3}>
          <TextField
            label="Agreement Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Agreement Content"
            variant="outlined"
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <TextField
            label="To Emails"
            variant="outlined"
            value={partyBEmail}
            onChange={(e) => setPartyBEmail(e.target.value)}
            required
          />
          <Button variant="contained" color="primary" type="submit">
            Create Agreement
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default CreateAgreement;
