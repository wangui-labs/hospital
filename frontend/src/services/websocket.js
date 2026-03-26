// ============================================================================
// WEBSOCKET CLIENT
// ============================================================================

class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.shouldReconnect = true;
        this.isConnecting = false;
    }

    // ============================================================================
    // CONNECTION MANAGEMENT
    // ============================================================================

    connect() {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        this.isConnecting = true;

        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = this.handleOpen.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
            this.ws.onerror = this.handleError.bind(this);
            this.ws.onclose = this.handleClose.bind(this);
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    }

    disconnect() {
        this.shouldReconnect = false;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.listeners.clear();
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    handleOpen(event) {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', event);
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.emit('message', data);
            this.emit(data.type, data);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            this.emit('error', { message: 'Invalid message format' });
        }
    }

    handleError(error) {
        console.error('WebSocket error:', error);
        this.emit('error', error);
    }

    handleClose(event) {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', event);

        if (this.shouldReconnect) {
            this.scheduleReconnect();
        }
    }

    // ============================================================================
    // RECONNECTION LOGIC
    // ============================================================================

    scheduleReconnect() {
        if (!this.shouldReconnect) return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            this.emit('max_reconnect_attempts');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (this.shouldReconnect) {
                this.connect();
            }
        }, delay);
    }

    // ============================================================================
    // MESSAGE SENDING
    // ============================================================================

    send(type, data = {}) {
        if (!this.isConnected()) {
            console.warn('WebSocket not connected');
            return false;
        }

        const message = {
            type,
            data,
            timestamp: new Date().toISOString()
        };

        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    sendPing() {
        return this.send('ping', {});
    }

    sendSubscribe(channel) {
        return this.send('subscribe', { channel });
    }

    sendUnsubscribe(channel) {
        return this.send('unsubscribe', { channel });
    }

    // ============================================================================
    // EVENT LISTENERS
    // ============================================================================

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    isConnectingState() {
        return this.ws && this.ws.readyState === WebSocket.CONNECTING;
    }

    getState() {
        if (!this.ws) return 'disconnected';

        const states = {
            [WebSocket.CONNECTING]: 'connecting',
            [WebSocket.OPEN]: 'connected',
            [WebSocket.CLOSING]: 'closing',
            [WebSocket.CLOSED]: 'disconnected'
        };

        return states[this.ws.readyState] || 'unknown';
    }

    getReconnectAttempts() {
        return this.reconnectAttempts;
    }

    resetReconnectAttempts() {
        this.reconnectAttempts = 0;
    }

    setMaxReconnectAttempts(max) {
        this.maxReconnectAttempts = max;
    }

    setReconnectDelay(delay) {
        this.reconnectDelay = delay;
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance = null;

export const getWebSocket = (url = null) => {
    if (!instance && url) {
        instance = new WebSocketClient(url);
    }
    return instance;
};

export const createWebSocket = (url) => {
    instance = new WebSocketClient(url);
    return instance;
};

export const disconnectWebSocket = () => {
    if (instance) {
        instance.disconnect();
        instance = null;
    }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default WebSocketClient;