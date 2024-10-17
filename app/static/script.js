let currentTab = 'curl';

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${tab === 'curl' ? 1 : 2})`).classList.add('active');
    document.getElementById('input').placeholder = `Введите ваш ${tab} запрос здесь...`;
    document.getElementById('input').value = '';
    document.getElementById('output').innerHTML = '';
}

async function convertToPython() {
    const input = document.getElementById('input').value;
    const format = document.getElementById('format').value;
    const output = document.getElementById('output');

    // Преобразование многострочного ввода в однострочный
    const singleLineInput = input.replace(/\n/g, ' ').trim();

    const payload = {
    request_type: currentTab,
    target: format,
    data_str: singleLineInput
    };

    try {
    const response = await fetch('/api', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    output.innerHTML = `${data.request_string}<button class="copy-btn" onclick="copyToClipboard()">Копировать</button>`;
    } catch (error) {
    output.textContent = 'Произошла ошибка при конвертации. Пожалуйста, попробуйте еще раз.';
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