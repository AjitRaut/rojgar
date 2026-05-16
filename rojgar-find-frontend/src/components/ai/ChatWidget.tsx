"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiChat } from "@/lib/hooks/use-ai";
import type { ChatMessage } from "@/types/api";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste! I'm Rojgar Sahayak. Ask me about hiring workers, posting jobs, or fair wages.",
    },
  ]);
  const chat = useAiChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, chat.isPending]);

  const send = () => {
    const text = input.trim();
    if (!text || chat.isPending) return;
    const next = [...history, { role: "user" as const, content: text }];
    setHistory(next);
    setInput("");
    chat.mutate(
      { message: text, history },
      {
        onSuccess: (data) => {
          setHistory((h) => [...h, { role: "assistant", content: data.reply }]);
        },
        onError: () => {
          setHistory((h) => [
            ...h,
            { role: "assistant", content: "Sorry, I couldn't reach the AI service right now." },
          ]);
        },
      }
    );
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-violet-500 to-accent text-white shadow-xl"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 flex h-[32rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/10 to-accent/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Rojgar Sahayak</h3>
                <p className="text-xs text-muted-foreground">AI assistant · Powered by OpenAI</p>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-4"
            >
              {history.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {chat.isPending && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t bg-background p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything..."
                className="flex-1 rounded-full border bg-muted/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                disabled={chat.isPending}
              />
              <Button
                size="icon"
                onClick={send}
                disabled={!input.trim() || chat.isPending}
                className="rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
