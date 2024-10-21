from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# TODO: looks like schemas arent even used..
from .schemas import CharacterRequest
from .utils import generate_story

router = APIRouter(prefix='/api', tags=['API'])

@router.websocket('/generate_story')
async def generate_story_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            characters = data.get('characters')
            if not characters:
                await websocket.send_json({"error": "No characters provided"})
                continue

            character_list = [name.strip() for name in characters.split(',')]
            await generate_story(character_list, websocket)

    except WebSocketDisconnect:
        print("WebSocket disconnected")