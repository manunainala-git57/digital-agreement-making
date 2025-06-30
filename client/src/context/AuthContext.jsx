// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api.js';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const navigate = useNavigate();

  const isTokenValid = (token) => {
    if (!token) return false;
    const base64 = token.split('.')[1];
    const payload = JSON.parse(window.atob(base64)); // parses { exp: xxx }
    return payload.exp * 1000 > Date.now();
  };

  useEffect(() => {
    if (token) {
      if (isTokenValid(token)) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      } else {
        // Token is invalid or expired
        logout();
        navigate('/login'); 
      }
    }
  }, [token]);

  const login = async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user)); 
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return true;
  };
  
  const register = async (fullName, email, password) => {
    const res = await api.post('/auth/register', { fullName, email, password });
    const { token, user } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user)); 
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user'); 
    localStorage.removeItem('token'); 
    delete api.defaults.headers.common['Authorization']; 
    navigate('/login'); 
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
