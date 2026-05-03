// ============================================================
// ARIA CHATBOT — PRO LEVEL SCRIPT
// ============================================================

// ------------- STATE -------------
let chats = JSON.parse(localStorage.getItem("aria_chats") || "{}");
let currentChatId = localStorage.getItem("aria_current");
let contextTarget = null;
let isWaiting = false;

// ------------- DOM REFS -------------
const chatBox    = document.getElementById("chat-box");
const inputEl    = document.getElementById("user-input");
const sendBtn    = document.getElementById("send-btn") || document.getElementById("sendBtn");
const chatList   = document.getElementById("chat-list");
const charCount  = document.getElementById("charCount");
const ctxMenu    = document.getElementById("contextMenu");
const titleBar   = document.getElementById("chat-title-bar");

// ------------- CANVAS BACKGROUND -------------
(function initCanvas() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(true); }
        reset(init) {
            this.x  = Math.random() * W;
            this.y  = init ? Math.random() * H : H + 20;
            this.r  = Math.random() * 1.8 + 0.3;
            this.vx = (Math.random() - 0.5) * 0.25;
            this.vy = -(Math.random() * 0.4 + 0.1);
            this.life = 0;
            this.maxLife = Math.random() * 400 + 200;
            this.hue = Math.random() > 0.5 ? 260 : 195; // violet or cyan
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            if (this.life > this.maxLife || this.y < -20) this.reset(false);
        }
        draw() {
            const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.7;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${alpha})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = Array.from({ length: 90 }, () => new Particle());
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        // subtle gradient bg
        const grd = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.5, H * 0.5, W * 0.7);
        grd.addColorStop(0, "rgba(90,45,180,0.06)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", () => { resize(); initParticles(); });
    resize();
    initParticles();
    draw();
})();

// ------------- SAVE / LOAD -------------
function save() {
    localStorage.setItem("aria_chats", JSON.stringify(chats));
    localStorage.setItem("aria_current", currentChatId || "");
}

// ------------- TIME -------------
function timeNow() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ------------- ESCAPE HTML -------------
function esc(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
}

// ------------- FORMAT MESSAGE (light markdown) -------------
function formatMessage(text) {
    let html = esc(text);
    // bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // code block
    html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
        `<pre><code>${code.trim()}</code></pre>`);
    // line breaks
    html = html.replace(/\n/g, "<br>");
    return html;
}

// ------------- RENDER WELCOME -------------
function showWelcome() {
    chatBox.innerHTML = `
      <div class="welcome-screen" id="welcome-screen">
        <div class="welcome-orb">
          <div class="orb-ring r1"></div>
          <div class="orb-ring r2"></div>
          <div class="orb-ring r3"></div>
          <div class="orb-core">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M14 24 Q24 10 34 24 Q24 38 14 24Z" fill="url(#wg)"/>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#38bdf8"/>
              </linearGradient></defs>
            </svg>
          </div>
        </div>
        <h1 class="welcome-title">Hello, I'm <span class="gradient-text">ARIA</span></h1>
        <p class="welcome-sub">Your advanced AI assistant. Ask me anything.</p>
        <div class="suggestion-chips">
          <button class="chip" onclick="useSuggestion(this)">Explain quantum computing</button>
          <button class="chip" onclick="useSuggestion(this)">Write a Python script</button>
          <button class="chip" onclick="useSuggestion(this)">Summarize a topic</button>
          <button class="chip" onclick="useSuggestion(this)">Help me brainstorm ideas</button>
        </div>
      </div>`;
}

