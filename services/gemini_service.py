from google import genai
from config import API_KEY, MODEL_NAME

client = genai.Client(api_key=API_KEY)

# 🧠 memory storage
chat_history = [
    "You are a smart, helpful AI assistant. Talk casually and clearly."
]

def get_ai_response(user_input):
    # add user message
    chat_history.append(f"User: {user_input}")

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents="\n".join(chat_history)   # 🔥 memory context
        )

        reply = response.text if response.text else "No response"

        # add bot reply
        chat_history.append(f"Bot: {reply}")

        return reply

    except Exception as e:
        print(e)
        return "Error: check terminal"


# 🔁 optional reset (future use)
def reset_chat():
    chat_history.clear()