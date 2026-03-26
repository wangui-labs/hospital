import React, { useState, useEffect, useCallback } from 'react';
import TopBar from '../layout/TopBar';
import Sidebar from '../layout/Sidebar';
import ActivityFeed from './ActivityFeed';
import RightPanel from '../layout/RightPanel';
import MetricCards from './MetricCards';
import PatientsView from '../views/PatientsView';
import RoomsView from '../views/RoomsView';
import EmployeesView from '../views/EmployeesView';
import BadgesView from '../views/BadgesView';
import AdmissionsView from '../views/AdmissionsView';
import ShiftsView from '../views/ShiftsView';
import ActivityLogView from '../views/ActivityLogView';
import { activityAPI, roomAPI, admissionAPI } from '../../services/api';
import { getWebSocket, createWebSocket } from '../../services/websocket';
import { CSS_VARS, WEBSOCKET } from '../../utils/constants';
import { useAuth } from '../hooks/useAuth';

function Dashboard({ userId, onLogout }) {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');
    const [activities, setActivities] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);
    const [activityFilter, setActivityFilter] = useState('');
    const [filteredActivities, setFilteredActivities] = useState([]);

    const userRole = user?.role || 'user';

    // ============================================================================
    // LOAD DATA
    // ============================================================================

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [logsRes, roomsRes, admissionsRes] = await Promise.all([
                activityAPI.getLogs(50),
                roomAPI.getPublicRooms(),
                admissionAPI.getActive()
            ]);

            setActivities(logsRes?.logs || []);
            setRooms(roomsRes?.rooms || []);
            setAdmissions(admissionsRes?.admissions || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setActivities([]);
            setRooms([]);
            setAdmissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================================================
    // FILTER ACTIVITIES
    // ============================================================================

    useEffect(() => {
        if (!activityFilter) {
            setFilteredActivities(activities);
        } else {
            const filtered = activities.filter(a =>
                a.category?.toLowerCase() === activityFilter ||
                a.action?.toLowerCase().includes(activityFilter)
            );
            setFilteredActivities(filtered);
        }
    }, [activities, activityFilter]);

    // ============================================================================
    // WEBSOCKET SETUP
    // ============================================================================

    useEffect(() => {
        if (!userId) return;

        const wsUrl = `${WEBSOCKET.URL}/${userId}`;
        const ws = createWebSocket(wsUrl);

        ws.on('connected', () => {
            setWsConnected(true);
            console.log('WebSocket connected');
        });

        ws.on('disconnected', () => {
            setWsConnected(false);
            console.log('WebSocket disconnected');
        });

        ws.on('message', (data) => {
            // Handle incoming messages
            if (data.type === 'activity' || data.type === 'message') {
                setActivities(prev => [data.data || data, ...prev.slice(0, 49)]);
            }
        });

        ws.connect();

        return () => {
            ws.disconnect();
        };
    }, [userId]);

    // ============================================================================
    // INITIAL LOAD
    // ============================================================================

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ============================================================================
    // STATS CALCULATION
    // ============================================================================

    const stats = {
        totalEvents: activities.length,
        activePatients: admissions.filter(a => a.status === 'active').length,
        availableRooms: rooms.filter(r => r.status === 'available').length,
        totalRooms: rooms.length,
        occupancyRate: rooms.length > 0
            ? Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100)
            : 0,
        accessDenials: activities.filter(a => a.action?.toLowerCase().includes('denied')).length
    };

    // ============================================================================
    // RENDER VIEW
    // ============================================================================

    const renderView = () => {
        switch (currentView) {
            case 'patients':
                return <PatientsView userRole={userRole} />;

            case 'rooms':
                return <RoomsView userRole={userRole} />;

            case 'employees':
                if (userRole !== 'admin') {
                    return <div style={styles.accessDenied}>Access Denied - Admin Only</div>;
                }
                return <EmployeesView />;

            case 'badges':
                if (userRole !== 'admin') {
                    return <div style={styles.accessDenied}>Access Denied - Admin Only</div>;
                }
                return <BadgesView />;

            case 'admissions':
                return <AdmissionsView userRole={userRole} />;

            case 'shifts':
                if (userRole !== 'admin') {
                    return <div style={styles.accessDenied}>Access Denied - Admin Only</div>;
                }
                return <ShiftsView userRole={userRole} />;

            case 'activity':
                return <ActivityLogView
                    activities={filteredActivities}
                    loading={loading}
                />;

            case 'dashboard':
            default:
                return (
                    <>
                        <MetricCards stats={stats} />
                        <div style={styles.contentRow}>
                            <div style={styles.feedColumn}>
                                <ActivityFeed
                                    activities={filteredActivities}
                                    loading={loading}
                                    filter={activityFilter}
                                    onFilterChange={setActivityFilter}
                                />
                            </div>
                            <div style={styles.rightPanelColumn}>
                                <RightPanel
                                    rooms={rooms}
                                    admissions={admissions}
                                />
                            </div>
                        </div>
                    </>
                );
        }
    };

    // ============================================================================
    // STYLES
    // ============================================================================

    const styles = {
        container: {
            minHeight: '100vh',
        },
        mainContent: {
            display: 'flex',
            paddingTop: '64px',
            minHeight: 'calc(100vh - 64px)',
        },
        mainArea: {
            marginLeft: '256px',
            flex: 1,
            background: CSS_VARS.surface,
            overflowY: 'auto',
            padding: '28px 32px',
            minHeight: 'calc(100vh - 64px)',
        },
        contentRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '24px',
            marginTop: '24px',
        },
        feedColumn: {
            minWidth: 0,
        },
        rightPanelColumn: {
            width: '320px',
        },
        accessDenied: {
            padding: '40px',
            textAlign: 'center',
            color: CSS_VARS.ink3,
            fontSize: '14px',
        },
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div style={styles.container}>
            <TopBar
                userId={userId}
                userName={user?.username}
                userRole={userRole}
                onLogout={onLogout}
                wsConnected={wsConnected}
            />
            <div style={styles.mainContent}>
                <Sidebar
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    userRole={userRole}
                />
                <main style={styles.mainArea}>
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;