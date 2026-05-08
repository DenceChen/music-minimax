import React, { useState } from "react";

function App() {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [lyrics, setLyrics] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("chat"); // chat -> lyrics -> music

  const handleChat = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    // 添加用户消息到对话
    setConversation(prev => [...prev, { role: "user", content: userInput }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
      });
      const data = await response.json();

      // 添加助手回复
      const assistantMessage = data.choices?.[0]?.message?.content || "好的，我来帮你创作这首歌";
      setConversation(prev => [...prev, { role: "assistant", content: assistantMessage }]);

      // 自动进入歌词生成阶段
      setStep("lyrics");
    } catch (error) {
      console.error("Chat error:", error);
    }
    setLoading(false);
  };

  const generateLyrics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput })
      });
      const data = await response.json();
      setLyrics(data.lyrics || "");
      setStep("lyrics");
    } catch (error) {
      console.error("Lyrics error:", error);
    }
    setLoading(false);
  };

  const generateMusic = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput, lyrics })
      });
      const data = await response.json();
      if (data.data?.audio) {
        setSongUrl(data.data.audio);
      }
      setStep("music");
    } catch (error) {
      console.error("Music error:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>AI 歌曲生成器</h1>

      {/* 对话区域 */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px", minHeight: "200px" }}>
        {conversation.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
            <strong>{msg.role === "user" ? "你" : "AI"}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* 输入区域 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="描述你想要什么样的歌曲..."
          style={{ flex: 1, padding: "10px" }}
          onKeyPress={(e) => e.key === "Enter" && handleChat()}
        />
        <button onClick={handleChat} disabled={loading}>发送</button>
      </div>

      {/* 歌词区域 */}
      {step !== "chat" && (
        <div style={{ marginBottom: "20px" }}>
          <h3>歌词 {step === "music" && "✓"}</h3>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            style={{ width: "100%", height: "200px", padding: "10px" }}
            placeholder="生成的歌词将显示在这里，你可以修改..."
          />
          {step === "lyrics" && (
            <button onClick={generateMusic} disabled={loading || !lyrics}>
              {loading ? "生成中..." : "生成歌曲"}
            </button>
          )}
        </div>
      )}

      {/* 音频播放器 */}
      {step === "music" && songUrl && (
        <div>
          <h3>歌曲已生成!</h3>
          <audio controls src={songUrl} style={{ width: "100%" }}>
            您的浏览器不支持音频播放
          </audio>
        </div>
      )}

      {/* 生成歌词按钮 */}
      {step === "chat" && conversation.length > 0 && (
        <button onClick={generateLyrics} disabled={loading}>
          {loading ? "生成歌词中..." : "开始生成歌词"}
        </button>
      )}
    </div>
  );
}

export default App;