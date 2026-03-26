import React, { useState, useMemo } from 'react';
import { formatDate, formatTime } from '../../utils/formatters';

// ── helpers ───────────────────────────────────────────────────────────────────

const SEVERITY = {
    info: { color: '#1B6EF3', bg: '#E8F0FE', dot: '#4285F4', label: 'Info' },
    warning: { color: '#B45309', bg: '#FEF3C7', dot: '#FBBC04', label: 'Warning' },
    error: { color: '#C5221F', bg: '#FCE8E6', dot: '#EA4335', label: 'Error' },
    critical: { color: '#C5221F', bg: '#FCE8E6', dot: '#EA4335', label: 'Critical' },
};

const CATEGORY_ICONS = {
    auth: '🔐',
    access: '🚪',
    patient: '🏥',
    medication: '💊',
    system: '⚙️',
    badge: '🪪',
    employee: '👤',
    room: '🛏',
    security: '🛡',
};

// Format datetime for display - shows date and time
function formatDateTime(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// Format time only
function formatTimeOnly(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(userId) {
    if (!userId || userId === 'System') return 'SY';
    const parts = userId.replace('@', '.').split('.');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

const AVATAR_COLORS = ['#1B6EF3', '#137333', '#B45309', '#6B3FA0', '#C5221F'];
function avatarColor(userId) {
    const n = [...(userId || '')].reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            padding: '12px'
        }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E8EAED',
                    background: currentPage === 1 ? '#F8F9FA' : '#fff',
                    color: currentPage === 1 ? '#9AA0A6' : '#1B6EF3',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                }}
            >
                ← Previous
            </button>

            {getPageNumbers().map((page, idx) => (
                <button
                    key={idx}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: page === currentPage ? '1.5px solid #1B6EF3' : '1px solid #E8EAED',
                        background: page === currentPage ? '#E8F0FE' : '#fff',
                        color: page === currentPage ? '#1B6EF3' : '#5F6368',
                        fontWeight: page === currentPage ? '600' : '400',
                        cursor: page === '...' ? 'default' : 'pointer',
                        minWidth: '36px',
                        fontSize: '13px'
                    }}
                    disabled={page === '...'}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E8EAED',
                    background: currentPage === totalPages ? '#F8F9FA' : '#fff',
                    color: currentPage === totalPages ? '#9AA0A6' : '#1B6EF3',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                }}
            >
                Next →
            </button>
        </div>
    );
}

// ── sub-components ────────────────────────────────────────────────────────────

function SeverityChip({ severity }) {
    const s = SEVERITY[severity] || SEVERITY.info;
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '11px', fontWeight: '700',
            background: s.bg, color: s.color,
            letterSpacing: '0.3px', whiteSpace: 'nowrap',
            textTransform: 'uppercase'
        }}>{s.label}</span>
    );
}

function FilterChip({ label, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '6px 14px', borderRadius: '100px',
            border: active ? '1.5px solid #1B6EF3' : '1px solid #E8EAED',
            background: active ? '#E8F0FE' : '#fff',
            color: active ? '#1B6EF3' : '#5F6368',
            fontSize: '13px', fontWeight: active ? '600' : '400',
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap'
        }}>{label}</button>
    );
}

// ── main ──────────────────────────────────────────────────────────────────────

