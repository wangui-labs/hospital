import React, { useState, useEffect } from 'react';
import { badgeAPI, employeeAPI } from '../../services/api';

const BADGE_TYPES = {
    role: [
        { id: 'doctor', name: 'Doctor', color: '#1B6EF3', icon: '⚕', bg: '#E8F0FE', accent: '#174EA6' },
        { id: 'nurse', name: 'Nurse', color: '#137333', icon: '+', bg: '#E6F4EA', accent: '#0D652D' },
        { id: 'admin', name: 'Admin', color: '#C5221F', icon: 'A', bg: '#FCE8E6', accent: '#A50E0E' },
        { id: 'resident', name: 'Resident', color: '#B45309', icon: 'R', bg: '#FEF3C7', accent: '#92400E' },
        { id: 'technician', name: 'Technician', color: '#5F6368', icon: 'T', bg: '#F1F3F4', accent: '#3C4043' },
        { id: 'pharmacist', name: 'Pharmacist', color: '#1B6EF3', icon: 'Rx', bg: '#E8F0FE', accent: '#174EA6' },
        { id: 'security', name: 'Security', color: '#C5221F', icon: 'S', bg: '#FCE8E6', accent: '#A50E0E' },
        { id: 'volunteer', name: 'Volunteer', color: '#B45309', icon: 'V', bg: '#FEF3C7', accent: '#92400E' }
    ],
    department: [
        { id: 'emergency', name: 'Emergency', color: '#C5221F' },
        { id: 'icu', name: 'ICU', color: '#C5221F' },
        { id: 'surgery', name: 'Surgery', color: '#137333' },
        { id: 'pediatrics', name: 'Pediatrics', color: '#1B6EF3' },
        { id: 'radiology', name: 'Radiology', color: '#B45309' },
        { id: 'pharmacy', name: 'Pharmacy', color: '#137333' },
        { id: 'cardiology', name: 'Cardiology', color: '#C5221F' },
        { id: 'neurology', name: 'Neurology', color: '#1B6EF3' }
    ],
    accessLevel: [
        { id: 'full', name: 'Full Access', color: '#137333', bg: '#E6F4EA', level: 4, bars: 4 },
        { id: 'elevated', name: 'Elevated', color: '#B45309', bg: '#FEF3C7', level: 3, bars: 3 },
        { id: 'standard', name: 'Standard', color: '#1B6EF3', bg: '#E8F0FE', level: 2, bars: 2 },
        { id: 'basic', name: 'Basic', color: '#5F6368', bg: '#F1F3F4', level: 1, bars: 1 },
        { id: 'restricted', name: 'Restricted', color: '#C5221F', bg: '#FCE8E6', level: 0, bars: 0 }
    ],
    status: [
        { id: 'active', name: 'Active', color: '#137333', dot: '#34A853' },
        { id: 'on_call', name: 'On Call', color: '#B45309', dot: '#FBBC04' },
        { id: 'in_surgery', name: 'In Surgery', color: '#C5221F', dot: '#EA4335' },
        { id: 'off_duty', name: 'Off Duty', color: '#5F6368', dot: '#9AA0A6' },
        { id: 'busy', name: 'Busy', color: '#B45309', dot: '#FF6D00' }
    ]
};

// Helper function to generate next badge number
const generateNextBadgeNumber = (existingBadges) => {
    if (!existingBadges || existingBadges.length === 0) {
        return 'B-001';
    }

    const numbers = existingBadges
        .map(b => {
            const match = b.badge_number?.match(/B-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);

    if (numbers.length === 0) return 'B-001';

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    return `B-${String(nextNumber).padStart(3, '0')}`;
};

function AccessBars({ level }) {
    const max = 4;
    return (
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '16px' }}>
            {Array.from({ length: max }).map((_, i) => (
                <div key={i} style={{
                    width: '5px',
                    height: `${6 + i * 2.5}px`,
                    borderRadius: '2px',
                    background: i < level
                        ? (level >= 4 ? '#137333' : level >= 3 ? '#B45309' : level >= 2 ? '#1B6EF3' : '#5F6368')
                        : '#E8EAED',
                    transition: 'background 0.2s'
                }} />
            ))}
        </div>
    );
}

function StatusDot({ status }) {
    const s = BADGE_TYPES.status.find(x => x.id === status) || BADGE_TYPES.status[0];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: s.color, fontWeight: 500 }}>
            <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: s.dot,
                boxShadow: `0 0 0 2px ${s.dot}30`,
                display: 'inline-block'
            }} />
            {s.name}
        </span>
    );
}

