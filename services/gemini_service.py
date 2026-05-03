from google import genai
import os
import json

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-1.5-flash"

client = genai.Client(api_key=API_KEY)

DATA_FOLDER = "data"


def get_user_file(user_id):
    return os.path.join(DATA_FOLDER, f"{user_id}.json")


def load_chat(user_id):
    file_path = get_user_file(user_id)

    if not os.path.exists(file_path):
        return [
            "You are a smart, helpful AI assistant. Talk casually and clearly."
        ]

    with open(file_path, "r") as f:
        return json.load(f)


def save_chat(user_id, chat_history):
    file_path = get_user_file(user_id)

    with open(file_path, "w") as f:
        json.dump(chat_history, f)


def get_ai_response(user_id, user_input):
    try:
        chat_history = load_chat(user_id)

        chat_history.append(f"User: {user_input}")

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents="\n".join(chat_history)
        )

        reply = response.text if response and response.text else "No response"

        chat_history.append(f"Bot: {reply}")

        save_chat(user_id, chat_history)

        return reply

    except Exception as e:
        print("Gemini Error:", e)
        return "Something went wrong. Please try again."