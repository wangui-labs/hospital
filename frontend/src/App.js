import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/hooks/useAuth';
import Login from './components/views/Login';
import Dashboard from './components/dashboard/Dashboard';
import { STORAGE_KEYS } from './utils/constants';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// ============================================================================
// APP ROUTES COMPONENT
// ============================================================================

const AppRoutes = () => {
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ?
                        <Navigate to="/dashboard" replace /> :
                        <Login />
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard
                            userId={user?.id}
                            onLogout={handleLogout}
                        />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />
            <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
            />
        </Routes>
    );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
    const [loading, setLoading] = useState(true);

    // Clear any stale data on initial load
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const user = localStorage.getItem(STORAGE_KEYS.USER);

        if (!token || !user) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        }

        setLoading(false);
    }, []);

    if (loading) {
        return <LoadingSpinner fullScreen message="Initializing..." />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <div className="App">
                        <AppRoutes />
                    </div>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;