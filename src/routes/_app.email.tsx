import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/email")({
  head: () => ({ meta: [{ title: "Email Generator — Worklytic" }] }),
  component: Page,
});

function Page() {
  return (
    <ToolWorkspace
      tool="email"
      title="Smart Email Generator"
      description="Draft professional emails in seconds."
      icon={Mail}
      storageKey="worklytic.history.email"
      examplePrompt={{
        recipient: "Project stakeholders",
        tone: "Professional",
        subject: "Project deadline extension",
        context:
          "Deadline extended by one week to allow additional QA. Thank them for patience. Mention revised timeline will follow.",
      }}
      fields={[
        { name: "recipient", label: "Recipient", placeholder: "e.g., Project team, John from Acme", required: true },
        {
          name: "tone",
          label: "Tone",
          type: "select",
          options: ["Professional", "Friendly", "Formal", "Persuasive", "Apologetic"],
        },
        { name: "subject", label: "Subject / Purpose", placeholder: "What is this email about?", required: true },
        {
          name: "context",
          label: "Key points to include",
          type: "textarea",
          rows: 6,
          placeholder: "Bullet the facts, asks, and any deadlines.",
          required: true,
        },
      ]}
    />
  );
}
