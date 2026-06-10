import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Copy, Loader2, RefreshCw, Sparkle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { runTool } from "@/lib/ai.functions";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "input" | "textarea" | "select";
  options?: string[];
  rows?: number;
  required?: boolean;
};

type HistoryItem = {
  id: string;
  createdAt: number;
  fields: Record<string, string>;
  output: string;
};

export function ToolWorkspace({
  tool,
  title,
  description,
  icon: Icon,
  fields,
  storageKey,
  examplePrompt,
}: {
  tool: "email" | "summarize" | "plan" | "research";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
  storageKey: string;
  examplePrompt?: Record<string, string>;
}) {
  const run = useServerFn(runTool);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(storageKey, []);

  const submit = async () => {
    const missing = fields.filter((f) => f.required && !values[f.name]?.trim());
    if (missing.length) {
      toast.error(`Please fill: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { tool, fields: values } });
      setOutput(res.text);
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        fields: values,
        output: res.text,
      };
      setHistory((prev) => [item, ...prev].slice(0, 25));
    } catch (e) {
      console.error(e);
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const loadExample = () => {
    if (examplePrompt) setValues({ ...values, ...examplePrompt });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name} className="text-xs font-medium">
                {f.label} {f.required && <span className="text-destructive">*</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  rows={f.rows ?? 5}
                  placeholder={f.placeholder}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : f.type === "select" && f.options ? (
                <Select
                  value={values[f.name] ?? ""}
                  onValueChange={(val) => setValues((v) => ({ ...v, [f.name]: val }))}
                >
                  <SelectTrigger id={f.name}>
                    <SelectValue placeholder={f.placeholder ?? "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={f.name}
                  placeholder={f.placeholder}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={submit} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkle className="h-4 w-4" />
              )}
              {loading ? "Generating…" : "Generate"}
            </Button>
            {examplePrompt && (
              <Button type="button" variant="outline" onClick={loadExample}>
                Try example
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[420px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-base">AI Output</CardTitle>
            <CardDescription className="text-xs">
              Editable. Always review before sharing.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={submit} disabled={loading || !output}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="history">History ({history.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              {output ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              ) : (
                <EmptyState loading={loading} />
              )}
            </TabsContent>
            <TabsContent value="edit" className="mt-4">
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={18}
                placeholder="Generated output will appear here. Edit freely."
                className="font-mono text-xs"
              />
            </TabsContent>
            <TabsContent value="history" className="mt-4 space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setHistory([])}
                      className="text-muted-foreground"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear all
                    </Button>
                  </div>
                  {history.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setValues({ ...values, ...h.fields });
                        setOutput(h.output);
                      }}
                      className="block w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                    >
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm">{h.output.slice(0, 160)}</p>
                    </button>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
          <div className="mt-6 rounded-md border border-dashed border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <strong className="font-medium">Responsible AI:</strong> Outputs may contain errors,
            bias, or hallucinations. Verify facts and review tone before sending.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 text-center">
      {loading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Thinking…</p>
        </>
      ) : (
        <>
          <Sparkle className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Fill the form and click Generate.</p>
        </>
      )}
    </div>
  );
}
