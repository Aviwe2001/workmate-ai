import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/planner")({
  head: () => ({ meta: [{ title: "Task Planner — Worklytic" }] }),
  component: Page,
});

function Page() {
  return (
    <ToolWorkspace
      tool="plan"
      title="AI Task Planner"
      description="Turn a goal into a prioritized, time-boxed plan."
      icon={ListChecks}
      storageKey="worklytic.history.plan"
      examplePrompt={{
        goal: "Launch the new pricing page",
        timeframe: "Next 2 weeks",
        context: "Solo PM, dev capacity is limited, design assets ready.",
      }}
      fields={[
        { name: "goal", label: "Goal", placeholder: "What are you trying to accomplish?", required: true },
        {
          name: "timeframe",
          label: "Timeframe",
          type: "select",
          options: ["Today", "This week", "Next 2 weeks", "This month", "This quarter"],
        },
        {
          name: "context",
          label: "Constraints & context",
          type: "textarea",
          rows: 5,
          placeholder: "Team size, dependencies, blockers…",
        },
      ]}
    />
  );
}
