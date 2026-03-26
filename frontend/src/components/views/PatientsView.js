import React, { useState, useEffect, useMemo } from 'react';
import { patientAPI } from '../../services/api';
import { CSS_VARS, COLORS } from '../../utils/constants';
import { formatDate, formatPhone, capitalize } from '../../utils/formatters';
import Button from '../common/Button';
import Card from '../common/Card';
import FormInput from '../common/FormInput';
import Modal from '../common/Modal';
import Table from '../common/Table';
import LoadingSpinner from '../common/LoadingSpinner';

// ============================================================================
// CONSTANTS
// ============================================================================

const GENDERS = ['male', 'female', 'other'];
const AVATAR_COLORS = [CSS_VARS.blue, CSS_VARS.green, '#b45309', '#6d28d9', COLORS.secondary[500]];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const nextMRN = (patients) => {
    if (!patients.length) return 'MRN-000001';
    const nums = patients
        .map(p => parseInt((p.mrn || '').replace(/\D/g, ''), 10))
        .filter(n => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return `MRN-${String(max + 1).padStart(6, '0')}`;
};

const calcAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const bmi = (weight, height) => {
    const w = parseFloat(weight), h = parseFloat(height) / 100;
    if (!w || !h || isNaN(w) || isNaN(h)) return null;
    return (w / (h * h)).toFixed(1);
};

const bmiLabel = (val) => {
    if (!val) return null;
    const v = parseFloat(val);
    if (v < 18.5) return { text: 'Underweight', color: '#b45309', bg: '#FEF3C7', icon: '⚠️' };
    if (v < 25) return { text: 'Normal', color: CSS_VARS.green, bg: CSS_VARS.greenL, icon: '✓' };
    if (v < 30) return { text: 'Overweight', color: '#b45309', bg: '#FEF3C7', icon: '⚠️' };
    return { text: 'Obese', color: COLORS.secondary[500], bg: CSS_VARS.redL, icon: '⚠️' };
};

const tempLabel = (temp) => {
    const t = parseFloat(temp);
    if (!t || isNaN(t)) return null;
    if (t < 36.0) return { text: 'Low', color: CSS_VARS.blue, bg: CSS_VARS.blueL, icon: '❄️' };
    if (t <= 37.5) return { text: 'Normal', color: CSS_VARS.green, bg: CSS_VARS.greenL, icon: '✓' };
    if (t <= 38.5) return { text: 'Fever', color: '#b45309', bg: '#FEF3C7', icon: '🌡️' };
    return { text: 'High Fever', color: COLORS.secondary[500], bg: CSS_VARS.redL, icon: '🔥' };
};

const getInitials = (first, last) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || '?';
};

