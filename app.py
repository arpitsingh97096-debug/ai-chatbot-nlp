from flask import Flask, render_template, request, jsonify, session
from services.gemini_service import get_ai_response
import uuid
import os

app = Flask(__name__)

# 🔐 Better secret key handling
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")


@app.before_request
def assign_user():
    if "user_id" not in session:
        session["user_id"] = str(uuid.uuid4())


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid request"}), 400

        user_input = data.get("message")

        if not user_input:
            return jsonify({"error": "No message provided"}), 400

        user_id = session.get("user_id")

        if not user_id:
            return jsonify({"error": "Session error"}), 500

        reply = get_ai_response(user_id, user_input)

        return jsonify({"response": reply})

    except Exception as e:
        print("App Error:", e)
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)