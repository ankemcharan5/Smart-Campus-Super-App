import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  Wrench,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
} from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export function AIAssistant() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [proactive, setProactive] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Welcome to the **Smart Campus Agentic AI Assistant**!\n\nI have direct, secure access to your academic records, attendance, timetable, fee dues, and campus updates. Ask me anything!",
      tools_used: [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [suggestions, setSuggestions] = useState([
    "How much fee do I have to pay?",
    "How is my attendance in Data Structures?",
    "What assignments are due?",
    "Give me my academic status",
    "What is today's timetable?",
    "Show upcoming events",
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const availableTools = [
    { name: "get_fees", desc: "Retrieves Total, Paid, and Due amounts from fees collection" },
    { name: "get_attendance", desc: "Calculates subject and overall attendance percentages" },
    { name: "get_assignments", desc: "Lists pending coursework and deadlines for your year" },
    { name: "get_timetable", desc: "Fetches schedule, room locations, and faculty timings" },
    { name: "get_results", desc: "Aggregates exam marks, grades, and average percentages" },
    { name: "get_notices", desc: "Fetches official university announcements and circulars" },
    { name: "get_events", desc: "Lists upcoming campus events, fests, and workshops" },
    { name: "get_campus_resources", desc: "Queries university libraries, labs, and facilities" },
    { name: "get_academic_summary", desc: "Multi-tool aggregator for holistic student status" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTool]);

  useEffect(() => {
    const loadProactive = async () => {
      try {
        const res = await API.get("/ai/proactive");
        setProactive(res.data?.insights || []);
      } catch (err) {}
    };
    loadProactive();
  }, []);

  // Voice speech-to-text
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

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
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
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={i} className="font-bold text-white text-base mt-2 mb-1">
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Bot size={16} />
            <span>Autonomous AI Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Smart Campus AI Assistant
            <span className="flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300">
              <Sparkles size={14} /> Real Agent
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Natural language interface with secure tool calling over your university MongoDB records.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Side: Agent Telemetry & Tools */}
        <div className="space-y-6 lg:col-span-1">
          {/* Agent Status */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu size={16} className="text-purple-400" /> Agent Status
            </h4>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online • Grounded in MongoDB</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Queries execute read-only backend tools scoped strictly to your authenticated session.
            </p>
          </Card>

          {/* Proactive Alerts */}
          {proactive.length > 0 && (
            <Card className="p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <AlertTriangle size={16} /> Proactive Alerts
              </h4>
              <div className="space-y-2">
                {proactive.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSend(p.title)}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 cursor-pointer hover:bg-amber-500/20 transition-colors"
                  >
                    <p className="font-bold text-white">{p.title}</p>
                    <p className="text-[11px] text-amber-300/90 mt-0.5">{p.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tool Directory */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database size={16} className="text-blue-400" /> Controlled Tools ({availableTools.length})
            </h4>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {availableTools.map((tool) => (
                <div
                  key={tool.name}
                  onClick={() => handleSend(`Use ${tool.name} to check my data`)}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer"
                >
                  <p className="font-mono text-xs font-bold text-purple-300">{tool.name}()</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tool.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Main Chat Area */}
        <Card className="lg:col-span-3 flex flex-col h-[700px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-5 text-xs ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-blue-500/20"
                      : "bg-slate-950/80 border border-white/10 text-slate-200 rounded-bl-none shadow-md"
                  }`}
                >
                  {m.role === "assistant" ? renderMarkdown(m.content) : m.content}

                  {m.tools_used && m.tools_used.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Wrench size={10} /> Tools Executed:
                      </span>
                      {m.tools_used.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300"
                        >
                          {t}()
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {activeTool && (
              <div className="flex items-center gap-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 px-4 py-3 text-xs text-purple-300 animate-pulse">
                <Loader2 size={16} className="animate-spin text-purple-400" />
                <span className="font-mono text-xs">{activeTool}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="border-t border-white/10 bg-white/[0.01] px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                disabled={loading}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="border-t border-white/10 p-4 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={toggleVoice}
                className={`rounded-2xl border p-3 transition-colors ${
                  isListening
                    ? "border-red-500/50 bg-red-500/20 text-red-400 animate-pulse"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
                title={isListening ? "Listening... click to stop" : "Voice input"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isListening ? "Listening to voice..." : "Ask fees, attendance, timetable, results..."
                }
                disabled={loading}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />

              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AIAssistant;