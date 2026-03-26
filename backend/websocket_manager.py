"""
WebSocket connection manager for real-time updates
"""
from typing import Dict, Optional
from fastapi import WebSocket, WebSocketDisconnect
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket) -> bool:
        """Accept and store a new WebSocket connection"""
        try:
            await websocket.accept()
            self.active_connections[user_id] = websocket
            logger.info(f"🔌 WebSocket connected: {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect WebSocket for {user_id}: {e}")
            return False
    
    def disconnect(self, user_id: str) -> None:
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"🔌 WebSocket disconnected: {user_id}")
    
    async def send_personal_message(self, user_id: str, message: dict) -> bool:
        """Send a message to a specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                return True
            except WebSocketDisconnect:
                self.disconnect(user_id)
            except Exception as e:
                logger.error(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)
        return False
    
    async def broadcast(self, message: dict, exclude_user: Optional[str] = None) -> int:
        """Send message to all connected clients, optionally excluding one user"""
        disconnected = []
        sent_count = 0
        
        for user_id, connection in self.active_connections.items():
            if user_id == exclude_user:
                continue
                
            try:
                await connection.send_json(message)
                sent_count += 1
            except WebSocketDisconnect:
                disconnected.append(user_id)
            except Exception as e:
                logger.error(f"Error broadcasting to {user_id}: {e}")
                disconnected.append(user_id)
        
        # Clean up disconnected clients
        for user_id in disconnected:
            self.disconnect(user_id)
        
        return sent_count
    
    async def broadcast_to_role(self, message: dict, role: str) -> int:
        """Send message only to users with specific role (requires user lookup)"""
        # Note: This would need user role information, which would require database lookup
        # For now, it broadcasts to all or implement role-based filtering in your app logic
        return await self.broadcast(message)
    
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
    
    def get_connected_users(self) -> list:
        """Get list of connected user IDs"""
        return list(self.active_connections.keys())

# Create global instance
manager = ConnectionManager()