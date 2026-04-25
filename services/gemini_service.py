from google import genai
from config import API_KEY, MODEL_NAME

client = genai.Client(api_key=API_KEY)

def get_ai_response(user_input):
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_input   # ✅ just plain string
        )

        return response.text if response.text else "No response"

    except Exception as e:
        print(e)
        return "Error: check terminal"