import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'student') {
            return <Navigate to="/student/dashboard" replace />;
        } else if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === 'recruiter') {
            return <Navigate to="/recruiter/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
