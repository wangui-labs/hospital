import React, { useState } from 'react';
import { CSS_VARS, COLORS } from '../../utils/constants';
import { activityAPI } from '../../services/api';
import Button from '../common/Button';
import FormInput from '../common/FormInput';

function RightPanel({ rooms, admissions }) {
    const [formData, setFormData] = useState({
        entity: '',
        action: '',
        category: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Room calculations
    const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
    const availableRooms = rooms?.filter(r => r.status === 'available').length || 0;
    const cleaningRooms = rooms?.filter(r => r.status === 'cleaning').length || 0;
    const totalRooms = rooms?.length || 0;
    const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Department load data (mock - replace with real data)
    const departments = [
        { name: 'Emergency', percent: 90, color: 'red' },
        { name: 'ICU', percent: 75, color: 'blue' },
        { name: 'Surgery', percent: 60, color: 'yellow' },
        { name: 'Ward A', percent: 55, color: 'green' },
        { name: 'Pediatrics', percent: 40, color: 'green' }
    ];

    // Staff online data (mock - replace with real data)
    const staff = [
        { initials: 'JC', name: 'Dr. James Carter', role: 'Emergency · Doctor', online: true, color: 'blue' },
        { initials: 'SJ', name: 'Sara Jennings', role: 'Nursing · Head Nurse', online: true, color: 'green' },
        { initials: 'U5', name: 'User Five', role: 'Security · idle 4 min', online: false, color: 'yellow' },
        { initials: 'ML', name: 'Maria Lopez', role: 'Reception · idle 11 min', online: false, color: 'red' }
    ];

    const getDeptColor = (color) => {
        const colorMap = {
            red: CSS_VARS.red,
            yellow: CSS_VARS.yellow,
            green: CSS_VARS.green,
            blue: CSS_VARS.blue
        };
        return colorMap[color] || CSS_VARS.blue;
    };

    const getUserColorStyles = (color) => {
        const styles = {
            blue: { bg: CSS_VARS.blueL, text: CSS_VARS.blue },
            green: { bg: CSS_VARS.greenL, text: CSS_VARS.green },
            yellow: { bg: CSS_VARS.yellowL, text: '#b06000' },
            red: { bg: CSS_VARS.redL, text: CSS_VARS.red }
        };
        return styles[color] || styles.blue;
    };

    const handleSubmit = async () => {
        if (!formData.action) return;

        setSubmitting(true);
        try {
            await activityAPI.create(
                formData.category || 'system',
                formData.action,
                'info',
                { entity: formData.entity }
            );
            setFormData({ entity: '', action: '', category: '' });
        } catch (err) {
            console.error('Failed to log activity:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Styles using CSS_VARS
    const styles = {
        aside: {
            background: CSS_VARS.white,
            borderLeft: `1px solid ${CSS_VARS.divider}`,
            padding: '20px',
            overflowY: 'auto',
            width: '320px',
            flexShrink: 0,
        },
        section: {
            marginBottom: '28px',
        },
        sectionTitle: {
            fontSize: '13px',
            fontWeight: '700',
            color: CSS_VARS.ink2,
            marginBottom: '14px',
        },
        divider: {
            height: '1px',
            background: CSS_VARS.divider,
            margin: '16px 0',
        },
        statRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: CSS_VARS.ink3,
            padding: '3px 0',
        },
        statLabel: {
            flex: 1,
        },
        statValue: {
            marginLeft: 'auto',
            fontWeight: '500',
            color: CSS_VARS.ink,
        },
        colorDot: (color) => ({
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
        }),
        deptRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        deptName: {
            fontSize: '12px',
            color: CSS_VARS.ink3,
            width: '70px',
            flexShrink: 0,
        },
        progressBar: {
            flex: 1,
            height: '8px',
            background: CSS_VARS.surface,
            borderRadius: '4px',
            overflow: 'hidden',
        },
        progressFill: (color, percent) => ({
            height: '100%',
            borderRadius: '4px',
            width: `${percent}%`,
            background: color,
        }),
        progressPercent: {
            fontSize: '12px',
            fontWeight: '500',
            color: CSS_VARS.ink3,
            width: '28px',
            textAlign: 'right',
        },
        staffRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        avatar: (bgColor, textColor) => ({
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '500',
            flexShrink: 0,
            position: 'relative',
            background: bgColor,
            color: textColor,
        }),
        onlineDot: (isOnline) => ({
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: isOnline ? CSS_VARS.green : CSS_VARS.yellow,
            border: `2px solid ${CSS_VARS.white}`,
        }),
        staffInfo: {
            flex: 1,
        },
        staffName: {
            fontSize: '13px',
            fontWeight: '500',
            color: CSS_VARS.ink,
        },
        staffRole: {
            fontSize: '11px',
            color: CSS_VARS.ink4,
        },
    };

    return (
        <aside style={styles.aside}>
            {/* Room Occupancy */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Room Occupancy</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r="28" fill="none" stroke={CSS_VARS.divider} strokeWidth="10" />
                        <circle
                            cx="36" cy="36" r="28" fill="none" stroke={CSS_VARS.blue} strokeWidth="10"
                            strokeDasharray={`${occupancyPercent * 1.76} ${(100 - occupancyPercent) * 1.76}`}
                            strokeDashoffset="44" strokeLinecap="round" transform="rotate(-90 36 36)"
                        />
                        <text
                            x="36" y="36" textAnchor="middle" dominantBaseline="central"
                            fontFamily="Google Sans, sans-serif" fontSize="13" fontWeight="700" fill={CSS_VARS.ink}
                        >
                            {occupancyPercent}%
                        </text>
                    </svg>
                    <div style={{ flex: 1 }}>
                        <div style={styles.statRow}>
                            <div style={styles.colorDot(CSS_VARS.blue)}></div>
                            <span style={styles.statLabel}>Occupied</span>
                            <span style={styles.statValue}>{occupiedRooms}</span>
                        </div>
                        <div style={styles.statRow}>
                            <div style={styles.colorDot(CSS_VARS.green)}></div>
                            <span style={styles.statLabel}>Available</span>
                            <span style={styles.statValue}>{availableRooms}</span>
                        </div>
                        <div style={styles.statRow}>
                            <div style={styles.colorDot(CSS_VARS.yellow)}></div>
                            <span style={styles.statLabel}>Cleaning</span>
                            <span style={styles.statValue}>{cleaningRooms}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.divider}></div>

            {/* Department Load */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Department Load</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {departments.map(dept => (
                        <div key={dept.name} style={styles.deptRow}>
                            <span style={styles.deptName}>{dept.name}</span>
                            <div style={styles.progressBar}>
                                <div style={styles.progressFill(getDeptColor(dept.color), dept.percent)}></div>
                            </div>
                            <span style={styles.progressPercent}>{dept.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.divider}></div>

            {/* Staff Online */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Staff Online</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {staff.map(user => {
                        const colorStyles = getUserColorStyles(user.color);
                        return (
                            <div key={user.initials} style={styles.staffRow}>
                                <div style={styles.avatar(colorStyles.bg, colorStyles.text)}>
                                    {user.initials}
                                    <div style={styles.onlineDot(user.online)}></div>
                                </div>
                                <div style={styles.staffInfo}>
                                    <div style={styles.staffName}>{user.name}</div>
                                    <div style={styles.staffRole}>{user.role}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={styles.divider}></div>

            {/* Log Event */}
            <div>
                <div style={styles.sectionTitle}>Log Event</div>
                <FormInput
                    type="text"
                    placeholder="Patient MRN or username"
                    value={formData.entity}
                    onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                    fullWidth
                    size="sm"
                />
                <div style={{ marginBottom: '8px' }} />
                <FormInput
                    type="text"
                    placeholder="Describe the action..."
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    fullWidth
                    size="sm"
                />
                <div style={{ marginBottom: '8px' }} />
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                        width: '100%',
                        fontFamily: 'Google Sans, sans-serif',
                        fontSize: '13px',
                        color: CSS_VARS.ink,
                        background: CSS_VARS.surface,
                        border: `1px solid ${CSS_VARS.divider}`,
                        borderRadius: CSS_VARS.radiusS,
                        padding: '9px 12px',
                        outline: 'none',
                        marginBottom: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <option value="">Category</option>
                    <option value="patient">Patient</option>
                    <option value="admission">Admission</option>
                    <option value="room">Room</option>
                    <option value="badge">Badge</option>
                    <option value="shift">Shift</option>
                    <option value="alert">Alert</option>
                    <option value="system">System</option>
                </select>
                <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    loading={submitting}
                    disabled={submitting || !formData.action}
                    onClick={handleSubmit}
                >
                    Log Event
                </Button>
            </div>
        </aside>
    );
}

export default RightPanel;