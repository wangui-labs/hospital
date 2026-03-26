import React, { useState, useEffect } from 'react';
import { shiftAPI, employeeAPI } from '../../services/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .shf-root {
    font-family: 'DM Sans', sans-serif;
    background: #f7f8fc;
    min-height: 100vh;
    padding: 36px 40px;
    color: #0f1924;
  }

  /* ── Header ── */
  .shf-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
  }
  .shf-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #7c8fa6;
    margin-bottom: 6px;
  }
  .shf-title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -.4px;
    color: #0f1924;
    line-height: 1;
  }

  /* ── Stats ── */
  .shf-stats {
    display: flex;
    gap: 1px;
    background: #e0e5ef;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 28px;
    border: 1px solid #e0e5ef;
  }
  .shf-stat {
    flex: 1;
    background: #fff;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background .15s;
  }
  .shf-stat:hover { background: #fafbff; }
  .shf-stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #a0aec0;
    font-weight: 500;
  }
  .shf-stat-val {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -.5px;
    color: #0f1924;
    line-height: 1;
  }
  .shf-stat-sub { font-size: 12px; color: #7c8fa6; }
  .shf-stat-val.green  { color: #0d9488; }
  .shf-stat-val.blue   { color: #1d4ed8; }
  .shf-stat-val.slate  { color: #475569; }
  .shf-stat-val.red    { color: #d63b3b; }

  /* ── Buttons ── */
  .shf-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all .15s;
    padding: 10px 18px;
  }
  .shf-btn-primary {
    background: #0f1924;
    color: #fff;
    box-shadow: 0 1px 3px rgba(15,25,36,.18);
  }
  .shf-btn-primary:hover { background: #1e3048; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(15,25,36,.2); }
  .shf-btn-ghost {
    background: transparent;
    color: #5a6a7e;
    border: 1.5px solid #dde3ef;
    padding: 7px 13px;
    font-size: 12.5px;
  }
  .shf-btn-ghost:hover { background: #f0f3fa; color: #0f1924; }
  .shf-btn-danger {
    background: #fff0f0;
    color: #c53030;
    border: 1.5px solid #fecaca;
    padding: 7px 13px;
    font-size: 12.5px;
  }
  .shf-btn-danger:hover { background: #fee2e2; }

  /* ── Form ── */
  .shf-form-wrap {
    background: #fff;
    border: 1.5px solid #e0e5ef;
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 28px;
    box-shadow: 0 2px 12px rgba(15,25,36,.06);
    animation: shfSlide .2s ease;
  }
  @keyframes shfSlide {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .shf-form-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f1924;
    margin-bottom: 22px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f0f3fa;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .shf-form-title-dot {
    width: 8px; height: 8px;
    background: #0f1924;
    border-radius: 50%;
  }
  .shf-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  .shf-field { display: flex; flex-direction: column; gap: 6px; }
  .shf-field.full { grid-column: 1/-1; }
  .shf-label {
    font-size: 11.5px;
    font-weight: 500;
    color: #5a6a7e;
    letter-spacing: .04em;
  }
  .shf-input {
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #0f1924;
    background: #f7f8fc;
    border: 1.5px solid #e0e5ef;
    border-radius: 9px;
    padding: 9px 13px;
    outline: none;
    transition: all .15s;
    -webkit-appearance: none;
  }
  .shf-input:focus { border-color: #0f1924; background: #fff; box-shadow: 0 0 0 3px rgba(15,25,36,.06); }
  .shf-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  /* ── Table ── */
  .shf-table-card {
    background: #fff;
    border: 1.5px solid #e0e5ef;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(15,25,36,.06);
  }
  .shf-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 22px;
    border-bottom: 1px solid #f0f3fa;
  }
  .shf-table-count {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #7c8fa6;
    letter-spacing: .06em;
  }
  .shf-table { width: 100%; border-collapse: collapse; }
  .shf-table thead th {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #a0aec0;
    padding: 12px 20px;
    text-align: left;
    background: #fafbff;
    border-bottom: 1px solid #f0f3fa;
  }
  .shf-table tbody tr {
    border-bottom: 1px solid #f7f8fc;
    transition: background .12s;
  }
  .shf-table tbody tr:last-child { border-bottom: none; }
  .shf-table tbody tr:hover { background: #fafbff; }
  .shf-table td {
    padding: 14px 20px;
    font-size: 13.5px;
    color: #2d3d50;
    vertical-align: middle;
  }
  .shf-emp-name {
    font-weight: 600;
    color: #0f1924;
    font-size: 14px;
  }
  .shf-dept {
    font-size: 12px;
    color: #7c8fa6;
    margin-top: 2px;
  }
  .shf-time {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #4a5e72;
  }
  .shf-actions { display: flex; gap: 8px; }

  /* ── Chips ── */
  .shf-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: .06em;
    padding: 4px 10px;
    border-radius: 20px;
    text-transform: uppercase;
  }
  .shf-chip::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
  }
  .shf-chip-blue     { background: #eff6ff; color: #1d4ed8; }
  .shf-chip-green    { background: #f0fdf4; color: #166534; }
  .shf-chip-gray     { background: #f0f3fa; color: #4a5e72; }
  .shf-chip-red      { background: #fff0f0; color: #c53030; }
  .shf-chip-indigo   { background: #eef2ff; color: #4338ca; }
  .shf-chip-amber    { background: #fffbeb; color: #b45309; }

  /* ── Shift type dot ── */
  .shf-type-row { display: flex; align-items: center; gap: 8px; }
  .shf-type-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .shf-type-dot.morning   { background: #f59e0b; }
  .shf-type-dot.afternoon { background: #3b82f6; }
  .shf-type-dot.night     { background: #6366f1; }
  .shf-type-dot.oncall    { background: #10b981; }

  /* ── Empty / Loading ── */
  .shf-empty {
    padding: 56px 20px;
    text-align: center;
    color: #a0aec0;
    font-size: 14px;
  }
  .shf-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: .4; }
  .shf-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 80px;
    color: #7c8fa6;
    font-size: 14px;
  }
  .shf-spinner {
    width: 18px; height: 18px;
    border: 2px solid #e0e5ef;
    border-top-color: #0f1924;
    border-radius: 50%;
    animation: shfSpin .7s linear infinite;
  }
  @keyframes shfSpin { to { transform: rotate(360deg); } }
`;

const shiftTypeColor = (type) => ({
    morning: 'morning', afternoon: 'afternoon', night: 'night', oncall: 'oncall'
}[type] || 'morning');

const statusChip = (status) => ({
    scheduled: 'shf-chip-blue',
    active: 'shf-chip-green',
    completed: 'shf-chip-gray',
    missed: 'shf-chip-red',
}[status] || 'shf-chip-gray');

function ShiftsView({ userRole }) {
    const [shifts, setShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '', shift_type: 'morning', start_time: '', end_time: '', status: 'scheduled', notes: ''
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [shiftsRes, employeesRes] = await Promise.all([
                shiftAPI.getAll(),
                employeeAPI.getAll()
            ]);
            setShifts(shiftsRes.shifts || []);
            setEmployees(employeesRes.employees || []);
        } catch (err) {
            console.error('Failed to load shifts:', err);
            setShifts([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employee_id || !formData.start_time) { alert('Please fill required fields'); return; }
        try {
            if (editingShift) {
                await shiftAPI.update(editingShift.id, formData);
            } else {
                await shiftAPI.create(formData);
            }
            setShowForm(false);
            setEditingShift(null);
            setFormData({ employee_id: '', shift_type: 'morning', start_time: '', end_time: '', status: 'scheduled', notes: '' });
            loadData();
        } catch (err) {
            alert(err.message || 'Error saving shift');
        }
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        setFormData({
            employee_id: shift.employee_id,
            shift_type: shift.shift_type,
            start_time: shift.start_time?.slice(0, 16) || '',
            end_time: shift.end_time?.slice(0, 16) || '',
            status: shift.status,
            notes: shift.notes || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this shift?')) return;
        try {
            await shiftAPI.delete(id);
            loadData();
        } catch (err) {
            alert(err.message || 'Error deleting shift');
        }
    };

    const counts = {
        total: shifts.length,
        active: shifts.filter(s => s.status === 'active').length,
        scheduled: shifts.filter(s => s.status === 'scheduled').length,
        missed: shifts.filter(s => s.status === 'missed').length,
    };

    const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    if (loading) return (
        <>
            <style>{styles}</style>
            <div className="shf-root">
                <div className="shf-loading"><div className="shf-spinner" /><span>Loading shifts…</span></div>
            </div>
        </>
    );

    return (
        <>
            <style>{styles}</style>
            <div className="shf-root">

                {/* Header */}
                <div className="shf-header">
                    <div>
                        <div className="shf-eyebrow">Staff Management</div>
                        <div className="shf-title">Shift Tracking</div>
                    </div>
                    {userRole === 'admin' && (
                        <button className="shf-btn shf-btn-primary" onClick={() => {
                            setEditingShift(null);
                            setFormData({ employee_id: '', shift_type: 'morning', start_time: '', end_time: '', status: 'scheduled', notes: '' });
                            setShowForm(!showForm);
                        }}>
                            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Schedule Shift
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="shf-stats">
                    <div className="shf-stat">
                        <div className="shf-stat-label">Total</div>
                        <div className="shf-stat-val">{counts.total}</div>
                        <div className="shf-stat-sub">all shifts</div>
                    </div>
                    <div className="shf-stat">
                        <div className="shf-stat-label">Active</div>
                        <div className="shf-stat-val green">{counts.active}</div>
                        <div className="shf-stat-sub">on duty now</div>
                    </div>
                    <div className="shf-stat">
                        <div className="shf-stat-label">Scheduled</div>
                        <div className="shf-stat-val blue">{counts.scheduled}</div>
                        <div className="shf-stat-sub">upcoming</div>
                    </div>
                    <div className="shf-stat">
                        <div className="shf-stat-label">Missed</div>
                        <div className="shf-stat-val red">{counts.missed}</div>
                        <div className="shf-stat-sub">no-shows</div>
                    </div>
                </div>

                {/* Form */}
                {showForm && userRole === 'admin' && (
                    <div className="shf-form-wrap">
                        <div className="shf-form-title">
                            <div className="shf-form-title-dot" />
                            {editingShift ? 'Edit Shift' : 'Schedule New Shift'}
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="shf-grid-2">
                                <div className="shf-field">
                                    <label className="shf-label">Employee *</label>
                                    <select className="shf-input" value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} required>
                                        <option value="">Select employee…</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} — {emp.department}</option>)}
                                    </select>
                                </div>
                                <div className="shf-field">
                                    <label className="shf-label">Shift Type</label>
                                    <select className="shf-input" value={formData.shift_type} onChange={e => setFormData({ ...formData, shift_type: e.target.value })}>
                                        <option value="morning">Morning (07:00–15:00)</option>
                                        <option value="afternoon">Afternoon (15:00–23:00)</option>
                                        <option value="night">Night (23:00–07:00)</option>
                                        <option value="oncall">On Call</option>
                                    </select>
                                </div>
                                <div className="shf-field">
                                    <label className="shf-label">Start Time *</label>
                                    <input type="datetime-local" className="shf-input" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required />
                                </div>
                                <div className="shf-field">
                                    <label className="shf-label">End Time</label>
                                    <input type="datetime-local" className="shf-input" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                                </div>
                                <div className="shf-field">
                                    <label className="shf-label">Status</label>
                                    <select className="shf-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="missed">Missed</option>
                                    </select>
                                </div>
                                <div className="shf-field">
                                    <label className="shf-label">Notes</label>
                                    <input type="text" className="shf-input" placeholder="Optional notes…" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                </div>
                            </div>
                            <div className="shf-form-actions">
                                <button type="button" className="shf-btn shf-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="shf-btn shf-btn-primary">{editingShift ? 'Update Shift' : 'Schedule Shift'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="shf-table-card">
                    <div className="shf-table-toolbar">
                        <span className="shf-table-count">{shifts.length} SHIFT{shifts.length !== 1 ? 'S' : ''}</span>
                    </div>
                    <table className="shf-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Shift Type</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Status</th>
                                {userRole === 'admin' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.length === 0 ? (
                                <tr><td colSpan="6">
                                    <div className="shf-empty">
                                        <div className="shf-empty-icon">🗓</div>
                                        <div>No shifts scheduled</div>
                                    </div>
                                </td></tr>
                            ) : shifts.map(shift => (
                                <tr key={shift.id}>
                                    <td>
                                        <div className="shf-emp-name">{shift.employee_name || shift.employee_id}</div>
                                        {shift.department && <div className="shf-dept">{shift.department}</div>}
                                    </td>
                                    <td>
                                        <div className="shf-type-row">
                                            <span className={`shf-type-dot ${shiftTypeColor(shift.shift_type)}`} />
                                            <span style={{ textTransform: 'capitalize', fontSize: 13 }}>{shift.shift_type}</span>
                                        </div>
                                    </td>
                                    <td><span className="shf-time">{fmt(shift.start_time)}</span></td>
                                    <td><span className="shf-time">{fmt(shift.end_time)}</span></td>
                                    <td><span className={`shf-chip ${statusChip(shift.status)}`}>{shift.status}</span></td>
                                    {userRole === 'admin' && (
                                        <td>
                                            <div className="shf-actions">
                                                <button className="shf-btn shf-btn-ghost" onClick={() => handleEdit(shift)}>Edit</button>
                                                <button className="shf-btn shf-btn-danger" onClick={() => handleDelete(shift.id)}>Delete</button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
}

export default ShiftsView;