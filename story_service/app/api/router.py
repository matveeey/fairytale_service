from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from app.api.utils import execute_request
from .schemas import CharacterRequest

router = APIRouter(prefix='', tags=['API'])
templates = Jinja2Templates(directory='app/templates')

@router.get('/')
async def get_main_page(request: Request):
    return templates.TemplateResponse(name='index.html', context={'request': request})

@router.post('/api', summary='Основной API метод')
async def main_logic(request_body: CharacterRequest):
    try:
        # Actors name parsing
        character_list = [name.strip() for name in request_body.characters.split(',')]

        # Story generation
        story = execute_request(character_list)
        return {"story": story}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))