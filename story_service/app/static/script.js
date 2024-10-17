const socket = new WebSocket('ws://localhost:8001/api/generate_story');
const output = document.getElementById('output');

socket.onmessage = function(event) {
    const chunk = event.data;
    output.innerHTML += chunk;
    output.innerHTML += '<button class="copy-btn" onclick="copyToClipboard()">Копировать</button>';
};

async function generateStory() {
    const characters = document.getElementById('characters').value;
    socket.send(JSON.stringify({ characters: characters }));
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