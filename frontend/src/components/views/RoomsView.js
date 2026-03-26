import React, { useState, useEffect, useMemo } from 'react';
import { roomAPI } from '../../services/api';

// ── constants (using centralized values but keeping your styling) ─────────────

const STATUS = {
    available: { color: '#137333', bg: '#E6F4EA', dot: '#34A853', label: 'Available' },
    occupied: { color: '#C5221F', bg: '#FCE8E6', dot: '#EA4335', label: 'Occupied' },
    cleaning: { color: '#B45309', bg: '#FEF3C7', dot: '#FBBC04', label: 'Cleaning' },
    maintenance: { color: '#5F6368', bg: '#F1F3F4', dot: '#9AA0A6', label: 'Maintenance' },
    out_of_service: { color: '#5F6368', bg: '#F1F3F4', dot: '#9AA0A6', label: 'Out of Service' }
};

const ROOM_TYPE = {
    private: { icon: '🛏', color: '#1B6EF3', bg: '#E8F0FE', label: 'Private' },
    shared: { icon: '🛏', color: '#6B3FA0', bg: '#F3E8FD', label: 'Shared' },
    icu: { icon: '🫀', color: '#C5221F', bg: '#FCE8E6', label: 'ICU' },
    emergency: { icon: '🚨', color: '#C5221F', bg: '#FCE8E6', label: 'Emergency' },
    recovery: { icon: '💊', color: '#137333', bg: '#E6F4EA', label: 'Recovery' },
};

// ── sub-components (YOUR ORIGINAL DESIGN - UNCHANGED) ────────────────────────

function StatusDot({ status }) {
    const s = STATUS[status] || STATUS.available;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: s.color, fontWeight: 600 }}>
            <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: s.dot,
                boxShadow: status === 'occupied' ? `0 0 0 3px ${s.dot}30` : 'none',
                display: 'inline-block', flexShrink: 0
            }} />
            {s.label}
        </span>
    );
}

function BedDots({ capacity, status }) {
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: Math.min(capacity, 4) }).map((_, i) => (
                <div key={i} style={{
                    width: '10px', height: '14px', borderRadius: '3px',
                    background: status === 'occupied' ? '#EA4335' : status === 'available' ? '#34A853' : '#9AA0A6',
                    opacity: status === 'occupied' && i >= 1 ? 0.35 : 1
                }} />
            ))}
            {capacity > 4 && <span style={{ fontSize: '11px', color: '#9AA0A6', alignSelf: 'center' }}>+{capacity - 4}</span>}
        </div>
    );
}

