"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/Markdown";
import { ModelBadge } from "@/components/ai/ModelBadge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How do I become investor-ready?",
  "What are my biggest financial weaknesses?",
  "How can I improve my profit margin?",
  "Draft an elevator pitch for my business.",
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Grow AI advisor. Ask me anything about getting your business investor-ready — I can see your financials and Prospect Score.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const history = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "", streaming: true }]);
    setInput("");
    setBusy(true);

    const updateLast = (patch) =>
      setMessages((cur) => {
        const copy = [...cur];
        copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
        return copy;
      });

    try {
      await api.ai.chatStream(
        history.filter((m) => m.role !== "system").map(({ role, content }) => ({ role, content })),
        (full) => updateLast({ content: full }),
      );
      updateLast({ streaming: false });
    } catch (e) {
      updateLast({ content: `Sorry, something went wrong: ${e.message}`, streaming: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <RoleGate allow={["MSME"]}>
      <PageHeader
        title="AI Advisor"
        subtitle="Your personal co-pilot for becoming investor-ready."
        action={<ModelBadge />}
      />

      <Card className="flex h-[calc(100vh-220px)] min-h-[460px] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" && (
                <span className="mr-2 mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-emerald-800 text-amber-300">
                  <Sparkles className="h-4 w-4" />
                </span>
              )}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "whitespace-pre-wrap bg-emerald-800 text-paper-soft"
                    : "border border-sand bg-paper text-ink-soft",
                )}
              >
                {m.role === "assistant" ? (
                  m.content ? (
                    <Markdown
                      content={m.content}
                      className="[&_h2]:text-lg [&_h3]:text-base [&_h2]:mt-1 [&_h3]:mt-2 [&_p]:my-1 [&_ul]:my-1"
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" />
                    </span>
                  )
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 px-6 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-sand bg-paper px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:border-emerald-700/40 hover:bg-emerald-800/5"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 border-t border-sand p-4"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your advisor…" disabled={busy} />
          <Button type="submit" variant="amber" size="icon" disabled={busy || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </RoleGate>
  );
}
