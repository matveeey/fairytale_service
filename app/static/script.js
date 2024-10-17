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

        const data = await response.json();
        output.innerHTML = `${data.story}<button class="copy-btn" onclick="copyToClipboard()">Копировать</button>`;
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