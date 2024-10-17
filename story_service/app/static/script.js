async function generateStory() {
    const characters = document.getElementById('characters').value;
    const output = document.getElementById('output');

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ characters: characters }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let story = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            story += chunk;
            output.innerHTML = `${story}<button class="copy-btn" onclick="copyToClipboard()">Копировать</button>`;
        }
    } catch (error) {
        output.textContent = 'Произошла ошибка при генерации сказки. Пожалуйста, попробуйте еще раз.';
        console.error('Error:', error);
    }
}

function copyToClipboard() {
    const output = document.getElementById('output');
    const textToCopy = output.textContent.replace('Копировать', '').trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Результат скопирован в буфер обмена!');
    }, (err) => {
        console.error('Не удалось скопировать текст: ', err);
    });
}