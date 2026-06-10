import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  ListChecks,
  Mail,
  MessagesSquare,
  Search,
  Sparkle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Worklytic — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft emails, summarize meetings, plan tasks, and research topics with an AI workplace assistant.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    title: "Smart Email Generator",
    desc: "Draft professional emails with the right tone in seconds.",
    icon: Mail,
    to: "/email" as const,
    accent: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into decisions, action items, and questions.",
    icon: FileText,
    to: "/summarizer" as const,
    accent: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "AI Task Planner",
    desc: "Get a prioritized plan with estimates and suggested days.",
    icon: ListChecks,
    to: "/planner" as const,
    accent: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "AI Research Assistant",
    desc: "Quick, balanced briefings on any topic for your audience.",
    icon: Search,
    to: "/research" as const,
    accent: "bg-violet-500/10 text-violet-600",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            <Sparkle className="h-3 w-3" /> AI-powered
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Good to see you. What shall we work on?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A focused workspace for emails, meetings, planning, and research.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link to="/chat">
            <MessagesSquare className="h-4 w-4" /> Open Chat
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${t.accent}`}>
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{t.title}</CardTitle>
                    <CardDescription className="text-xs">{t.desc}</CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>Three steps. Same flow for every tool.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "1", t: "Describe your task", d: "Fill a short structured form." },
            { n: "2", t: "Generate with AI", d: "Get a clean, formatted draft." },
            { n: "3", t: "Edit & use", d: "Refine in place, copy, and ship." },
          ].map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {s.n}
              </div>
              <p className="mt-3 text-sm font-medium">{s.t}</p>
              <p className="text-xs text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-[11px] text-muted-foreground">
        Responses are AI-generated. Please review for accuracy and tone before acting on them.
      </p>
    </div>
  );
}
