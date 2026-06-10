import { useEffect, useMemo, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessagesSquare, Plus, Send, Sparkle, Trash2 } from "lucide-react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Thread } from "@/lib/chat-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_app/chat/$threadId")({
  head: () => ({ meta: [{ title: "AI Chat — Worklytic" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  return <ChatView key={threadId} threadId={threadId} />;
}

function getTextFromMessage(m: UIMessage): string {
  return m.parts
    .map((p) => ((p as { type: string }).type === "text" ? (p as { text: string }).text : ""))
    .join("");
}

function ChatView({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const [threads, setThreads, hydrated] = useLocalStorage<Thread[]>(
    "worklytic.chat.threads",
    [],
  );

  // Ensure thread exists once hydrated
  useEffect(() => {
    if (!hydrated) return;
    if (!threads.find((t) => t.id === threadId)) {
      setThreads((prev) => [
        ...prev,
        { id: threadId, title: "New conversation", updatedAt: Date.now(), messages: [] },
      ]);
    }
  }, [hydrated, threadId, threads, setThreads]);

  const active = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const initialMessagesRef = useRef<UIMessage[] | null>(null);
  if (initialMessagesRef.current === null && hydrated) {
    initialMessagesRef.current = active?.messages ?? [];
  }

  const { messages, sendMessage, status, setMessages } = useChat({
    id: threadId,
    messages: initialMessagesRef.current ?? [],
    transport,
  });

  // Persist messages back into thread when status becomes ready
  useEffect(() => {
    if (!hydrated) return;
    if (status === "streaming" || status === "submitted") return;
    if (messages.length === 0) return;
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const firstUser = messages.find((m) => m.role === "user");
        const title =
          t.title === "New conversation" && firstUser
            ? getTextFromMessage(firstUser).slice(0, 48) || "New conversation"
            : t.title;
        return { ...t, messages, title, updatedAt: Date.now() };
      }),
    );
  }, [messages, status, threadId, hydrated, setThreads]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const newThread = () => {
    const id = crypto.randomUUID();
    setThreads((prev) => [
      { id, title: "New conversation", updatedAt: Date.now(), messages: [] },
      ...prev,
    ]);
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (id === threadId) {
        if (next.length > 0) {
          navigate({ to: "/chat/$threadId", params: { threadId: next[0].id }, replace: true });
        } else {
          const nid = crypto.randomUUID();
          navigate({ to: "/chat/$threadId", params: { threadId: nid }, replace: true });
          return [{ id: nid, title: "New conversation", updatedAt: Date.now(), messages: [] }];
        }
      }
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text) return;
    if (inputRef.current) inputRef.current.value = "";
    await sendMessage({ text });
  };

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Thread list */}
      <Card className="hidden flex-col overflow-hidden lg:flex">
        <div className="flex items-center justify-between gap-2 border-b border-border p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Conversations
          </p>
          <Button size="sm" variant="ghost" onClick={newThread} className="h-7 gap-1 px-2">
            <Plus className="h-3.5 w-3.5" /> New
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {[...threads]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors",
                    t.id === threadId ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: t.id } })}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessagesSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{t.title || "New conversation"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteThread(t.id)}
                    className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Conversation */}
      <Card className="flex min-w-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {active?.title || "New conversation"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Ask anything about emails, meetings, planning, or research.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={newThread} className="lg:hidden">
            <Plus className="mr-1 h-3.5 w-3.5" /> New
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <EmptyChat onPick={(t) => sendMessage({ text: t })} />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Thinking…
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t border-border bg-card p-3">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea
              ref={inputRef}
              rows={1}
              placeholder="Message your AI assistant…"
              className="min-h-[44px] flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.currentTarget.form as HTMLFormElement).requestSubmit();
                }
              }}
              disabled={busy}
            />
            <Button type="submit" disabled={busy} size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
            AI-generated responses may contain errors. Review before acting on them.
          </p>
        </form>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = getTextFromMessage(message);
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkle className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "min-w-0 max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 text-foreground",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none [&_*]:my-1 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-background [&_pre]:p-2 [&_code]:text-xs">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

const STARTERS = [
  "Draft a follow-up email after a sales call",
  "Summarize this week's standup decisions",
  "Plan my day given 3 deep-work tasks and 2 meetings",
  "Brief me on AI regulation in the EU",
];

function EmptyChat({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Sparkle className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">How can I help you work today?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask anything, or pick a starter below.
        </p>
      </div>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-lg border border-border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
