import React, { useState, useEffect, useCallback } from 'react';
import { admissionAPI, patientAPI, roomAPI, employeeAPI } from '../../services/api';

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
    doctor: { label: 'Doctor', short: 'DR', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    nurse: { label: 'Nurse', short: 'RN', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    specialist: { label: 'Specialist', short: 'SP', bg: '#faf5ff', color: '#6d28d9', border: '#ddd6fe' },
    resident: { label: 'Resident', short: 'RS', bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
};

const BLANK_FORM = {
    patient_id: '',
    room_id: '',
    attending_employee_id: '',
    admission_reason: '',
    priority: 'routine',
    assigned_staff: [],
};

// ─── Styles (keep the same) ───────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .adm-root { font-family: 'DM Sans', sans-serif; background: #f7f8fc; min-height: 100vh; padding: 36px 40px; color: #0f1924; }

  /* Header */
  .adm-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 36px; }
  .adm-eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: .18em; text-transform: uppercase; color: #7c8fa6; margin-bottom: 6px; }
  .adm-page-title { font-size: 28px; font-weight: 600; letter-spacing: -.4px; color: #0f1924; line-height: 1; }

  /* Stats bar */
  .adm-stats { display: flex; gap: 1px; background: #e0e5ef; border-radius: 14px; overflow: hidden; margin-bottom: 28px; border: 1px solid #e0e5ef; }
  .adm-stat { flex: 1; background: #fff; padding: 18px 22px; display: flex; flex-direction: column; gap: 4px; transition: background .15s; }
  .adm-stat:hover { background: #fafbff; }
  .adm-stat-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #a0aec0; font-weight: 500; }
  .adm-stat-val { font-size: 26px; font-weight: 600; letter-spacing: -.5px; color: #0f1924; line-height: 1; }
  .adm-stat-sub { font-size: 12px; color: #7c8fa6; }
  .adm-stat-val.red   { color: #d63b3b; }
  .adm-stat-val.amber { color: #d97706; }
  .adm-stat-val.teal  { color: #0d9488; }

  /* Buttons */
  .adm-btn { display: inline-flex; align-items: center; gap: 7px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500; border: none; border-radius: 10px; cursor: pointer; transition: all .15s; padding: 10px 18px; line-height: 1; }
  .adm-btn-primary { background: #0f1924; color: #fff; box-shadow: 0 1px 3px rgba(15,25,36,.18); }
  .adm-btn-primary:hover:not(:disabled) { background: #1e3048; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(15,25,36,.2); }
  .adm-btn-primary:disabled { opacity: .55; cursor: not-allowed; }
  .adm-btn-ghost { background: transparent; color: #5a6a7e; border: 1.5px solid #dde3ef; }
  .adm-btn-ghost:hover { background: #f0f3fa; color: #0f1924; }

  /* Toast / feedback */
  .adm-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    display: flex; align-items: center; gap: 10px;
    padding: 14px 20px; border-radius: 12px;
    font-size: 13.5px; font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,.14);
    animation: toastIn .25s ease;
  }
  @keyframes toastIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
  .adm-toast.success { background: #0f1924; color: #fff; }
  .adm-toast.error   { background: #fff0f0; color: #c53030; border: 1.5px solid #feb2b2; }

  /* Inline validation */
  .adm-field-error { font-size: 11.5px; color: #c53030; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
  .adm-input.invalid { border-color: #f87171 !important; background: #fff8f8 !important; }

  /* Form card */
  .adm-form-wrap { background: #fff; border: 1.5px solid #e0e5ef; border-radius: 16px; padding: 28px 32px; margin-bottom: 28px; box-shadow: 0 2px 12px rgba(15,25,36,.06); animation: slideDown .22s ease; }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .adm-form-title { font-size: 16px; font-weight: 600; color: #0f1924; margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px solid #f0f3fa; display: flex; align-items: center; gap: 10px; }
  .adm-form-dot { width: 8px; height: 8px; background: #0f1924; border-radius: 50%; flex-shrink: 0; }

  .adm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .adm-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 4px; }
  .adm-field.span2 { grid-column: 1 / -1; }
  .adm-label { font-size: 11.5px; font-weight: 500; color: #5a6a7e; letter-spacing: .04em; }
  .adm-input {
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #0f1924;
    background: #f7f8fc; border: 1.5px solid #e0e5ef; border-radius: 9px;
    padding: 9px 13px; outline: none; transition: border-color .15s, background .15s, box-shadow .15s;
    -webkit-appearance: none; width: 100%; box-sizing: border-box;
  }
  .adm-input:focus { border-color: #0f1924; background: #fff; box-shadow: 0 0 0 3px rgba(15,25,36,.06); }

  /* Staff section divider */
  .adm-section-sep { display: flex; align-items: center; gap: 12px; margin: 24px 0 18px; }
  .adm-section-sep-line { flex: 1; height: 1px; background: #f0f3fa; }
  .adm-section-sep-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #a0aec0; white-space: nowrap; }

  /* Staff picker cards */
  .adm-staff-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
    margin-top: 12px;
  }
  .adm-staff-card {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 12px;
    border: 1.5px solid #e0e5ef;
    border-radius: 10px;
    cursor: pointer;
    transition: all .13s;
    background: #fff;
    user-select: none;
  }
  .adm-staff-card:hover { border-color: #a0b4cc; background: #fafbff; }
  .adm-staff-card.selected { border-color: #0f1924; background: #f7f8fc; box-shadow: 0 0 0 2px rgba(15,25,36,.06); }
  .adm-staff-check {
    width: 17px; height: 17px;
    border: 1.5px solid #d0d9e8;
    border-radius: 5px;
    background: #fff;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: transparent;
    transition: all .13s;
  }
  .adm-staff-card.selected .adm-staff-check { background: #0f1924; border-color: #0f1924; color: #fff; }
  .adm-staff-name { font-size: 13px; font-weight: 500; color: #0f1924; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .adm-staff-dept { font-size: 11px; color: #7c8fa6; }
  .adm-staff-abbr { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 700; padding: 2px 5px; border-radius: 4px; flex-shrink: 0; }

  /* Selected staff summary chips */
  .adm-selected-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; min-height: 0; }
  .adm-selected-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px 4px 5px; border-radius: 20px; border: 1.5px solid;
    font-size: 12px; font-weight: 500;
  }
  .adm-selected-chip-icon { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .adm-selected-chip-x { margin-left: 4px; cursor: pointer; opacity: .5; font-size: 13px; line-height: 1; }
  .adm-selected-chip-x:hover { opacity: 1; }

  /* Form actions */
  .adm-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0f3fa; }

  /* Table */
  .adm-table-card { background: #fff; border: 1.5px solid #e0e5ef; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(15,25,36,.06); }
  .adm-table-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-bottom: 1px solid #f0f3fa; }
  .adm-table-count { font-family: 'DM Mono', monospace; font-size: 11px; color: #7c8fa6; letter-spacing: .06em; }
  .adm-table { width: 100%; border-collapse: collapse; }
  .adm-table thead th { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: #a0aec0; padding: 11px 20px; text-align: left; background: #fafbff; border-bottom: 1px solid #f0f3fa; white-space: nowrap; }
  .adm-table tbody tr { border-bottom: 1px solid #f7f8fc; transition: background .12s; }
  .adm-table tbody tr:last-child { border-bottom: none; }
  .adm-table tbody tr:hover { background: #fafbff; }
  .adm-table td { padding: 13px 20px; font-size: 13.5px; color: #2d3d50; vertical-align: middle; }
  .adm-patient-name { font-weight: 600; color: #0f1924; font-size: 14px; }
  .adm-room-badge { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; background: #f0f3fa; color: #4a5e72; padding: 4px 10px; border-radius: 6px; border: 1px solid #e0e5ef; display: inline-block; }
  .adm-reason { color: #5a6a7e; font-size: 13px; }

  /* Priority / status chips */
  .adm-chip { display: inline-flex; align-items: center; gap: 5px; font-family: 'DM Mono', monospace; font-size: 10.5px; font-weight: 500; letter-spacing: .08em; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; white-space: nowrap; }
  .adm-chip::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .adm-chip-red   { background: #fff0f0; color: #c53030; }
  .adm-chip-amber { background: #fffbeb; color: #b45309; }
  .adm-chip-gray  { background: #f0f3fa; color: #4a5e72; }
  .adm-chip-blue  { background: #eff6ff; color: #1d4ed8; }
  .adm-chip-green { background: #f0fdf4; color: #166534; }

  /* Staff badges in table */
  .adm-badges { display: flex; flex-wrap: wrap; gap: 5px; }
  .adm-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px 3px 3px; border-radius: 20px; border: 1.5px solid; font-size: 11.5px; font-weight: 500; white-space: nowrap; }
  .adm-badge-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .adm-badge-none { font-size: 12px; color: #a0aec0; font-style: italic; }

  /* Empty / loading */
  .adm-empty { padding: 56px 20px; text-align: center; color: #a0aec0; font-size: 14px; }
  .adm-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: .4; }
  .adm-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 80px; color: #7c8fa6; font-size: 14px; }
  .adm-spinner { width: 18px; height: 18px; border: 2px solid #e0e5ef; border-top-color: #0f1924; border-radius: 50%; animation: admspin .7s linear infinite; }
  @keyframes admspin { to { transform: rotate(360deg); } }
`;

// ─── Toast helper ─────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);
    return <div className={`adm-toast ${type}`}>{type === 'success' ? '✓' : '⚠'} {message}</div>;
}

// ─── Staff badge (table row) ─────────────────────────────────────────────────
function StaffBadge({ member }) {
    const cfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.doctor;
    return (
        <span className="adm-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
            <span className="adm-badge-icon" style={{ background: cfg.color }}>{cfg.short}</span>
            {member.first_name} {member.last_name}
        </span>
    );
}

// ─── Staff picker with department filter ─────────────────────────────────────
function StaffPicker({ staff, selected, onChange, selectedDept }) {
    const toggle = (member) => {
        const already = selected.find(s => s.id === member.id);
        onChange(already ? selected.filter(s => s.id !== member.id) : [...selected, member]);
    };
    const remove = (id) => onChange(selected.filter(s => s.id !== id));

    const filteredStaff = selectedDept ? staff.filter(s => s.department === selectedDept) : staff;

    return (
        <div>
            {filteredStaff.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#7c8fa6', fontSize: '13px' }}>
                    No staff found in this department
                </div>
            ) : (
                <div className="adm-staff-grid">
                    {filteredStaff.map(m => {
                        const isSelected = !!selected.find(s => s.id === m.id);
                        const cfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.doctor;
                        return (
                            <div
                                key={m.id}
                                className={`adm-staff-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggle(m)}
                            >
                                <div className="adm-staff-check">{isSelected ? '✓' : ''}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="adm-staff-name">{m.first_name} {m.last_name}</div>
                                    <div className="adm-staff-dept">{m.department}</div>
                                </div>
                                <span className="adm-staff-abbr" style={{ background: cfg.bg, color: cfg.color }}>
                                    {cfg.short}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {selected.length > 0 && (
                <div className="adm-selected-wrap">
                    {selected.map(s => {
                        const cfg = ROLE_CONFIG[s.role] || ROLE_CONFIG.doctor;
                        return (
                            <span
                                key={s.id}
                                className="adm-selected-chip"
                                style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                            >
                                <span className="adm-selected-chip-icon" style={{ background: cfg.color }}>{cfg.short}</span>
                                {s.first_name} {s.last_name}
                                <span className="adm-selected-chip-x" onClick={() => remove(s.id)}>×</span>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
function AdmissionsView({ userRole }) {
    const [admissions, setAdmissions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});
    const [selectedDept, setSelectedDept] = useState('');
    const [formData, setFormData] = useState({ ...BLANK_FORM });

    // ── Load data ─────────────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [admitsRes, patientsRes, roomsRes, empRes] = await Promise.all([
                admissionAPI.getActive(),
                patientAPI.getAll(),
                roomAPI.getAll(),
                employeeAPI.getAll(),
            ]);
            setAdmissions(admitsRes.admissions || []);
            setPatients(patientsRes.patients || []);
            setRooms(roomsRes.rooms || []);
            setStaff(empRes.employees || []);
        } catch (err) {
            console.error('Failed to load admissions data:', err);
            setAdmissions([]);
            setPatients([]);
            setRooms([]);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Get unique departments for filter
    const departments = [...new Set(staff.map(s => s.department).filter(Boolean))];

    // ── Field helpers ─────────────────────────────────────────────────────────
    const set = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    };

    // ── Validate ───────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!formData.patient_id) e.patient_id = 'Please select a patient.';
        if (!formData.room_id) e.room_id = 'Please select a room.';
        if (!formData.attending_employee_id) e.attending_employee_id = 'Please select an attending doctor.';
        if (!formData.admission_reason.trim()) e.admission_reason = 'Please enter a reason.';
        return e;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        setErrors({});

        try {
            await admissionAPI.create({
                patient_id: formData.patient_id,
                room_id: formData.room_id,
                attending_employee_id: formData.attending_employee_id,
                admission_reason: formData.admission_reason.trim(),
                priority: formData.priority,
            });
            setToast({ message: 'Patient admitted successfully.', type: 'success' });
            closeForm();
            loadData();
        } catch (err) {
            console.error('Error creating admission:', err);

            let errorMessage = 'Error creating admission.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMessage = err.response.data.detail;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const openForm = () => { setFormData({ ...BLANK_FORM }); setErrors({}); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setErrors({}); };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = {
        total: admissions.length,
        emergency: admissions.filter(a => a.priority === 'emergency').length,
        urgent: admissions.filter(a => a.priority === 'urgent').length,
        active: admissions.filter(a => a.status === 'active').length,
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) return (
        <>
            <style>{styles}</style>
            <div className="adm-root">
                <div className="adm-loading"><div className="adm-spinner" /><span>Loading admissions…</span></div>
            </div>
        </>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{styles}</style>
            <div className="adm-root">

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onDone={() => setToast(null)}
                    />
                )}

                {/* Header */}
                <div className="adm-header">
                    <div>
                        <div className="adm-eyebrow">Hospital Management</div>
                        <div className="adm-page-title">Admissions</div>
                    </div>
                    <button
                        className="adm-btn adm-btn-primary"
                        type="button"
                        onClick={showForm ? closeForm : openForm}
                    >
                        <span style={{ fontSize: 17, lineHeight: 1 }}>{showForm ? '×' : '+'}</span>
                        {showForm ? 'Cancel' : 'New Admission'}
                    </button>
                </div>

                {/* Stats */}
                <div className="adm-stats">
                    <div className="adm-stat">
                        <div className="adm-stat-label">Total</div>
                        <div className="adm-stat-val">{stats.total}</div>
                        <div className="adm-stat-sub">all admissions</div>
                    </div>
                    <div className="adm-stat">
                        <div className="adm-stat-label">Emergency</div>
                        <div className="adm-stat-val red">{stats.emergency}</div>
                        <div className="adm-stat-sub">critical cases</div>
                    </div>
                    <div className="adm-stat">
                        <div className="adm-stat-label">Urgent</div>
                        <div className="adm-stat-val amber">{stats.urgent}</div>
                        <div className="adm-stat-sub">priority cases</div>
                    </div>
                    <div className="adm-stat">
                        <div className="adm-stat-label">Active</div>
                        <div className="adm-stat-val teal">{stats.active}</div>
                        <div className="adm-stat-sub">currently admitted</div>
                    </div>
                </div>

                {/* ── Admission form ── */}
                {showForm && (
                    <div className="adm-form-wrap">
                        <div className="adm-form-title">
                            <div className="adm-form-dot" />
                            Admit New Patient
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            <div className="adm-grid-2">

                                {/* Patient */}
                                <div className="adm-field">
                                    <label className="adm-label">Patient *</label>
                                    <select
                                        className={`adm-input${errors.patient_id ? ' invalid' : ''}`}
                                        value={formData.patient_id}
                                        onChange={e => set('patient_id', e.target.value)}
                                    >
                                        <option value="">Select patient…</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.first_name} {p.last_name} ({p.mrn})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.patient_id && (
                                        <span className="adm-field-error">⚠ {errors.patient_id}</span>
                                    )}
                                </div>

                                {/* Room */}
                                <div className="adm-field">
                                    <label className="adm-label">Room *</label>
                                    <select
                                        className={`adm-input${errors.room_id ? ' invalid' : ''}`}
                                        value={formData.room_id}
                                        onChange={e => set('room_id', e.target.value)}
                                    >
                                        <option value="">Select room…</option>
                                        {rooms
                                            .filter(r => r.status === 'available')
                                            .map(r => (
                                                <option key={r.id} value={r.id}>
                                                    Room {r.room_number} — {r.ward}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.room_id && (
                                        <span className="adm-field-error">⚠ {errors.room_id}</span>
                                    )}
                                </div>

                                {/* Department Filter */}
                                <div className="adm-field">
                                    <label className="adm-label">Department</label>
                                    <select
                                        className="adm-input"
                                        value={selectedDept}
                                        onChange={e => {
                                            setSelectedDept(e.target.value);
                                            setFormData(prev => ({ ...prev, attending_employee_id: '' }));
                                        }}
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Attending Doctor */}
                                <div className="adm-field">
                                    <label className="adm-label">Attending Doctor *</label>
                                    <select
                                        className={`adm-input${errors.attending_employee_id ? ' invalid' : ''}`}
                                        value={formData.attending_employee_id || ''}
                                        onChange={e => set('attending_employee_id', e.target.value)}
                                    >
                                        <option value="">Select doctor…</option>
                                        {staff
                                            .filter(s => !selectedDept || s.department === selectedDept)
                                            .map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.first_name} {s.last_name} — {s.department}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.attending_employee_id && (
                                        <span className="adm-field-error">⚠ {errors.attending_employee_id}</span>
                                    )}
                                </div>

                                {/* Priority */}
                                <div className="adm-field">
                                    <label className="adm-label">Priority Level</label>
                                    <select
                                        className="adm-input"
                                        value={formData.priority}
                                        onChange={e => set('priority', e.target.value)}
                                    >
                                        <option value="routine">Routine</option>
                                        <option value="urgent">Urgent</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>

                                {/* Reason - spans full width */}
                                <div className="adm-field span2">
                                    <label className="adm-label">Admission Reason *</label>
                                    <input
                                        type="text"
                                        className={`adm-input${errors.admission_reason ? ' invalid' : ''}`}
                                        placeholder="e.g. Chest pain, post-op recovery…"
                                        value={formData.admission_reason}
                                        onChange={e => set('admission_reason', e.target.value)}
                                    />
                                    {errors.admission_reason && (
                                        <span className="adm-field-error">⚠ {errors.admission_reason}</span>
                                    )}
                                </div>

                            </div>

                            {/* Staff assignment section */}
                            <div className="adm-section-sep">
                                <div className="adm-section-sep-line" />
                                <div className="adm-section-sep-label">Assign Additional Staff (optional)</div>
                                <div className="adm-section-sep-line" />
                            </div>

                            <StaffPicker
                                staff={staff}
                                selected={formData.assigned_staff}
                                onChange={sel => setFormData(prev => ({ ...prev, assigned_staff: sel }))}
                                selectedDept={selectedDept}
                            />

                            {/* Actions */}
                            <div className="adm-form-actions">
                                <button type="button" className="adm-btn adm-btn-ghost" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="adm-btn adm-btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? <><div className="adm-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Admitting…</>
                                        : 'Admit Patient'
                                    }
                                </button>
                            </div>

                        </form>
                    </div>
                )}

                {/* ── Table ── */}
                <div className="adm-table-card">
                    <div className="adm-table-toolbar">
                        <span className="adm-table-count">
                            {admissions.length} RECORD{admissions.length !== 1 ? 'S' : ''}
                        </span>
                    </div>
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Room</th>
                                <th>Doctor</th>
                                <th>Reason</th>
                                <th>Assigned Staff</th>
                                <th>Priority</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admissions.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="adm-empty">
                                            <div className="adm-empty-icon">🏥</div>
                                            <div>No admissions found</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : admissions.map(adm => (
                                <tr key={adm.id}>
                                    <td>
                                        <div className="adm-patient-name">
                                            {adm.patient_name || `${adm.patient_first} ${adm.patient_last}`}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="adm-room-badge">RM {adm.room_number}</span>
                                    </td>
                                    <td>
                                        <span className="adm-reason">{adm.doctor_name || '—'}</span>
                                    </td>
                                    <td>
                                        <span className="adm-reason">{adm.reason}</span>
                                    </td>
                                    <td>
                                        {adm.assigned_staff && adm.assigned_staff.length > 0 ? (
                                            <div className="adm-badges">
                                                {adm.assigned_staff.map(s => (
                                                    <StaffBadge key={s.id} member={s} />
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="adm-badge-none">Unassigned</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`adm-chip ${adm.priority === 'emergency' ? 'adm-chip-red' :
                                            adm.priority === 'urgent' ? 'adm-chip-amber' :
                                                'adm-chip-gray'
                                            }`}>
                                            {adm.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`adm-chip ${adm.status === 'active' ? 'adm-chip-blue' : 'adm-chip-green'
                                            }`}>
                                            {adm.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
}

export default AdmissionsView;