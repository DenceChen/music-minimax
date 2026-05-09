import requests
import os
import logging
import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class MiniMaxClient:
    def __init__(self):
        self.api_key = os.getenv("MINIMAX_API_KEY")
        self.api_base = os.getenv("MINIMAX_API_BASE", "https://api.minimaxi.com")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.timeout = 180  # 3分钟超时

    def _post(self, url, payload, endpoint_name="API"):
        """发送 POST 请求并处理响应"""
        start_time = time.time()
        logger.info(f"[{endpoint_name}] 请求开始: {url}")
        logger.info(f"[{endpoint_name}] 请求参数: {payload}")

        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=self.timeout)
            elapsed = time.time() - start_time

            logger.info(f"[{endpoint_name}] 响应状态: {response.status_code}, 耗时: {elapsed:.2f}s")

            if response.status_code != 200:
                logger.error(f"[{endpoint_name}] HTTP错误: {response.status_code}, 响应: {response.text[:500]}")

            response.raise_for_status()
            result = response.json()
            logger.info(f"[{endpoint_name}] 响应成功, 数据长度: {len(str(result))}")
            return result

        except requests.exceptions.Timeout:
            elapsed = time.time() - start_time
            logger.error(f"[{endpoint_name}] 请求超时: {elapsed:.2f}s - {url}")
            raise Exception(f"请求超时，请稍后重试")

        except requests.exceptions.HTTPError as e:
            elapsed = time.time() - start_time
            logger.error(f"[{endpoint_name}] HTTP错误: {e}, 响应: {response.text[:500] if response else 'N/A'}")
            raise Exception(f"HTTP错误: {e}")

        except requests.exceptions.RequestException as e:
            elapsed = time.time() - start_time
            logger.error(f"[{endpoint_name}] 请求失败: {e}, 耗时: {elapsed:.2f}s")
            raise Exception(f"请求失败: {e}")

        except ValueError as e:
            logger.error(f"[{endpoint_name}] JSON解析失败: {e}")
            raise Exception("API响应格式错误")

        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(f"[{endpoint_name}] 未知错误: {e}, 耗时: {elapsed:.2f}s")
            raise

    def chat(self, messages):
        """对话理解 - 使用 MiniMax-M2.7-highspeed"""
        url = f"{self.api_base}/v1/text/chatcompletion_v2"
        payload = {
            "model": "MiniMax-M2.7-highspeed",
            "messages": messages,
            "stream": False
        }
        logger.info("[Chat] 开始对话请求")
        result = self._post(url, payload, "Chat")
        logger.info("[Chat] 对话请求成功")
        return result

    def generate_lyrics(self, prompt, mode="write_full_song"):
        """歌词生成 - 使用 lyrics_generation"""
        url = f"{self.api_base}/v1/lyrics_generation"
        payload = {
            "mode": mode,
            "prompt": prompt
        }
        logger.info("[Lyrics] 开始歌词生成请求")
        result = self._post(url, payload, "Lyrics")
        lyrics = result.get("lyrics", "")
        logger.info(f"[Lyrics] 歌词生成成功, 长度: {len(lyrics)}")
        return result

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
        logger.info("[Music] 开始歌曲生成请求")
        logger.info(f"[Music] Prompt: {prompt[:100]}...")
        logger.info(f"[Music] Lyrics length: {len(lyrics)}")

        result = self._post(url, payload, "Music")

        if result.get("data", {}).get("audio"):
            audio_url = result["data"]["audio"]
            logger.info(f"[Music] 歌曲生成成功, URL: {audio_url[:80]}...")
        else:
            logger.warning("[Music] 歌曲生成响应中未包含音频URL")

        return result
