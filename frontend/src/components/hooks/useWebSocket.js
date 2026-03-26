import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocket, createWebSocket, disconnectWebSocket } from '../../services/websocket';
import { WEBSOCKET } from '../../utils/constants';

// ============================================================================
// USE WEBSOCKET HOOK
// ============================================================================

export const useWebSocket = (userId, options = {}) => {
    const {
        autoConnect = true,
        onMessage,
        onConnect,
        onDisconnect,
        onError,
        reconnectOnMount = true,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const wsRef = useRef(null);
    const listenersRef = useRef([]);

    // ============================================================================
    // CONNECTION MANAGEMENT
    // ============================================================================

    const connect = useCallback(() => {
        if (!userId) return;

        setIsConnecting(true);
        setError(null);

        const url = `${WEBSOCKET.URL}/${userId}`;
        const ws = createWebSocket(url);
        wsRef.current = ws;

        ws.connect();
    }, [userId]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.disconnect();
            wsRef.current = null;
        }
        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    // ============================================================================
    // SEND MESSAGES
    // ============================================================================

    const send = useCallback((type, data = {}) => {
        if (wsRef.current && wsRef.current.isConnected()) {
            return wsRef.current.send(type, data);
        }
        console.warn('WebSocket not connected');
        return false;
    }, []);

    const sendPing = useCallback(() => {
        return send('ping');
    }, [send]);

    const subscribe = useCallback((channel) => {
        return send('subscribe', { channel });
    }, [send]);

    const unsubscribe = useCallback((channel) => {
        return send('unsubscribe', { channel });
    }, [send]);

    // ============================================================================
    // EVENT LISTENERS
    // ============================================================================

    const addListener = useCallback((event, callback) => {
        if (wsRef.current) {
            const remove = wsRef.current.on(event, callback);
            listenersRef.current.push({ event, callback, remove });
            return remove;
        }
        return () => { };
    }, []);

    const removeAllListeners = useCallback(() => {
        listenersRef.current.forEach(({ remove }) => {
            if (remove) remove();
        });
        listenersRef.current = [];
    }, []);

    // ============================================================================
    // SETUP WEBSOCKET EVENT HANDLERS
    // ============================================================================

    useEffect(() => {
        if (!wsRef.current || !userId) return;

        const handleConnected = () => {
            setIsConnected(true);
            setIsConnecting(false);
            setError(null);
            setReconnectAttempts(0);
            if (onConnect) onConnect();
        };

        const handleDisconnected = () => {
            setIsConnected(false);
            setIsConnecting(false);
            if (onDisconnect) onDisconnect();
        };

        const handleMessage = (data) => {
            setLastMessage(data);
            if (onMessage) onMessage(data);
        };

        const handleError = (err) => {
            setError(err.message || 'WebSocket error');
            if (onError) onError(err);
        };

        const handleMaxReconnect = () => {
            setError('Max reconnect attempts reached');
            setIsConnecting(false);
        };

        // Register listeners
        const ws = wsRef.current;
        ws.on('connected', handleConnected);
        ws.on('disconnected', handleDisconnected);
        ws.on('message', handleMessage);
        ws.on('error', handleError);
        ws.on('max_reconnect_attempts', handleMaxReconnect);

        // Update reconnect attempts
        const checkReconnectInterval = setInterval(() => {
            if (wsRef.current) {
                setReconnectAttempts(wsRef.current.getReconnectAttempts());
            }
        }, 1000);

        return () => {
            clearInterval(checkReconnectInterval);
        };
    }, [userId, onConnect, onDisconnect, onMessage, onError]);

    // ============================================================================
    // AUTO CONNECT ON MOUNT
    // ============================================================================

    useEffect(() => {
        if (autoConnect && userId && reconnectOnMount) {
            connect();
        }

        return () => {
            removeAllListeners();
            disconnect();
        };
    }, [autoConnect, userId, reconnectOnMount, connect, disconnect, removeAllListeners]);

    // ============================================================================
    // RETURN
    // ============================================================================

    return {
        // State
        isConnected,
        isConnecting,
        lastMessage,
        error,
        reconnectAttempts,

        // Methods
        connect,
        disconnect,
        send,
        sendPing,
        subscribe,
        unsubscribe,
        addListener,
        removeAllListeners,

        // Helpers
        isReady: isConnected && !isConnecting,
    };
};

// ============================================================================
// USE WEBSOCKET MESSAGES HOOK (For specific message types)
// ============================================================================

export const useWebSocketMessages = (userId, messageTypes = []) => {
    const [messages, setMessages] = useState([]);
    const [latestMessage, setLatestMessage] = useState(null);

    const { isConnected, send, addListener } = useWebSocket(userId);

    useEffect(() => {
        if (!isConnected) return;

        const handleMessage = (data) => {
            // Filter by message type if specified
            if (messageTypes.length === 0 || messageTypes.includes(data.type)) {
                setLatestMessage(data);
                setMessages(prev => [data, ...prev].slice(0, 100)); // Keep last 100
            }
        };

        const remove = addListener('message', handleMessage);
        return () => remove();
    }, [isConnected, messageTypes, addListener]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setLatestMessage(null);
    }, []);

    return {
        messages,
        latestMessage,
        isConnected,
        send,
        clearMessages,
    };
};

// ============================================================================
// USE WEBSOCKET ACTIVITY HOOK (For real-time activity feed)
// ============================================================================

export const useWebSocketActivity = (userId) => {
    const [activities, setActivities] = useState([]);
    const [newActivityCount, setNewActivityCount] = useState(0);

    const { isConnected, send, addListener } = useWebSocket(userId);

    useEffect(() => {
        if (!isConnected) return;

        // Subscribe to activity channel
        send('subscribe', { channel: 'activity' });

        const handleActivity = (data) => {
            setActivities(prev => [data, ...prev].slice(0, 50));
            setNewActivityCount(prev => prev + 1);
        };

        const remove = addListener('activity', handleActivity);

        return () => {
            remove();
            send('unsubscribe', { channel: 'activity' });
        };
    }, [isConnected, send, addListener]);

    const markAsRead = useCallback(() => {
        setNewActivityCount(0);
    }, []);

    const clearActivities = useCallback(() => {
        setActivities([]);
        setNewActivityCount(0);
    }, []);

    return {
        activities,
        newActivityCount,
        isConnected,
        markAsRead,
        clearActivities,
    };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default useWebSocket;