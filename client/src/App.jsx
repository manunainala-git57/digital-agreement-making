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
import PageNotFound from './components/PageNotFound.jsx';
import Layout from './components/Layout.jsx';
// Using a ProtectedRoute component is not mandatory, but it's a best practice that helps you avoid repeating logic and makes your code:
import ProtectedRoute from './components/ProtectedRoutes.jsx';
 // we need not use <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
 // instead we can use <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />


const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Wrap all protected routes inside Layout so Navbar + BottomNav appear */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-agreement"
            element={
              <ProtectedRoute>
                <CreateAgreement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-agreements"
            element={
              <ProtectedRoute>
                <MyAgreements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sign-agreements"
            element={
              <ProtectedRoute>
                <SignAgreements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Catch-All Route */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
      />
    </ErrorBoundary>
  );
};

export default App;