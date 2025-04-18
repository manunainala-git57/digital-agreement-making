// src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthContext } from './context/AuthContext.jsx';
import { Typography, Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './utils/ErrorBoundary.jsx'; 
import Home from './components/Home';
import CreateAgreement from './components/CreateAgreement';
import Navbar from './components/NavBar.jsx';
import MyAgreements from './components/MyAgreements';
import SignAgreements from './components/SignAgreements';
import Profile from './components/Profile';




const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <ErrorBoundary>
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-agreement" element={<CreateAgreement />} />
        <Route path="/my-agreements" element={user ? <MyAgreements /> : <Navigate to="/login" />} />
        <Route path="/sign-agreements" element={user ? <SignAgreements /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
    </>
    </ErrorBoundary>
);
};

export default App;
