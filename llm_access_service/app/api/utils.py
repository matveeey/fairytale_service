import requests

def fetch_token():
    # Отправка запроса к внешнему сервису для получения токена
    response = requests.get('http://example.com/api/get_token')

    if response.status_code != 200:
        raise ValueError("Error retrieving token")

    return response.json().get("token")

def execute_request(token):
    # Отправка запроса к llm_manager_service с использованием токена
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.post('http://localhost:8001/api/generate_story', headers=headers)

    if response.status_code != 200:
        raise ValueError("Error generating story")

    return response.json().get("story")