// ------------- RENDER MESSAGES -------------
function renderMessages() {
    chatBox.innerHTML = "";
    if (!currentChatId || !chats[currentChatId]) { showWelcome(); return; }

    const msgs = chats[currentChatId].messages;
    if (!msgs.length) { showWelcome(); return; }

    msgs.forEach(m => appendBubble(m.role, m.text, m.time, false));
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBubble(role, text, time, animate = true) {
    const group = document.createElement("div");
    group.className = "msg-group";
    if (!animate) group.style.animation = "none";

    const isBot = role === "bot";
    const avatarContent = isBot
        ? `<svg viewBox="0 0 20 20" fill="none" style="width:14px;height:14px"><path d="M5 10 Q10 4 15 10 Q10 16 5 10Z" fill="white"/></svg>`
        : "U";

    group.innerHTML = `
      <div class="msg-meta">
        <div class="msg-avatar ${isBot ? "ai-avatar" : "user-avatar"}">${avatarContent}</div>
        <span class="msg-sender ${isBot ? "ai" : "user"}">${isBot ? "ARIA" : "You"}</span>
        <span class="msg-time">${time || timeNow()}</span>
      </div>
      <div class="message ${role}">
        <div class="msg-content">${formatMessage(text)}</div>
        <button class="msg-copy-btn">copy</button>
      </div>`;

    chatBox.appendChild(group);
    chatBox.scrollTop = chatBox.scrollHeight;
    return group;
}

// ------------- STREAMING TEXT -------------
function streamText(element, text, onDone) {
    let i = 0;
    const contentEl = element.querySelector(".msg-content");
    contentEl.innerHTML = "";
    const timer = setInterval(() => {
        if (i < text.length) {
            contentEl.innerHTML = formatMessage(text.slice(0, i + 1));
            i += 2;
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            clearInterval(timer);
            contentEl.innerHTML = formatMessage(text);
            if (onDone) onDone();
        }
    }, 10);
}

// ------------- TYPING INDICATOR -------------
function showTyping() {
    const group = document.createElement("div");
    group.className = "typing-group";
    group.id = "typing-indicator";
    group.innerHTML = `
      <div class="msg-meta">
        <div class="msg-avatar ai-avatar">
          <svg viewBox="0 0 20 20" fill="none" style="width:14px;height:14px">
            <path d="M5 10 Q10 4 15 10 Q10 16 5 10Z" fill="white"/>
          </svg>
        </div>
        <span class="msg-sender ai">ARIA</span>
      </div>
      <div class="typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>`;
    chatBox.appendChild(group);
    chatBox.scrollTop = chatBox.scrollHeight;
    return group;
}

// ------------- CHAT LIST -------------
function renderChatList() {
    const search = document.getElementById("search-chat")?.value?.toLowerCase() || "";
    chatList.innerHTML = "";

    const pinned = [], normal = [];
    Object.entries(chats).forEach(([id, chat]) => {
        if (!chat.title.toLowerCase().includes(search)) return;
        (chat.pinned ? pinned : normal).push({ id, chat });
    });

    // Sort by recency (newest first)
    const sortByRecent = (a, b) => parseInt(b.id) - parseInt(a.id);
    pinned.sort(sortByRecent);
    normal.sort(sortByRecent);

    function renderSection(label, list) {
        if (!list.length) return;

        const labelEl = document.createElement("div");
        labelEl.className = "section-label";
        labelEl.textContent = label;
        chatList.appendChild(labelEl);

        list.forEach(({ id, chat }) => {
            const item = document.createElement("div");
            item.className = "chat-item" + (id === currentChatId ? " active" : "");
            item.dataset.id = id;

            const icons = { default: "💬", code: "🖥", idea: "💡", question: "❓" };
            const icon = icons.default;

            item.innerHTML = `
              <div class="chat-item-icon">${chat.pinned ? "📌" : icon}</div>
              <span class="chat-item-title">${esc(chat.title)}</span>
              <button class="chat-item-menu" title="Options">⋯</button>`;

            item.querySelector(".chat-item-menu").addEventListener("click", e => {
                e.stopPropagation();
                openContextMenu(e, id);
            });

            item.addEventListener("click", () => switchChat(id));
            chatList.appendChild(item);
        });
    }

    renderSection("Pinned", pinned);
    renderSection("Recent", normal);

    if (!pinned.length && !normal.length) {
        chatList.innerHTML = `<div style="text-align:center;color:var(--text-3);font-size:12px;padding:20px 0">No conversations yet</div>`;
    }
}

// ------------- CONTEXT MENU -------------
function openContextMenu(e, id) {
    contextTarget = id;
    const rect = e.target.getBoundingClientRect();
    ctxMenu.style.top  = `${rect.bottom + 4}px`;
    ctxMenu.style.left = `${rect.left}px`;
    ctxMenu.classList.add("open");
}

document.getElementById("ctxPin").onclick = () => {
    if (!contextTarget) return;
    chats[contextTarget].pinned = !chats[contextTarget].pinned;
    save(); renderChatList();
    ctxMenu.classList.remove("open");
};

document.getElementById("ctxRename").onclick = () => {
    if (!contextTarget) return;
    ctxMenu.classList.remove("open");
    const item = chatList.querySelector(`[data-id="${contextTarget}"] .chat-item-title`);
    if (!item) return;
    const old = item.textContent;
    item.innerHTML = `<input class="rename-input" value="${esc(old)}" />`;
    const inp = item.querySelector("input");
    inp.focus(); inp.select();
    function finish() {
        const v = inp.value.trim() || old;
        chats[contextTarget].title = v;
        save(); renderChatList();
    }
    inp.addEventListener("keydown", e => { if (e.key === "Enter") finish(); });
    inp.addEventListener("blur", finish);
};

document.getElementById("ctxDelete").onclick = () => {
    if (!contextTarget) return;
    delete chats[contextTarget];
    if (currentChatId === contextTarget) {
        const keys = Object.keys(chats);
        currentChatId = keys.length ? keys.sort((a,b) => parseInt(b)-parseInt(a))[0] : null;
    }
    ctxMenu.classList.remove("open");
    save(); renderAll();
};

document.addEventListener("click", e => {
    if (!ctxMenu.contains(e.target)) ctxMenu.classList.remove("open");
});

// ------------- NEW CHAT -------------
function newChat() {
    const id = Date.now().toString();
    chats[id] = { title: "New Conversation", messages: [], pinned: false };
    currentChatId = id;
    save(); renderAll();
    setTimeout(() => inputEl?.focus(), 100);
}

// ------------- SWITCH CHAT -------------
function switchChat(id) {
    currentChatId = id;
    save(); renderAll();
    document.getElementById("sidebar")?.classList.remove("mobile-open");
}

// ------------- CLEAR CURRENT -------------
function clearCurrentChat() {
    if (!currentChatId) return;
    chats[currentChatId].messages = [];
    save(); renderAll();
}

// ------------- SEND MESSAGE -------------
async function sendMessage() {
    const text = inputEl?.value?.trim();
    if (!text || isWaiting) return;

    if (!currentChatId || !chats[currentChatId]) newChat();

    // Auto title
    if (!chats[currentChatId].messages.length) {
        chats[currentChatId].title = text.length > 28 ? text.slice(0, 28) + "…" : text;
    }

    const t = timeNow();
    chats[currentChatId].messages.push({ role: "user", text, time: t });

    // Clear welcome screen if present
    document.getElementById("welcome-screen")?.remove();

    appendBubble("user", text, t);
    inputEl.value = "";
    inputEl.style.height = "auto";
    charCount.textContent = "0";

    const typingEl = showTyping();
    isWaiting = true;
    sendBtn.disabled = true;
    titleBar.textContent = "ARIA — Thinking…";

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const data = await res.json();
        typingEl.remove();

        const botTime = timeNow();
        const group = appendBubble("bot", "", botTime);

        streamText(group.querySelector(".message"), data.response, () => {
            chats[currentChatId].messages.push({ role: "bot", text: data.response, time: botTime });
            save();
        });

    } catch (err) {
        typingEl.remove();
        const t2 = timeNow();
        appendBubble("bot", "⚠️ Connection error. Please try again.", t2);
        chats[currentChatId].messages.push({ role: "bot", text: "⚠️ Connection error.", time: t2 });
        save();
    }

    isWaiting = false;
    sendBtn.disabled = false;
    titleBar.textContent = chats[currentChatId]?.title || "ARIA";
    renderChatList();
}

