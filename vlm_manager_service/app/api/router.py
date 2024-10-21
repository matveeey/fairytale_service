from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .schemas import ImageRequest
from .utils import generate_image

router = APIRouter(prefix='/api', tags=['API'])

@router.websocket('/generate_image')
async def generate_image_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            description = data.get('description')
            if not description:
                await websocket.send_json({"error": "No description provided"})
                continue

            await generate_image(description, websocket)

    except WebSocketDisconnect:
        print("WebSocket disconnected")