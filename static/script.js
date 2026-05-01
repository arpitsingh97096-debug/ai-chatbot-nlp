// ===============================
// 🔥 CLEAN + UPGRADED CHAT APP
// ===============================

let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChatId = localStorage.getItem("currentChatId");

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const chatList = document.getElementById("chat-list");

// ===============================
// 💾 SAVE
// ===============================
function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("currentChatId", currentChatId);
}

// ===============================
// 🆕 NEW CHAT
// ===============================
function newChat() {
    const id = Date.now().toString();

    chats[id] = {
        title: "New Chat",
        messages: []
    };

    currentChatId = id;
    saveChats();
    renderAll();
}

// ===============================
// 🧠 TITLE GENERATOR
// ===============================
function generateTitle(text) {
    return text.length > 25 ? text.slice(0, 25) + "..." : text;
}

// ===============================
// 📋 RENDER SIDEBAR
// ===============================
function renderChatList() {
    chatList.innerHTML = ""; // FIX: avoid duplication

    Object.keys(chats).forEach(id => {
        const activeClass = id === currentChatId ? "active" : "";

        const div = document.createElement("div");
        div.className = `chat-item ${activeClass}`;

        div.innerHTML = `
            <span class="chat-title">${chats[id].title}</span>
            <button class="delete-btn">🗑</button>
        `;

        // EVENTS (better than inline onclick)
        div.querySelector(".chat-title").onclick = () => switchChat(id);
        div.querySelector(".chat-title").ondblclick = (e) => startRename(id, e.target);
        div.querySelector(".delete-btn").onclick = () => deleteChat(id);

        chatList.appendChild(div);
    });
}

// ===============================
// ✏️ RENAME
// ===============================
function startRename(id, element) {
    const currentText = element.innerText;

    element.innerHTML = `<input type="text" value="${currentText}" />`;

    const inputField = element.querySelector("input");
    inputField.focus();

    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finishRename(id, inputField.value);
    });

    inputField.addEventListener("blur", () => finishRename(id, inputField.value));
}

function finishRename(id, newName) {
    if (!newName.trim()) return renderChatList();

    chats[id].title = newName.trim();
    saveChats();
    renderChatList();
}

// ===============================
// 🗑 DELETE
// ===============================
function deleteChat(id) {
    delete chats[id];

    if (currentChatId === id) {
        const keys = Object.keys(chats);
        currentChatId = keys.length ? keys[0] : null;
    }

    saveChats();
    renderAll();
}

// ===============================
// 🔁 SWITCH CHAT
// ===============================
function switchChat(id) {
    currentChatId = id;
    saveChats();
    renderAll();
}

// ===============================
// 💬 RENDER MESSAGES
// ===============================
function renderMessages() {
    chatBox.innerHTML = "";
    if (!currentChatId) return;

    chats[currentChatId].messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = `message ${msg.role}`;
        div.textContent = msg.text; // FIX: prevent XSS
        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
// 🚀 SEND MESSAGE
// ===============================
async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    if (!currentChatId) newChat();

    if (chats[currentChatId].messages.length === 0) {
        chats[currentChatId].title = generateTitle(message);
    }

    chats[currentChatId].messages.push({ role: "user", text: message });

    input.value = "";
    renderMessages();
    saveChats();

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = "<span>•</span><span>•</span><span>•</span>";
    chatBox.appendChild(typing);

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await res.json();

        chats[currentChatId].messages.push({
            role: "bot",
            text: data.response
        });

    } catch (err) {
        chats[currentChatId].messages.push({
            role: "bot",
            text: "⚠️ Error: Server not responding"
        });
    }

    typing.remove();
    renderMessages();
    saveChats();
}

// ===============================
// ⌨️ ENTER KEY
// ===============================
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// ===============================
// 🔄 RENDER ALL
// ===============================
function renderAll() {
    renderChatList();
    renderMessages();
}

// ===============================
// 🟢 INIT
// ===============================
if (!currentChatId || !chats[currentChatId]) {
    newChat();
} else {
    renderAll();
}