function BadgeCard({ badge, onEdit, onDelete }) {
    const role = BADGE_TYPES.role.find(r => r.id === badge.role) || BADGE_TYPES.role[0];
    const dept = BADGE_TYPES.department.find(d => d.id === badge.department) || { name: badge.department, color: '#5F6368' };
    const access = BADGE_TYPES.accessLevel.find(a => a.id === badge.access_level) || BADGE_TYPES.accessLevel[2];
    const initials = `${badge.first_name?.[0] || ''}${badge.last_name?.[0] || ''}`.toUpperCase();

    return (
        <div style={{
            background: '#fff',
            border: '1px solid #E8EAED',
            borderRadius: '20px',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'default',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ height: '6px', background: `linear-gradient(90deg, ${badge.color_code || role.color}, ${badge.color_code || role.color}88)` }} />

            <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: role.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: '700', color: role.color,
                        flexShrink: 0, letterSpacing: '-0.5px',
                        border: `1.5px solid ${role.color}25`
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#202124', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {badge.first_name} {badge.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#5F6368', fontFamily: 'monospace', marginTop: '2px' }}>
                            {badge.badge_number}
                        </div>
                    </div>
                    <StatusDot status={badge.status} />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                        background: role.bg, color: role.accent || role.color, letterSpacing: '0.2px'
                    }}>{role.name}</span>
                    <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: '#F1F3F4', color: dept.color
                    }}>{dept.name}</span>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: '10px',
                    background: access.bg, marginBottom: '16px'
                }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: access.color }}>
                        {access.name}
                    </span>
                    <AccessBars level={access.level} />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onEdit(badge)} style={{
                        flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #E8EAED',
                        background: 'transparent', color: '#1B6EF3', fontSize: '13px', fontWeight: '500',
                        cursor: 'pointer', transition: 'background 0.15s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E8F0FE'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >Edit</button>
                    <button onClick={() => onDelete(badge.id)} style={{
                        flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #FCE8E6',
                        background: 'transparent', color: '#C5221F', fontSize: '13px', fontWeight: '500',
                        cursor: 'pointer', transition: 'background 0.15s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FCE8E6'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >Revoke</button>
                </div>
            </div>
        </div>
    );
}

function BadgeLivePreview({ formData, employees }) {
    const employee = employees.find(e => e.id === formData.employee_id);
    const role = BADGE_TYPES.role.find(r => r.id === formData.role) || BADGE_TYPES.role[0];
    const access = BADGE_TYPES.accessLevel.find(a => a.id === formData.access_level) || BADGE_TYPES.accessLevel[2];
    const status = BADGE_TYPES.status.find(s => s.id === formData.status) || BADGE_TYPES.status[0];
    const dept = BADGE_TYPES.department.find(d => d.id === formData.department);

    const name = employee ? `${employee.first_name} ${employee.last_name}` : 'Employee Name';
    const initials = employee
        ? `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase()
        : '?';

    const cardColor = formData.color_code || role.color || '#1B6EF3';

    return (
        <div style={{
            background: '#F8F9FA',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E8EAED',
            marginBottom: '28px'
        }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#5F6368', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
                Live Preview
            </div>

            <div style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                maxWidth: '340px',
                border: '1px solid #E8EAED',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
            }}>
                <div style={{
                    background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}CC 100%)`,
                    padding: '20px 20px 36px',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0' }}>
                        <div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '600' }}>
                                Staff Badge
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginTop: '2px', letterSpacing: '-0.3px' }}>
                                {name}
                            </div>
                        </div>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: '700', color: '#fff',
                            border: '1.5px solid rgba(255,255,255,0.35)'
                        }}>
                            {initials}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: role.bg, color: role.accent || role.color }}>{role.name}</span>
                        {dept && <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: '#F1F3F4', color: dept.color }}>{dept.name}</span>}
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: access.bg, color: access.color, fontWeight: '500' }}>{access.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9AA0A6' }}>
                            {formData.badge_number || 'BADGE-XXX'}
                        </span>
                        <StatusDot status={formData.status} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BadgesView() {
    const [badges, setBadges] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '', badge_number: '', role: '', department: '',
        access_level: 'standard', status: 'active', color_code: '#1B6EF3'
    });
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [badgesRes, empRes] = await Promise.all([
                badgeAPI.getAll(),
                employeeAPI.getAll()
            ]);
            setBadges(badgesRes.badges || []);
            setEmployees(empRes.employees || []);
        } catch (err) {
            console.error('Failed to load badges:', err);
            setBadges([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employee_id) {
            alert('Please select an employee');
            return;
        }

        let badgeNumber = formData.badge_number;
        if (!badgeNumber || badgeNumber === '') {
            badgeNumber = generateNextBadgeNumber(badges);
            setFormData({ ...formData, badge_number: badgeNumber });
        }

        const submitData = { ...formData, badge_number: badgeNumber };

        try {
            if (editingBadge) {
                await badgeAPI.update(editingBadge.id, submitData);
                alert('Badge updated successfully!');
            } else {
                await badgeAPI.create(submitData);
                alert(`Badge ${badgeNumber} issued successfully!`);
            }
            closeForm();
            await loadData();
        } catch (err) {
            console.error('Error saving badge:', err);
            alert(err.message || 'Error saving badge. Please try again.');
        }
    };

    const handleEdit = (badge) => {
        setEditingBadge(badge);
        setFormData({
            employee_id: badge.employee_id || '',
            badge_number: badge.badge_number,
            role: badge.role || '',
            department: badge.department || '',
            access_level: badge.access_level,
            status: badge.status,
            color_code: badge.color_code || '#1B6EF3'
        });
        setShowForm(true);
        setTimeout(() => document.getElementById('badge-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Revoke this badge? This action cannot be undone.')) return;
        try {
            await badgeAPI.delete(id);
            alert('Badge revoked successfully!');
            await loadData();
        } catch (err) {
            console.error('Error revoking badge:', err);
            alert(err.message || 'Error revoking badge');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingBadge(null);
        setFormData({
            employee_id: '', badge_number: '', role: '', department: '',
            access_level: 'standard', status: 'active', color_code: '#1B6EF3'
        });
    };

    const filteredBadges = badges.filter(b => {
        const name = `${b.first_name} ${b.last_name} ${b.badge_number}`.toLowerCase();
        return name.includes(search.toLowerCase()) && (!filterRole || b.role === filterRole);
    });

    const stats = [
        { label: 'Total Badges', value: badges.length, color: '#1B6EF3', bg: '#E8F0FE' },
        { label: 'Active', value: badges.filter(b => b.status === 'active').length, color: '#137333', bg: '#E6F4EA' },
        { label: 'On Call', value: badges.filter(b => b.status === 'on_call').length, color: '#B45309', bg: '#FEF3C7' },
        { label: 'Full Access', value: badges.filter(b => b.access_level === 'full').length, color: '#C5221F', bg: '#FCE8E6' },
    ];

    const nextBadgeNumber = generateNextBadgeNumber(badges);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#5F6368', fontSize: '14px' }}>
            Loading badges...
        </div>
    );

    const inputStyle = {
        width: '100%', padding: '10px 14px', border: '1px solid #E8EAED', borderRadius: '10px',
        fontSize: '14px', color: '#202124', outline: 'none', background: '#fff',
        boxSizing: 'border-box', transition: 'border-color 0.15s'
    };

    const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#5F6368', letterSpacing: '0.3px', marginBottom: '6px', display: 'block' };

    return (
        <div style={{ fontFamily: "'Google Sans', Roboto, sans-serif", maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', background: '#fff' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px'
                        }}>🪪</div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#202124', margin: 0, letterSpacing: '-0.4px' }}>
                            Badges & Access Control
                        </h1>
                    </div>
                    <p style={{ fontSize: '14px', color: '#5F6368', margin: 0, paddingLeft: '52px' }}>
                        Manage employee identification and access cards
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ ...formData, badge_number: nextBadgeNumber });
                        closeForm();
                        setShowForm(true);
                        setTimeout(() => document.getElementById('badge-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
                    }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '100px',
                        background: '#1B6EF3', color: '#fff', border: 'none',
                        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(27,110,243,0.35)',
                        transition: 'box-shadow 0.2s, transform 0.1s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,110,243,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,110,243,0.35)'; e.currentTarget.style.transform = 'none'; }}
                >
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                    Issue New Badge
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{
                        padding: '16px 18px', borderRadius: '14px',
                        background: s.bg, border: `1px solid ${s.color}20`
                    }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: s.color, marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Issue / Edit Form */}
            {showForm && (
                <div id="badge-form" style={{
                    background: '#F8F9FA', borderRadius: '20px',
                    padding: '28px', marginBottom: '32px',
                    border: '1px solid #E8EAED'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#202124', margin: 0 }}>
                            {editingBadge ? 'Edit Badge' : 'Issue New Badge'}
                        </h2>
                        <button onClick={closeForm} style={{
                            width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E8EAED',
                            background: '#fff', cursor: 'pointer', fontSize: '16px', color: '#5F6368',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>×</button>
                    </div>

                    <BadgeLivePreview formData={formData} employees={employees} />

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Employee *</label>
                                <select style={inputStyle} value={formData.employee_id}
                                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })} required
                                    onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                                    onBlur={e => e.target.style.borderColor = '#E8EAED'}
                                >
                                    <option value="">Select employee…</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} — {emp.department}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Badge Number {!editingBadge && <span style={{ fontSize: '10px', color: '#137333' }}>(Auto: {nextBadgeNumber})</span>}</label>
                                <input type="text" style={inputStyle} placeholder="Auto-generated if empty"
                                    value={formData.badge_number}
                                    onChange={e => setFormData({ ...formData, badge_number: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                                    onBlur={e => e.target.style.borderColor = '#E8EAED'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Role</label>
                                <select style={inputStyle} value={formData.role}
                                    onChange={e => {
                                        const r = BADGE_TYPES.role.find(x => x.id === e.target.value);
                                        setFormData({ ...formData, role: e.target.value, color_code: r?.color || '#1B6EF3' });
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                                    onBlur={e => e.target.style.borderColor = '#E8EAED'}
                                >
                                    <option value="">Select role…</option>
                                    {BADGE_TYPES.role.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Department</label>
                                <select style={inputStyle} value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                                    onBlur={e => e.target.style.borderColor = '#E8EAED'}
                                >
                                    <option value="">Select department…</option>
                                    {BADGE_TYPES.department.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Access Level</label>
                                <select style={inputStyle} value={formData.access_level}
                                    onChange={e => setFormData({ ...formData, access_level: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                                    onBlur={e => e.target.style.borderColor = '#E8EAED'}
                                >
                                    {BADGE_TYPES.accessLevel.map(a => <option key={a.id} value={a.id}>{a.name} (L{a.level})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select style={inputStyle} value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                                    onBlur={e => e.target.style.borderColor = '#E8EAED'}
                                >
                                    {BADGE_TYPES.status.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={closeForm} style={{
                                padding: '10px 20px', borderRadius: '100px', border: '1px solid #E8EAED',
                                background: '#fff', color: '#5F6368', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                            }}>Cancel</button>
                            <button type="submit" style={{
                                padding: '10px 24px', borderRadius: '100px', border: 'none',
                                background: '#1B6EF3', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(27,110,243,0.3)'
                            }}>
                                {editingBadge ? 'Update Badge' : 'Issue Badge'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search + Filter Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
                    <input type="text" placeholder="Search by name or badge number…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '36px', borderRadius: '100px' }}
                        onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                        onBlur={e => e.target.style.borderColor = '#E8EAED'}
                    />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', minWidth: '140px', borderRadius: '100px' }}
                    onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                    onBlur={e => e.target.style.borderColor = '#E8EAED'}
                >
                    <option value="">All roles</option>
                    {BADGE_TYPES.role.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <span style={{ fontSize: '13px', color: '#5F6368', whiteSpace: 'nowrap' }}>
                    {filteredBadges.length} badge{filteredBadges.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Badge Grid */}
            {filteredBadges.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '64px 24px',
                    background: '#F8F9FA', borderRadius: '20px', border: '1px dashed #E8EAED'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪪</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#202124', marginBottom: '6px' }}>No badges found</div>
                    <div style={{ fontSize: '14px', color: '#5F6368' }}>
                        {search || filterRole ? 'Try adjusting your filters' : 'Click "Issue New Badge" to get started'}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {filteredBadges.map(badge => (
                        <BadgeCard key={badge.id} badge={badge} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {/* Reference Footer */}
            <div style={{
                marginTop: '40px', padding: '24px', borderRadius: '16px',
                border: '1px solid #E8EAED', background: '#F8F9FA'
            }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#5F6368', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '20px' }}>
                    Badge Types Reference
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#202124', marginBottom: '10px' }}>Roles</div>
                        {BADGE_TYPES.role.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '13px', color: '#3C4043' }}>{r.name}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#202124', marginBottom: '10px' }}>Access Levels</div>
                        {BADGE_TYPES.accessLevel.map(a => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                                <span style={{ fontSize: '13px', color: '#3C4043' }}>{a.name}</span>
                                <AccessBars level={a.level} />
                            </div>
                        ))}
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#202124', marginBottom: '10px' }}>Status</div>
                        {BADGE_TYPES.status.map(s => (
                            <div key={s.id} style={{ marginBottom: '7px' }}>
                                <StatusDot status={s.id} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BadgesView;