from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from app.api.utils import fetch_token, execute_request
from .schemas import TokenRequest
import os

router = APIRouter(prefix='', tags=['API'])

@router.post('/api', summary='Основной API метод')
async def main_logic(request_body: TokenRequest):
    try:
        # Получение токена
        token = fetch_token()
        if not token:
            raise HTTPException(status_code=500, detail="Failed to retrieve token")

        # Установка токена в переменную окружения
        os.environ['IAM_TOKEN'] = token

        # Использование токена для выполнения запроса
        story = execute_request(request_body.token)
        return {"story": story}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))