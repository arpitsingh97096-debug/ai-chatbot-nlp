from flask import Flask, render_template, request, jsonify
from services.gemini_service import get_ai_response

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json["message"]
    reply = get_ai_response(user_input)
    return jsonify({"response": reply})

if __name__ == "__main__":
    app.run(debug=True)