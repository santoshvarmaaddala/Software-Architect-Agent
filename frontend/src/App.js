import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MermaidDiagramGenrator from "./components/Mermaid";
import { IoSunnyOutline } from "react-icons/io5";
import { FiMoon } from "react-icons/fi";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSessionId = () => "mock-session-id"; // Replace if needed

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/api/submit-prompt", {
        prompt: input,
        sessionId: getSessionId(),
      });

      const aiMessage = {
        role: "ai",
        content: res.data.mermaid || "No valid response received.",
        isDiagram: res.data.mermaid && res.data.mermaid.startsWith("graph"),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error generating diagram." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      key={theme}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-600 dark:text-blue-400">
            Architecture Playground
          </h1>
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:opacity-90"
            title="Toggle Theme"
          >
            {theme === "dark" ? <IoSunnyOutline /> : <FiMoon />}
          </button>
        </div>

        {/* Chat area */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 space-y-4 h-[70vh] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-bl-none"
                }`}
              >
                {msg.isDiagram ? (
                  <MermaidDiagramGenrator code={msg.content} />
                ) : (
                  <pre className="whitespace-pre-wrap">{msg.content}</pre>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-400">AI is typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
            rows={2}
            placeholder="Ask about your system architecture..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
