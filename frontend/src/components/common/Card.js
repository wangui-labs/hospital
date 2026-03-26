import React from 'react';
import { COLORS } from '../../utils/constants';

// ============================================================================
// CARD COMPONENT
// ============================================================================

const Card = ({
    // Variants
    variant = 'default',  // default, elevated, outlined, flat

    // Content
    children,
    title,
    subtitle,
    header,
    footer,

    // Actions
    actions,
    onAction,

    // State
    loading = false,
    error = false,
    errorMessage = 'Failed to load content',

    // Styling
    className = '',
    style = {},
    headerStyle = {},
    bodyStyle = {},
    footerStyle = {},

    // Sizing
    padding = 'md',      // sm, md, lg, none

    // Hover effects
    hoverable = false,

    // Other
    ...props
}) => {
    // ============================================================================
    // STYLE CONFIGURATIONS
    // ============================================================================

    // Variant configurations
    const variants = {
        default: {
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.gray[200]}`,
            boxShadow: 'none',
        },
        elevated: {
            backgroundColor: COLORS.white,
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        outlined: {
            backgroundColor: 'transparent',
            border: `1px solid ${COLORS.gray[300]}`,
            boxShadow: 'none',
        },
        flat: {
            backgroundColor: COLORS.gray[50],
            border: 'none',
            boxShadow: 'none',
        },
    };

    // Padding configurations
    const paddings = {
        sm: '12px',
        md: '20px',
        lg: '24px',
        none: '0',
    };

    const currentVariant = variants[variant] || variants.default;
    const currentPadding = paddings[padding] || paddings.md;

    // Card styles
    const cardStyle = {
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        ...currentVariant,
        ...(hoverable && {
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
        }),
        ...style,
    };

    // Body styles
    const bodyStyles = {
        padding: currentPadding,
        ...bodyStyle,
    };

    // Header styles
    const headerStyles = {
        padding: `${currentPadding} ${currentPadding} 0 ${currentPadding}`,
        borderBottom: variant !== 'outlined' ? `1px solid ${COLORS.gray[200]}` : 'none',
        ...headerStyle,
    };

    // Footer styles
    const footerStyles = {
        padding: `0 ${currentPadding} ${currentPadding} ${currentPadding}`,
        borderTop: variant !== 'outlined' ? `1px solid ${COLORS.gray[200]}` : 'none',
        ...footerStyle,
    };

    // Handle click for hoverable cards
    const handleClick = (e) => {
        if (hoverable && onAction) {
            onAction(e);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={cardStyle} className={`card card-${variant} ${className}`} {...props}>
                <div style={bodyStyles}>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{
                            display: 'inline-block',
                            width: '40px',
                            height: '40px',
                            border: `3px solid ${COLORS.gray[200]}`,
                            borderTop: `3px solid ${COLORS.primary[500]}`,
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        <p style={{ marginTop: '16px', color: COLORS.gray[500] }}>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={cardStyle} className={`card card-${variant} ${className}`} {...props}>
                <div style={bodyStyles}>
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: COLORS.error,
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px' }}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill={COLORS.error} />
                        </svg>
                        <p style={{ fontSize: '14px', marginBottom: '8px' }}>{errorMessage}</p>
                        {onAction && (
                            <button
                                onClick={onAction}
                                style={{
                                    marginTop: '12px',
                                    padding: '6px 12px',
                                    backgroundColor: COLORS.primary[500],
                                    color: COLORS.white,
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                }}
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={cardStyle}
            className={`card card-${variant} ${hoverable ? 'card-hoverable' : ''} ${className}`}
            onClick={handleClick}
            {...props}
        >
            {/* Custom Header */}
            {header && (
                <div style={headerStyles}>
                    {header}
                </div>
            )}

            {/* Title/Subtitle Header */}
            {!header && (title || subtitle) && (
                <div style={headerStyles}>
                    {title && (
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: COLORS.gray[800],
                            margin: 0,
                            marginBottom: subtitle ? '4px' : 0,
                        }}>
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p style={{
                            fontSize: '14px',
                            color: COLORS.gray[500],
                            margin: 0,
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Card Body */}
            <div style={bodyStyles}>
                {children}
            </div>

            {/* Card Footer */}
            {(footer || actions) && (
                <div style={footerStyles}>
                    {footer}
                    {actions && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {actions}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// CARD GRID (Grid of cards)
// ============================================================================

export const CardGrid = ({
    children,
    columns = 3,
    gap = 'md',
    className = '',
    ...props
}) => {
    const gaps = {
        sm: '12px',
        md: '20px',
        lg: '24px',
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gaps[gap],
    };

    return (
        <div className={`card-grid ${className}`} style={gridStyle} {...props}>
            {children}
        </div>
    );
};

// ============================================================================
// CARD METRIC (Metric card with large number)
// ============================================================================

export const MetricCard = ({
    title,
    value,
    change,
    icon,
    color = 'primary',
    onClick,
    ...props
}) => {
    const colors = {
        primary: COLORS.primary[500],
        success: COLORS.success[500],
        warning: COLORS.warning[500],
        danger: COLORS.error,
        info: COLORS.info,
    };

    const isPositiveChange = change && change > 0;
    const changeColor = isPositiveChange ? COLORS.success[500] : COLORS.error;
    const changeIcon = isPositiveChange ? '↑' : '↓';

    return (
        <Card
            variant="elevated"
            hoverable={!!onClick}
            onAction={onClick}
            {...props}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: '14px',
                        color: COLORS.gray[500],
                        margin: '0 0 8px 0',
                    }}>
                        {title}
                    </p>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: 600,
                        color: COLORS.gray[800],
                        margin: 0,
                    }}>
                        {value}
                    </h2>
                    {change !== undefined && (
                        <p style={{
                            fontSize: '12px',
                            color: changeColor,
                            margin: '8px 0 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            <span>{changeIcon}</span>
                            <span>{Math.abs(change)}%</span>
                            <span style={{ color: COLORS.gray[500] }}>from last period</span>
                        </p>
                    )}
                </div>
                {icon && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: colors[color],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: COLORS.white,
                    }}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
};

// ============================================================================
// CARD SECTION (Section inside card)
// ============================================================================

export const CardSection = ({
    title,
    children,
    borderTop = false,
    borderBottom = false,
    className = '',
    ...props
}) => {
    const sectionStyle = {
        padding: '16px 0',
        borderTop: borderTop ? `1px solid ${COLORS.gray[200]}` : 'none',
        borderBottom: borderBottom ? `1px solid ${COLORS.gray[200]}` : 'none',
    };

    return (
        <div className={`card-section ${className}`} style={sectionStyle} {...props}>
            {title && (
                <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: COLORS.gray[700],
                    margin: '0 0 12px 0',
                }}>
                    {title}
                </h4>
            )}
            {children}
        </div>
    );
};

// ============================================================================
// STYLES (Add to global CSS)
// ============================================================================

// Add this to your global.css file:
/*
.card-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default Card;