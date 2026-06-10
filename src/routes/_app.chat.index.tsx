import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Thread } from "@/lib/chat-types";

export const Route = createFileRoute("/_app/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const [threads, setThreads, hydrated] = useLocalStorage<Thread[]>(
    "worklytic.chat.threads",
    [],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (threads.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
      return;
    }
    const id = crypto.randomUUID();
    const fresh: Thread = { id, title: "New conversation", updatedAt: Date.now(), messages: [] };
    setThreads([fresh]);
    navigate({ to: "/chat/$threadId", params: { threadId: id }, replace: true });
  }, [hydrated, threads, setThreads, navigate]);

  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Opening chat…
    </div>
  );
}
