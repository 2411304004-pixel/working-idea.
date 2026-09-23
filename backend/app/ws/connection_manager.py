import json
import math
from datetime import datetime
from typing import Dict, List, Any
from fastapi import WebSocket

class RideConnectionManager:
    def __init__(self):
        # Maps booking_id -> list of active customer WebSockets
        self.active_customer_connections: Dict[str, List[WebSocket]] = {}
        # Maps booking_id -> driver WebSocket (if connected)
        self.active_driver_connections: Dict[str, WebSocket] = {}
        # In-memory latest state cache for instant handshake to new subscribers
        self.latest_ride_states: Dict[str, Dict[str, Any]] = {}

    async def connect_customer(self, websocket: WebSocket, booking_id: str):
        await websocket.accept()
        if booking_id not in self.active_customer_connections:
            self.active_customer_connections[booking_id] = []
        self.active_customer_connections[booking_id].append(websocket)
        
        # Immediately send latest state if exists
        if booking_id in self.latest_ride_states:
            try:
                await websocket.send_text(json.dumps(self.latest_ride_states[booking_id]))
            except Exception:
                pass

    def disconnect_customer(self, websocket: WebSocket, booking_id: str):
        if booking_id in self.active_customer_connections:
            if websocket in self.active_customer_connections[booking_id]:
                self.active_customer_connections[booking_id].remove(websocket)
            if not self.active_customer_connections[booking_id]:
                del self.active_customer_connections[booking_id]

    async def connect_driver(self, websocket: WebSocket, booking_id: str):
        await websocket.accept()
        self.active_driver_connections[booking_id] = websocket

    def disconnect_driver(self, booking_id: str):
        if booking_id in self.active_driver_connections:
            del self.active_driver_connections[booking_id]

    async def broadcast_to_customers(self, booking_id: str, message: Dict[str, Any]):
        self.latest_ride_states[booking_id] = message
        if booking_id in self.active_customer_connections:
            disconnected = []
            for connection in self.active_customer_connections[booking_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    disconnected.append(connection)
            for d in disconnected:
                self.disconnect_customer(d, booking_id)

ride_manager = RideConnectionManager()
