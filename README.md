# 🤖 AI Chatbot (Flask + Gemini API)

A clean AI chatbot built using **Flask (Python)** and **Google Gemini API** with a modern UI.

---

## 🚀 Features

- 💬 Real-time AI chat
- 🧠 Gemini API integration
- 🗂 Chat history sidebar
- ✏️ Rename chats
- 🗑 Delete chats
- ⚡ Smooth UI with typing animation

---

## 🛠 Tech Stack

- Python (Flask)
- HTML, CSS, JavaScript
- Google Gemini API

---

## 📁 Project Structure

```
ai-chatbot-nlp/
├── app.py
├── config.py
├── utils.py
├── intents.json
├── README.md
├── .gitignore
│
├── services/
│   └── gemini_service.py
│
├── static/
│   ├── style.css
│   └── script.js
│
└── templates/
    └── index.html
```

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/arpitsingh97096-debug/ai-chatbot-nlp.git
cd ai-chatbot-nlp
```

---

### 2. Install Dependencies

```bash
pip install flask python-dotenv google-generativeai
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

---

### 4. Run the Application

```bash
python app.py
```

Then open your browser and go to:

```
http://127.0.0.1:5000
```

---

## 🔒 Security

* `.env` file is excluded via `.gitignore`
* API keys are never hardcoded in the source code
* Sensitive data stays local to your environment


## 📸 Preview

<img width="720" height="405" alt="output" src="https://github.com/user-attachments/assets/20830c45-3303-4e6f-bab3-955dfb5fb601" />

---

## 👨‍💻 Author

Arpit Singh
