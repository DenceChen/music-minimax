import requests
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MiniMaxClient:
    def __init__(self):
        self.api_key = os.getenv("MINIMAX_API_KEY")
        self.api_base = os.getenv("MINIMAX_API_BASE", "https://api.minimaxi.com")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.timeout = 120

    def _post(self, url, payload):
        """发送 POST 请求并处理响应"""
        try:
            logger.info(f"POST {url}")
            response = requests.post(url, json=payload, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error(f"Request timeout: {url}")
            raise Exception("Request timed out")
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error: {e}, response: {response.text}")
            raise Exception(f"HTTP error: {e}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise Exception(f"Request failed: {e}")
        except ValueError as e:
            logger.error(f"Invalid JSON response: {e}")
            raise Exception("Invalid JSON response from API")

    def chat(self, messages):
        """对话理解 - 使用 MiniMax-M2.7-highspeed"""
        url = f"{self.api_base}/v1/text/chatcompletion_v2"
        payload = {
            "model": "MiniMax-M2.7-highspeed",
            "messages": messages,
            "stream": False
        }
        return self._post(url, payload)

    def generate_lyrics(self, prompt, mode="write_full_song"):
        """歌词生成 - 使用 lyrics_generation"""
        url = f"{self.api_base}/v1/lyrics_generation"
        payload = {
            "mode": mode,
            "prompt": prompt
        }
        return self._post(url, payload)

    def generate_music(self, prompt, lyrics, model="music-2.6"):
        """歌曲生成 - 使用 music-2.6"""
        url = f"{self.api_base}/v1/music_generation"
        payload = {
            "model": model,
            "prompt": prompt,
            "lyrics": lyrics,
            "output_format": "url",
            "audio_setting": {
                "sample_rate": 44100,
                "bitrate": 256000,
                "format": "mp3"
            }
        }
        return self._post(url, payload)