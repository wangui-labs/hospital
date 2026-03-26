import React from 'react';
import { COLORS } from '../../utils/constants';
import LoadingSpinner from './LoadingSpinner';

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

const Button = ({
    // Variants
    variant = 'primary',  // primary, secondary, outline, ghost, danger, success, warning
    size = 'md',          // sm, md, lg

    // Content
    children,
    iconLeft,
    iconRight,

    // State
    loading = false,
    disabled = false,
    fullWidth = false,

    // Actions
    onClick,
    type = 'button',

    // Styling
    className = '',
    style = {},

    // Accessibility
    ariaLabel,

    // Other
    ...props
}) => {
    // ============================================================================
    // STYLE CONFIGURATIONS
    // ============================================================================

    // Size configurations
    const sizes = {
        sm: {
            padding: '6px 12px',
            fontSize: '12px',
            height: '32px',
        },
        md: {
            padding: '8px 16px',
            fontSize: '14px',
            height: '40px',
        },
        lg: {
            padding: '10px 20px',
            fontSize: '16px',
            height: '48px',
        },
    };

    // Variant configurations
    const variants = {
        primary: {
            background: COLORS.primary[500],
            color: COLORS.white,
            border: 'none',
            hoverBackground: COLORS.primary[600],
            activeBackground: COLORS.primary[700],
            disabledBackground: COLORS.primary[300],
        },
        secondary: {
            background: COLORS.secondary[500],
            color: COLORS.white,
            border: 'none',
            hoverBackground: COLORS.secondary[600],
            activeBackground: COLORS.secondary[700],
            disabledBackground: COLORS.secondary[300],
        },
        success: {
            background: COLORS.success[500],
            color: COLORS.white,
            border: 'none',
            hoverBackground: COLORS.success[600],
            activeBackground: COLORS.success[700],
            disabledBackground: COLORS.success[300],
        },
        warning: {
            background: COLORS.warning[500],
            color: COLORS.white,
            border: 'none',
            hoverBackground: COLORS.warning[600],
            activeBackground: COLORS.warning[700],
            disabledBackground: COLORS.warning[300],
        },
        danger: {
            background: COLORS.error,
            color: COLORS.white,
            border: 'none',
            hoverBackground: COLORS.secondary[600],
            activeBackground: COLORS.secondary[700],
            disabledBackground: COLORS.secondary[300],
        },
        outline: {
            background: 'transparent',
            color: COLORS.primary[500],
            border: `1px solid ${COLORS.primary[500]}`,
            hoverBackground: COLORS.primary[50],
            activeBackground: COLORS.primary[100],
            disabledBackground: 'transparent',
            disabledColor: COLORS.gray[400],
            disabledBorder: `1px solid ${COLORS.gray[300]}`,
        },
        ghost: {
            background: 'transparent',
            color: COLORS.gray[700],
            border: 'none',
            hoverBackground: COLORS.gray[100],
            activeBackground: COLORS.gray[200],
            disabledBackground: 'transparent',
            disabledColor: COLORS.gray[400],
        },
    };

    const currentVariant = variants[variant] || variants.primary;
    const currentSize = sizes[size] || sizes.md;

    // Base button styles
    const buttonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        height: currentSize.height,
        fontFamily: 'inherit',
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...currentVariant,
        ...style,
    };

    // Override styles for disabled state
    if (disabled || loading) {
        buttonStyle.cursor = 'not-allowed';
        buttonStyle.opacity = 0.6;
        if (variant === 'outline') {
            buttonStyle.color = currentVariant.disabledColor;
            buttonStyle.border = currentVariant.disabledBorder;
        }
        if (variant === 'ghost') {
            buttonStyle.color = currentVariant.disabledColor;
        }
    }

    // Handle click
    const handleClick = (e) => {
        if (!disabled && !loading && onClick) {
            onClick(e);
        }
    };

    // Loading spinner size
    const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm';
    const spinnerColor = variant === 'outline' || variant === 'ghost' ? 'primary' : 'white';

    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${className}`}
            style={buttonStyle}
            onClick={handleClick}
            disabled={disabled || loading}
            aria-label={ariaLabel || (typeof children === 'string' ? children : 'button')}
            aria-busy={loading}
            {...props}
        >
            {/* Left Icon */}
            {iconLeft && !loading && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {iconLeft}
                </span>
            )}

            {/* Loading Spinner */}
            {loading && (
                <LoadingSpinner size={spinnerSize} color={spinnerColor} />
            )}

            {/* Button Text */}
            {children && (
                <span>{children}</span>
            )}

            {/* Right Icon */}
            {iconRight && !loading && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {iconRight}
                </span>
            )}
        </button>
    );
};

// ============================================================================
// ICON BUTTON (Round button with only icon)
// ============================================================================

export const IconButton = ({
    icon,
    variant = 'ghost',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    className = '',
    ariaLabel,
    ...props
}) => {
    const sizes = {
        sm: { width: '32px', height: '32px', iconSize: '16px' },
        md: { width: '40px', height: '40px', iconSize: '20px' },
        lg: { width: '48px', height: '48px', iconSize: '24px' },
    };

    const currentSize = sizes[size] || sizes.md;

    const variants = {
        primary: { background: COLORS.primary[500], color: COLORS.white, hoverBackground: COLORS.primary[600] },
        secondary: { background: COLORS.secondary[500], color: COLORS.white, hoverBackground: COLORS.secondary[600] },
        ghost: { background: 'transparent', color: COLORS.gray[600], hoverBackground: COLORS.gray[100] },
        outline: { background: 'transparent', color: COLORS.primary[500], border: `1px solid ${COLORS.primary[500]}`, hoverBackground: COLORS.primary[50] },
    };

    const currentVariant = variants[variant] || variants.ghost;

    const buttonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: currentSize.width,
        height: currentSize.height,
        borderRadius: '50%',
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        ...currentVariant,
    };

    const handleClick = (e) => {
        if (!disabled && !loading && onClick) {
            onClick(e);
        }
    };

    return (
        <button
            className={`icon-btn ${className}`}
            style={buttonStyle}
            onClick={handleClick}
            disabled={disabled || loading}
            aria-label={ariaLabel || 'icon button'}
            {...props}
        >
            {loading ? (
                <LoadingSpinner size={size === 'sm' ? 'sm' : 'sm'} color={variant === 'primary' ? 'white' : 'primary'} />
            ) : (
                <span style={{ fontSize: currentSize.iconSize, display: 'inline-flex' }}>
                    {icon}
                </span>
            )}
        </button>
    );
};

// ============================================================================
// BUTTON GROUP (Group of buttons)
// ============================================================================

export const ButtonGroup = ({
    children,
    orientation = 'horizontal', // horizontal, vertical
    spacing = 'sm',
    className = '',
    ...props
}) => {
    const spacingMap = {
        sm: '8px',
        md: '12px',
        lg: '16px',
    };

    const groupStyle = {
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        gap: spacingMap[spacing],
    };

    return (
        <div className={`btn-group ${className}`} style={groupStyle} {...props}>
            {children}
        </div>
    );
};

// ============================================================================
// BUTTON WITH CONFIRM (Button that requires confirmation)
// ============================================================================

export const ConfirmButton = ({
    onConfirm,
    confirmMessage = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    children,
    ...buttonProps
}) => {
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleClick = () => {
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        onConfirm();
        setShowConfirm(false);
    };

    const handleCancel = () => {
        setShowConfirm(false);
    };

    if (showConfirm) {
        return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: COLORS.gray[600] }}>{confirmMessage}</span>
                <Button size="sm" variant="danger" onClick={handleConfirm}>
                    {confirmText}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                    {cancelText}
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={handleClick} {...buttonProps}>
            {children}
        </Button>
    );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default Button;