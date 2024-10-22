import os
import aiohttp
import json
import asyncio
import redis

def build_json_payload(model_uri, seed, aspect_ratio, text):
    return {
        "modelUri": model_uri,
        "generationOptions": {
            "seed": seed,
            "aspectRatio": aspect_ratio
        },
        "messages": [
            {
                "weight": "1",
                "text": text
            }
        ]
    }

async def get_generation_result(iam_token, request_id, websocket):
    url = f"https://llm.api.cloud.yandex.net:443/operations/{request_id}"
    
    headers = {
        "Authorization": f"Bearer {iam_token}"
    }
    
    async with aiohttp.ClientSession() as session:
        while True:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    response_data = await response.json()
                    done = response_data.get("done", False)
                    
                    if done:
                        image_base64 = response_data.get("response", {}).get("image")
                        if image_base64:
                            print("Image generation completed.", flush=True)
                            await websocket.send_text(image_base64)
                            return
                        else:
                            print("Image generation failed.", flush=True)
                            return
                    else:
                        print("Image generation is still in progress.", flush=True)
                        await asyncio.sleep(3)
                        print("Retrying in 3 seconds...", flush=True)
                else:
                    raise Exception(f"Request failed with status code {response.status}: {await response.text()}")
                
async def send_generation_request(iam_token, folder_id, prompt_data, websocket):
    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {iam_token}",
        "x-folder-id": folder_id
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=prompt_data) as response:
            if response.status == 200:
                response_data = await response.json()
                request_id = response_data.get("id")
                print(f"Request ID: {request_id}", flush=True)
                
                await get_generation_result(iam_token, request_id, websocket)
            else:
                raise Exception(f"Request failed with status code {response.status}: {await response.text()}")

async def generate_image(prompt, websocket):
    IAM_TOKEN = redis.Redis(host='redis', port=6379, db=0).get('IAM_TOKEN').decode('utf-8')
    FOLDER_ID = redis.Redis(host='redis', port=6379, db=0).get('FOLDER_ID').decode('utf-8')

    # Payload
    model_uri = f"art://{FOLDER_ID}/yandex-art/latest"
    seed = "1863"
    aspect_ratio = {
        "widthRatio": "2",
        "heightRatio": "1"
    }
    text = prompt
    # print(text, flush=True)

    # Limitations are 500 tokens per prompt
    text = text[:500]

    prompt_data = build_json_payload(model_uri, seed, aspect_ratio, text)
    
    try:
        await send_generation_request(IAM_TOKEN, FOLDER_ID, prompt_data, websocket)
    except Exception as e:
        print(f"Error generating image: {e}")
