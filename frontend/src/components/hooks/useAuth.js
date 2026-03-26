import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authAPI } from '../../services/api';
import { STORAGE_KEYS } from '../../utils/constants';

// ============================================================================
// AUTH CONTEXT
// ============================================================================

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ============================================================================
    // INITIALIZE AUTH ON MOUNT
    // ============================================================================

    useEffect(() => {
        const initAuth = () => {
            try {
                const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

                if (storedUser && token) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error('Failed to initialize auth:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // ============================================================================
    // LOGIN
    // ============================================================================

    const login = useCallback(async (username, password) => {
        setError(null);
        setLoading(true);

        try {
            const response = await authAPI.login(username, password);

            // Response structure: { user_id, username, role, message }
            const userData = {
                id: response.user_id,
                username: response.username,
                role: response.role,
            };

            setUser(userData);
            setIsAuthenticated(true);
            setError(null);

            return { success: true, user: userData };
        } catch (err) {
            const errorMessage = err.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================================================
    // LOGOUT
    // ============================================================================

    const logout = useCallback(() => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    }, []);

    // ============================================================================
    // UPDATE USER
    // ============================================================================

    const updateUser = useCallback((updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    }, [user]);

    // ============================================================================
    // CLEAR ERROR
    // ============================================================================

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ============================================================================
    // CHECK PERMISSIONS
    // ============================================================================

    const hasRole = useCallback((role) => {
        if (!user) return false;
        return user.role === role;
    }, [user]);

    const isAdmin = useCallback(() => {
        return hasRole('admin');
    }, [hasRole]);

    const isDoctor = useCallback(() => {
        return hasRole('doctor');
    }, [hasRole]);

    const isNurse = useCallback(() => {
        return hasRole('nurse');
    }, [hasRole]);

    const isManager = useCallback(() => {
        return hasRole('manager');
    }, [hasRole]);

    // ============================================================================
    // CONTEXT VALUE
    // ============================================================================

    const value = {
        // State
        user,
        loading,
        error,
        isAuthenticated,

        // Methods
        login,
        logout,
        updateUser,
        clearError,

        // Permissions
        hasRole,
        isAdmin,
        isDoctor,
        isNurse,
        isManager,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ============================================================================
// CUSTOM HOOK EXPORTS (Alternative API)
// ============================================================================

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
    const { user, loading } = useAuth();
    return { user, loading };
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
    const { isAuthenticated, loading } = useAuth();
    return { isAuthenticated, loading };
};

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (role) => {
    const { hasRole, loading } = useAuth();
    return { hasRole: hasRole(role), loading };
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = () => {
    const { isAdmin, loading } = useAuth();
    return { isAdmin: isAdmin(), loading };
};

/**
 * Hook for login action
 */
export const useLogin = () => {
    const { login, loading, error } = useAuth();
    return { login, loading, error };
};

/**
 * Hook for logout action
 */
export const useLogout = () => {
    const { logout } = useAuth();
    return { logout };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default useAuth;