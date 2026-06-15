"use client";

import { useEffect, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { api } from "@/lib/api";

const PRETTY = {
  "llama-3.3-70b-versatile": "Llama 3.3 70B · Groq",
  "gemini-2.0-flash": "Gemini 2.0 Flash",
  "llama3.2": "Llama 3.2 · Ollama",
};

export function ModelBadge() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    api.ai.status().then(setInfo).catch(() => setInfo({ configured: false }));
  }, []);

  if (!info) return null;
  const label = info.configured ? PRETTY[info.model] || info.model : "Template fallback";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-paper-soft px-3 py-1.5 text-xs font-semibold text-ink-soft"
      title={info.configured ? "AI responses are generated live by this model" : "No AI provider configured — using data-driven templates"}
    >
      {info.configured ? <Zap className="h-3.5 w-3.5 text-amber-500" /> : <Sparkles className="h-3.5 w-3.5 text-ink-muted" />}
      {label}
    </span>
  );
}
