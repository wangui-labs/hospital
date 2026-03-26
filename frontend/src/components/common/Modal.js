import React, { useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../../utils/constants';
import Button from './Button';

// ============================================================================
// MODAL COMPONENT
// ============================================================================

const Modal = ({
    // Visibility
    isOpen = false,
    onClose,

    // Content
    title,
    children,
    footer,

    // Size
    size = 'md',  // sm, md, lg, xl, full

    // Actions
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,

    // Buttons
    showConfirmButton = false,
    confirmText = 'Confirm',
    confirmVariant = 'primary',
    onConfirm,

    showCancelButton = true,
    cancelText = 'Cancel',
    cancelVariant = 'ghost',
    onCancel,

    // State
    loading = false,

    // Styling
    className = '',
    overlayClassName = '',
    contentClassName = '',

    // Animation
    animation = true,

    // Other
    ...props
}) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    // ============================================================================
    // SIZE CONFIGURATIONS
    // ============================================================================

    const sizes = {
        sm: { width: '400px', maxWidth: '90%' },
        md: { width: '600px', maxWidth: '90%' },
        lg: { width: '800px', maxWidth: '90%' },
        xl: { width: '1000px', maxWidth: '90%' },
        full: { width: '95%', maxWidth: '95%', height: '95%' },
    };

    const currentSize = sizes[size] || sizes.md;

    // ============================================================================
    // CLOSE HANDLERS
    // ============================================================================

    const handleClose = useCallback(() => {
        if (!loading && onClose) {
            onClose();
        }
    }, [loading, onClose]);

    const handleCancel = useCallback(() => {
        if (!loading && onCancel) {
            onCancel();
        } else if (!loading && onClose) {
            onClose();
        }
    }, [loading, onCancel, onClose]);

    const handleConfirm = useCallback(() => {
        if (!loading && onConfirm) {
            onConfirm();
        }
    }, [loading, onConfirm]);

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === overlayRef.current && !loading) {
            handleClose();
        }
    };

    // ============================================================================
    // ESCAPE KEY HANDLER
    // ============================================================================

    useEffect(() => {
        const handleEscape = (e) => {
            if (closeOnEscape && e.key === 'Escape' && isOpen && !loading) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, closeOnEscape, loading, handleClose]);

    // ============================================================================
    // FOCUS TRAP
    // ============================================================================

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    // ============================================================================
    // ANIMATION STYLES
    // ============================================================================

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: animation && isOpen ? 'fadeIn 0.2s ease' : 'none',
        ...props.overlayStyle,
    };

    const modalStyle = {
        position: 'relative',
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: size === 'full' ? '100%' : '90vh',
        width: currentSize.width,
        maxWidth: currentSize.maxWidth,
        height: size === 'full' ? currentSize.height : 'auto',
        animation: animation && isOpen ? 'slideIn 0.3s ease' : 'none',
        outline: 'none',
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: `1px solid ${COLORS.gray[200]}`,
    };

    const bodyStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
    };

    const footerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px',
        borderTop: `1px solid ${COLORS.gray[200]}`,
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    if (!isOpen) return null;

    return (
        <>
            {/* Add animation keyframes to document head */}
            <style>
                {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideIn {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
            </style>

            <div
                ref={overlayRef}
                style={overlayStyle}
                className={`modal-overlay ${overlayClassName}`}
                onClick={handleOverlayClick}
            >
                <div
                    ref={modalRef}
                    style={modalStyle}
                    className={`modal-content ${contentClassName} ${className}`}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-label={title || 'modal'}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div style={headerStyle} className="modal-header">
                            {title && (
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    color: COLORS.gray[800],
                                    margin: 0,
                                }}>
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        color: COLORS.gray[500],
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = COLORS.gray[700]}
                                    onMouseLeave={(e) => e.target.style.color = COLORS.gray[500]}
                                    aria-label="Close modal"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    <div style={bodyStyle} className="modal-body">
                        {children}
                    </div>

                    {/* Footer */}
                    {((showConfirmButton || showCancelButton) && !footer) || (footer && !(showConfirmButton || showCancelButton)) ? (
                        <div style={footerStyle} className="modal-footer">
                            {footer ? (
                                footer
                            ) : (
                                <>
                                    {showCancelButton && (
                                        <Button
                                            variant={cancelVariant}
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            {cancelText}
                                        </Button>
                                    )}
                                    {showConfirmButton && (
                                        <Button
                                            variant={confirmVariant}
                                            onClick={handleConfirm}
                                            loading={loading}
                                            disabled={loading}
                                        >
                                            {confirmText}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};

// ============================================================================
// CONFIRM MODAL (Specialized modal for confirmations)
// ============================================================================

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    confirmVariant = 'primary',
    cancelText = 'Cancel',
    loading = false,
    danger = false,
    ...props
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            confirmText={confirmText}
            confirmVariant={danger ? 'danger' : confirmVariant}
            cancelText={cancelText}
            onConfirm={onConfirm}
            onCancel={onClose}
            loading={loading}
            showConfirmButton={true}
            showCancelButton={true}
            {...props}
        >
            <div style={{ textAlign: 'center' }}>
                {danger && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: COLORS.secondary[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill={COLORS.secondary[500]} />
                        </svg>
                    </div>
                )}
                <p style={{
                    fontSize: '16px',
                    color: COLORS.gray[600],
                    margin: 0,
                    lineHeight: 1.5,
                }}>
                    {message}
                </p>
            </div>
        </Modal>
    );
};

// ============================================================================
// FORM MODAL (Modal with form)
// ============================================================================

export const FormModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    children,
    submitText = 'Submit',
    cancelText = 'Cancel',
    loading = false,
    ...props
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            confirmText={submitText}
            cancelText={cancelText}
            onConfirm={handleSubmit}
            onCancel={onClose}
            loading={loading}
            showConfirmButton={true}
            showCancelButton={true}
            {...props}
        >
            <form onSubmit={handleSubmit}>
                {children}
            </form>
        </Modal>
    );
};

// ============================================================================
// LARGE MODAL (Full screen modal)
// ============================================================================

export const LargeModal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    ...props
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="xl"
            footer={footer}
            {...props}
        >
            {children}
        </Modal>
    );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default Modal;