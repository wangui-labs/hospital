// ============================================================================
// DATE & TIME FORMATTERS
// ============================================================================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'full', 'time', 'datetime'
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return '—';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    const options = {
        short: { year: 'numeric', month: 'numeric', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    };

    return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Format time from ISO string or time string
 * @param {string|Date} time - Time to format
 * @param {boolean} withSeconds - Include seconds
 */
export const formatTime = (time, withSeconds = false) => {
    if (!time) return '—';

    const d = new Date(time);
    if (isNaN(d.getTime())) return 'Invalid time';

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        ...(withSeconds && { second: '2-digit' }),
    };

    return d.toLocaleTimeString('en-US', options);
};

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 * @param {string|Date} date - Date to format relative to now
 */
export const formatRelativeTime = (date) => {
    if (!date) return '—';

    try {
        const now = new Date();
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid date';

        const diffMs = now - d;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 10) return 'just now';
        if (diffSec < 60) return `${diffSec} seconds ago`;
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (err) {
        console.error('Error formatting relative time:', err);
        return '—';
    }
};

/**
 * Format shift duration
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 */
export const formatShiftDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '—';

    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffHour = diffMs / (1000 * 60 * 60);

        if (diffHour < 0) return 'Invalid';
        if (diffHour < 1) return `${Math.round(diffHour * 60)} min`;
        if (diffHour === 1) return '1 hour';
        if (diffHour < 24) return `${Math.round(diffHour)} hours`;

        return `${Math.round(diffHour / 24)} days`;
    } catch (err) {
        return '—';
    }
};

// ============================================================================
// STATUS & BADGE FORMATTERS
// ============================================================================

/**
 * Get room status styling
 * @param {string} status - Room status value
 */
export const getRoomStatusStyle = (status) => {
    const styles = {
        available: { color: '#34A853', bg: '#E6F4EA', label: 'Available' },
        occupied: { color: '#EA4335', bg: '#FCE8E6', label: 'Occupied' },
        cleaning: { color: '#F9AB00', bg: '#FEF7E0', label: 'Cleaning' },
        maintenance: { color: '#5F6368', bg: '#F1F3F4', label: 'Maintenance' },
    };
    return styles[status] || { color: '#5F6368', bg: '#F1F3F4', label: status };
};

/**
 * Get shift type details
 * @param {string} shiftType - Shift type value
 */
export const getShiftDetails = (shiftType) => {
    const types = {
        morning: { label: 'Morning', icon: '🌅', time: '06:00 - 14:00' },
        afternoon: { label: 'Afternoon', icon: '☀️', time: '14:00 - 22:00' },
        night: { label: 'Night', icon: '🌙', time: '22:00 - 06:00' },
        oncall: { label: 'On Call', icon: '📞', time: '24/7' },
    };
    return types[shiftType] || { label: shiftType, icon: '⏰', time: '—' };
};

/**
 * Get access level styling
 * @param {string} level - Access level value
 */
export const getAccessLevelStyle = (level) => {
    const levels = {
        basic: { color: '#5F6368', label: 'Basic', level: 1 },
        standard: { color: '#4285F4', label: 'Standard', level: 2 },
        elevated: { color: '#F9AB00', label: 'Elevated', level: 3 },
        admin: { color: '#EA4335', label: 'Admin', level: 4 },
    };
    return levels[level] || { color: '#5F6368', label: level, level: 0 };
};

/**
 * Get user role details
 * @param {string} role - User role value
 */
export const getUserRoleDetails = (role) => {
    const roles = {
        admin: { label: 'Administrator', icon: '👑' },
        doctor: { label: 'Doctor', icon: '👨‍⚕️' },
        nurse: { label: 'Nurse', icon: '👩‍⚕️' },
        receptionist: { label: 'Receptionist', icon: '📋' },
        security: { label: 'Security', icon: '🛡️' },
        manager: { label: 'Manager', icon: '📊' },
    };
    return roles[role] || { label: role, icon: '👤' };
};

