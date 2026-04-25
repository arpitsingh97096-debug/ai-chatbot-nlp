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
ai-chatbot-nlp/
│
├── services/
│ └── gemini_service.py
│
├── static/
│ ├── style.css
│ └── script.js
│
├── templates/
│ └── index.html
│
├── app.py
├── config.py
├── check_models.py
├── intents.json
├── utils.py
├── .gitignore
├── README.md
---

## ⚙️ Setup Instructions

### 1. Clone the repo
git clone https://github.com/arpitsingh97096-debug/ai-chatbot-nlp.git

cd ai-chatbot-nlp
---

### 2. Install dependencies
pip install flask python-dotenv google-generativeai
---

### 3. Create `.env` file
GEMINI_API_KEY=your_api_key_here
---

### 4. Run the app
python app.py
Open in browser: http://127.0.0.1:5000
---

## 🔒 Security

- `.env` is ignored using `.gitignore`
- API key is NOT exposed in code

---

## 📸 Preview

<img width="720" height="405" alt="output" src="https://github.com/user-attachments/assets/20830c45-3303-4e6f-bab3-955dfb5fb601" />

---

## 👨‍💻 Author

Arpit Singh
