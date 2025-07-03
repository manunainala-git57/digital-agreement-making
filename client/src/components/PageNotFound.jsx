// src/components/PageNotFound.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#e3f2fd',
        textAlign: 'center',
        px: 2
      }}
    >
      <Typography variant="h2" color="#0d47a1" fontWeight="bold" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" mb={3}>
        Oops! Page not found.
      </Typography>
      <Button
        variant="contained"
        sx={{
          background: 'linear-gradient(to right, #2196f3, #1976d2)',
          fontWeight: 'bold',
          px: 4,
          py: 1.5
        }}
        onClick={() => navigate('/')}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default PageNotFound;
