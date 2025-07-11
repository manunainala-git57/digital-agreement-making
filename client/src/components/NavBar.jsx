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

  // if (isMobile) return null; 

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(to right, #1976d2, #0d47a1)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
          Agreema
        </Typography>

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

            {/* Mobile view logout icon */}
            {isMobile && (
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} color="inherit">
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/register">Register</Button>
          </Stack>
        )}
      </Toolbar>

    </AppBar>
  );
};

export default Navbar;