// ------------- SUGGESTION CHIPS -------------
function useSuggestion(btn) {
    inputEl.value = btn.textContent;
    inputEl.focus();
    inputEl.dispatchEvent(new Event("input"));
}

// ------------- TOGGLE THEME -------------
function toggleTheme() {
    document.body.classList.toggle("light");
    localStorage.setItem("aria_theme", document.body.classList.contains("light") ? "light" : "dark");
}

// ------------- MOBILE SIDEBAR -------------
function toggleMobileSidebar() {
    document.getElementById("sidebar")?.classList.toggle("mobile-open");
}

// ------------- SIDEBAR COLLAPSE -------------
document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("collapsed");
});

// ------------- VOICE INPUT -------------
(function initVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const btn = document.getElementById("voiceBtn");
    if (!SR || !btn) return;

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;

    let listening = false;

    btn.addEventListener("click", () => {
        if (listening) { rec.stop(); return; }
        rec.start();
    });

    rec.onstart  = () => { listening = true;  btn.classList.add("listening"); };
    rec.onend    = () => { listening = false; btn.classList.remove("listening"); };
    rec.onresult = e => {
        const transcript = e.results[0][0].transcript;
        inputEl.value += transcript;
        inputEl.dispatchEvent(new Event("input"));
    };
})();

// ------------- COPY BUTTONS -------------
document.addEventListener("click", e => {
    if (e.target.classList.contains("msg-copy-btn")) {
        const content = e.target.closest(".message")?.querySelector(".msg-content")?.textContent || "";
        navigator.clipboard.writeText(content).then(() => {
            e.target.textContent = "✓ copied";
            e.target.style.background = "var(--violet)";
            e.target.style.color = "#fff";
            setTimeout(() => {
                e.target.textContent = "copy";
                e.target.style.background = "";
                e.target.style.color = "";
            }, 1500);
        });
    }
});

// ------------- INPUT HANDLERS -------------
inputEl?.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

inputEl?.addEventListener("input", () => {
    // Auto resize
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";

    // Char count
    const n = inputEl.value.length;
    charCount.textContent = n;
    charCount.className = "char-count" + (n > 1500 ? " over" : n > 1000 ? " warn" : "");
});

// ------------- SEARCH -------------
document.getElementById("search-chat")?.addEventListener("input", renderChatList);

// ------------- RENDER ALL -------------
function renderAll() {
    renderChatList();
    renderMessages();
    if (currentChatId && chats[currentChatId]) {
        titleBar.textContent = chats[currentChatId].title || "ARIA";
    } else {
        titleBar.textContent = "ARIA — Ready";
    }
}

// ------------- INIT -------------
(function init() {
    // Load theme
    if (localStorage.getItem("aria_theme") === "light") document.body.classList.add("light");

    // Validate current chat
    if (!currentChatId || !chats[currentChatId]) {
        const keys = Object.keys(chats).sort((a,b) => parseInt(b)-parseInt(a));
        currentChatId = keys[0] || null;
    }

    if (!currentChatId) {
        newChat();
    } else {
        renderAll();
    }

    inputEl?.focus();
})();
