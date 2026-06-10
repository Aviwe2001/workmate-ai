import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ToolInput = z.object({
  tool: z.enum(["email", "summarize", "plan", "research"]),
  fields: z.record(z.string(), z.string()),
});

const SYSTEM_PROMPTS: Record<string, (f: Record<string, string>) => string> = {
  email: (f) =>
    `You are a professional workplace email writer. Write a clear, concise, professional email.

Recipient: ${f.recipient || "Colleague"}
Tone: ${f.tone || "Professional"}
Subject / Purpose: ${f.subject || "(not specified)"}
Key points to include:
${f.context || "(none)"}

Produce ONLY the email body in Markdown, starting with a subject line as "**Subject:** ...", then greeting, body, and sign-off. Keep it under 250 words.`,
  summarize: (f) =>
    `You are an executive assistant summarizing meeting notes.
Notes:
"""
${f.notes || ""}
"""

Return Markdown with these sections:
### Summary
A 2-3 sentence overview.
### Key Decisions
- bullets
### Action Items
- [ ] Owner — Task — Due date (if mentioned)
### Open Questions
- bullets`,
  plan: (f) =>
    `You are a productivity coach. Create a structured task plan.

Goal: ${f.goal || ""}
Timeframe: ${f.timeframe || "this week"}
Constraints / context: ${f.context || "(none)"}

Return Markdown with:
### Plan Overview
Brief paragraph.
### Prioritized Tasks
A table with columns: Priority | Task | Estimated Time | Suggested Day
### Tips
- 3 short productivity tips tailored to the goal.`,
  research: (f) =>
    `You are a research analyst. Provide a balanced, well-structured briefing.

Topic: ${f.topic || ""}
Depth: ${f.depth || "Overview"}
Audience: ${f.audience || "Business professional"}

Return Markdown with:
### TL;DR
2-3 sentences.
### Background
### Key Insights
- bullets
### Considerations & Risks
### Sources to explore further
- list general categories of sources (no fabricated URLs)`,
};

export const runTool = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ToolInput.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const prompt = SYSTEM_PROMPTS[data.tool](data.fields);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
    });
    return { text };
  });
