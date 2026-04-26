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

// AUTO TITLE
function generateTitle(text) {
    return text.length > 20 ? text.substring(0, 20) + "..." : text;
}

// SIDEBAR
Object.keys(chats).forEach(id => {
    const activeClass = id === currentChatId ? "active" : "";

    chatList.innerHTML += `
        <div class="chat-item ${activeClass}">

            <span class="chat-title"
                  onclick="switchChat('${id}')"
                  ondblclick="startRename('${id}', this)">
                ${chats[id].title}
            </span>

            <button onclick="deleteChat('${id}')" class="delete-btn">🗑</button>

        </div>
    `;
});

// RENAME
function startRename(id, element) {
    let currentText = element.innerText;

    element.innerHTML = `
        <input type="text" class="rename-input" value="${currentText}" />
    `;

    let input = element.querySelector("input");
    input.focus();

    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            finishRename(id, input.value);
        }
    });

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

// DELETE
function deleteChat(id) {
    delete chats[id];

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

    renderChatList();   // 
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

// SEND MESSAGE (FIXED)
function sendMessage() {
    let message = input.value.trim();
    if (message === "") return;

    if (!currentChatId) newChat();

    // AUTO TITLE (first message)
    if (chats[currentChatId].messages.length === 0) {
        chats[currentChatId].title = generateTitle(message);
    }

    // SAVE USER MESSAGE
    chats[currentChatId].messages.push({
        role: "user",
        text: message
    });

    renderMessages();
    saveChats();

    input.value = "";

    // TYPING
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = `<span>•</span><span>•</span><span>•</span>`;
    chatBox.appendChild(typing);

    chatBox.scrollTop = chatBox.scrollHeight;

    // API CALL
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

        // SAVE BOT MESSAGE
        chats[currentChatId].messages.push({
            role: "bot",
            text: data.response
        });

        renderMessages();
        saveChats();
    });
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