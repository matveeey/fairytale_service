import openai

def generate_story(characters):
    # Задаем значения по умолчанию для длины сказки
    story_length = 300

    # Настройка клиента для работы с локальной LLM
    client = openai.OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

    # Формирование запроса к LLM
    prompt = f"Создай сказку с персонажами: {', '.join(characters)}. Сказка должна быть примерно {story_length} слов в длину."

    try:
        # Отправка запроса к LLM в режиме потоковой передачи
        response = client.chat.completions.create(
            model="model-identifier",  # Замените на идентификатор вашей модели
            messages=[
                {"role": "system", "content": "You are a storyteller."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=story_length,  # Установите максимальное количество токенов, если необходимо
            stream=True  # Включение режима потоковой передачи
        )

        # Сбор данных из потока
        story = ""
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                story += chunk.choices[0].delta.content

        return story

    except Exception as e:
        raise ValueError(f"Error generating story: {str(e)}")