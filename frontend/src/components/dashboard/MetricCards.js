import React from 'react';
import { CSS_VARS, COLORS } from '../../utils/constants';

function MetricCards({ stats }) {
    const cards = [
        {
            icon: '■',
            iconColor: 'blue',
            label: 'Total Events',
            value: stats.totalEvents,
            delta: '+8.3% vs yesterday',
            deltaType: 'up',
            sparkline: true
        },
        {
            icon: '▲',
            iconColor: 'green',
            label: 'Active Patients',
            value: stats.activePatients,
            delta: '+4 admitted today',
            deltaType: 'up',
            sparkline: true,
            sparkColor: 'green'
        },
        {
            icon: '□',
            iconColor: 'yellow',
            label: 'Rooms Available',
            value: `${stats.availableRooms} / ${stats.totalRooms || 24}`,
            delta: `${stats.occupancyRate || 72}% occupancy`,
            deltaType: 'warn'
        },
        {
            icon: '⬆',
            iconColor: 'red',
            label: 'Access Denials',
            value: stats.accessDenials || 0,
            delta: '1 new denial',
            deltaType: 'down'
        }
    ];

    const getIconStyle = (color) => {
        const styles = {
            blue: { bg: CSS_VARS.blueL, color: CSS_VARS.blue },
            green: { bg: CSS_VARS.greenL, color: CSS_VARS.green },
            yellow: { bg: CSS_VARS.yellowL, color: CSS_VARS.yellow },
            red: { bg: CSS_VARS.redL, color: CSS_VARS.red }
        };
        return styles[color] || styles.blue;
    };

    const getDeltaStyle = (type) => {
        const styles = {
            up: { bg: CSS_VARS.greenL, color: CSS_VARS.green, icon: '↑' },
            down: { bg: CSS_VARS.redL, color: CSS_VARS.red, icon: '↓' },
            warn: { bg: CSS_VARS.yellowL, color: '#b06000', icon: '●' }
        };
        return styles[type] || styles.warn;
    };

    const getSparkColor = (color) => {
        const colors = {
            blue: { light: CSS_VARS.blueL, dark: CSS_VARS.blue },
            green: { light: CSS_VARS.greenL, dark: CSS_VARS.green }
        };
        return colors[color] || colors.blue;
    };

    // Generate random sparkline data (in real app, use actual data)
    const generateSparkData = () => {
        return Array(8).fill(0).map(() => Math.random() * 80 + 20);
    };

    const styles = {
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px',
        },
        card: {
            background: CSS_VARS.white,
            border: `1px solid ${CSS_VARS.divider}`,
            borderRadius: CSS_VARS.radius,
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
        },
        cardHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
        },
        iconBox: (bgColor) => ({
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            background: bgColor,
        }),
        menuIcon: {
            color: CSS_VARS.ink4,
            cursor: 'pointer',
            fontSize: '18px',
        },
        label: {
            fontSize: '12px',
            fontWeight: '500',
            color: CSS_VARS.ink3,
            marginBottom: '6px',
        },
        value: {
            fontSize: '28px',
            fontWeight: '700',
            color: CSS_VARS.ink,
            letterSpacing: '-1px',
            lineHeight: 1,
        },
        deltaBadge: (bg, color) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '12px',
            fontWeight: '500',
            marginTop: '8px',
            padding: '3px 8px',
            borderRadius: '12px',
            background: bg,
            color: color,
        }),
        sparkline: {
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '32px',
            marginTop: '12px',
        },
        sparkBar: (height, bgColor) => ({
            flex: 1,
            borderRadius: '2px 2px 0 0',
            background: bgColor,
            height: `${height}%`,
        }),
    };

    return (
        <div style={styles.grid}>
            {cards.map((card, idx) => {
                const iconStyle = getIconStyle(card.iconColor);
                const deltaStyle = getDeltaStyle(card.deltaType);
                const sparkData = generateSparkData();
                const sparkColors = card.sparkline ? getSparkColor(card.sparkColor || card.iconColor) : null;

                return (
                    <div key={idx} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconBox(iconStyle.bg)}>
                                <span style={{ color: iconStyle.color }}>{card.icon}</span>
                            </div>
                            <div style={styles.menuIcon}>⋯</div>
                        </div>

                        <div style={styles.label}>{card.label}</div>
                        <div style={styles.value}>{card.value}</div>

                        <div style={styles.deltaBadge(deltaStyle.bg, deltaStyle.color)}>
                            {deltaStyle.icon} {card.delta}
                        </div>

                        {card.sparkline && (
                            <div style={styles.sparkline}>
                                {sparkData.map((height, i) => (
                                    <div
                                        key={i}
                                        style={styles.sparkBar(
                                            height,
                                            i === sparkData.length - 1 ? sparkColors.dark : sparkColors.light
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default MetricCards;