function RoomCard({ room, isAdmin, onEdit, onDelete }) {
    const s = STATUS[room.status] || STATUS.available;
    const t = ROOM_TYPE[room.room_type] || ROOM_TYPE.private;

    return (
        <div style={{
            background: '#fff', border: '1px solid #E8EAED', borderRadius: '16px',
            overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
        >
            {/* Top color bar */}
            <div style={{ height: '5px', background: s.dot }} />

            <div style={{ padding: '18px 18px 14px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#202124', letterSpacing: '-0.4px', lineHeight: 1 }}>
                            {room.room_number}
                        </div>
                        <div style={{ fontSize: '12px', color: '#5F6368', marginTop: '4px' }}>
                            {room.ward} · Floor {room.floor}
                        </div>
                    </div>
                    <StatusDot status={room.status} />
                </div>

                {/* Type + Beds row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                        fontWeight: '600', background: t.bg, color: t.color
                    }}>
                        {t.icon} {t.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BedDots capacity={room.capacity} status={room.status} />
                        <span style={{ fontSize: '12px', color: '#5F6368' }}>
                            {room.capacity} {room.capacity === 1 ? 'bed' : 'beds'}
                        </span>
                    </div>
                </div>

                {/* Admin actions */}
                {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #F1F3F4' }}>
                        <button onClick={() => onEdit(room)} style={{
                            flex: 1, padding: '7px', borderRadius: '10px',
                            border: '1px solid #E8EAED', background: 'transparent',
                            color: '#1B6EF3', fontSize: '12px', fontWeight: '600',
                            cursor: 'pointer', transition: 'background 0.15s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#E8F0FE'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >Edit</button>
                        <button onClick={() => onDelete(room.id)} style={{
                            flex: 1, padding: '7px', borderRadius: '10px',
                            border: '1px solid #FCE8E6', background: 'transparent',
                            color: '#C5221F', fontSize: '12px', fontWeight: '600',
                            cursor: 'pointer', transition: 'background 0.15s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FCE8E6'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── main ──────────────────────────────────────────────────────────────────────

function RoomsView({ userRole }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [formData, setFormData] = useState({
        room_number: '', ward: '', room_type: 'private',
        capacity: 1, floor: 1, status: 'available'
    });

    const isAdmin = userRole === 'admin' || !userRole;

    useEffect(() => { loadRooms(); }, []);

    const loadRooms = async () => {
        setLoading(true);
        try {
            const res = await roomAPI.getAll();
            setRooms(res.rooms || []);
        } catch (err) {
            console.error('Failed to load rooms:', err);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.room_number || !formData.ward) { alert('Please fill room number and ward'); return; }
        try {
            if (editingRoom) {
                await roomAPI.update(editingRoom.id, formData);
            } else {
                await roomAPI.create(formData);
            }
            closeForm();
            loadRooms();
        } catch (err) {
            alert(err.response?.data?.detail || 'Error saving room');
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({ room_number: room.room_number, ward: room.ward, room_type: room.room_type, capacity: room.capacity, floor: room.floor, status: room.status });
        setShowForm(true);
        setTimeout(() => document.getElementById('room-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this room?')) return;
        try {
            await roomAPI.delete(id);
            loadRooms();
        } catch {
            alert('Error deleting room');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingRoom(null);
        setFormData({ room_number: '', ward: '', room_type: 'private', capacity: 1, floor: 1, status: 'available' });
    };

    const filtered = useMemo(() => rooms.filter(r => {
        const hay = `${r.room_number} ${r.ward} ${r.room_type}`.toLowerCase();
        return hay.includes(search.toLowerCase())
            && (statusFilter === 'all' || r.status === statusFilter)
            && (typeFilter === 'all' || r.room_type === typeFilter);
    }), [rooms, search, statusFilter, typeFilter]);

    const byWard = useMemo(() => {
        const map = {};
        filtered.forEach(r => { (map[r.ward] = map[r.ward] || []).push(r); });
        return map;
    }, [filtered]);

    const stats = [
        { label: 'Total Rooms', value: rooms.length, color: '#1B6EF3', bg: '#E8F0FE' },
        { label: 'Available', value: rooms.filter(r => r.status === 'available').length, color: '#137333', bg: '#E6F4EA' },
        { label: 'Occupied', value: rooms.filter(r => r.status === 'occupied').length, color: '#C5221F', bg: '#FCE8E6' },
        { label: 'Out of Service', value: rooms.filter(r => r.status === 'maintenance' || r.status === 'cleaning' || r.status === 'out_of_service').length, color: '#B45309', bg: '#FEF3C7' },
    ];

    const inputStyle = {
        width: '100%', padding: '10px 14px', border: '1px solid #E8EAED',
        borderRadius: '10px', fontSize: '14px', color: '#202124',
        outline: 'none', background: '#fff', boxSizing: 'border-box',
        transition: 'border-color 0.15s', fontFamily: 'inherit'
    };
    const labelStyle = {
        fontSize: '12px', fontWeight: '600', color: '#5F6368',
        letterSpacing: '0.3px', marginBottom: '6px', display: 'block'
    };
    const focus = {
        onFocus: e => e.target.style.borderColor = '#1B6EF3',
        onBlur: e => e.target.style.borderColor = '#E8EAED',
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#5F6368', fontSize: '14px' }}>
            Loading rooms…
        </div>
    );

    return (
        <div style={{ fontFamily: "'Google Sans', Roboto, sans-serif", maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', background: '#fff' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#E6F4EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            🏥
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#202124', margin: 0, letterSpacing: '-0.4px' }}>Hospital Rooms</h1>
                    </div>
                    <p style={{ fontSize: '14px', color: '#5F6368', margin: 0, paddingLeft: '52px' }}>View and manage room assignments</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { if (showForm) closeForm(); else setShowForm(true); }}
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
                        <span style={{ fontSize: '18px', lineHeight: 1 }}>{showForm ? '×' : '+'}</span>
                        {showForm ? 'Cancel' : 'Add Room'}
                    </button>
                )}
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

            {/* ── Occupancy bar ── */}
            {rooms.length > 0 && (() => {
                const occ = rooms.filter(r => r.status === 'occupied').length;
                const pct = Math.round((occ / rooms.length) * 100);
                const barColor = pct >= 90 ? '#EA4335' : pct >= 70 ? '#FBBC04' : '#34A853';
                return (
                    <div style={{ marginBottom: '28px', padding: '16px 20px', borderRadius: '14px', background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#202124' }}>Occupancy Rate</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: barColor }}>{pct}%</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '100px', background: '#E8EAED', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '100px', transition: 'width 0.6s ease' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {Object.entries(STATUS).map(([key, s]) => {
                                const count = rooms.filter(r => r.status === key).length;
                                return (
                                    <span key={key} style={{ fontSize: '12px', color: s.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                                        {s.label}: {count}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* ── Add / Edit Form ── */}
            {showForm && isAdmin && (
                <div id="room-form" style={{ background: '#F8F9FA', borderRadius: '20px', padding: '28px', marginBottom: '28px', border: '1px solid #E8EAED' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#202124', margin: 0 }}>
                            {editingRoom ? `Edit Room ${editingRoom.room_number}` : 'Add New Room'}
                        </h2>
                        <button onClick={closeForm} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E8EAED', background: '#fff', cursor: 'pointer', fontSize: '16px', color: '#5F6368', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Room Number *</label>
                                <input type="text" placeholder="e.g. 101, ER-01" style={inputStyle}
                                    value={formData.room_number} onChange={e => setFormData(p => ({ ...p, room_number: e.target.value }))} {...focus} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Ward *</label>
                                <input type="text" placeholder="e.g. Ward A, ICU, Emergency" style={inputStyle}
                                    value={formData.ward} onChange={e => setFormData(p => ({ ...p, ward: e.target.value }))} {...focus} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Room Type</label>
                                <select style={inputStyle} value={formData.room_type}
                                    onChange={e => setFormData(p => ({ ...p, room_type: e.target.value }))} {...focus}>
                                    {Object.entries(ROOM_TYPE).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select style={inputStyle} value={formData.status}
                                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} {...focus}>
                                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Capacity (beds)</label>
                                <input type="number" style={inputStyle} min="1" max="20"
                                    value={formData.capacity} onChange={e => setFormData(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))} {...focus} />
                            </div>
                            <div>
                                <label style={labelStyle}>Floor</label>
                                <input type="number" style={inputStyle} min="0" max="50"
                                    value={formData.floor} onChange={e => setFormData(p => ({ ...p, floor: parseInt(e.target.value) || 0 }))} {...focus} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={closeForm} style={{ padding: '10px 20px', borderRadius: '100px', border: '1px solid #E8EAED', background: '#fff', color: '#5F6368', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: '#1B6EF3', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,110,243,0.3)' }}>
                                {editingRoom ? 'Update Room' : 'Create Room'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Search + Filters + View toggle ── */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
                    <input type="text" placeholder="Search rooms, wards…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '36px', borderRadius: '100px' }} {...focus} />
                </div>
                {/* View toggle */}
                <div style={{ display: 'flex', border: '1px solid #E8EAED', borderRadius: '10px', overflow: 'hidden' }}>
                    {['grid', 'list'].map(m => (
                        <button key={m} onClick={() => setViewMode(m)} style={{
                            padding: '8px 14px', border: 'none', cursor: 'pointer',
                            background: viewMode === m ? '#E8F0FE' : '#fff',
                            color: viewMode === m ? '#1B6EF3' : '#5F6368',
                            fontSize: '16px', transition: 'background 0.15s'
                        }}>
                            {m === 'grid' ? '⊞' : '☰'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</span>
                {['all', ...Object.keys(STATUS)].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{
                        padding: '5px 12px', borderRadius: '100px', cursor: 'pointer',
                        border: statusFilter === s ? '1.5px solid #1B6EF3' : '1px solid #E8EAED',
                        background: statusFilter === s ? '#E8F0FE' : '#fff',
                        color: statusFilter === s ? '#1B6EF3' : '#5F6368',
                        fontSize: '12px', fontWeight: statusFilter === s ? '600' : '400', transition: 'all 0.15s'
                    }}>
                        {s === 'all' ? 'All' : STATUS[s].label}
                    </button>
                ))}
            </div>

            {/* Type chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Type</span>
                {['all', ...Object.keys(ROOM_TYPE)].map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)} style={{
                        padding: '5px 12px', borderRadius: '100px', cursor: 'pointer',
                        border: typeFilter === t ? '1.5px solid #1B6EF3' : '1px solid #E8EAED',
                        background: typeFilter === t ? '#E8F0FE' : '#fff',
                        color: typeFilter === t ? '#1B6EF3' : '#5F6368',
                        fontSize: '12px', fontWeight: typeFilter === t ? '600' : '400', transition: 'all 0.15s'
                    }}>
                        {t === 'all' ? 'All Types' : `${ROOM_TYPE[t].icon} ${ROOM_TYPE[t].label}`}
                    </button>
                ))}
                <span style={{ fontSize: '13px', color: '#5F6368', marginLeft: 'auto' }}>{filtered.length} room{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* ── Grid view ── */}
            {viewMode === 'grid' && (
                filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '56px 24px', background: '#F8F9FA', borderRadius: '16px', border: '1px dashed #E8EAED' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏥</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#202124', marginBottom: '6px' }}>No rooms found</div>
                        <div style={{ fontSize: '13px', color: '#5F6368' }}>
                            {search || statusFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your filters' : 'Click "Add Room" to get started'}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                        {filtered.map(room => (
                            <RoomCard key={room.id} room={room} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                )
            )}

            {/* ── List view (grouped by ward) ── */}
            {viewMode === 'list' && (
                filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '56px 24px', background: '#F8F9FA', borderRadius: '16px', border: '1px dashed #E8EAED' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏥</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#202124' }}>No rooms found</div>
                    </div>
                ) : (
                    Object.entries(byWard).map(([ward, wardRooms]) => (
                        <div key={ward} style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#5F6368', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '4px' }}>
                                {ward} · {wardRooms.length} room{wardRooms.length !== 1 ? 's' : ''}
                            </div>
                            <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: '14px', overflow: 'hidden' }}>
                                {wardRooms.map((room, i) => {
                                    const s = STATUS[room.status] || STATUS.available;
                                    const t = ROOM_TYPE[room.room_type] || ROOM_TYPE.private;
                                    return (
                                        <div key={room.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '16px',
                                            padding: '12px 16px',
                                            borderTop: i === 0 ? 'none' : '1px solid #F1F3F4',
                                            transition: 'background 0.15s'
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* Status stripe */}
                                            <div style={{ width: '4px', height: '36px', borderRadius: '2px', background: s.dot, flexShrink: 0 }} />
                                            {/* Room number */}
                                            <div style={{ minWidth: '70px' }}>
                                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#202124' }}>{room.room_number}</div>
                                                <div style={{ fontSize: '11px', color: '#9AA0A6' }}>Floor {room.floor}</div>
                                            </div>
                                            {/* Type chip */}
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: t.bg, color: t.color, whiteSpace: 'nowrap' }}>
                                                {t.icon} {t.label}
                                            </span>
                                            {/* Beds */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                                <BedDots capacity={room.capacity} status={room.status} />
                                                <span style={{ fontSize: '12px', color: '#5F6368' }}>{room.capacity} {room.capacity === 1 ? 'bed' : 'beds'}</span>
                                            </div>
                                            {/* Status */}
                                            <StatusDot status={room.status} />
                                            {/* Actions */}
                                            {isAdmin && (
                                                <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                                                    <button onClick={() => handleEdit(room)} style={{ padding: '5px 12px', borderRadius: '100px', border: '1px solid #E8EAED', background: 'transparent', color: '#1B6EF3', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#E8F0FE'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >Edit</button>
                                                    <button onClick={() => handleDelete(room.id)} style={{ padding: '5px 12px', borderRadius: '100px', border: '1px solid #FCE8E6', background: 'transparent', color: '#C5221F', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#FCE8E6'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )
            )}
        </div>
    );
}

export default RoomsView;