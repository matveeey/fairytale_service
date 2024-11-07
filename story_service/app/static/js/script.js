const storySocket = new WebSocket('ws://matveymatvey.ru/api/generate_story');
const imageSocket = new WebSocket('ws://matveymatvey.ru/api/generate_image');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copy-btn');

// Segment that just been generated and arrived to websocket
let currentSegment = null;
let segmentIdCounter = 0;

storySocket.onmessage = function(event) {
    const chunk = event.data;
    let chunkToAppend = '';
    if (!currentSegment) {
        currentSegment = createStorySegment();
        output.appendChild(currentSegment);
}

chunkToAppend = chunk;
let needImage = false;
// If the chunk contains "@", request an image
if (chunk.includes('@')) {
    chunkToAppend = chunk.replace('@', '');
    needImage = true;
}
// Clear the junk symbols
if (chunk.includes('#')) {
    chunkToAppend = chunkToAppend.replace('#', '');
}
if (chunk.includes('*')) {
    chunkToAppend = chunkToAppend.replace('*', '');
}
if (chunk.includes('@')) {
    chunkToAppend = chunkToAppend.replace('@', '');
}

currentSegment.querySelector('.story-text').innerHTML += chunkToAppend;

if (needImage) {
    currentSegment.innerHTML += `
        <div class="story-image">Image generating...</div>
    `;
    console.log(`REQUESTED IMAGE`)
    const textBeforeImage = currentSegment.querySelector('.story-text').textContent;
    requestImage(textBeforeImage, currentSegment.id);                
    currentSegment = null;
}
};

imageSocket.onmessage = function(event) {
    console.log(`Received image`)
    const { id, image_base64 } = JSON.parse(event.data);
    const segment = document.getElementById(id) //output.lastElementChild;
    console.log(`    Received image id: ${id}`)
    console.log(`    Raw data: ${event.data}`)
    if (segment) {
        const imageElement = segment.querySelector('.story-image');
        imageElement.innerHTML = `<img src="data:image/png;base64,${image_base64}" alt="Story illustration">`;
    }
};

imageSocket.onerror = function(event) {
    console.log(`error image SOCKET`);
};

imageSocket.onclose = function(event) {
    console.log(`CLOSING image SOCKET`);
};

storySocket.onerror = function(event) {
    console.log(`error story SOCKET`);
};

storySocket.onclose = function(event) {
    console.log(`CLOSING STORY SOCKET`);
    if (output.innerHTML.trim() !== '') {
        copyBtn.style.display = 'block'; // Displaying 'Copy' button
    }
};

function createStorySegment() {
    const segment = document.createElement('div');
    segment.className = 'story-segment';
    segment.id = `${segmentIdCounter++}`;
    segment.innerHTML = `
        <div class="story-text"></div>
    `;
    return segment;
}

function requestImage(text, segmentId) {
    console.log(`Requested image ${segmentId}`)
    imageSocket.send(JSON.stringify({ id: segmentId, prompt: text }));
}

async function generateStory() {
    const characters = document.getElementById('characters').value;
    output.innerHTML = ''; // Clear the output before generating a new story
    currentSegment = null; // Reset the current segment
    storySocket.send(JSON.stringify({ characters: characters }));
}