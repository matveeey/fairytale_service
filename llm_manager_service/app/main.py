from fastapi import FastAPI

from app.api.router import router as router_api

app = FastAPI()

import redis
redis_client = redis.Redis(host='redis', port=6379, db=0)

app.include_router(router_api)