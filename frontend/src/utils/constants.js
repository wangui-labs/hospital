// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_BASE_URL = 'http://localhost:8000/api';

export const ENDPOINTS = {
    // Auth
    LOGIN: '/login',

    // Public
    ACTIVITY: '/activity',
    ACTIVITY_LOG: '/activity-log',
    ROOMS: '/rooms',
    ADMISSIONS: '/admissions',

    // Admin
    ADMIN: {
        USERS: '/admin/users',
        EMPLOYEES: '/admin/employees',
        PATIENTS: '/admin/patients',
        ROOMS: '/admin/rooms',
        SHIFTS: '/admin/shifts',
        BADGES: '/admin/badges',
    }
};

// ============================================================================
// GOOGLE MATERIAL DESIGN COLORS
// ============================================================================

export const COLORS = {
    // Primary Colors (Google Blue)
    primary: {
        50: '#E8F0FE',
        100: '#D2E3FC',
        200: '#AECBFA',
        300: '#8AB4F8',
        400: '#669DF6',
        500: '#4285F4',  // Google Blue
        600: '#3367D6',
        700: '#2A56C6',
        800: '#1F3A7A',
        900: '#1A2C5E',
    },
    // Secondary Colors (Google Red)
    secondary: {
        50: '#FCE8E6',
        100: '#FAD1CC',
        200: '#F5A99E',
        300: '#F0826F',
        400: '#EB5A41',
        500: '#EA4335',  // Google Red
        600: '#D3382A',
        700: '#BC2D1F',
        800: '#A52318',
        900: '#8E1910',
    },
    // Success / Green (Google Green)
    success: {
        50: '#E6F4EA',
        100: '#CEEAD6',
        200: '#A8D5B2',
        300: '#81C08D',
        400: '#5BAB69',
        500: '#34A853',  // Google Green
        600: '#2C8C44',
        700: '#24703A',
        800: '#1C552F',
        900: '#143A25',
    },
    // Warning / Yellow (Google Yellow)
    warning: {
        50: '#FEF7E0',
        100: '#FEF0C1',
        200: '#FDE293',
        300: '#FCD364',
        400: '#FBC536',
        500: '#F9AB00',  // Google Yellow
        600: '#F29900',
        700: '#E68900',
        800: '#D97A00',
        900: '#CC6B00',
    },
    // Gray Scale
    gray: {
        50: '#F8F9FA',
        100: '#F1F3F4',
        200: '#E8EAED',
        300: '#DADCE0',
        400: '#BDC1C6',
        500: '#9AA0A6',
        600: '#80868B',
        700: '#5F6368',
        800: '#3C4043',
        900: '#202124',
    },
    // Utility Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Semantic Aliases
    info: '#4285F4',
    success: '#34A853',
    warning: '#F9AB00',
    error: '#EA4335',
    dark: '#202124',
    light: '#F8F9FA',
};

// ============================================================================
// CSS VARIABLES (for inline styles compatibility)
// ============================================================================

export const CSS_VARS = {
    // Surface colors
    surface: COLORS.gray[50],
    white: COLORS.white,

    // Ink colors (text)
    ink: COLORS.gray[800],
    ink2: COLORS.gray[600],
    ink3: COLORS.gray[500],
    ink4: COLORS.gray[400],

    // Divider
    divider: COLORS.gray[200],

    // Blue shades
    blue: COLORS.primary[500],
    blueL: COLORS.primary[50],
    blueM: COLORS.primary[300],

    // Green shades
    green: COLORS.success[500],
    greenL: COLORS.success[50],

    // Red shades
    red: COLORS.error,
    redL: COLORS.secondary[50],
    redM: COLORS.secondary[200],

    // Yellow shades
    yellow: COLORS.warning[500],
    yellowL: COLORS.warning[50],

    // Gray shades
    gray: COLORS.gray[500],
    grayLight: COLORS.gray[300],
    grayLighter: COLORS.gray[100],

    // Radius
    radius: '12px',
    radiusS: '8px',
};

// Helper function to get CSS variable values
export const getCSSVar = (varName) => {
    const varMap = {
        '--surface': CSS_VARS.surface,
        '--white': CSS_VARS.white,
        '--ink': CSS_VARS.ink,
        '--ink2': CSS_VARS.ink2,
        '--ink3': CSS_VARS.ink3,
        '--ink4': CSS_VARS.ink4,
        '--divider': CSS_VARS.divider,
        '--blue': CSS_VARS.blue,
        '--blue-l': CSS_VARS.blueL,
        '--blue-m': CSS_VARS.blueM,
        '--green': CSS_VARS.green,
        '--green-l': CSS_VARS.greenL,
        '--red': CSS_VARS.red,
        '--red-l': CSS_VARS.redL,
        '--red-m': CSS_VARS.redM,
        '--yellow': CSS_VARS.yellow,
        '--radius': CSS_VARS.radius,
        '--radius-s': CSS_VARS.radiusS,
    };
    return varMap[varName] || varName;
};

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

export const ROOM_STATUS = {
    AVAILABLE: { value: 'available', label: 'Available', color: COLORS.success[500], bg: COLORS.success[50] },
    OCCUPIED: { value: 'occupied', label: 'Occupied', color: COLORS.secondary[500], bg: COLORS.secondary[50] },
    CLEANING: { value: 'cleaning', label: 'Cleaning', color: COLORS.warning[500], bg: COLORS.warning[50] },
    MAINTENANCE: { value: 'maintenance', label: 'Maintenance', color: COLORS.gray[600], bg: COLORS.gray[100] },
};

