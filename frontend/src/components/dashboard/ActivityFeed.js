import React from 'react';
import { CSS_VARS } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';

function ActivityFeed({ activities, loading, filter, onFilterChange }) {
    const filters = ['All', 'Auth', 'Patients', 'Badges', 'Rooms', 'Alerts', 'Shifts', 'System'];

    // Category color mapping
    const getCategoryColor = (category) => {
        const colors = {
            auth: CSS_VARS.blue,
            patient: CSS_VARS.green,
            admission: CSS_VARS.green,
            badge: CSS_VARS.yellow,
            room: CSS_VARS.blue,
            alert: CSS_VARS.red,
            record: CSS_VARS.green,
            shift: CSS_VARS.blue,
            system: CSS_VARS.gray,
            security: CSS_VARS.red,
            scheduling: CSS_VARS.blue,
            facilities: CSS_VARS.yellow,
        };
        return colors[category?.toLowerCase()] || CSS_VARS.gray;
    };

    // Badge background color mapping
    const getBadgeStyle = (category) => {
        const styles = {
            auth: { bg: CSS_VARS.blueL, color: CSS_VARS.blue },
            patient: { bg: CSS_VARS.greenL, color: CSS_VARS.green },
            admission: { bg: CSS_VARS.greenL, color: CSS_VARS.green },
            badge: { bg: CSS_VARS.yellowL, color: '#b06000' },
            room: { bg: CSS_VARS.blueL, color: CSS_VARS.blue },
            alert: { bg: CSS_VARS.redL, color: CSS_VARS.red },
            record: { bg: CSS_VARS.greenL, color: CSS_VARS.green },
            shift: { bg: CSS_VARS.blueL, color: CSS_VARS.blue },
            system: { bg: CSS_VARS.surface, color: CSS_VARS.ink3 },
            security: { bg: CSS_VARS.redL, color: CSS_VARS.red },
            scheduling: { bg: CSS_VARS.blueL, color: CSS_VARS.blue },
            facilities: { bg: CSS_VARS.yellowL, color: '#b06000' },
        };
        return styles[category?.toLowerCase()] || { bg: CSS_VARS.surface, color: CSS_VARS.ink3 };
    };

    const styles = {
        container: {
            background: CSS_VARS.white,
            border: `1px solid ${CSS_VARS.divider}`,
            borderRadius: CSS_VARS.radius,
            overflow: 'hidden',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
        },
        title: {
            fontSize: '15px',
            fontWeight: '700',
            color: CSS_VARS.ink,
        },
        subtitle: {
            fontSize: '12px',
            color: CSS_VARS.ink4,
        },
        filterBar: {
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '12px',
        },
        filterButton: (isActive) => ({
            fontSize: '12px',
            fontWeight: '500',
            padding: '4px 12px',
            borderRadius: '12px',
            border: `1px solid ${isActive ? CSS_VARS.blueM : CSS_VARS.divider}`,
            color: isActive ? CSS_VARS.blue : CSS_VARS.ink3,
            background: isActive ? CSS_VARS.blueL : CSS_VARS.white,
            cursor: 'pointer',
            fontFamily: 'Google Sans, sans-serif',
            transition: 'all 0.15s',
        }),
        loadingContainer: {
            padding: '40px',
            textAlign: 'center',
            color: CSS_VARS.ink4,
        },
        emptyContainer: {
            padding: '40px',
            textAlign: 'center',
            color: CSS_VARS.ink4,
        },
        activityItem: (isHighlighted, isLast) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 20px',
            borderBottom: isLast ? 'none' : `1px solid ${CSS_VARS.divider}`,
            cursor: 'pointer',
            transition: 'background 0.12s',
            ...(isHighlighted && {
                background: CSS_VARS.blueL,
                borderLeft: `3px solid ${CSS_VARS.blue}`,
            }),
        }),
        dot: (color) => ({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            flexShrink: 0,
            background: color,
        }),
        content: {
            flex: 1,
            minWidth: 0,
        },
        actionText: {
            fontSize: '13px',
            color: CSS_VARS.ink2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        userName: {
            fontWeight: '500',
            color: CSS_VARS.ink,
        },
        metadata: {
            fontSize: '12px',
            color: CSS_VARS.ink4,
            marginTop: '2px',
        },
        badge: (bg, color) => ({
            fontSize: '11px',
            fontWeight: '500',
            padding: '3px 10px',
            borderRadius: '10px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            background: bg,
            color: color,
        }),
        timestamp: {
            fontSize: '11px',
            color: CSS_VARS.ink4,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            fontFamily: 'Google Sans Mono, monospace',
        },
    };

    const handleFilterClick = (filterValue) => {
        const newFilter = filterValue === 'all' ? '' : filterValue.toLowerCase();
        onFilterChange(newFilter);
    };

    const isHighlighted = (activity, index) => {
        return index < 2 && !filter; // Highlight first 2 only when no filter
    };

    // Safe format function with fallback
    const safeFormatTime = (timestamp) => {
        try {
            if (!timestamp) return '—';
            return formatRelativeTime(timestamp);
        } catch (err) {
            console.error('Error formatting time:', err);
            return '—';
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.title}>Live Events</div>
                <span style={styles.subtitle}>50 max · newest first</span>
            </div>

            {/* Filters */}
            <div style={styles.filterBar}>
                {filters.map(f => {
                    const filterValue = f.toLowerCase();
                    const isActive = filter === '' ? filterValue === 'all' : filter === filterValue;
                    return (
                        <button
                            key={f}
                            onClick={() => handleFilterClick(filterValue)}
                            style={styles.filterButton(isActive)}
                        >
                            {f}
                        </button>
                    );
                })}
            </div>

            {/* Activity List */}
            <div style={styles.container}>
                {loading ? (
                    <div style={styles.loadingContainer}>
                        Loading activities...
                    </div>
                ) : !activities || activities.length === 0 ? (
                    <div style={styles.emptyContainer}>
                        No activities found
                    </div>
                ) : (
                    activities.map((activity, idx) => {
                        const isLast = idx === activities.length - 1;
                        const highlighted = isHighlighted(activity, idx);
                        const dotColor = getCategoryColor(activity.category);
                        const badgeStyle = getBadgeStyle(activity.category);

                        const userName = activity.username || activity.user_id || 'System';

                        let metadataDisplay = null;
                        if (activity.metadata) {
                            if (typeof activity.metadata === 'object') {
                                metadataDisplay = JSON.stringify(activity.metadata).slice(0, 60);
                            } else {
                                metadataDisplay = activity.metadata;
                            }
                        }

                        return (
                            <div
                                key={activity.id || idx}
                                style={styles.activityItem(highlighted, isLast)}
                                onMouseEnter={(e) => {
                                    if (!highlighted) {
                                        e.currentTarget.style.background = CSS_VARS.surface;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!highlighted) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={styles.dot(dotColor)}></div>

                                <div style={styles.content}>
                                    <div style={styles.actionText}>
                                        <span style={styles.userName}>{userName}</span>{' '}
                                        {activity.action || 'Unknown action'}
                                    </div>
                                    {metadataDisplay && (
                                        <div style={styles.metadata}>
                                            {metadataDisplay}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.badge(badgeStyle.bg, badgeStyle.color)}>
                                    {(activity.category || 'INFO').toUpperCase()}
                                </div>

                                <div style={styles.timestamp}>
                                    {safeFormatTime(activity.created_at)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default ActivityFeed;