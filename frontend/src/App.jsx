import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Logger class for frontend logging
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.listeners = [];
  }

  log(level, message, data = null) {
    const entry = {
      time: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    this.notifyListeners(entry);
    const prefix = `[${entry.time}] [${level.toUpperCase()}]`;
    if (data) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`${prefix} ${message}`, data);
    } else {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`${prefix} ${message}`);
    }
  }

  info(msg, data) { this.log('info', msg, data); }
  warn(msg, data) { this.log('warn', msg, data); }
  error(msg, data) { this.log('error', msg, data); }
  success(msg, data) { this.log('success', msg, data); }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(entry) {
    this.listeners.forEach(l => l(entry));
  }

  getLogs() {
    return [...this.logs];
  }
}

const logger = new Logger();

// SVG Icons as components
const MusicNoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const MicrophoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
);

function App() {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [lyrics, setLyrics] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("chat");
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = logger.subscribe((entry) => {
      setLogs(prev => [...prev.slice(-99), entry]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    logger.info('应用启动', { step, timestamp: new Date().toISOString() });
  }, []);

  const clearError = () => {
    setError("");
    logger.info('错误已清除');
  };

  const handleChat = async () => {
    if (!userInput.trim()) return;
    logger.info('开始处理聊天请求', { message: userInput });
    clearError();
    setLoading(true);
    setLoadingText("正在发送...");

    const userMsg = userInput;
    setConversation(prev => [...prev, { role: "user", content: userMsg }]);
    logger.info('用户消息已添加到对话', { length: userMsg.length });

    try {
      logger.info('发送API请求: /api/chat');
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      logger.info('收到API响应', { status: response.status });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      logger.success('Chat API 响应解析成功', { hasData: !!data });

      const assistantMessage = data.choices?.[0]?.message?.content || "好的，我来帮你创作这首歌";
      setConversation(prev => [...prev, { role: "assistant", content: assistantMessage }]);
      logger.success('AI回复已添加到对话');

      setLoading(false);
      setLoadingText("");
      logger.info('聊天流程完成', { step: 'chat' });
    } catch (err) {
      logger.error('Chat 请求失败', { error: err.message });
      setError("发送消息失败，请检查后端服务是否运行");
      setConversation(prev => prev.slice(0, -1));
      setLoading(false);
      setLoadingText("");
    }
  };

  const generateLyrics = async () => {
    logger.info('开始生成歌词', { prompt: userInput });
    clearError();
    setLoading(true);
    setLoadingText("正在生成歌词...");

    try {
      logger.info('发送API请求: /api/lyrics');
      const response = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });
      logger.info('收到歌词API响应', { status: response.status });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      const generatedLyrics = data.lyrics || "";
      logger.success('歌词生成成功', { lyricsLength: generatedLyrics.length });

      setLyrics(generatedLyrics);
      setStep("lyrics");
      setLoading(false);
      setLoadingText("");
      logger.info('歌词生成流程完成', { lyricsLength: generatedLyrics.length });
    } catch (err) {
      logger.error('歌词生成失败', { error: err.message });
      setError("生成歌词失败，请重试");
      setLoading(false);
      setLoadingText("");
    }
  };

  const generateMusic = async () => {
    if (!lyrics.trim()) {
      logger.warn('歌词为空，无法生成歌曲');
      setError("请先输入歌词");
      return;
    }
    logger.info('开始生成歌曲', { prompt: userInput, lyricsLength: lyrics.length });
    clearError();
    setLoading(true);
    setLoadingText("正在生成歌曲，这可能需要一分钟...");

    try {
      logger.info('发送API请求: /api/music');
      const response = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput, lyrics }),
      });
      logger.info('收到音乐API响应', { status: response.status });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      logger.info('解析音乐API响应', { hasData: !!data });

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.data?.audio) {
        setSongUrl(data.data.audio);
        setStep("music");
        logger.success('歌曲生成成功!', { audioUrl: data.data.audio.substring(0, 50) + '...' });
      } else {
        throw new Error("未获取到音频数据");
      }
      setLoading(false);
      setLoadingText("");
    } catch (err) {
      logger.error('歌曲生成失败', { error: err.message });
      setError("生成歌曲失败，请重试");
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  const resetChat = () => {
    logger.info('重置对话');
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
        <div className="logo">
          <div className="logo-icon">
            <MusicNoteIcon />
          </div>
          <h1>AI 歌曲生成器</h1>
        </div>
        {step !== "chat" && (
          <button className="reset-btn" onClick={resetChat}>
            开始新对话
          </button>
        )}
      </header>

      {error && (
        <div className="error-toast" onClick={clearError}>
          <span className="error-icon">!</span>
          <span>{error}</span>
          <span className="error-close">x</span>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner">
              <div className="diamond"></div>
            </div>
            <p className="loading-text">{loadingText}</p>
            <p className="loading-subtext">请稍候...</p>
          </div>
        </div>
      )}

      <main className="main-content">
        {conversation.length === 0 && step === "chat" && (
          <div className="welcome-section">
            <div className="welcome-icon">
              <MicrophoneIcon />
            </div>
            <h2>AI 智能歌曲创作</h2>
            <p>描述你想要什么样的歌曲，AI 将帮你创作歌词并生成音乐</p>
          </div>
        )}

        <div className="conversation-area">
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
          <div className="input-wrapper">
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
              <SendIcon />
            </button>
          </div>
        </div>

        {step !== "chat" && lyrics && (
          <div className="lyrics-section">
            <div className="section-header">
              <h2>
                <SparkleIcon />
                歌词
              </h2>
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
                className={`generate-btn ${loading ? 'loading' : ''}`}
                onClick={generateMusic}
                disabled={loading || !lyrics.trim()}
              >
                <MusicNoteIcon />
                {loading ? "生成中..." : "生成歌曲"}
              </button>
            )}
          </div>
        )}

        {step === "chat" && conversation.length > 0 && !lyrics && (
          <button
            className={`generate-btn ${loading ? 'loading' : ''}`}
            onClick={generateLyrics}
            disabled={loading}
          >
            <SparkleIcon />
            {loading ? "生成中..." : "开始生成歌词"}
          </button>
        )}

        {step === "music" && songUrl && (
          <div className="player-section">
            <h2>
              <TrophyIcon />
              歌曲已生成
            </h2>
            <div className="audio-wrapper">
              <audio controls src={songUrl} className="audio-player">
                您的浏览器不支持音频播放
              </audio>
            </div>
            <div className="player-actions">
              <button className="secondary-btn" onClick={() => setStep("lyrics")}>
                <EditIcon />
                编辑歌词
              </button>
              <button
                className="secondary-btn"
                onClick={generateMusic}
                disabled={loading}
              >
                <RefreshIcon />
                重新生成
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Log Panel */}
      <div className={`log-panel${showLogs ? ' expanded' : ''}`}>
        <div className="log-header">
          <h3>日志面板</h3>
          <button className="log-toggle" onClick={() => setShowLogs(!showLogs)}>
            {showLogs ? '- ' : '+ '}
          </button>
        </div>
        {showLogs && (
          <div className="log-content" ref={logsEndRef}>
            {logs.map((log, idx) => (
              <div key={idx} className="log-entry">
                <span className="log-time">{log.time}</span>
                <span className={`log-level ${log.level}`}>{log.level.toUpperCase()}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
