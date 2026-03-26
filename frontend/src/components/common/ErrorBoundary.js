import React from 'react';
import { COLORS } from '../../utils/constants';

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Update state with error info for better debugging
        this.setState({ errorInfo });

        // You can also log to an error reporting service here
        // reportErrorToService(error, errorInfo);
    }

    // Reset error state
    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        const { hasError, error, errorInfo } = this.state;
        const {
            children,
            fallback,
            onError,
            showDetails = false,
            resetOnRetry = true,
            className = '',
        } = this.props;

        // If there's no error, render children normally
        if (!hasError) {
            return children;
        }

        // Call onError callback if provided
        if (onError && error) {
            onError(error, errorInfo);
        }

        // Use custom fallback if provided
        if (fallback) {
            return React.cloneElement(fallback, {
                error,
                errorInfo,
                resetError: resetOnRetry ? this.resetError : undefined,
            });
        }

        // Default error UI
        return (
            <DefaultErrorFallback
                error={error}
                errorInfo={errorInfo}
                resetError={resetOnRetry ? this.resetError : undefined}
                showDetails={showDetails}
                className={className}
            />
        );
    }
}

// ============================================================================
// DEFAULT ERROR FALLBACK COMPONENT
// ============================================================================

export const DefaultErrorFallback = ({
    error,
    errorInfo,
    resetError,
    showDetails = false,
    className = ''
}) => {
    return (
        <div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                padding: '40px',
                backgroundColor: COLORS.gray[50],
                borderRadius: '12px',
                textAlign: 'center',
            }}
        >
            {/* Error Icon */}
            <div style={{ marginBottom: '24px' }}>
                <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                        fill={COLORS.error}
                    />
                </svg>
            </div>

            {/* Error Title */}
            <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: COLORS.gray[800],
                marginBottom: '8px',
            }}>
                Something went wrong
            </h2>

            {/* Error Message */}
            <p style={{
                fontSize: '16px',
                color: COLORS.gray[600],
                marginBottom: '24px',
                maxWidth: '500px',
            }}>
                {error?.message || 'An unexpected error occurred'}
            </p>

            {/* Error Details (Optional) */}
            {showDetails && error && (
                <details style={{
                    marginBottom: '24px',
                    width: '100%',
                    maxWidth: '600px',
                    textAlign: 'left',
                    backgroundColor: COLORS.gray[100],
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                }}>
                    <summary style={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: COLORS.gray[700],
                    }}>
                        Technical Details
                    </summary>
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                        color: COLORS.gray[800],
                    }}>
                        {error.stack || error.toString()}
                    </pre>
                    {errorInfo && (
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            marginTop: '8px',
                            color: COLORS.gray[800],
                        }}>
                            {errorInfo.componentStack}
                        </pre>
                    )}
                </details>
            )}

            {/* Retry Button */}
            {resetError && (
                <button
                    onClick={resetError}
                    style={{
                        padding: '10px 24px',
                        backgroundColor: COLORS.primary[500],
                        color: COLORS.white,
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = COLORS.primary[600];
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = COLORS.primary[500];
                    }}
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

// ============================================================================
// MINI ERROR BOUNDARY (For small components)
// ============================================================================

export const MiniErrorBoundary = ({ children, fallback }) => {
    return (
        <ErrorBoundary
            fallback={fallback || (
                <div style={{
                    padding: '16px',
                    backgroundColor: COLORS.secondary[50],
                    border: `1px solid ${COLORS.secondary[200]}`,
                    borderRadius: '8px',
                    color: COLORS.secondary[700],
                    fontSize: '14px',
                    textAlign: 'center',
                }}>
                    ⚠️ Failed to load component
                </div>
            )}
        >
            {children}
        </ErrorBoundary>
    );
};

// ============================================================================
// ASYNC ERROR BOUNDARY (For async operations)
// ============================================================================

export class AsyncErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('AsyncErrorBoundary caught:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        const { hasError, error } = this.state;
        const { children, fallback, loading = false } = this.props;

        if (loading) {
            return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
        }

        if (hasError) {
            if (fallback) {
                return React.cloneElement(fallback, {
                    error,
                    resetError: this.resetError,
                });
            }

            return (
                <div style={{
                    padding: '20px',
                    backgroundColor: COLORS.secondary[50],
                    borderRadius: '8px',
                    textAlign: 'center',
                }}>
                    <p style={{ color: COLORS.secondary[700], marginBottom: '12px' }}>
                        {error?.message || 'Failed to load data'}
                    </p>
                    <button
                        onClick={this.resetError}
                        style={{
                            padding: '6px 16px',
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
                </div>
            );
        }

        return children;
    }
}

// ============================================================================
// WITH ERROR BOUNDARY HOC (Higher Order Component)
// ============================================================================

export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
    return function WithErrorBoundary(props) {
        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default ErrorBoundary;