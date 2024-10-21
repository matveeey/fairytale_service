import os
import aiohttp
import json
import redis

def build_json_payload(model_uri, temperature, max_tokens, system_message, user_message):
    return {
        "modelUri": model_uri,
        "completionOptions": {
            "stream": True,
            "temperature": temperature,
            "maxTokens": max_tokens
        },
        "messages": [
            {
                "role": "system",
                "text": system_message
            },
            {
                "role": "user",
                "text": user_message
            }
        ]
    }

async def send_completion_request(iam_token, folder_id, prompt_data, websocket):
    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {iam_token}",
        "x-folder-id": folder_id
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=prompt_data) as response:
            if response.status == 200:
                async for chunk in response.content.iter_any():
                    chunk_str = chunk.decode('utf-8')
                    try:
                        chunk_json = json.loads(chunk_str)
                        if "result" in chunk_json and "alternatives" in chunk_json["result"]:
                            for alternative in chunk_json["result"]["alternatives"]:
                                if "message" in alternative and "text" in alternative["message"]:
                                    message_text = alternative["message"]["text"]
                                    await websocket.send_text(message_text)
                                    print(message_text, end="|", flush=True)  # Отладочный вывод
                    except json.JSONDecodeError:
                        print(f"Failed to decode JSON: {chunk_str}")
            else:
                raise Exception(f"Request failed with status code {response.status}: {await response.text()}")

async def generate_story(characters, websocket):
    IAM_TOKEN = redis.Redis(host='redis', port=6379, db=0).get('IAM_TOKEN').decode('utf-8')
    FOLDER_ID = redis.Redis(host='redis', port=6379, db=0).get('FOLDER_ID').decode('utf-8')
    # IAM_TOKEN = os.environ["IAM_TOKEN"]
    # FOLDER_ID = os.environ["FOLDER_ID"]
    # Задаем значения по умолчанию для длины сказки
    model_uri = f"gpt://{FOLDER_ID}/yandexgpt-lite"
    temperature = 0.6
    max_tokens = "2000"
    story_length = 300
    system_message = f"Создай сказку с персонажами: {', '.join(characters)}. Сказка должна быть примерно {story_length} слов в длину."
    user_message = "Начни сказку."

    prompt_data = build_json_payload(model_uri, temperature, max_tokens, system_message, user_message)
    
    try:
        await send_completion_request(IAM_TOKEN, FOLDER_ID, prompt_data, websocket)
    except Exception as e:
        raise ValueError(f"Error generating story: {str(e)}")
