import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';  // For profile icon
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // For sign out icon

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); // Use logout from context
  const navigate = useNavigate();

  // State for managing the dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget); // Open menu when avatar is clicked
  };

  const handleClose = () => {
    setAnchorEl(null); // Close menu when an option is clicked or clicked outside
  };

  const handleLogout = () => {
    logout(); // Clears user, token, headers
    toast.success('Logged out successfully!');
    navigate('/login');
    handleClose(); // Close the menu after logout
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Digital Agreements
        </Typography>

        {user ? (
          <Stack direction="row" spacing={2}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/my-agreements">My Agreements</Button>
            <Button color="inherit" component={Link} to="/sign-agreements">Sign Agreements</Button>

            {/* Profile dropdown icon */}
            <IconButton onClick={handleClick} color="inherit">
              <Avatar alt={user.name} src={user.profileImage || ''} />
            </IconButton>

            {/* Profile menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem component={Link} to="/profile" onClick={handleClose}>
                <AccountCircleIcon sx={{ marginRight: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon sx={{ marginRight: 1 }} />
                Sign Out
              </MenuItem>
            </Menu>
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
