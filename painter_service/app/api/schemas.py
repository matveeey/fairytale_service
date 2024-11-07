from pydantic import BaseModel

class CharacterRequest(BaseModel):
    characters: str