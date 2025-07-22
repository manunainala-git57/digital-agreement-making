import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.warn("Please login to continue");
      setShouldRedirect(true);
    }
  }, [user]);

  if (shouldRedirect) return <Navigate to="/login" replace />;
  if (user) return children;

  return null; 
};

export default ProtectedRoute;