export const SHIFT_TYPES = {
    MORNING: { value: 'morning', label: 'Morning', icon: '🌅', time: '06:00 - 14:00' },
    AFTERNOON: { value: 'afternoon', label: 'Afternoon', icon: '☀️', time: '14:00 - 22:00' },
    NIGHT: { value: 'night', label: 'Night', icon: '🌙', time: '22:00 - 06:00' },
    ONCALL: { value: 'oncall', label: 'On Call', icon: '📞', time: '24/7' },
};

export const ACCESS_LEVELS = {
    BASIC: { value: 'basic', label: 'Basic', color: COLORS.gray[600], level: 1 },
    STANDARD: { value: 'standard', label: 'Standard', color: COLORS.info, level: 2 },
    ELEVATED: { value: 'elevated', label: 'Elevated', color: COLORS.warning[500], level: 3 },
    ADMIN: { value: 'admin', label: 'Admin', color: COLORS.error, level: 4 },
};

export const USER_ROLES = {
    ADMIN: { value: 'admin', label: 'Administrator', icon: '👑' },
    DOCTOR: { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
    NURSE: { value: 'nurse', label: 'Nurse', icon: '👩‍⚕️' },
    RECEPTIONIST: { value: 'receptionist', label: 'Receptionist', icon: '📋' },
    SECURITY: { value: 'security', label: 'Security', icon: '🛡️' },
    MANAGER: { value: 'manager', label: 'Manager', icon: '📊' },
};

export const ADMISSION_PRIORITY = {
    ROUTINE: { value: 'routine', label: 'Routine', color: COLORS.info, icon: '🟢' },
    URGENT: { value: 'urgent', label: 'Urgent', color: COLORS.warning[500], icon: '🟡' },
    EMERGENCY: { value: 'emergency', label: 'Emergency', color: COLORS.error, icon: '🔴' },
};

export const SEVERITY = {
    INFO: { value: 'info', label: 'Info', color: COLORS.info, icon: 'ℹ️' },
    WARNING: { value: 'warning', label: 'Warning', color: COLORS.warning[500], icon: '⚠️' },
    ERROR: { value: 'error', label: 'Error', color: COLORS.error, icon: '❌' },
    CRITICAL: { value: 'critical', label: 'Critical', color: COLORS.secondary[500], icon: '🔥' },
};

// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
    name: 'Hospital Activity Dashboard',
    version: '2.0.0',
    description: 'Real-time hospital management system',
    author: 'Hospital Dashboard Team',
    year: new Date().getFullYear(),
};

export const STORAGE_KEYS = {
    TOKEN: 'hospital_auth_token',
    USER: 'hospital_user_data',
    THEME: 'hospital_theme',
    LANGUAGE: 'hospital_language',
};

export const WEBSOCKET = {
    URL: 'ws://localhost:8000/ws',
    RECONNECT_DELAY: 3000,
    MAX_RECONNECT_ATTEMPTS: 5,
};

// ============================================================================
// DEFAULT DATA
// ============================================================================

export const DEFAULT_USER = {
    username: '',
    email: '',
    role: '',
    is_active: true,
};

export const DEFAULT_EMPLOYEE = {
    first_name: '',
    last_name: '',
    employee_number: '',
    department: '',
    job_title: '',
    phone: '',
};

export const DEFAULT_PATIENT = {
    mrn: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    contact_phone: '',
    contact_email: '',
};

export const DEFAULT_ROOM = {
    room_number: '',
    ward: '',
    room_type: '',
    capacity: 1,
    floor: 1,
    status: 'available',
};

export const DEFAULT_SHIFT = {
    employee_id: '',
    shift_type: 'morning',
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    notes: '',
};

export const DEFAULT_BADGE = {
    employee_id: '',
    badge_number: '',
    access_level: 'standard',
    is_active: true,
};

// ============================================================================
// FORM VALIDATION PATTERNS
// ============================================================================

export const VALIDATION = {
    EMAIL: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/,
    PHONE: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4}$/,
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    TIME: /^\d{2}:\d{2}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,64}$/,
    BADGE_NUMBER: /^[A-Z0-9]{4,16}$/,
    ROOM_NUMBER: /^[A-Z0-9-]{1,32}$/,
    MRN: /^[A-Z0-9-]{1,64}$/,
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const TABLE_ROWS_PER_PAGE = [10, 25, 50, 100];

export const NOTIFICATION_DURATION = 5000; // milliseconds

export const DEBOUNCE_DELAY = 300; // milliseconds

export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
};

// ============================================================================
// NAVIGATION ITEMS (SINGLE SOURCE OF TRUTH)
// ============================================================================

export const NAVIGATION = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/', roles: ['admin', 'doctor', 'nurse', 'receptionist', 'security', 'manager'] },
    { id: 'activity', icon: '📋', label: 'Activity Log', path: '/activity', roles: ['admin', 'doctor', 'nurse'] },
    { id: 'patients', icon: '👤', label: 'Patients', path: '/patients', roles: ['admin', 'doctor', 'nurse'] },
    { id: 'rooms', icon: '🏥', label: 'Rooms', path: '/rooms', roles: ['admin', 'doctor', 'nurse'] },
    { id: 'admissions', icon: '📝', label: 'Admissions', path: '/admissions', roles: ['admin', 'doctor'] },
    { id: 'employees', icon: '👥', label: 'Employees', path: '/employees', roles: ['admin'] },
    { id: 'badges', icon: '🪪', label: 'Badges', path: '/badges', roles: ['admin'] },
    { id: 'shifts', icon: '⏰', label: 'Shifts', path: '/shifts', roles: ['admin'] },
];

// ============================================================================
// CHART COLORS
// ============================================================================

export const CHART_COLORS = [
    COLORS.primary[500],
    COLORS.success[500],
    COLORS.warning[500],
    COLORS.secondary[500],
    COLORS.info,
    COLORS.gray[600],
    COLORS.primary[300],
    COLORS.success[300],
];