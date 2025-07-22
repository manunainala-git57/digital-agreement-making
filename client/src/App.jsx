// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
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
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import Contact from './components/Contact.jsx';

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>

        <Route element={<Layout />}>

          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />


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


        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


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
