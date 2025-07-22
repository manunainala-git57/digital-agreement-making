import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';

import {
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';

import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(to right, #1976d2, #0d47a1)' }}>
      <Toolbar>
        {/* App Logo */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            letterSpacing: 1,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          Agreema
        </Typography>

        {/* User logged in */}
        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            {!isMobile && (
              <>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/my-agreements">My Agreements</Button>
                <Button color="inherit" component={Link} to="/sign-agreements">Sign Agreements</Button>

                <IconButton onClick={handleMenuClick} color="inherit">
                  <Avatar alt={user.name} src={user.profileImage || ''} />
                </IconButton>

                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                  <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                    <AccountCircleIcon sx={{ marginRight: 1 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ExitToAppIcon sx={{ marginRight: 1 }} />
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            )}

            {isMobile && (
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} color="inherit">
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ) : (
          // 🔄 Replaced Login + Register with a single "Get Started" button
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              fontWeight: 'bold',
              borderRadius: '999px',
              px: 3,
              background: 'linear-gradient(to right, #2196f3, #1976d2)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                background: 'linear-gradient(to right, #1976d2, #0d47a1)',
              },
            }}
          >
            Get Started
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