const avatarColor = (first, last) => {
    const n = ((first?.charCodeAt(0) || 0) + (last?.charCodeAt(0) || 0));
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const AvatarCircle = ({ first, last, size = 40 }) => {
    const color = avatarColor(first, last);
    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color + '18',
            color: color,
            fontWeight: '700',
            fontSize: size * 0.33,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1.5px solid ${color}25`,
        }}>
            {getInitials(first, last)}
        </div>
    );
};

const Chip = ({ text, color, bg, icon }) => (
    <span style={{
        padding: '3px 9px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        background: bg,
        color: color,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
    }}>
        {icon && <span>{icon}</span>}
        {text}
    </span>
);

const VitalPill = ({ value, unit, labelInfo }) => {
    if (!value && value !== 0) return <span style={{ fontSize: '12px', color: CSS_VARS.ink4 }}>—</span>;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: CSS_VARS.ink }}>
                {value}<span style={{ fontSize: '11px', color: CSS_VARS.ink3, marginLeft: '2px' }}>{unit}</span>
            </span>
            {labelInfo && (
                <Chip
                    text={labelInfo.text}
                    color={labelInfo.color}
                    bg={labelInfo.bg}
                    icon={labelInfo.icon}
                />
            )}
        </div>
    );
};

// Styled select component
const StyledSelect = ({ value, onChange, options, label, error, required }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '500', color: '#5a6a7e', letterSpacing: '.04em' }}>
                {label} {required && '*'}
            </label>
            <select
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: `1px solid ${error ? '#f87171' : '#E8EAED'}`,
                    borderRadius: '4px',
                    background: error ? '#fff8f8' : CSS_VARS.white,
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                }}
                onFocus={e => e.target.style.borderColor = '#1B6EF3'}
                onBlur={e => e.target.style.borderColor = error ? '#f87171' : '#E8EAED'}
            >
                {options.map(opt => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                        {opt.label || capitalize(opt)}
                    </option>
                ))}
            </select>
            {error && <span style={{ fontSize: '11.5px', color: '#c53030', marginTop: '2px' }}>{error}</span>}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function PatientsView({ userRole }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [expandedRow, setExpandedRow] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        mrn: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'male',
        contact_phone: '',
        contact_email: '',
        height_cm: '',
        weight_kg: '',
        temperature_c: ''
    });
    const [editErrors, setEditErrors] = useState({});

    const isAdmin = userRole === 'admin';

    // ============================================================================
    // LOAD DATA
    // ============================================================================

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        if (showForm) {
            setFormData(prev => ({ ...prev, mrn: nextMRN(patients) }));
        }
    }, [showForm, patients]);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const res = await patientAPI.getAll();
            const patientsWithVitals = (res.patients || []).map(p => ({
                ...p,
                height_cm: p.height_cm || null,
                weight_kg: p.weight_kg || null,
                temperature_c: p.temperature_c || null
            }));
            setPatients(patientsWithVitals);
        } catch (err) {
            console.error('Failed to load patients:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // FORM HANDLERS
    // ============================================================================

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await patientAPI.create(formData);
            closeForm();
            loadPatients();
            alert('Patient created successfully');
        } catch (err) {
            console.error('Failed to create patient:', err);
            let errorMsg = 'Error creating patient';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMsg = err.response.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMsg = err.response.data.detail;
                }
            }
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setEditErrors({});
        setFormData({
            mrn: patient.mrn,
            first_name: patient.first_name,
            last_name: patient.last_name,
            date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
            gender: patient.gender,
            contact_phone: patient.contact_phone || '',
            contact_email: patient.contact_email || '',
            height_cm: patient.height_cm || '',
            weight_kg: patient.weight_kg || '',
            temperature_c: patient.temperature_c || ''
        });
        setShowEditModal(true);
    };

    const validateEdit = () => {
        const errors = {};
        if (!formData.first_name.trim()) errors.first_name = 'First name required';
        if (!formData.last_name.trim()) errors.last_name = 'Last name required';
        if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth required';
        return errors;
    };

    const handleUpdate = async () => {
        const errors = validateEdit();
        if (Object.keys(errors).length) {
            setEditErrors(errors);
            return;
        }

        setSubmitting(true);
        setEditErrors({});

        try {
            const updateData = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                contact_phone: formData.contact_phone || null,
                contact_email: formData.contact_email || null,
                height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
                weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
                temperature_c: formData.temperature_c ? parseFloat(formData.temperature_c) : null
            };

            await patientAPI.update(editingPatient.id, updateData);
            setShowEditModal(false);
            setEditingPatient(null);
            await loadPatients();
            alert('Patient updated successfully');
        } catch (err) {
            console.error('Failed to update patient:', err);
            let errorMsg = 'Error updating patient';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMsg = err.response.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMsg = err.response.data.detail;
                }
            }
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (patientId, patientName) => {
        if (!window.confirm(`Delete patient ${patientName}? This action cannot be undone.`)) return;
        try {
            await patientAPI.delete(patientId);
            loadPatients();
            alert('Patient deleted successfully');
        } catch (err) {
            console.error('Failed to delete patient:', err);
            alert('Error deleting patient');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setFormData({
            mrn: '',
            first_name: '',
            last_name: '',
            date_of_birth: '',
            gender: 'male',
            contact_phone: '',
            contact_email: '',
            height_cm: '',
            weight_kg: '',
            temperature_c: ''
        });
    };

    // ============================================================================
    // FILTER DATA
    // ============================================================================

    const filtered = useMemo(() => {
        return patients.filter(p => {
            const hay = `${p.first_name} ${p.last_name} ${p.mrn} ${p.contact_phone} ${p.contact_email}`.toLowerCase();
            return hay.includes(search.toLowerCase()) && (genderFilter === 'all' || p.gender === genderFilter);
        });
    }, [patients, search, genderFilter]);

    // ============================================================================
    // STATS
    // ============================================================================

    const stats = [
        { label: 'Total Patients', value: patients.length, color: CSS_VARS.blue, bg: CSS_VARS.blueL },
        { label: 'Male', value: patients.filter(p => p.gender === 'male').length, color: CSS_VARS.blue, bg: CSS_VARS.blueL },
        { label: 'Female', value: patients.filter(p => p.gender === 'female').length, color: '#6d28d9', bg: '#F3E8FD' },
        {
            label: 'Abnormal Temp', value: patients.filter(p => {
                const temp = parseFloat(p.temperature_c);
                return temp && (temp < 36.0 || temp > 37.5);
            }).length, color: COLORS.warning[500], bg: '#FEF3C7'
        },
    ];

    // ============================================================================
    // TABLE COLUMNS
    // ============================================================================

    const columns = [
        { key: 'patient', label: 'Patient', width: '180px' },
        { key: 'mrn', label: 'MRN', width: '100px' },
        { key: 'age', label: 'Age / DOB', width: '100px' },
        { key: 'gender', label: 'Gender', width: '80px' },
        { key: 'height', label: 'Height', width: '80px' },
        { key: 'weight', label: 'Weight', width: '80px' },
        { key: 'temp', label: 'Temp', width: '80px' },
        { key: 'contact', label: 'Contact', width: '150px' },
        { key: 'actions', label: 'Actions', width: '100px' },
    ];

    const renderCell = (column, row) => {
        const age = calcAge(row.date_of_birth);
        const tl = tempLabel(row.temperature_c);

        switch (column.key) {
            case 'patient':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AvatarCircle first={row.first_name} last={row.last_name} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: CSS_VARS.ink }}>
                            {row.first_name} {row.last_name}
                        </span>
                    </div>
                );
            case 'mrn':
                return (
                    <span style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: CSS_VARS.ink3,
                        background: CSS_VARS.surface,
                        padding: '3px 8px',
                        borderRadius: '6px',
                    }}>
                        {row.mrn}
                    </span>
                );
            case 'age':
                return (
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: CSS_VARS.ink }}>
                            {age != null ? `${age} yrs` : '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: CSS_VARS.ink4, marginTop: '1px' }}>
                            {row.date_of_birth ? formatDate(row.date_of_birth, 'short') : '—'}
                        </div>
                    </div>
                );
            case 'gender': {
                const genderColor = row.gender === 'female' ? '#6d28d9' : row.gender === 'male' ? CSS_VARS.blue : CSS_VARS.ink3;
                const genderBg = row.gender === 'female' ? '#F3E8FD' : row.gender === 'male' ? CSS_VARS.blueL : CSS_VARS.surface;
                return <Chip text={capitalize(row.gender || '—')} color={genderColor} bg={genderBg} />;
            }
            case 'height':
                return <VitalPill value={row.height_cm} unit="cm" />;
            case 'weight':
                return <VitalPill value={row.weight_kg} unit="kg" />;
            case 'temp':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <VitalPill value={row.temperature_c} unit="°C" />
                        {tl && tl.text !== 'Normal' && (
                            <Chip text={tl.text} color={tl.color} bg={tl.bg} icon={tl.icon} />
                        )}
                    </div>
                );
            case 'contact':
                return (
                    <div>
                        <div style={{ fontSize: '13px', color: CSS_VARS.ink2 }}>{formatPhone(row.contact_phone) || '—'}</div>
                        {row.contact_email && <div style={{ fontSize: '11px', color: CSS_VARS.ink4, marginTop: '2px' }}>{row.contact_email}</div>}
                    </div>
                );
            case 'actions':
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(row)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(row.id, row.first_name + ' ' + row.last_name)}
                        >
                            Delete
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <LoadingSpinner size="lg" message="Loading patients..." />
            </div>
        );
    }

    // BMI preview for form
    const bmiPreview = () => {
        if (!formData.height_cm || !formData.weight_kg) return null;
        const b = bmi(formData.weight_kg, formData.height_cm);
        const bl = bmiLabel(b);
        if (!b || !bl) return null;
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: bl.bg,
                marginBottom: '20px',
                border: `1px solid ${bl.color}20`,
            }}>
                <span style={{ fontSize: '13px', color: bl.color }}>BMI</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: bl.color }}>{b}</span>
                <Chip text={bl.text} color={bl.color} bg={bl.bg} icon={bl.icon} />
            </div>
        );
    };

    // Temperature preview for form
    const tempPreview = () => {
        if (!formData.temperature_c) return null;
        const tl = tempLabel(formData.temperature_c);
        if (!tl) return null;
        if (tl.text === 'Normal') return null;
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: tl.bg,
                marginBottom: '20px',
                border: `1px solid ${tl.color}20`,
            }}>
                <span style={{ fontSize: '13px', color: tl.color }}>Temperature Alert</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: tl.color }}>{formData.temperature_c}°C</span>
                <Chip text={tl.text} color={tl.color} bg={tl.bg} icon={tl.icon} />
            </div>
        );
    };

    return (
        <div style={{ background: CSS_VARS.white, minHeight: '100vh', borderRadius: '0' }}>
            <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: CSS_VARS.blueL,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                            }}>
                                🏥
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: CSS_VARS.ink, margin: 0, letterSpacing: '-0.4px' }}>
                                Patients
                            </h1>
                        </div>
                        <p style={{ fontSize: '14px', color: CSS_VARS.ink3, margin: 0, paddingLeft: '52px' }}>
                            {isAdmin ? 'Manage all patients' : 'View assigned patients'}
                        </p>
                    </div>
                    {isAdmin && (
                        <Button variant="primary" onClick={() => setShowForm(true)}>
                            + Add Patient
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
                    {stats.map(s => (
                        <div key={s.label} style={{
                            padding: '16px 18px',
                            borderRadius: '14px',
                            background: s.bg,
                            border: `1px solid ${s.color}20`,
                        }}>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, letterSpacing: '-1px' }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: '12px', color: s.color, marginTop: '4px', fontWeight: '500' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, MRN or phone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px 10px 36px',
                                border: `1px solid ${CSS_VARS.divider}`,
                                borderRadius: '100px',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>
                    {['all', 'male', 'female', 'other'].map(g => (
                        <button
                            key={g}
                            onClick={() => setGenderFilter(g)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '100px',
                                border: genderFilter === g ? `1.5px solid ${CSS_VARS.blue}` : `1px solid ${CSS_VARS.divider}`,
                                background: genderFilter === g ? CSS_VARS.blueL : CSS_VARS.white,
                                color: genderFilter === g ? CSS_VARS.blue : CSS_VARS.ink3,
                                fontSize: '13px',
                                fontWeight: genderFilter === g ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {capitalize(g)}
                        </button>
                    ))}
                    <span style={{ fontSize: '13px', color: CSS_VARS.ink3 }}>
                        {filtered.length} patient{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Table */}
                <Card>
                    <Table
                        columns={columns}
                        data={filtered}
                        renderCell={renderCell}
                        onRowClick={(row) => setExpandedRow(expandedRow === row.id ? null : row.id)}
                        emptyMessage="No patients found"
                        hoverable
                    />

                    {/* Expanded Row Details */}
                    {expandedRow && (() => {
                        const patient = patients.find(p => p.id === expandedRow);
                        if (!patient) return null;
                        const age = calcAge(patient.date_of_birth);
                        const b = bmi(patient.weight_kg, patient.height_cm);
                        const bl = bmiLabel(b);
                        const tl = tempLabel(patient.temperature_c);

                        return (
                            <div style={{ padding: '16px 20px 20px 72px', background: CSS_VARS.blueL, borderTop: `1px solid ${CSS_VARS.divider}` }}>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Full Name', val: `${patient.first_name} ${patient.last_name}` },
                                        { label: 'Age', val: age != null ? `${age} years old` : '—' },
                                        { label: 'Height', val: patient.height_cm ? `${patient.height_cm} cm` : '—' },
                                        { label: 'Weight', val: patient.weight_kg ? `${patient.weight_kg} kg` : '—' },
                                        { label: 'BMI', val: b || '—', badge: bl },
                                        { label: 'Temperature', val: patient.temperature_c ? `${patient.temperature_c}°C` : '—', badge: tl },
                                        { label: 'Phone', val: formatPhone(patient.contact_phone) || '—' },
                                        { label: 'Email', val: patient.contact_email || '—' },
                                    ].map(item => (
                                        <div key={item.label} style={{
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            background: CSS_VARS.white,
                                            border: `1px solid ${CSS_VARS.divider}`,
                                            minWidth: '100px',
                                        }}>
                                            <div style={{ fontSize: '10px', color: CSS_VARS.ink4, fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: CSS_VARS.ink }}>
                                                {item.val}
                                            </div>
                                            {item.badge && (
                                                <div style={{ marginTop: '6px' }}>
                                                    <Chip text={item.badge.text} color={item.badge.color} bg={item.badge.bg} icon={item.badge.icon} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </Card>

                {filtered.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: CSS_VARS.ink4 }}>
                        Showing {filtered.length} of {patients.length} patients · click any row to expand vitals
                    </div>
                )}

                {/* Add Patient Modal */}
                <Modal
                    isOpen={showForm}
                    onClose={closeForm}
                    title="New Patient Record"
                    size="lg"
                    confirmText="Create Patient Record"
                    cancelText="Cancel"
                    onConfirm={handleSubmit}
                    loading={submitting}
                    showConfirmButton={true}
                    showCancelButton={true}
                >
                    <div style={{ background: CSS_VARS.blueL, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: CSS_VARS.blue, fontFamily: 'monospace' }}>
                            {formData.mrn || 'MRN-000000'}
                        </div>
                        <div style={{ fontSize: '11px', color: CSS_VARS.ink3 }}>Auto-generated Medical Record Number</div>
                    </div>

                    {/* Identity Section */}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: CSS_VARS.ink4, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Identity
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <FormInput
                            label="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            fullWidth
                        />
                        <FormInput
                            label="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            fullWidth
                        />
                        <FormInput
                            label="Date of Birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            required
                            fullWidth
                        />
                        <StyledSelect
                            label="Gender"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            options={GENDERS}
                            required
                        />
                    </div>

                    {/* Vitals Section */}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: CSS_VARS.ink4, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Vitals
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <FormInput
                            label="Height (cm)"
                            type="number"
                            placeholder="e.g. 175"
                            value={formData.height_cm}
                            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                            fullWidth
                        />
                        <FormInput
                            label="Weight (kg)"
                            type="number"
                            placeholder="e.g. 72"
                            value={formData.weight_kg}
                            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                            fullWidth
                        />
                        <FormInput
                            label="Temperature (°C)"
                            type="number"
                            placeholder="e.g. 37.0"
                            value={formData.temperature_c}
                            onChange={(e) => setFormData({ ...formData, temperature_c: e.target.value })}
                            fullWidth
                            helperText="Normal range: 36.0°C - 37.5°C"
                        />
                    </div>

                    {/* BMI Preview */}
                    {bmiPreview()}

                    {/* Temperature Alert Preview */}
                    {tempPreview()}

                    {/* Contact Section */}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: CSS_VARS.ink4, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Contact
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <FormInput
                            label="Phone"
                            placeholder="e.g. 555-0101"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                            fullWidth
                        />
                        <FormInput
                            label="Email"
                            type="email"
                            placeholder="e.g. patient@email.com"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            fullWidth
                        />
                    </div>
                </Modal>

                {/* Edit Patient Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit Patient Record"
                    size="lg"
                    confirmText="Update Patient"
                    cancelText="Cancel"
                    onConfirm={handleUpdate}
                    loading={submitting}
                    showConfirmButton={true}
                    showCancelButton={true}
                >
                    <div style={{ background: CSS_VARS.blueL, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: CSS_VARS.blue, fontFamily: 'monospace' }}>
                            {formData.mrn}
                        </div>
                        <div style={{ fontSize: '11px', color: CSS_VARS.ink3 }}>Medical Record Number (cannot be changed)</div>
                    </div>

                    {/* Identity Section */}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: CSS_VARS.ink4, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Identity
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <FormInput
                            label="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            fullWidth
                            error={editErrors.first_name}
                        />
                        <FormInput
                            label="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            fullWidth
                            error={editErrors.last_name}
                        />
                        <FormInput
                            label="Date of Birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            required
                            fullWidth
                            error={editErrors.date_of_birth}
                        />
                        <StyledSelect
                            label="Gender"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            options={GENDERS}
                            required
                        />
                    </div>

                    {/* Vitals Section */}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: CSS_VARS.ink4, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Vitals
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <FormInput
                            label="Height (cm)"
                            type="number"
                            placeholder="e.g. 175"
                            value={formData.height_cm}
                            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                            fullWidth
                        />
                        <FormInput
                            label="Weight (kg)"
                            type="number"
                            placeholder="e.g. 72"
                            value={formData.weight_kg}
                            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                            fullWidth
                        />
                        <FormInput
                            label="Temperature (°C)"
                            type="number"
                            placeholder="e.g. 37.0"
                            value={formData.temperature_c}
                            onChange={(e) => setFormData({ ...formData, temperature_c: e.target.value })}
                            fullWidth
                            helperText="Normal range: 36.0°C - 37.5°C"
                        />
                    </div>

                    {/* BMI Preview */}
                    {bmiPreview()}

                    {/* Temperature Alert Preview */}
                    {tempPreview()}

                    {/* Contact Section */}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: CSS_VARS.ink4, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Contact
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <FormInput
                            label="Phone"
                            placeholder="e.g. 555-0101"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                            fullWidth
                        />
                        <FormInput
                            label="Email"
                            type="email"
                            placeholder="e.g. patient@email.com"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            fullWidth
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default PatientsView;