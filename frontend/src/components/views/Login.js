import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { COLORS } from '../../utils/constants';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login(username.trim(), password.trim());

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Invalid username or password');
            }
        } catch (err) {
            setError(err.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    // Styles to match your original design
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--white) 100%)',
            padding: '20px',
        },
        card: {
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            border: `1px solid var(--divider)`,
            padding: '48px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.5s ease-out',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '24px',
        },
        logoBox: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            fontWeight: '700',
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--ink)',
            letterSpacing: '-0.5px',
        },
        subtitle: {
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--ink4)',
            marginBottom: '32px',
        },
        errorContainer: {
            background: 'var(--red-l)',
            border: `1px solid var(--red-m)`,
            borderRadius: 'var(--radius-s)',
            padding: '10px',
            color: 'var(--red)',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'center',
        },
        footer: {
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--divider)',
            fontSize: '11px',
            color: 'var(--ink4)',
            textAlign: 'center',
        },
        credentials: {
            marginTop: '4px',
        },
        adminText: {
            color: 'var(--blue)',
        },
        userText: {
            color: 'var(--green)',
            marginLeft: '8px',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoContainer}>
                    <div style={styles.logoBox}>H</div>
                    <div style={styles.title}>
                        Hospi<span style={{ color: 'var(--blue)' }}>tal</span>
                    </div>
                </div>

                {/* Subtitle */}
                <div style={styles.subtitle}>
                    SECURE ACTIVITY DASHBOARD
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <FormInput
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        autoFocus
                        fullWidth
                        size="md"
                    />

                    <FormInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        fullWidth
                        size="md"
                    />

                    {/* Error Message */}
                    {error && (
                        <div style={styles.errorContainer}>
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                        size="md"
                    >
                        {loading ? 'AUTHENTICATING...' : '→ ACCESS DASHBOARD'}
                    </Button>
                </form>

                {/* Default Credentials */}
                <div style={styles.footer}>
                    <div>Default credentials:</div>
                    <div style={styles.credentials}>
                        <span style={styles.adminText}>admin/admin</span>
                        <span style={styles.userText}>| user/user</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;