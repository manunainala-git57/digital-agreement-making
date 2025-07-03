// src/components/MobileBottomNav.jsx
import React, { useContext } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  Description as DescriptionIcon,
  EditNote as EditNoteIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleChange = (_, value) => {
    navigate(value);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', sm: 'none' },
        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
        borderTop: '1px solid #90caf9',
        zIndex: 999,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={handleChange}
        sx={{ bgcolor: 'transparent' }}
      >
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="My Agreements" value="/my-agreements" icon={<DescriptionIcon />} />
        <BottomNavigationAction label="Sign" value="/sign-agreements" icon={<EditNoteIcon />} />
        <BottomNavigationAction label="Profile" value="/profile" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
