import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/summarizer")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — Worklytic" }] }),
  component: Page,
});

function Page() {
  return (
    <ToolWorkspace
      tool="summarize"
      title="Meeting Notes Summarizer"
      description="Paste raw notes — get summary, decisions, and action items."
      icon={FileText}
      storageKey="worklytic.history.summary"
      examplePrompt={{
        notes:
          "Q3 planning call. Sarah will own onboarding redesign, due Oct 15. Engineering raised concern about API limits. Marketing to draft launch copy by Friday. Decision: launch postponed to Nov 1. Open question: pricing tier for SMB.",
      }}
      fields={[
        {
          name: "notes",
          label: "Raw meeting notes / transcript",
          type: "textarea",
          rows: 14,
          placeholder: "Paste your messy notes here…",
          required: true,
        },
      ]}
    />
  );
}
