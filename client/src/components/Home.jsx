import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Stack,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  Avatar,
  Link,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  PictureAsPdf as PdfIcon,
  Assessment as StatusIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';


const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleRestrictedAction = (path) => {
    if (user) {
      navigate(path);
    } else {
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 26, color: '#1976d2' }} />,
      title: 'Fast Creation',
      description: 'Create agreements instantly with ease.',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 26, color: '#1976d2' }} />,
      title: 'Collaborate Easily',
      description: 'Work with others on your agreements.',
    },
    {
      icon: <PdfIcon sx={{ fontSize: 26, color: '#1976d2' }} />,
      title: 'Download as PDF',
      description: 'Easily export your agreements as PDFs.',
    },
    {
      icon: <StatusIcon sx={{ fontSize: 26, color: '#1976d2' }} />,
      title: 'Status Display',
      description: 'Track agreement signing status.',
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      <Container maxWidth="md" sx={{ flexGrow: 1, py: 6, pb: { xs: 10, sm: 6 } }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #0d47a1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Agreema
          </Typography>

          <Typography variant="h6" color="text.secondary" mb={4}>
            A digital agreement platform to create, manage, and sign documents seamlessly.
          </Typography>

          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleRestrictedAction('/create-agreement')}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #2196f3, #1976d2)',
                '&:hover': {
                  background: 'linear-gradient(to right, #1976d2, #0d47a1)',
                },
              }}
            >
              Create Agreement
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<DescriptionIcon />}
              onClick={() => handleRestrictedAction('/my-agreements')}
              sx={{
                px: 4,
                py: 1.5,
                borderColor: '#1976d2',
                color: '#1976d2',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#0d47a1',
                  backgroundColor: '#e3f2fd',
                },
              }}
            >
              View My Agreements
            </Button>
          </Stack>
        </Box>

        {/* Snackbar for login prompt */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
            Please login to use this feature.
          </Alert>
        </Snackbar>

        {/* Features Section */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            sx={{ color: '#0d47a1', mb: 4 }}
          >
            Features of Agreema
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                sx={{
                  height: 180,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mb: 1,
                    backgroundColor: '#e3f2fd',
                    border: '2px solid #1976d2',
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold" color="#0d47a1">
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '0.85rem', mt: 1 }}
                >
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ backgroundColor: '#1565c0', color: '#fff', py: 3, display: { xs: 'none', sm: 'block' } }}>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="body2">
                © {new Date().getFullYear()} Agreema — A Project by Manu
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'center', sm: 'right' }, mt: { xs: 2, sm: 0 } }}>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <Link
                  href="https://github.com/manunainala-git57/digital-agreement-making.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="inherit"
                >
                  GitHub
                </Link>
                <Link component={RouterLink} to="/contact" underline="hover" color="inherit">
                  Contact
                </Link>
                <Link
                  href="https://manunainala.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="inherit"
                >
                  About
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
