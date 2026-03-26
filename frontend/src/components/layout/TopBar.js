import React, { useState } from 'react';
import { CSS_VARS, COLORS } from '../../utils/constants';
import Button from '../common/Button';

function TopBar({ userId, userName, userRole, onLogout, wsConnected, onSearch }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    const getUserInitials = () => {
        if (userName) {
            return userName.substring(0, 2).toUpperCase();
        }
        return userId?.substring(0, 2).toUpperCase() || 'U';
    };

    // Fix: Use CSS_VARS for colors, not COLORS with array access
    const styles = {
        topBar: {
            background: CSS_VARS.white,
            borderBottom: `1px solid ${CSS_VARS.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            padding: '0 24px',
            height: '64px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '20px',
            fontWeight: '700',
            color: CSS_VARS.ink,
            letterSpacing: '-0.5px',
            marginRight: '32px',
        },
        logoIcon: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            background: CSS_VARS.blue,
            color: CSS_VARS.white,
            fontWeight: '700',
        },
        logoText: {
            color: CSS_VARS.blue,
        },
        searchContainer: {
            flex: 1,
            maxWidth: '480px',
            display: 'flex',
            alignItems: 'center',
            background: CSS_VARS.surface,
            border: `1px solid ${CSS_VARS.divider}`,
            borderRadius: '24px',
            padding: '0 16px',
            height: '40px',
            gap: '8px',
            transition: 'all 0.2s',
        },
        searchIcon: {
            color: CSS_VARS.ink4,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
        },
        searchInput: {
            border: 'none',
            background: 'transparent',
            fontFamily: 'Google Sans, sans-serif',
            fontSize: '14px',
            color: CSS_VARS.ink,
            outline: 'none',
            flex: 1,
        },
        rightSection: {
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        notificationBtn: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: CSS_VARS.ink3,
            fontSize: '18px',
            position: 'relative',
            transition: 'background 0.2s',
        },
        notificationDot: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: CSS_VARS.red,
            border: `2px solid ${CSS_VARS.white}`,
        },
        avatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: CSS_VARS.blue,
            color: CSS_VARS.white,
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
        },
        wsStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: wsConnected ? CSS_VARS.greenL : CSS_VARS.redL,
            fontSize: '11px',
            fontWeight: '500',
            color: wsConnected ? CSS_VARS.green : CSS_VARS.red,
        },
        wsDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: wsConnected ? CSS_VARS.green : CSS_VARS.red,
        },
    };

    return (
        <div style={styles.topBar}>
            <div style={styles.logo}>
                <div style={styles.logoIcon}>H</div>
                Hospi<span style={styles.logoText}>tal</span>
            </div>

            <div style={styles.searchContainer}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    placeholder="Search patients, rooms, staff..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.rightSection}>
                <div style={styles.wsStatus}>
                    <div style={styles.wsDot}></div>
                    <span>{wsConnected ? 'Live' : 'Reconnecting'}</span>
                </div>

                <button
                    style={styles.notificationBtn}
                    onMouseEnter={(e) => e.currentTarget.style.background = CSS_VARS.surface}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    🔔
                    <span style={styles.notificationDot}></span>
                </button>

                <div
                    style={styles.avatar}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    title={userName || userId}
                >
                    {getUserInitials()}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                >
                    Exit
                </Button>
            </div>
        </div>
    );
}

export default TopBar;