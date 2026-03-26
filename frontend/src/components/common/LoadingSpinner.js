import React from 'react';
import { COLORS } from '../../utils/constants';

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner = ({
    size = 'md',
    color = 'primary',
    fullScreen = false,
    message = '',
    overlay = false,
    className = ''
}) => {
    // Size configurations
    const sizes = {
        sm: { width: '24px', height: '24px', borderWidth: '2px' },
        md: { width: '40px', height: '40px', borderWidth: '3px' },
        lg: { width: '56px', height: '56px', borderWidth: '4px' },
        xl: { width: '80px', height: '80px', borderWidth: '5px' },
    };

    // Color configurations
    const colors = {
        primary: COLORS.primary[500],
        secondary: COLORS.secondary[500],
        success: COLORS.success[500],
        warning: COLORS.warning[500],
        danger: COLORS.error,
        info: COLORS.info,
        white: COLORS.white,
        gray: COLORS.gray[500],
    };

    const spinnerSize = sizes[size] || sizes.md;
    const spinnerColor = colors[color] || colors.primary;

    // Spinner styles
    const spinnerStyle = {
        display: 'inline-block',
        width: spinnerSize.width,
        height: spinnerSize.height,
        border: `${spinnerSize.borderWidth} solid ${spinnerColor}20`,
        borderTop: `${spinnerSize.borderWidth} solid ${spinnerColor}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    };

    // Full screen container styles
    const fullScreenStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        zIndex: 9999,
    };

    // Overlay container styles
    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${COLORS.gray[800]}80`,
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
    };

    // Normal container styles
    const normalStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px',
    };

    // Determine container style
    let containerStyle = normalStyle;
    if (fullScreen) {
        containerStyle = fullScreenStyle;
    } else if (overlay) {
        containerStyle = overlayStyle;
    }

    return (
        <>
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .spinner-dots {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: center;
          }
          
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 1.4s ease-in-out infinite;
          }
          
          .dot:nth-child(1) { animation-delay: 0s; }
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
        `}
            </style>

            <div style={containerStyle} className={className}>
                <div style={spinnerStyle} />
                {message && (
                    <div style={{
                        marginTop: '12px',
                        color: fullScreen ? COLORS.gray[700] : (overlay ? COLORS.white : COLORS.gray[600]),
                        fontSize: size === 'sm' ? '12px' : '14px',
                        fontWeight: 500,
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </>
    );
};

// ============================================================================
// DOT LOADER (Alternative Loading Animation)
// ============================================================================

export const DotLoader = ({
    size = 'md',
    color = 'primary',
    message = '',
    className = ''
}) => {
    const sizes = {
        sm: { width: '6px', height: '6px', gap: '6px' },
        md: { width: '8px', height: '8px', gap: '8px' },
        lg: { width: '10px', height: '10px', gap: '10px' },
    };

    const colors = {
        primary: COLORS.primary[500],
        secondary: COLORS.secondary[500],
        success: COLORS.success[500],
        warning: COLORS.warning[500],
        danger: COLORS.error,
        info: COLORS.info,
        white: COLORS.white,
        gray: COLORS.gray[500],
    };

    const dotSize = sizes[size] || sizes.md;
    const dotColor = colors[color] || colors.primary;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }} className={className}>
            <div className="spinner-dots" style={{ gap: dotSize.gap }}>
                <div className="dot" style={{ backgroundColor: dotColor, width: dotSize.width, height: dotSize.height }} />
                <div className="dot" style={{ backgroundColor: dotColor, width: dotSize.width, height: dotSize.height }} />
                <div className="dot" style={{ backgroundColor: dotColor, width: dotSize.width, height: dotSize.height }} />
            </div>
            {message && (
                <div style={{ fontSize: size === 'sm' ? '12px' : '14px', color: COLORS.gray[600] }}>
                    {message}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// SKELETON LOADER (For Content Placeholders)
// ============================================================================

export const SkeletonLoader = ({
    type = 'text',
    count = 1,
    width = '100%',
    height = '20px',
    className = '',
    style = {}
}) => {
    const skeletons = [];

    const skeletonStyle = {
        ...style,
        backgroundColor: COLORS.gray[200],
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite',
    };

    // Text skeleton
    if (type === 'text') {
        for (let i = 0; i < count; i++) {
            skeletons.push(
                <div
                    key={i}
                    style={{
                        ...skeletonStyle,
                        width: width,
                        height: height,
                        marginBottom: i < count - 1 ? '8px' : 0,
                    }}
                />
            );
        }
    }

    // Card skeleton
    if (type === 'card') {
        for (let i = 0; i < count; i++) {
            skeletons.push(
                <div
                    key={i}
                    style={{
                        ...skeletonStyle,
                        padding: '16px',
                        backgroundColor: COLORS.white,
                        border: `1px solid ${COLORS.gray[200]}`,
                        borderRadius: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div style={{ ...skeletonStyle, width: '60%', height: '24px', marginBottom: '12px' }} />
                    <div style={{ ...skeletonStyle, width: '80%', height: '16px', marginBottom: '8px' }} />
                    <div style={{ ...skeletonStyle, width: '40%', height: '16px' }} />
                </div>
            );
        }
    }

    // Table row skeleton
    if (type === 'table-row') {
        for (let i = 0; i < count; i++) {
            skeletons.push(
                <div
                    key={i}
                    style={{
                        ...skeletonStyle,
                        display: 'flex',
                        gap: '16px',
                        padding: '12px 0',
                        borderBottom: `1px solid ${COLORS.gray[200]}`,
                    }}
                >
                    <div style={{ ...skeletonStyle, width: '20%', height: '20px' }} />
                    <div style={{ ...skeletonStyle, width: '25%', height: '20px' }} />
                    <div style={{ ...skeletonStyle, width: '30%', height: '20px' }} />
                    <div style={{ ...skeletonStyle, width: '15%', height: '20px' }} />
                </div>
            );
        }
    }

    return <div className={className}>{skeletons}</div>;
};

// ============================================================================
// PAGE LOADER (Full Page Loading)
// ============================================================================

export const PageLoader = ({ message = 'Loading...' }) => {
    return (
        <LoadingSpinner
            size="lg"
            color="primary"
            fullScreen={true}
            message={message}
        />
    );
};

// ============================================================================
// BUTTON LOADER (Inline Loading for Buttons)
// ============================================================================

export const ButtonLoader = ({ size = 'sm', color = 'white' }) => {
    return (
        <LoadingSpinner
            size={size}
            color={color}
            message=""
        />
    );
};

// ============================================================================
// SECTION LOADER (Loading for Content Sections)
// ============================================================================

export const SectionLoader = ({ message = 'Loading content...', height = '200px' }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: height,
            backgroundColor: COLORS.gray[50],
            borderRadius: '12px',
        }}>
            <LoadingSpinner size="md" color="primary" message={message} />
        </div>
    );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default LoadingSpinner;