/**
 * Get admission priority styling
 * @param {string} priority - Priority value
 */
export const getPriorityStyle = (priority) => {
    const priorities = {
        routine: { color: '#4285F4', label: 'Routine', icon: '🟢' },
        urgent: { color: '#F9AB00', label: 'Urgent', icon: '🟡' },
        emergency: { color: '#EA4335', label: 'Emergency', icon: '🔴' },
    };
    return priorities[priority] || { color: '#5F6368', label: priority, icon: '⚪' };
};

/**
 * Get severity styling
 * @param {string} severity - Severity value
 */
export const getSeverityStyle = (severity) => {
    const severities = {
        info: { color: '#4285F4', label: 'Info', icon: 'ℹ️' },
        warning: { color: '#F9AB00', label: 'Warning', icon: '⚠️' },
        error: { color: '#EA4335', label: 'Error', icon: '❌' },
        critical: { color: '#EA4335', label: 'Critical', icon: '🔥' },
    };
    return severities[severity] || { color: '#5F6368', label: severity, icon: '📌' };
};

// ============================================================================
// NUMBER & CURRENCY FORMATTERS
// ============================================================================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 */
export const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined) return '—';
    if (isNaN(num)) return 'Invalid';

    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '—';
    if (isNaN(value)) return 'Invalid';

    return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// TEXT & STRING FORMATTERS
// ============================================================================

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Truncate text to max length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default '...')
 */
export const truncate = (str, length = 50, suffix = '...') => {
    if (!str) return '';
    if (str.length <= length) return str;

    return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 */
export const formatPhone = (phone) => {
    if (!phone) return '—';

    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    return phone;
};

/**
 * Format MRN (Medical Record Number)
 * @param {string} mrn - MRN to format
 */
export const formatMRN = (mrn) => {
    if (!mrn) return '—';
    return mrn.toUpperCase();
};

/**
 * Format badge number
 * @param {string} badgeNumber - Badge number to format
 */
export const formatBadgeNumber = (badgeNumber) => {
    if (!badgeNumber) return '—';
    return badgeNumber.toUpperCase();
};

/**
 * Format room number
 * @param {string} roomNumber - Room number to format
 */
export const formatRoomNumber = (roomNumber) => {
    if (!roomNumber) return '—';
    return roomNumber.toUpperCase();
};

// ============================================================================
// TABLE & LIST HELPERS
// ============================================================================

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {boolean} ascending - Sort direction
 */
export const sortByKey = (array, key, ascending = true) => {
    if (!array || !Array.isArray(array)) return [];

    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
};

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} keys - Keys to search in
 */
export const filterBySearch = (array, searchTerm, keys) => {
    if (!array || !searchTerm) return array;

    const term = searchTerm.toLowerCase();
    return array.filter(item =>
        keys.some(key => {
            const value = item[key];
            return value && value.toString().toLowerCase().includes(term);
        })
    );
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Current page (1-indexed)
 * @param {number} perPage - Items per page
 */
export const paginate = (array, page = 1, perPage = 10) => {
    if (!array || !Array.isArray(array)) return { items: [], total: 0, pages: 0 };

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const items = array.slice(start, end);
    const total = array.length;
    const pages = Math.ceil(total / perPage);

    return { items, total, pages, page, perPage };
};

// ============================================================================
// DEFAULT EXPORT (for convenience)
// ============================================================================

export default {
    // Date formatters
    formatDate,
    formatTime,
    formatRelativeTime,
    formatShiftDuration,

    // Status formatters
    getRoomStatusStyle,
    getShiftDetails,
    getAccessLevelStyle,
    getUserRoleDetails,
    getPriorityStyle,
    getSeverityStyle,

    // Number formatters
    formatNumber,
    formatPercentage,

    // Text formatters
    capitalize,
    truncate,
    formatPhone,
    formatMRN,
    formatBadgeNumber,
    formatRoomNumber,

    // Table helpers
    sortByKey,
    filterBySearch,
    paginate,
};