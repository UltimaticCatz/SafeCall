from typing import Dict, List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_ids: Dict[int, str] = {}
        self.text_connections: Dict[str, List[WebSocket]] = {}
        self.text_user_ids: Dict[int, str] = {}

    async def connect(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append(websocket)
        user_id = str(id(websocket))
        self.user_ids[id(websocket)] = user_id
        return user_id

    def disconnect(self, room_code: str, user_id: int):
        self.active_connections[room_code] = [
            ws for ws in self.active_connections[room_code] if id(ws) != user_id
        ]
        self.user_ids.pop(user_id, None)

    async def broadcast(self, room_code: str, data: bytes, sender_id: str = None):
        for connection in self.active_connections.get(room_code, []):
            if str(id(connection)) != sender_id:
                try:
                    await connection.send_bytes(data)
                except Exception as e:
                    print(f"[Broadcast] Failed to send audio to {id(connection)}: {e}")

    async def register_text_ws(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.text_connections:
            self.text_connections[room_code] = []
        self.text_connections[room_code].append(websocket)

    async def broadcast_text_to_others(self, room_code: str, sender_id: str, transcription: str, summary: str):
        for connection in self.text_connections.get(room_code, []):
            if str(id(connection)) != sender_id:
                try:
                    await connection.send_text(json.dumps({
                        "transcription": transcription,
                        "summary": summary
                    }))
                except Exception as e:
                    print(f"[Text WS] Failed to send to {id(connection)}: {e}")

    async def connect_text(self, room_code: str, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if room_code not in self.text_connections:
            self.text_connections[room_code] = []
        self.text_connections[room_code].append(websocket)
        self.text_user_ids[id(websocket)] = client_id
        print(f"[TextWS] Client {client_id} connected for text in room {room_code}")

    def disconnect_text(self, room_code: str, client_id: str):
        self.text_connections[room_code] = [
            ws for ws in self.text_connections[room_code] if self.text_user_ids.get(id(ws)) != client_id
        ]
        to_remove = [ws_id for ws_id, uid in self.text_user_ids.items() if uid == client_id]
        for ws_id in to_remove:
            del self.text_user_ids[ws_id]
        print(f"[TextWS] Client {client_id} disconnected from text room {room_code}")

    async def broadcast_text_to_others(self, room_code: str, transcription: str, summary: str, sender_id: str):
        print(f"[Broadcast Text] From {sender_id} to room {room_code}")
        for ws in self.text_connections.get(room_code, []):
            ws_id = id(ws)
            if self.text_user_ids.get(ws_id) != sender_id:
                try:
                    await ws.send_json({
                        "transcription": transcription,
                        "summary": summary
                    })
                except Exception as e:
                    print(f"[Broadcast Text] Failed to send to {ws_id}: {e}")
