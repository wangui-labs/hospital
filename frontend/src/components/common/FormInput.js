import React, { useState, useRef, useEffect } from 'react';
import { COLORS } from '../../utils/constants';

// ============================================================================
// FORM INPUT COMPONENT (Google Material Design Style)
// ============================================================================

const FormInput = ({
    // Basic props
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder = '',

    // Validation
    required = false,
    error,
    helperText,

    // Styling
    fullWidth = true,
    disabled = false,
    readOnly = false,

    // Icons
    icon,
    iconPosition = 'left',

    // Size
    size = 'md', // sm, md, lg

    // Character count
    showCharCount = false,
    maxLength,

    // Other
    className = '',
    style = {},
    onBlur,
    onFocus,
    ...props
}) => {
    // ============================================================================
    // STATE
    // ============================================================================

    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputRef = useRef(null);

    // ============================================================================
    // EFFECTS
    // ============================================================================

    useEffect(() => {
        setHasValue(!!value);
    }, [value]);

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    const handleChange = (e) => {
        if (onChange) onChange(e);
        setHasValue(!!e.target.value);
    };

    // ============================================================================
    // STYLES
    // ============================================================================

    // Size configurations
    const sizes = {
        sm: {
            padding: '8px 12px',
            fontSize: '13px',
            labelFontSize: '12px',
            labelTop: '8px',
            labelFocusedTop: '-8px',
        },
        md: {
            padding: '12px 16px',
            fontSize: '14px',
            labelFontSize: '14px',
            labelTop: '12px',
            labelFocusedTop: '-8px',
        },
        lg: {
            padding: '16px 20px',
            fontSize: '16px',
            labelFontSize: '16px',
            labelTop: '16px',
            labelFocusedTop: '-10px',
        },
    };

    const currentSize = sizes[size] || sizes.md;

    // Colors based on state
    const getBorderColor = () => {
        if (error) return COLORS.error;
        if (isFocused) return COLORS.primary[500];
        return COLORS.gray[300];
    };

    const getLabelColor = () => {
        if (error) return COLORS.error;
        if (isFocused) return COLORS.primary[500];
        return COLORS.gray[500];
    };

    // Container styles
    const containerStyle = {
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '20px',
        ...style,
    };

    // Input wrapper styles
    const wrapperStyle = {
        position: 'relative',
        width: '100%',
    };

    // Input styles
    const inputStyle = {
        width: '100%',
        padding: currentSize.padding,
        paddingLeft: icon && iconPosition === 'left' ? '40px' : currentSize.padding,
        paddingRight: icon && iconPosition === 'right' ? '40px' : currentSize.padding,
        fontSize: currentSize.fontSize,
        fontFamily: 'inherit',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '4px',
        backgroundColor: disabled ? COLORS.gray[50] : COLORS.white,
        color: disabled ? COLORS.gray[500] : COLORS.gray[800],
        outline: 'none',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'text',
        boxShadow: isFocused && !error ? `0 0 0 2px ${COLORS.primary[100]}` : 'none',
    };

    // Label styles (floating)
    const labelStyle = {
        position: 'absolute',
        left: icon && iconPosition === 'left' ? '40px' : '12px',
        top: isFocused || hasValue ? currentSize.labelFocusedTop : currentSize.labelTop,
        fontSize: isFocused || hasValue ? currentSize.labelFontSize : currentSize.fontSize,
        fontWeight: 400,
        color: getLabelColor(),
        backgroundColor: COLORS.white,
        padding: '0 4px',
        transition: 'all 0.2s ease',
        pointerEvents: 'none',
        zIndex: 1,
    };

    // Icon styles
    const iconStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [iconPosition]: '12px',
        color: error ? COLORS.error : (isFocused ? COLORS.primary[500] : COLORS.gray[400]),
        fontSize: currentSize.fontSize === '13px' ? '16px' : currentSize.fontSize === '14px' ? '18px' : '20px',
        transition: 'color 0.2s ease',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
    };

    // Helper text styles
    const helperStyle = {
        marginTop: '4px',
        fontSize: '12px',
        color: error ? COLORS.error : COLORS.gray[500],
    };

    // Character count styles
    const charCountStyle = {
        position: 'absolute',
        bottom: '-20px',
        right: '0',
        fontSize: '11px',
        color: COLORS.gray[400],
    };

    return (
        <div style={containerStyle} className={`form-input-container ${className}`}>
            <div style={wrapperStyle}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={name}
                        style={labelStyle}
                        onClick={() => inputRef.current?.focus()}
                    >
                        {label}
                        {required && <span style={{ color: COLORS.error, marginLeft: '2px' }}>*</span>}
                    </label>
                )}

                {/* Icon */}
                {icon && (
                    <div style={iconStyle}>
                        {icon}
                    </div>
                )}

                {/* Input */}
                <input
                    ref={inputRef}
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={isFocused ? placeholder : ''}
                    disabled={disabled}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    style={inputStyle}
                    {...props}
                />

                {/* Character Count */}
                {showCharCount && maxLength && (
                    <div style={charCountStyle}>
                        {value?.length || 0}/{maxLength}
                    </div>
                )}
            </div>

            {/* Helper Text / Error */}
            {(helperText || error) && (
                <div style={helperStyle}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export const TextArea = ({
    label,
    name,
    value,
    onChange,
    rows = 4,
    placeholder = '',
    required = false,
    error,
    helperText,
    fullWidth = true,
    disabled = false,
    showCharCount = false,
    maxLength,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        setHasValue(!!value);
    }, [value]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleChange = (e) => {
        if (onChange) onChange(e);
        setHasValue(!!e.target.value);
    };

    const getBorderColor = () => {
        if (error) return COLORS.error;
        if (isFocused) return COLORS.primary[500];
        return COLORS.gray[300];
    };

    const getLabelColor = () => {
        if (error) return COLORS.error;
        if (isFocused) return COLORS.primary[500];
        return COLORS.gray[500];
    };

    const containerStyle = {
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '20px',
    };

    const textareaStyle = {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        fontFamily: 'inherit',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '4px',
        backgroundColor: disabled ? COLORS.gray[50] : COLORS.white,
        color: disabled ? COLORS.gray[500] : COLORS.gray[800],
        outline: 'none',
        resize: 'vertical',
        transition: 'all 0.2s ease',
        boxShadow: isFocused && !error ? `0 0 0 2px ${COLORS.primary[100]}` : 'none',
    };

    const labelStyle = {
        position: 'absolute',
        left: '12px',
        top: isFocused || hasValue ? '-8px' : '12px',
        fontSize: isFocused || hasValue ? '12px' : '14px',
        fontWeight: 400,
        color: getLabelColor(),
        backgroundColor: COLORS.white,
        padding: '0 4px',
        transition: 'all 0.2s ease',
        pointerEvents: 'none',
        zIndex: 1,
    };

    const helperStyle = {
        marginTop: '4px',
        fontSize: '12px',
        color: error ? COLORS.error : COLORS.gray[500],
    };

    return (
        <div style={containerStyle} className={className}>
            {label && (
                <label style={labelStyle}>
                    {label}
                    {required && <span style={{ color: COLORS.error, marginLeft: '2px' }}>*</span>}
                </label>
            )}

            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={isFocused ? placeholder : ''}
                rows={rows}
                disabled={disabled}
                maxLength={maxLength}
                style={textareaStyle}
                {...props}
            />

            {(helperText || error) && (
                <div style={helperStyle}>
                    {error || helperText}
                </div>
            )}

            {showCharCount && maxLength && (
                <div style={{ marginTop: '4px', fontSize: '11px', textAlign: 'right', color: COLORS.gray[400] }}>
                    {value?.length || 0}/{maxLength}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    required = false,
    error,
    helperText,
    fullWidth = true,
    disabled = false,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
        setHasValue(!!value);
    }, [value]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleChange = (e) => {
        if (onChange) onChange(e);
        setHasValue(!!e.target.value);
    };

    const getBorderColor = () => {
        if (error) return COLORS.error;
        if (isFocused) return COLORS.primary[500];
        return COLORS.gray[300];
    };

    const getLabelColor = () => {
        if (error) return COLORS.error;
        if (isFocused) return COLORS.primary[500];
        return COLORS.gray[500];
    };

    const containerStyle = {
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '20px',
    };

    const selectStyle = {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        fontFamily: 'inherit',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '4px',
        backgroundColor: disabled ? COLORS.gray[50] : COLORS.white,
        color: disabled ? COLORS.gray[500] : COLORS.gray[800],
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isFocused && !error ? `0 0 0 2px ${COLORS.primary[100]}` : 'none',
    };

    const labelStyle = {
        position: 'absolute',
        left: '12px',
        top: isFocused || hasValue ? '-8px' : '12px',
        fontSize: isFocused || hasValue ? '12px' : '14px',
        fontWeight: 400,
        color: getLabelColor(),
        backgroundColor: COLORS.white,
        padding: '0 4px',
        transition: 'all 0.2s ease',
        pointerEvents: 'none',
        zIndex: 1,
    };

    const helperStyle = {
        marginTop: '4px',
        fontSize: '12px',
        color: error ? COLORS.error : COLORS.gray[500],
    };

    return (
        <div style={containerStyle} className={className}>
            {label && (
                <label style={labelStyle}>
                    {label}
                    {required && <span style={{ color: COLORS.error, marginLeft: '2px' }}>*</span>}
                </label>
            )}

            <select
                name={name}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                style={selectStyle}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {(helperText || error) && (
                <div style={helperStyle}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export const Checkbox = ({
    label,
    name,
    checked,
    onChange,
    required = false,
    error,
    disabled = false,
    className = '',
    ...props
}) => {
    const checkboxStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
    };

    const inputStyle = {
        width: '18px',
        height: '18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        accentColor: COLORS.primary[500],
    };

    const labelStyle = {
        fontSize: '14px',
        color: error ? COLORS.error : COLORS.gray[700],
        cursor: disabled ? 'not-allowed' : 'pointer',
    };

    const errorStyle = {
        marginTop: '4px',
        fontSize: '12px',
        color: COLORS.error,
    };

    return (
        <div className={className}>
            <label style={checkboxStyle}>
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    style={inputStyle}
                    {...props}
                />
                <span style={labelStyle}>
                    {label}
                    {required && <span style={{ color: COLORS.error, marginLeft: '2px' }}>*</span>}
                </span>
            </label>
            {error && <div style={errorStyle}>{error}</div>}
        </div>
    );
};

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

export const RadioGroup = ({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    error,
    disabled = false,
    className = '',
    ...props
}) => {
    const containerStyle = {
        marginBottom: '20px',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: COLORS.gray[700],
    };

    const optionsContainerStyle = {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
    };

    const radioLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
    };

    const radioStyle = {
        width: '16px',
        height: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        accentColor: COLORS.primary[500],
    };

    const errorStyle = {
        marginTop: '4px',
        fontSize: '12px',
        color: COLORS.error,
    };

    return (
        <div style={containerStyle} className={className}>
            {label && (
                <div style={labelStyle}>
                    {label}
                    {required && <span style={{ color: COLORS.error, marginLeft: '2px' }}>*</span>}
                </div>
            )}

            <div style={optionsContainerStyle}>
                {options.map((option) => (
                    <label key={option.value} style={radioLabelStyle}>
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                            disabled={disabled}
                            style={radioStyle}
                            {...props}
                        />
                        <span style={{ fontSize: '14px', color: COLORS.gray[700] }}>{option.label}</span>
                    </label>
                ))}
            </div>

            {error && <div style={errorStyle}>{error}</div>}
        </div>
    );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default FormInput;