import openai

def execute_request(characters):
    # Задаем значения по умолчанию для длины сказки
    print(characters)
    story_length = 300

    # Настройка клиента для работы с локальной LLM
    client = openai.OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

    # Формирование запроса к LLM
    prompt = f"Создай сказку с персонажами: {', '.join(characters)}. Сказка должна быть примерно {story_length} слов в длину."

    try:
        # Отправка запроса к LLM
        completion = client.chat.completions.create(
            model="model-identifier",  # Замените на идентификатор вашей модели
            messages=[
                {"role": "system", "content": "You are a storyteller."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=story_length  # Установите максимальное количество токенов, если необходимо
        )

        # Получение и возврат сгенерированной сказки
        story = completion.choices[0].message.content
        return story

    except Exception as e:
        raise ValueError(f"Error generating story: {str(e)}")