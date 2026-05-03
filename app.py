from flask import Flask, render_template, request, jsonify
from services.gemini_service import get_ai_response

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_input = data.get("message")

        if not user_input:
            return jsonify({"error": "No message provided"}), 400

        reply = get_ai_response(user_input)

        return jsonify({"response": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔥 IMPORTANT FOR DEPLOYMENT
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)