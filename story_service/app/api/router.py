from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from app.api.utils import execute_request
from .schemas import CharacterRequest

router = APIRouter(prefix='', tags=['API'])
templates = Jinja2Templates(directory='app/templates')

@router.get('/')
async def get_main_page(request: Request):
    return templates.TemplateResponse(name='index.html', context={'request': request})
