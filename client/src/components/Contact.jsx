// src/components/Contact.jsx
import React, { useRef, useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const form = useRef();
  const [success, setSuccess] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      'service_ifu2ywo',           
      'template_2k61ozg',          
      form.current,
      'qXScERzUWXrJ-bO1L'          
    ).then(() => {
      setSuccess(true);
      form.current.reset();
    }, (error) => {
      console.error('FAILED...', error.text);
      setSuccess(false);
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
        Contact With Me
      </Typography>

      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Have questions or ideas? Reach out and let’s collaborate.
      </Typography>

      <Box
        component="form"
        ref={form}
        onSubmit={sendEmail}
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <TextField
          label="Your Name"
          name="user_name"
          variant="outlined"
          required
          fullWidth
        />
        <TextField
          label="Your Email"
          name="email"
          type="email"
          variant="outlined"
          required
          fullWidth
        />
        <TextField
          label="Message"
          name="message"
          multiline
          rows={4}
          variant="outlined"
          required
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            background: 'linear-gradient(to right, #1976d2, #0d47a1)',
            color: '#fff',
            fontWeight: 'bold',
            py: 1.2,
            '&:hover': {
              background: 'linear-gradient(to right, #1565c0, #0d47a1)',
            },
          }}
        >
          Send Message
        </Button>
      </Box>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          ✅ Thanks! Message sent successfully.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Contact;
