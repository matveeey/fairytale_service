from fastapi import APIRouter, HTTPException
from .schemas import CharacterRequest
from .utils import generate_story

router = APIRouter(prefix='/api', tags=['API'])

@router.post('/generate_story', summary='Генерация сказки')
async def generate_story_endpoint(request_body: CharacterRequest):
    try:
        # Парсинг имен персонажей
        character_list = [name.strip() for name in request_body.characters.split(',')]

        # Вызов функции для генерации сказки
        story = generate_story(character_list)
        return {"story": story}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))