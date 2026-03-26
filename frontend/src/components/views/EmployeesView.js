import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../../services/api';
import { CSS_VARS, COLORS } from '../../utils/constants';
import { capitalize } from '../../utils/formatters';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import Modal from '../common/Modal';
import Table from '../common/Table';
import LoadingSpinner from '../common/LoadingSpinner';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEPARTMENTS = [
    'Emergency', 'ICU', 'Surgery', 'Pediatrics',
    'Nursing', 'Cardiology', 'Radiology', 'Pharmacy',
    'Neurology', 'Administration', 'Security', 'Maintenance',
];

const DEPT_COLORS = {
    Emergency: { color: COLORS.secondary[500], bg: COLORS.secondary[50] },
    ICU: { color: COLORS.secondary[500], bg: COLORS.secondary[50] },
    Surgery: { color: COLORS.success[500], bg: COLORS.success[50] },
    Pediatrics: { color: COLORS.primary[500], bg: COLORS.primary[50] },
    Nursing: { color: COLORS.success[500], bg: COLORS.success[50] },
    Cardiology: { color: '#b45309', bg: '#fffbeb' },
    Radiology: { color: '#b45309', bg: '#fffbeb' },
    Pharmacy: { color: COLORS.success[500], bg: COLORS.success[50] },
    Neurology: { color: '#6d28d9', bg: '#faf5ff' },
    Administration: { color: CSS_VARS.gray, bg: CSS_VARS.surface },
    Security: { color: COLORS.secondary[500], bg: COLORS.secondary[50] },
    Maintenance: { color: CSS_VARS.gray, bg: CSS_VARS.surface },
};

const ROLE_CONFIG = {
    admin: { label: 'Admin', short: 'AD', bg: CSS_VARS.surface, color: CSS_VARS.gray },
    doctor: { label: 'Doctor', short: 'DR', bg: CSS_VARS.blueL, color: CSS_VARS.blue },
    nurse: { label: 'Nurse', short: 'RN', bg: CSS_VARS.greenL, color: CSS_VARS.green },
    specialist: { label: 'Specialist', short: 'SP', bg: '#faf5ff', color: '#6d28d9' },
    resident: { label: 'Resident', short: 'RS', bg: CSS_VARS.yellowL, color: '#b06000' },
    other: { label: 'Other', short: '—', bg: CSS_VARS.surface, color: CSS_VARS.gray },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (first, last) => {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase() || '?';
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const Avatar = ({ first, last }) => {
    const colors = [CSS_VARS.blue, CSS_VARS.green, '#b45309', COLORS.secondary[500], '#6d28d9'];
    const idx = ((first?.charCodeAt(0) || 0) + (last?.charCodeAt(0) || 0)) % colors.length;
    const color = colors[idx];
    return (
        <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
            background: color + '18',
            color: color,
            border: `1.5px solid ${color}28`,
        }}>
            {getInitials(first, last)}
        </div>
    );
};

