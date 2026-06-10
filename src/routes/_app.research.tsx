import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Worklytic" }] }),
  component: Page,
});

function Page() {
  return (
    <ToolWorkspace
      tool="research"
      title="AI Research Assistant"
      description="Balanced briefings for any topic — pitched to your audience."
      icon={Search}
      storageKey="worklytic.history.research"
      examplePrompt={{
        topic: "B2B SaaS pricing strategies for 2026",
        depth: "Deep dive",
        audience: "Product leadership",
      }}
      fields={[
        { name: "topic", label: "Topic / question", placeholder: "What do you want to understand?", required: true },
        {
          name: "depth",
          label: "Depth",
          type: "select",
          options: ["Quick overview", "Standard briefing", "Deep dive"],
        },
        {
          name: "audience",
          label: "Audience",
          placeholder: "Who is this for? e.g., Engineering team",
        },
      ]}
    />
  );
}
