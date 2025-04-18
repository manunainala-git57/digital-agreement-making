// src/pages/Home.jsx
import React from 'react';
import { Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleCreateAgreement = () => {
    navigate('/create-agreement');
  };

  const handleMyAgreements = () => {
    navigate('/my-agreements');
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
          Agreema - a digital agreement making
      </Typography>

      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        You can create, manage, and sign agreements all in one place.
      </Typography>

      <Stack spacing={2} direction="row" justifyContent="center">
        <Button variant="contained" color="primary" onClick={handleCreateAgreement}>
          ➕ Create Agreement
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleMyAgreements}>
          📄 View My Agreements
        </Button>
      </Stack>
    </Container>
  );
};

export default Home;
