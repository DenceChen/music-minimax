import React, { useState } from "react";
import "./App.css";

function App() {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [lyrics, setLyrics] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("chat");

  const clearError = () => setError("");

  const handleChat = async () => {
    if (!userInput.trim()) return;
    clearError();
    setLoading(true);
    setLoadingText("正在发送...");

    setConversation((prev) => [...prev, { role: "user", content: userInput }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage =
        data.choices?.[0]?.message?.content || "好的，我来帮你创作这首歌";
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
      // Chat 成功后设置 step 为 lyrics 阶段，并停止loading
      setStep("lyrics");
      setLoading(false);
      setLoadingText("");
    } catch (err) {
      console.error("Chat error:", err);
      setError("发送消息失败，请检查后端服务是否运行");
      setConversation((prev) => prev.filter((_, i) => i < prev.length - 1));
      setLoading(false);
      setLoadingText("");
    }
  };

  const generateLyrics = async () => {
    clearError();
    setLoading(true);
    setLoadingText("正在生成歌词...");

    try {
      const response = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      setLyrics(data.lyrics || "");
      setStep("lyrics");
    } catch (err) {
      console.error("Lyrics error:", err);
      setError("生成歌词失败，请重试");
    }
    setLoading(false);
    setLoadingText("");
  };

  const generateMusic = async () => {
    if (!lyrics.trim()) {
      setError("请先输入歌词");
      return;
    }
    clearError();
    setLoading(true);
    setLoadingText("正在生成歌曲，这可能需要几分钟...");

    try {
      const response = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput, lyrics }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.data?.audio) {
        setSongUrl(data.data.audio);
      } else {
        throw new Error("未获取到音频数据");
      }
      setStep("music");
    } catch (err) {
      console.error("Music error:", err);
      setError("生成歌曲失败，请重试");
    }
    setLoading(false);
    setLoadingText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  const resetChat = () => {
    setUserInput("");
    setConversation([]);
    setLyrics("");
    setSongUrl("");
    setStep("chat");
    setError("");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI 歌曲生成器</h1>
        {step !== "chat" && (
          <button className="reset-btn" onClick={resetChat}>
            开始新对话
          </button>
        )}
      </header>

      {error && (
        <div className="error-toast" onClick={clearError}>
          <span className="error-icon">!</span>
          {error}
          <span className="error-close">x</span>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{loadingText}</p>
        </div>
      )}

      <div className="conversation-area">
        {conversation.length === 0 && step === "chat" && (
          <div className="welcome-message">
            <p>欢迎使用 AI 歌曲生成器</p>
            <p className="hint">描述你想要什么样的歌曲，我会帮你创作歌词并生成音乐</p>
          </div>
        )}
        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === "user" ? "user-message" : "assistant-message"}`}
          >
            <div className="message-avatar">
              {msg.role === "user" ? "U" : "AI"}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="input-area">
        <textarea
          className="chat-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="描述你想要什么样的歌曲..."
          disabled={loading}
          rows={2}
        />
        <button
          className="send-btn"
          onClick={handleChat}
          disabled={loading || !userInput.trim()}
        >
          发送
        </button>
      </div>

      {step !== "chat" && lyrics && (
        <div className="lyrics-section">
          <div className="section-header">
            <h2>歌词</h2>
            {step === "music" && <span className="completed-badge">已完成</span>}
          </div>
          <textarea
            className="lyrics-input"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="生成的歌词将显示在这里，你可以修改..."
            disabled={loading && step === "lyrics"}
          />
          {step === "lyrics" && (
            <button
              className="generate-btn"
              onClick={generateMusic}
              disabled={loading || !lyrics.trim()}
            >
              {loading ? "生成中..." : "生成歌曲"}
            </button>
          )}
        </div>
      )}

      {step === "chat" && conversation.length > 0 && !lyrics && (
        <button
          className="generate-btn lyrics-btn"
          onClick={generateLyrics}
          disabled={loading}
        >
          {loading ? "生成歌词中..." : "开始生成歌词"}
        </button>
      )}

      {step === "music" && songUrl && (
        <div className="player-section">
          <div className="section-header">
            <h2>歌曲已生成</h2>
          </div>
          <div className="audio-wrapper">
            <audio controls src={songUrl} className="audio-player">
              您的浏览器不支持音频播放
            </audio>
          </div>
          <div className="player-actions">
            <button className="secondary-btn" onClick={() => setStep("lyrics")}>
              编辑歌词
            </button>
            <button
              className="generate-btn"
              onClick={generateMusic}
              disabled={loading}
            >
              重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;