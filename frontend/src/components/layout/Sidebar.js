import React from 'react';
import { COLORS, CSS_VARS, NAVIGATION } from '../../utils/constants';

function Sidebar({ currentView, onViewChange, userRole }) {
    // Filter navigation items based on user role
    const filteredItems = NAVIGATION.filter(item =>
        item.roles?.includes(userRole) ||
        (userRole === 'admin' && item.id !== 'login')
    );

    // Get role display name
    const getRoleDisplay = () => {
        const roleMap = {
            admin: 'Admin Panel',
            doctor: 'Doctor Portal',
            nurse: 'Nurse Portal',
            receptionist: 'Reception Portal',
            security: 'Security Portal',
            manager: 'Manager Portal'
        };
        return roleMap[userRole] || `${userRole.toUpperCase()} Portal`;
    };

    // Get access level info
    const getAccessLevel = () => {
        const levelMap = {
            admin: { label: 'Full Access', color: COLORS.success[500] },
            doctor: { label: 'Medical Records', color: COLORS.warning[500] },
            nurse: { label: 'Patient Care', color: COLORS.warning[500] },
            receptionist: { label: 'Front Desk', color: COLORS.info },
            security: { label: 'Security Access', color: COLORS.info },
            manager: { label: 'Management', color: COLORS.primary[500] }
        };
        return levelMap[userRole] || { label: 'Limited Access', color: COLORS.gray[500] };
    };

    const accessLevel = getAccessLevel();

    // Styles using CSS_VARS
    const styles = {
        nav: {
            background: CSS_VARS.white,
            borderRight: `1px solid ${CSS_VARS.divider}`,
            padding: '16px 0',
            overflowY: 'auto',
            position: 'fixed',
            top: '64px',
            left: 0,
            width: '256px',
            height: 'calc(100vh - 64px)',
            zIndex: 50,
        },
        sectionHeader: {
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.08em',
            color: CSS_VARS.ink4,
            textTransform: 'uppercase',
            padding: '12px 24px 6px',
        },
        navButton: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '10px 12px 10px 20px',
            margin: '1px 10px 1px 8px',
            borderRadius: `0 ${CSS_VARS.radius} ${CSS_VARS.radius} 0`,
            fontSize: '14px',
            fontWeight: '500',
            color: isActive ? CSS_VARS.blue : CSS_VARS.ink2,
            cursor: 'pointer',
            background: isActive ? CSS_VARS.blueL : 'transparent',
            border: 'none',
            width: 'calc(100% - 18px)',
            textAlign: 'left',
            fontFamily: 'Google Sans, sans-serif',
            transition: 'all 0.15s ease',
        }),
        icon: {
            width: '20px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        statsCard: {
            margin: '16px 16px 0',
            padding: '16px',
            background: CSS_VARS.surface,
            borderRadius: CSS_VARS.radius,
            border: `1px solid ${CSS_VARS.divider}`,
        },
        statsHeader: {
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.08em',
            color: CSS_VARS.ink4,
            textTransform: 'uppercase',
            marginBottom: '10px',
        },
        statRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
        },
        statLabel: {
            color: CSS_VARS.ink3,
            fontSize: '13px',
        },
        statValue: {
            fontWeight: '500',
        },
        statDivider: {
            borderTop: `1px solid ${CSS_VARS.divider}`,
            marginTop: '6px',
            paddingTop: '6px',
        },
    };

    return (
        <nav style={styles.nav}>
            {/* Section Header */}
            <div style={styles.sectionHeader}>
                {getRoleDisplay()}
            </div>

            {/* Navigation Items */}
            {filteredItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    style={styles.navButton(currentView === item.id)}
                    onMouseEnter={(e) => {
                        if (currentView !== item.id) {
                            e.currentTarget.style.background = CSS_VARS.surface;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (currentView !== item.id) {
                            e.currentTarget.style.background = 'transparent';
                        }
                    }}
                >
                    <span style={styles.icon}>{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}

            {/* Live Stats Card */}
            <div style={styles.statsCard}>
                <div style={styles.statsHeader}>
                    Live Stats
                </div>
                <div style={styles.statRow}>
                    <span style={styles.statLabel}>Role</span>
                    <span style={{ ...styles.statValue, color: CSS_VARS.blue }}>
                        {userRole.toUpperCase()}
                    </span>
                </div>
                <div style={{ ...styles.statRow, ...styles.statDivider }}>
                    <span style={styles.statLabel}>Access Level</span>
                    <span style={{ ...styles.statValue, color: accessLevel.color }}>
                        {accessLevel.label}
                    </span>
                </div>
            </div>
        </nav>
    );
}

export default Sidebar;