const RoleBadge = ({ role }) => {
    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.other;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px 3px 3px',
            borderRadius: '20px',
            border: `1.5px solid ${cfg.bg}`,
            background: cfg.bg,
            color: cfg.color,
            fontSize: '11.5px',
            fontWeight: '500',
        }}>
            <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: '700',
                background: cfg.color,
                color: CSS_VARS.white,
            }}>
                {cfg.short}
            </span>
            {cfg.label}
        </span>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function EmployeesView() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        employee_number: '',
        department: 'Emergency',
        job_title: '',
        role: 'doctor',
    });
    const [errors, setErrors] = useState({});

    // ============================================================================
    // LOAD DATA
    // ============================================================================

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const empRes = await employeeAPI.getAll();
            setEmployees(empRes?.employees || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ============================================================================
    // FORM HANDLERS
    // ============================================================================

    const nextEmpNumber = () => {
        if (!employees.length) return 'EMP-001';
        const nums = employees
            .map(e => parseInt((e.employee_number || '').replace(/\D/g, ''), 10))
            .filter(n => !isNaN(n));
        const max = nums.length ? Math.max(...nums) : 0;
        return `EMP-${String(max + 1).padStart(3, '0')}`;
    };

    useEffect(() => {
        if (showForm) {
            setFormData(prev => ({ ...prev, employee_number: nextEmpNumber() }));
        }
    }, [showForm, employees]);

    const validate = () => {
        const e = {};
        if (!formData.first_name.trim()) e.first_name = 'Required';
        if (!formData.last_name.trim()) e.last_name = 'Required';
        if (!formData.employee_number.trim()) e.employee_number = 'Required';
        if (!formData.job_title.trim()) e.job_title = 'Required';
        return e;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        try {
            await employeeAPI.create({
                user_id: null,  // Always null - no user account linking
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                employee_number: formData.employee_number.trim(),
                department: formData.department,
                job_title: formData.job_title.trim(),
            });
            closeForm();
            loadData();
        } catch (err) {
            console.error('Failed to create employee:', err);

            let errorMessage = 'Failed to create employee';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMessage = err.response.data.detail;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setErrors({ submit: errorMessage });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this employee?')) return;
        try {
            await employeeAPI.delete(id);
            loadData();
        } catch (err) {
            console.error('Failed to delete employee:', err);
            alert('Error deleting employee');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setErrors({});
        setFormData({
            first_name: '',
            last_name: '',
            employee_number: '',
            department: 'Emergency',
            job_title: '',
            role: 'doctor',
        });
    };

    // ============================================================================
    // FILTER DATA
    // ============================================================================

    const filtered = employees.filter(emp => {
        const hay = `${emp.first_name} ${emp.last_name} ${emp.employee_number} ${emp.job_title}`.toLowerCase();
        return (
            hay.includes(search.toLowerCase()) &&
            (!filterDept || emp.department === filterDept) &&
            (!filterRole || emp.role === filterRole)
        );
    });

    // ============================================================================
    // STATS
    // ============================================================================

    const stats = {
        total: employees.length,
        departments: new Set(employees.map(e => e.department)).size,
        doctors: employees.filter(e => e.role === 'doctor').length,
        nurses: employees.filter(e => e.role === 'nurse').length,
    };

    // ============================================================================
    // TABLE COLUMNS
    // ============================================================================

    const columns = [
        { key: 'name', label: 'Employee', width: '200px' },
        { key: 'employee_number', label: 'Number', width: '100px' },
        { key: 'department', label: 'Department', width: '120px' },
        { key: 'job_title', label: 'Job Title', width: '150px' },
        { key: 'role', label: 'Role Badge', width: '100px' },
        { key: 'actions', label: '', width: '80px' },
    ];

    const renderCell = (column, row) => {
        switch (column.key) {
            case 'name':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                        <Avatar first={row.first_name} last={row.last_name} />
                        <span style={{ fontWeight: 600, color: CSS_VARS.ink }}>{row.first_name} {row.last_name}</span>
                    </div>
                );
            case 'employee_number':
                return (
                    <span style={{
                        fontFamily: 'monospace',
                        fontSize: '11.5px',
                        fontWeight: 500,
                        background: CSS_VARS.surface,
                        color: CSS_VARS.gray,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${CSS_VARS.divider}`,
                        display: 'inline-block',
                    }}>
                        {row.employee_number}
                    </span>
                );
            case 'department': {
                const deptStyle = DEPT_COLORS[row.department] || { color: CSS_VARS.gray, bg: CSS_VARS.surface };
                return (
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: deptStyle.bg,
                        color: deptStyle.color,
                    }}>
                        {row.department}
                    </span>
                );
            }
            case 'job_title':
                return <span style={{ color: CSS_VARS.ink2, fontSize: 13 }}>{row.job_title}</span>;
            case 'role':
                return <RoleBadge role={row.role} />;
            case 'actions':
                return (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(row.id)}
                    >
                        Delete
                    </Button>
                );
            default:
                return row[column.key];
        }
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <LoadingSpinner size="lg" message="Loading employees..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '36px 40px', background: CSS_VARS.surface, minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: CSS_VARS.ink4, marginBottom: '6px' }}>
                        Staff Management
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.4px', color: CSS_VARS.ink }}>
                        Employees
                    </div>
                </div>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                    + Add Employee
                </Button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'flex', gap: '1px', background: CSS_VARS.divider, borderRadius: '14px', overflow: 'hidden', marginBottom: '28px' }}>
                {[
                    { label: 'Total Staff', value: stats.total, color: CSS_VARS.blue },
                    { label: 'Departments', value: stats.departments, color: CSS_VARS.ink },
                    { label: 'Doctors', value: stats.doctors, color: CSS_VARS.blue },
                    { label: 'Nurses', value: stats.nurses, color: CSS_VARS.green },
                ].map((stat, i) => (
                    <div key={i} style={{ flex: 1, background: CSS_VARS.white, padding: '18px 22px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: CSS_VARS.ink4 }}>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.5px', color: stat.color }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: CSS_VARS.ink4 }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, number, title…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '9px 13px 9px 34px',
                            fontSize: '13.5px',
                            border: `1.5px solid ${CSS_VARS.divider}`,
                            borderRadius: '10px',
                            outline: 'none',
                            fontFamily: 'inherit',
                        }}
                    />
                </div>
                <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    style={{
                        padding: '9px 13px',
                        fontSize: '13.5px',
                        border: `1.5px solid ${CSS_VARS.divider}`,
                        borderRadius: '10px',
                        background: CSS_VARS.white,
                        cursor: 'pointer',
                        minWidth: '160px',
                    }}
                >
                    <option value="">All departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{
                        padding: '9px 13px',
                        fontSize: '13.5px',
                        border: `1.5px solid ${CSS_VARS.divider}`,
                        borderRadius: '10px',
                        background: CSS_VARS.white,
                        cursor: 'pointer',
                        minWidth: '160px',
                    }}
                >
                    <option value="">All roles</option>
                    {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: CSS_VARS.ink4 }}>
                    {filtered.length} EMPLOYEE{filtered.length !== 1 ? 'S' : ''}
                </span>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={filtered}
                renderCell={renderCell}
                emptyMessage="No employees found"
                hoverable
                striped
            />

            {/* Add Employee Modal */}
            <Modal
                isOpen={showForm}
                onClose={closeForm}
                title="Add New Employee"
                size="lg"
                confirmText="Create Employee"
                cancelText="Cancel"
                onConfirm={handleSubmit}
                loading={submitting}
                showConfirmButton={true}
                showCancelButton={true}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormInput
                        label="First Name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        error={errors.first_name}
                        required
                        fullWidth
                    />
                    <FormInput
                        label="Last Name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        error={errors.last_name}
                        required
                        fullWidth
                    />
                    <FormInput
                        label="Employee Number"
                        value={formData.employee_number}
                        onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                        error={errors.employee_number}
                        required
                        fullWidth
                    />
                    <FormInput
                        label="Job Title"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        error={errors.job_title}
                        required
                        fullWidth
                    />
                    <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            border: `1px solid ${CSS_VARS.divider}`,
                            borderRadius: '4px',
                            background: CSS_VARS.white,
                        }}
                    >
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            border: `1px solid ${CSS_VARS.divider}`,
                            borderRadius: '4px',
                            background: CSS_VARS.white,
                        }}
                    >
                        {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
                {errors.submit && (
                    <div style={{ marginTop: '16px', padding: '10px', background: CSS_VARS.redL, color: CSS_VARS.red, borderRadius: '8px', fontSize: '13px' }}>
                        {errors.submit}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default EmployeesView;