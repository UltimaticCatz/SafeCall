from typing import Dict, List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_ids: Dict[int, str] = {}

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

    async def broadcast_text_to_others(self, sender_id: str, transcription: str):
        print(f"[Transcription] Broadcasting to all except {sender_id}")
        for ws_id, user_id in self.user_ids.items():
            if user_id != sender_id:
                for room, connections in self.active_connections.items():
                    for ws in connections:
                        if id(ws) == ws_id:
                            try:
                                await ws.send_text(json.dumps({
                                    "transcription": transcription
                                }))
                            except Exception as e:
                                print(f"[Transcription] Failed to send to {ws_id}: {e}")
