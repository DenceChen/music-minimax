from flask import Flask, request, jsonify
from flask_cors import CORS
from api_client import MiniMaxClient
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
client = MiniMaxClient()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        if not request.json:
            return jsonify({"error": "Request body is required"}), 400

        user_message = request.json.get("message", "")
        if not user_message:
            return jsonify({"error": "message is required"}), 400

        messages = [{"role": "user", "content": user_message}]
        logger.info(f"Chat request: {user_message[:50]}...")
        result = client.chat(messages)

        # 返回简化的响应格式给前端
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "好的，我来帮你创作这首歌")
        return jsonify({
            "choices": [{
                "message": {
                    "content": content
                }
            }]
        })

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/lyrics", methods=["POST"])
def lyrics():
    try:
        if not request.json:
            return jsonify({"error": "Request body is required"}), 400

        prompt = request.json.get("prompt", "")
        if not prompt:
            return jsonify({"error": "prompt is required"}), 400

        logger.info(f"Lyrics request: {prompt[:50]}...")
        result = client.generate_lyrics(prompt)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Lyrics error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/music", methods=["POST"])
def music():
    try:
        if not request.json:
            return jsonify({"error": "Request body is required"}), 400

        prompt = request.json.get("prompt", "")
        lyrics = request.json.get("lyrics", "")
        if not prompt:
            return jsonify({"error": "prompt is required"}), 400

        logger.info(f"Music request: prompt={prompt[:50]}..., lyrics_length={len(lyrics)}")
        result = client.generate_music(prompt, lyrics)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Music error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)