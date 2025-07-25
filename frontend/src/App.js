import React, { useState, useEffect } from "react";
import axios from "axios";
import { getSessionId } from "./utils";
import MermaidDiagramGenrator from "./Mermaid";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  // On mount: load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    const html = document.getElementById("htmlRoot");
    if (savedTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, []);

  // Toggle between dark and light theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    const html = document.getElementById("htmlRoot");
    html.classList.toggle("dark", newTheme === "dark");
  };

  // Handle prompt submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const sessionId = getSessionId();
    try {
      const res = await axios.post("http://localhost:4000/api/submit-prompt", {
        prompt,
        sessionId,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Failed to generate diagram:", err);
      setResult({ mermaid: "error" });
    }
    setLoading(false);
  };

  return (
    <div 
        key={theme}
        className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-600 dark:text-blue-400">
            Architecture Playground
            </h1>
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-lg font-medium">Enter Prompt</label>
            <textarea
              className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Describe the architecture..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Generating..." : "Generate Diagram"}
            </button>
          </form>

          {result?.mermaid && result.mermaid !== "error" && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold mb-2">Generated Diagram</h2>
              <div className="bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md p-4 overflow-auto">
                <MermaidDiagramGenrator code={result.mermaid} />
              </div>
            </div>
          )}

          {result?.mermaid === "error" && (
            <p className="text-red-500 font-medium">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
