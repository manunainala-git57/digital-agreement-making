import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';


const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
    if (!user) {
    toast.warn("Please login to continue");
    return <Navigate to="/login" />;
    }
    return children;
};


export default ProtectedRoute;
