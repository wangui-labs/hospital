import axios from 'axios';
import { API_BASE_URL, ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - Clear storage and redirect to login
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const handleResponse = (response) => response.data;
const handleError = (error) => {
    const message = error.response?.data?.detail || error.message || 'Something went wrong';
    throw new Error(message);
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const authAPI = {
    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     */
    login: async (username, password) => {
        try {
            const response = await api.post(ENDPOINTS.LOGIN, { username, password });
            const data = handleResponse(response);

            // Store auth data
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.user_id);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

            return data;
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    /**
     * Get current logged in user
     */
    getCurrentUser: () => {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
    },
};

// ============================================================================
// USERS (Admin Only)
// ============================================================================

export const userAPI = {
    /**
     * Get all users
     */
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMIN.USERS);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create new user
     * @param {Object} userData - User data (username, email, password, role)
     */
    create: async (userData) => {
        try {
            const response = await api.post(ENDPOINTS.ADMIN.USERS, userData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// EMPLOYEES
// ============================================================================

export const employeeAPI = {
    /**
     * Get all employees
     */
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMIN.EMPLOYEES);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create new employee
     * @param {Object} employeeData - Employee data
     */
    create: async (employeeData) => {
        try {
            const response = await api.post(ENDPOINTS.ADMIN.EMPLOYEES, employeeData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Delete employee
     * @param {string} employeeId - Employee ID
     */
    delete: async (employeeId) => {
        try {
            const response = await api.delete(`${ENDPOINTS.ADMIN.EMPLOYEES}/${employeeId}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// PATIENTS
// ============================================================================

export const patientAPI = {
    /**
     * Get all patients
     */
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMIN.PATIENTS);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create new patient
     * @param {Object} patientData - Patient data
     */
    create: async (patientData) => {
        try {
            const response = await api.post(ENDPOINTS.ADMIN.PATIENTS, patientData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// ROOMS
// ============================================================================

export const roomAPI = {
    /**
     * Get all rooms
     */
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMIN.ROOMS);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get public rooms (for dashboard)
     */
    getPublicRooms: async () => {
        try {
            const response = await api.get(ENDPOINTS.ROOMS);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create new room
     * @param {Object} roomData - Room data
     */
    create: async (roomData) => {
        try {
            const response = await api.post(ENDPOINTS.ADMIN.ROOMS, roomData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Update room status
     * @param {string} roomId - Room ID
     * @param {string} status - New status
     */
    updateStatus: async (roomId, status) => {
        try {
            const response = await api.put(`${ENDPOINTS.ADMIN.ROOMS}/${roomId}`, { status });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Delete room
     * @param {string} roomId - Room ID
     */
    delete: async (roomId) => {
        try {
            const response = await api.delete(`${ENDPOINTS.ADMIN.ROOMS}/${roomId}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// SHIFTS
// ============================================================================

export const shiftAPI = {
    /**
     * Get all shifts
     */
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMIN.SHIFTS);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create new shift
     * @param {Object} shiftData - Shift data
     */
    create: async (shiftData) => {
        try {
            const response = await api.post(ENDPOINTS.ADMIN.SHIFTS, shiftData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// BADGES
// ============================================================================

export const badgeAPI = {
    /**
     * Get all badges
     */
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMIN.BADGES);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create new badge
     * @param {Object} badgeData - Badge data
     */
    create: async (badgeData) => {
        try {
            const response = await api.post(ENDPOINTS.ADMIN.BADGES, badgeData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// ADMISSIONS
// ============================================================================

export const admissionAPI = {
    /**
     * Get active admissions
     */
    getActive: async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMISSIONS);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create new admission
     * @param {Object} admissionData - Admission data
     */
    create: async (admissionData) => {
        try {
            const response = await api.post(ENDPOINTS.ADMISSIONS, admissionData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export const activityAPI = {
    /**
     * Get activity logs
     * @param {number} limit - Number of logs to fetch
     */
    getLogs: async (limit = 50) => {
        try {
            const response = await api.get(`${ENDPOINTS.ACTIVITY_LOG}?limit=${limit}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Create activity log entry
     * @param {string} category - Activity category
     * @param {string} action - Action description
     * @param {string} severity - Severity level
     * @param {Object} metadata - Additional metadata
     */
    create: async (category, action, severity = 'info', metadata = {}) => {
        try {
            const response = await api.post(ENDPOINTS.ACTIVITY, null, {
                params: { category, action, severity, ...metadata }
            });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },
};

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export const dashboardAPI = {
    /**
     * Get dashboard statistics
     * Aggregates data from multiple endpoints
     */
    getStats: async () => {
        try {
            const [rooms, admissions, employees, patients, shifts, badges] = await Promise.all([
                roomAPI.getPublicRooms().catch(() => ({ rooms: [] })),
                admissionAPI.getActive().catch(() => ({ admissions: [] })),
                employeeAPI.getAll().catch(() => ({ employees: [] })),
                patientAPI.getAll().catch(() => ({ patients: [] })),
                shiftAPI.getAll().catch(() => ({ shifts: [] })),
                badgeAPI.getAll().catch(() => ({ badges: [] })),
            ]);

            const roomsList = rooms.rooms || [];
            const admissionsList = admissions.admissions || [];
            const employeesList = employees.employees || [];
            const patientsList = patients.patients || [];
            const shiftsList = shifts.shifts || [];
            const badgesList = badges.badges || [];

            // Calculate room occupancy
            const totalRooms = roomsList.length;
            const occupiedRooms = roomsList.filter(r => r.status === 'occupied').length;
            const availableRooms = roomsList.filter(r => r.status === 'available').length;

            // Get today's shifts
            const today = formatDate(new Date(), 'short');
            const todayShifts = shiftsList.filter(s => formatDate(s.date, 'short') === today);

            return {
                totalEmployees: employeesList.length,
                totalPatients: patientsList.length,
                totalRooms,
                occupiedRooms,
                availableRooms,
                occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : 0,
                activeAdmissions: admissionsList.length,
                activeShifts: todayShifts.length,
                totalBadges: badgesList.length,
                activeBadges: badgesList.filter(b => b.is_active).length,
            };
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            return {
                totalEmployees: 0,
                totalPatients: 0,
                totalRooms: 0,
                occupiedRooms: 0,
                availableRooms: 0,
                occupancyRate: 0,
                activeAdmissions: 0,
                activeShifts: 0,
                totalBadges: 0,
                activeBadges: 0,
            };
        }
    },
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
    authAPI,
    userAPI,
    employeeAPI,
    patientAPI,
    roomAPI,
    shiftAPI,
    badgeAPI,
    admissionAPI,
    activityAPI,
    dashboardAPI,
};