const socket = new WebSocket('ws://localhost:8002/api/generate_story');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copy-btn');

socket.onmessage = function(event) {
    const chunk = event.data;
    output.innerHTML += chunk;
    copyBtn.style.display = 'block'; // Displaying 'Copy' button
};

socket.onclose = function(event) {
    if (output.innerHTML.trim() !== '') {
        copyBtn.style.display = 'block'; // Displaying 'Copy' button
    }
};

async function generateStory() {
    const characters = document.getElementById('characters').value;
    output.innerHTML = "";
    output.textContent.replaceAll("");
    socket.send(JSON.stringify({ characters: characters }));
}

function copyToClipboard() {
    const textToCopy = output.textContent.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Result copied to clipboard!');
    }, (err) => {
        console.error('Failed to copy text: ', err);
    });
}