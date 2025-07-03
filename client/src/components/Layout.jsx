// src/components/Layout.jsx
import React from 'react';
import Navbar from './NavBar';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import MobileBottomNav from './MobileBottomNav';
const Layout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' , background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, mt: 2 }}>
        <Outlet />
      </Box>
      <MobileBottomNav/>
    </Box>
  );
};

export default Layout;
