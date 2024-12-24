import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { validateSession } from '../api/login/api';
import { LoginResponse } from '../api/Providers/interfaces/interfaces';

interface RoleProtectedRouteProps {
    element: JSX.Element;
    requiredRole: 'admin' | 'user';
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ element, requiredRole }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    const checkSessionAndRole = async () => {
        try {
            const response: LoginResponse = await validateSession();

            if (response?.isLoggedIn) {
                setIsAuthenticated(true);
                setHasRequiredRole(response.role === requiredRole || response.role === 'admin');
            } else {
                setIsAuthenticated(false);
                setHasRequiredRole(false);
            }
        } catch (err) {
            console.error('Error during session validation:', err);
            setIsAuthenticated(false);
            setError('Failed to validate session. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSessionAndRole();
    }, [requiredRole]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <Navigate to="/login" replace />;
    }

    if (isAuthenticated && location.pathname === '/login') {
        return <Navigate to="/" replace />;
    }

    if (isAuthenticated === false) {
        return <Navigate to="/login" replace />;
    }

    if (hasRequiredRole === false) {
        return <Navigate to="/forbidden" replace />;
    }
    return element;
};

export default RoleProtectedRoute;