function ActivityLogView({ activities: propActivities, loading }) {
    const activities = propActivities || [];

    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const categories = useMemo(() =>
        ['all', ...new Set(activities.map(a => a.category).filter(Boolean))],
        [activities]
    );

    const filtered = useMemo(() => activities.filter(a => {
        if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
        if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
        if (search && !`${a.username || a.user_id} ${a.action} ${a.category} ${a.entity_type}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [activities, categoryFilter, severityFilter, search]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filtered.slice(start, end);
    }, [filtered, currentPage]);

    // Reset to page 1 when filters change
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const stats = [
        { label: 'Total Events', value: activities.length, color: '#1B6EF3', bg: '#E8F0FE' },
        { label: 'Warnings', value: activities.filter(a => a.severity === 'warning').length, color: '#B45309', bg: '#FEF3C7' },
        { label: 'Errors', value: activities.filter(a => a.severity === 'error').length, color: '#C5221F', bg: '#FCE8E6' },
        { label: 'Critical', value: activities.filter(a => a.severity === 'critical').length, color: '#C5221F', bg: '#FCE8E6' },
    ];

    const inputStyle = {
        width: '100%', padding: '9px 14px 9px 36px',
        border: '1px solid #E8EAED', borderRadius: '100px',
        fontSize: '14px', color: '#202124', outline: 'none',
        background: '#fff', boxSizing: 'border-box',
        transition: 'border-color 0.15s', fontFamily: 'inherit'
    };

    return (
        <div style={{ fontFamily: "'Google Sans', Roboto, sans-serif", maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', background: '#fff' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            📋
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#202124', margin: 0, letterSpacing: '-0.4px' }}>Activity Log</h1>
                    </div>
                    <p style={{ fontSize: '14px', color: '#5F6368', margin: 0, paddingLeft: '52px' }}>Full audit trail · all system events</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '100px', background: '#F8F9FA', border: '1px solid #E8EAED', fontSize: '13px', color: '#5F6368' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34A853', display: 'inline-block' }} />
                    Live · {filtered.length} event{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{ padding: '16px 18px', borderRadius: '14px', background: s.bg, border: `1px solid ${s.color}20` }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: s.color, marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div style={{ background: '#F8F9FA', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #E8EAED' }}>
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
                    <input type="text" placeholder="Search events, users, actions…"
                        value={search} onChange={e => handleFilterChange(setSearch, e.target.value)}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                        onBlur={e => e.target.style.borderColor = '#E8EAED'}
                    />
                </div>

                {/* Category chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.5px', textTransform: 'uppercase', marginRight: '4px' }}>Category</span>
                    {categories.map(c => (
                        <FilterChip key={c}
                            label={c === 'all' ? 'All' : `${CATEGORY_ICONS[c] || '📌'} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
                            active={categoryFilter === c}
                            onClick={() => handleFilterChange(setCategoryFilter, c)}
                        />
                    ))}
                </div>

                {/* Severity chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.5px', textTransform: 'uppercase', marginRight: '4px' }}>Severity</span>
                    {['all', 'info', 'warning', 'error', 'critical'].map(s => (
                        <FilterChip key={s}
                            label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            active={severityFilter === s}
                            onClick={() => handleFilterChange(setSeverityFilter, s)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Feed ── */}
            <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#5F6368', fontSize: '14px' }}>Loading events…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#202124', marginBottom: '6px' }}>No events found</div>
                        <div style={{ fontSize: '13px', color: '#5F6368' }}>Try adjusting your filters</div>
                    </div>
                ) : (
                    paginatedLogs.map((a, i) => {
                        const sev = SEVERITY[a.severity] || SEVERITY.info;
                        const isCritical = a.severity === 'critical' || a.severity === 'error';
                        const isOpen = expanded === a.id;
                        const userId = a.username || a.user_id || 'System';
                        const color = avatarColor(userId);
                        const initials = getInitials(userId);
                        const catIcon = CATEGORY_ICONS[a.category] || '📌';
                        const fullDateTime = formatDateTime(a.created_at);
                        const timeOnly = formatTimeOnly(a.created_at);

                        return (
                            <div key={a.id}
                                onClick={() => setExpanded(isOpen ? null : a.id)}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                                    padding: '14px 20px',
                                    borderTop: i === 0 ? 'none' : '1px solid #F1F3F4',
                                    background: isCritical ? '#FFF8F8' : isOpen ? '#F8F9FA' : '#fff',
                                    cursor: 'pointer', transition: 'background 0.15s',
                                    borderLeft: isCritical ? '3px solid #EA4335' : '3px solid transparent',
                                }}
                                onMouseEnter={e => { if (!isCritical) e.currentTarget.style.background = '#F8F9FA'; }}
                                onMouseLeave={e => { if (!isCritical) e.currentTarget.style.background = isOpen ? '#F8F9FA' : '#fff'; }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: color + '18', color, fontWeight: '700',
                                    fontSize: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0,
                                    border: `1.5px solid ${color}25`, letterSpacing: '-0.3px'
                                }}>
                                    {initials.toUpperCase()}
                                </div>

                                {/* Main content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#202124' }}>
                                            {userId}
                                        </span>
                                        <span style={{ fontSize: '14px', color: '#3C4043' }}>{a.action}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '12px', color: '#5F6368' }}>
                                            {catIcon} {a.category || 'system'}
                                        </span>
                                        {a.entity_type && (
                                            <span style={{ fontSize: '12px', color: '#9AA0A6' }}>· {a.entity_type}</span>
                                        )}
                                        {isOpen && a.meta_data && (
                                            <span style={{ fontSize: '12px', color: '#9AA0A6', fontFamily: 'monospace', background: '#F1F3F4', padding: '2px 6px', borderRadius: '6px' }}>
                                                {typeof a.meta_data === 'string' ? a.meta_data : JSON.stringify(a.meta_data).slice(0, 80)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Right side */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                                    <SeverityChip severity={a.severity} />
                                    <div style={{ textAlign: 'right' }}>
                                        <span title={fullDateTime} style={{ fontSize: '11px', color: '#5F6368', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                            {timeOnly}
                                        </span>
                                        <div style={{ fontSize: '10px', color: '#9AA0A6', marginTop: '2px' }}>
                                            {formatDateTime(a.created_at).split(',')[0]}
                                        </div>
                                    </div>
                                </div>

                                {/* Severity dot */}
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: sev.dot, flexShrink: 0, marginTop: '14px',
                                    boxShadow: isCritical ? `0 0 0 3px ${sev.dot}30` : 'none'
                                }} />
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Pagination ── */}
            {filtered.length > 0 && (
                <>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#9AA0A6' }}>
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} events
                    </div>
                </>
            )}
        </div>
    );
}

export default ActivityLogView;