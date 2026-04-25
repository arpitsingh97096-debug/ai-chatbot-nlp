let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChatId = localStorage.getItem("currentChatId");

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const chatList = document.getElementById("chat-list");

// SAVE TO STORAGE
function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("currentChatId", currentChatId);
}

// NEW CHAT
function newChat() {
    const id = Date.now().toString();

    chats[id] = {
        title: "New Chat",
        messages: []
    };

    currentChatId = id;

    saveChats();
    renderChatList();
    renderMessages();
}

// AUTO TITLE (based on first message)
function generateTitle(text) {
    return text.length > 20 ? text.substring(0, 20) + "..." : text;
}

// SIDEBAR
function renderChatList() {
    chatList.innerHTML = "";

    Object.keys(chats).forEach(id => {
        chatList.innerHTML += `
            <div class="chat-item">

                <span class="chat-title"
                      onclick="switchChat('${id}')"
                      ondblclick="startRename('${id}', this)">
                    ${chats[id].title}
                </span>

                <button onclick="deleteChat('${id}')" class="delete-btn">🗑</button>

            </div>
        `;
    });
}
function startRename(id, element) {
    let currentText = element.innerText;

    element.innerHTML = `
        <input type="text" class="rename-input" value="${currentText}" />
    `;

    let input = element.querySelector("input");
    input.focus();

    // save on Enter
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            finishRename(id, input.value);
        }
    });

    // save on blur (click outside)
    input.addEventListener("blur", function() {
        finishRename(id, input.value);
    });
}

function finishRename(id, newName) {
    if (!newName || newName.trim() === "") {
        renderChatList();
        return;
    }

    chats[id].title = newName.trim();

    saveChats();
    renderChatList();
}
function renameChat(id) {
    let newName = prompt("Rename chat:");

    if (newName === null) return; // cancel
    if (newName.trim() === "") return;

    chats[id].title = newName.trim();

    saveChats();
    renderChatList();
}
function deleteChat(id) {
    delete chats[id];

    // if current chat deleted → switch to another
    if (currentChatId === id) {
        let keys = Object.keys(chats);
        currentChatId = keys.length ? keys[0] : null;
    }

    saveChats();
    renderChatList();
    renderMessages();
}

// SWITCH CHAT
function switchChat(id) {
    currentChatId = id;
    saveChats();
    renderMessages();
}

// SHOW MESSAGES
function renderMessages() {
    chatBox.innerHTML = "";

    if (!currentChatId) return;

    chats[currentChatId].messages.forEach(msg => {
        chatBox.innerHTML += `
            <div class="message ${msg.role}">
                ${msg.text}
            </div>
        `;
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

// SEND MESSAGE
function sendMessage() {
    let input = document.getElementById("user-input");
    let message = input.value.trim();

    if (message === "") return;

    addMessage(message, "user");

    // typing indicator
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = `<span>•</span><span>•</span><span>•</span>`;
    chatBox.appendChild(typing);

    chatBox.scrollTop = chatBox.scrollHeight;

    fetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: message }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        typing.remove();
        addMessage(data.response, "bot");
    });

    input.value = "";
}

// ENTER KEY
input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// INIT
if (!currentChatId || !chats[currentChatId]) {
    newChat();
} else {
    renderChatList();
    renderMessages();
}
function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = "message " + type;
    msg.innerText = text;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}