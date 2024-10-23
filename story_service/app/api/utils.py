import requests

def execute_request(characters):
    # Отправка запроса к llm_manager_service
    response = requests.post('http://localhost:8002/api/generate_story', json={
        "characters": ", ".join(characters)
    })

    if response.status_code != 200:
        raise ValueError("Error generating story")

    return response.json().get("story")