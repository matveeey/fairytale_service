from langchain_openai import OpenAI

async def generate_story(characters):
    # Задаем значения по умолчанию для длины сказки
    story_length = 300

    # Настройка клиента для работы с локальной LLM
    client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

    # Формирование запроса к LLM
    prompt = f"Создай сказку с персонажами: {', '.join(characters)}. Сказка должна быть примерно {story_length} слов в длину."

    try:
        async for chunk in client.astream(prompt):
                    print(chunk, end="|", flush=True)  # Отладочный вывод
                    yield chunk

    except Exception as e:
        raise ValueError(f"Error generating story: {str(e)}")