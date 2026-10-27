import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Loader2,
  Mic,
  MicOff,
  Wrench,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Maximize2,
} from "lucide-react";
import API from "../../api/axios";

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I am your **Smart Campus Agentic AI Assistant**.\n\nI have direct, secure access to your academic records, attendance, timetable, fee dues, and campus updates. Ask me anything!",
      tools_used: [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [suggestions, setSuggestions] = useState([
    "How much fee do I have to pay?",
    "How is my attendance?",
    "What assignments are pending?",
    "Give me my academic status",
  ]);

  const [proactiveAlerts, setProactiveAlerts] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTool]);

  // Load real proactive alerts when opened
  useEffect(() => {
    if (isOpen && proactiveAlerts.length === 0) {
      const loadProactive = async () => {
        try {
          const res = await API.get("/ai/proactive");
          setProactiveAlerts(res.data?.insights || []);
        } catch (err) {}
      };
      loadProactive();
    }
  }, [isOpen]);

  // Voice speech-to-text setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || message).trim();
    if (!query || loading) return;

    setMessage("");

    // Append user message
    const userMsg = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulate agentic tool selection state
    const lower = query.toLowerCase();
    if (lower.includes("fee") || lower.includes("due") || lower.includes("pay")) {
      setActiveTool("Executing get_fees() from MongoDB...");
    } else if (lower.includes("attendance") || lower.includes("absent")) {
      setActiveTool("Executing get_attendance() tool...");
    } else if (lower.includes("assignment") || lower.includes("homework")) {
      setActiveTool("Executing get_assignments() tool...");
    } else if (lower.includes("timetable") || lower.includes("class")) {
      setActiveTool("Executing get_timetable() tool...");
    } else if (lower.includes("summary") || lower.includes("status")) {
      setActiveTool("Aggregating get_academic_summary() across records...");
    } else {
      setActiveTool("Agent reasoning & selecting tools...");
    }

    try {
      const res = await API.post("/ai/chat", {
        message: query,
        history: messages.slice(-4).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setActiveTool(null);

      const aiMsg = {
        role: "assistant",
        content: res.data?.response || "I was unable to complete your request.",
        tools_used: res.data?.tools_used || [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (res.data?.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch (error) {
      setActiveTool(null);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Sorry, I encountered an issue connecting with the campus backend server. Please try again.",
          tools_used: [],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    // Simple fast formatting for bold, lists, and headers
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={i} className="font-bold text-white text-sm mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        const content = line.replace("- ", "");
        const formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return (
          <li
            key={i}
            className="ml-4 list-disc text-xs text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p
          key={i}
          className="text-xs text-slate-300 leading-relaxed min-h-[14px]"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-white/10"
            title="Open Smart Campus AI Assistant"
          >
            <Bot size={28} className="animate-bounce duration-1000" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 ring-2 ring-slate-950" />
            </span>
          </button>
        </div>
      )}

      {/* Slide-out Drawer / Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[600px] max-h-[90vh] w-[92vw] sm:w-[440px] flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-950/95 shadow-2xl shadow-black backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-white tracking-tight">
                  SmartCampus AI
                  <span className="flex items-center gap-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[9px] font-semibold text-purple-300">
                    <Sparkles size={10} /> AGENTIC
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time academic agent • MongoDB integrated
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Proactive Alerts Banner */}
          {proactiveAlerts.length > 0 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2 truncate">
                <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                <span className="truncate">{proactiveAlerts[0].message}</span>
              </div>
              <button
                onClick={() => handleSend(proactiveAlerts[0].title)}
                className="text-[10px] font-bold text-amber-400 underline shrink-0 ml-2"
              >
                Details
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-xs ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md"
                      : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.role === "assistant" ? renderMarkdown(m.content) : m.content}

                  {/* Tool Tags */}
                  {m.tools_used && m.tools_used.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Wrench size={10} /> Tools Executed:
                      </span>
                      {m.tools_used.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 text-[9px] font-mono font-medium text-purple-300"
                        >
                          {t}()
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {/* Active Tool Execution Indicator */}
            {activeTool && (
              <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-xs text-purple-300 animate-pulse">
                <Loader2 size={14} className="animate-spin text-purple-400" />
                <span className="font-mono text-[11px]">{activeTool}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="border-t border-white/10 bg-white/[0.01] px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                disabled={loading}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="border-t border-white/10 p-3 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleVoice}
                className={`rounded-xl border p-2.5 transition-colors ${
                  isListening
                    ? "border-red-500/50 bg-red-500/20 text-red-400 animate-pulse"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
                title={isListening ? "Listening... click to stop" : "Voice input"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isListening ? "Listening to your voice..." : "Ask fees, attendance, timetable..."
                }
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistantWidget;
