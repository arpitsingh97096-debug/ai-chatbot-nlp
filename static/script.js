// ===============================
// 🚀 FINAL LEVEL CHAT SYSTEM
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
// 🧠 TITLE
// ===============================
function generateTitle(text) {
    return text.length > 25 ? text.slice(0, 25) + "..." : text;
}

// ===============================
// 📋 SIDEBAR
// ===============================
function renderChatList() {
    const search = document.getElementById("search-chat")?.value?.toLowerCase() || "";
    chatList.innerHTML = "";

    const pinned = [];
    const normal = [];

    Object.keys(chats).forEach(id => {
        const chat = chats[id];

        if (!chat.title.toLowerCase().includes(search)) return;

        if (chat.pinned) pinned.push({ id, chat });
        else normal.push({ id, chat });
    });

    // 🧠 RENDER GROUP
    function renderGroup(title, list) {
        if (list.length === 0) return;

        const section = document.createElement("div");
        section.className = "chat-section";
        section.innerHTML = `<div class="section-title">${title}</div>`;

        list.forEach(({ id, chat }) => {
            const activeClass = id === currentChatId ? "active" : "";

            const div = document.createElement("div");
            div.className = `chat-item ${activeClass}`;

            div.innerHTML = `
                <span class="chat-title">${chat.title}</span>

                <button class="menu-btn">⋯</button>

                <div class="menu-dropdown">
                    <div class="menu-item pin">📌 ${chat.pinned ? "Unpin" : "Pin"}</div>
                    <div class="menu-item rename">✏️ Rename</div>
                    <div class="menu-item delete">🗑 Delete</div>
                </div>
            `;

            // CLICK CHAT
            div.onclick = (e) => {
                if (e.target.closest(".menu-btn") || e.target.closest(".menu-dropdown")) return;
                switchChat(id);
            };

            const menuBtn = div.querySelector(".menu-btn");
            const dropdown = div.querySelector(".menu-dropdown");

            menuBtn.onclick = (e) => {
                e.stopPropagation();

                document.querySelectorAll(".menu-dropdown").forEach(m => m.style.display = "none");
                dropdown.style.display = "block";
            };

            // ACTIONS
            div.querySelector(".pin").onclick = (e) => {
                e.stopPropagation();
                chat.pinned = !chat.pinned;
                saveChats();
                renderChatList();
            };

            div.querySelector(".rename").onclick = (e) => {
                e.stopPropagation();
                startRename(id, div.querySelector(".chat-title"));
            };

            div.querySelector(".delete").onclick = (e) => {
                e.stopPropagation();
                deleteChat(id);
            };

            section.appendChild(div);
        });

        chatList.appendChild(section);
    }

    renderGroup("📌 Pinned", pinned);
    renderGroup("💬 Chats", normal);
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
// 🔁 SWITCH
// ===============================
function switchChat(id) {
    currentChatId = id;
    saveChats();
    renderAll();
}

// ===============================
// 🧼 SAFE TEXT
// ===============================
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ===============================
// 🧠 STREAMING EFFECT
// ===============================
function streamText(element, text) {
    let i = 0;
    element.innerHTML = "";

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(type, 12);
        }
    }

    type();
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

        const safeText = escapeHTML(msg.text);

        div.innerHTML = `
            <div>${safeText}</div>
            <span class="copy-btn">copy</span>
        `;

        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
// 📋 COPY BUTTON
// ===============================
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("copy-btn")) {
        const text = e.target.parentElement.innerText;
        navigator.clipboard.writeText(text);

        e.target.innerText = "copied";
        setTimeout(() => e.target.innerText = "copy", 1000);
    }
});

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

    // typing indicator
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatBox.appendChild(typing);

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await res.json();

        typing.remove();

        const botDiv = document.createElement("div");
        botDiv.className = "message bot";
        chatBox.appendChild(botDiv);

        streamText(botDiv, data.response);

        chats[currentChatId].messages.push({
            role: "bot",
            text: data.response
        });

    } catch (err) {
        typing.remove();

        chats[currentChatId].messages.push({
            role: "bot",
            text: "⚠️ Server error"
        });

        renderMessages();
    }

    saveChats();
}

// ===============================
// ⌨️ ENTER
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
document.addEventListener("input", (e) => {
    if (e.target.id === "search-chat") {
        renderChatList();
    }
});
document.addEventListener("click", () => {
    document.querySelectorAll(".menu-dropdown").forEach(m => m.style.display = "none");
});