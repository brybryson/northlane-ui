import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bot, Sparkles, MessageSquare, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account/ai-conversations")({
  head: () => ({
    meta: [
      { title: "AI Shopping Log — Northlane Studio" },
      { name: "description", content: "Review your past AI concierge inquiries, search logs, and saved recommendations." },
    ],
  }),
  component: AIConversationsPage,
});

interface AIConversationLog {
  id: string;
  date: string;
  topic: string;
  userPrompt: string;
  aiSummary: string;
  recommendedProducts: string[];
}

const INITIAL_AI_LOGS: AIConversationLog[] = [
  {
    id: "log-1",
    date: "2026-08-02 14:20",
    topic: "Minimalist Coding Setup",
    userPrompt: "Recommend silent mechanical keyboards under $250 with warm backlighting for night coding",
    aiSummary:
      "Matched Monolith Low-Profile Mechanical Keyboard with linear silent switches and CNC aluminum body.",
    recommendedProducts: ["Monolith Low-Profile Keyboard", "Northlane Solid Oak Wool Desk Mat"],
  },
  {
    id: "log-2",
    date: "2026-07-28 09:15",
    topic: "Studio Audio & Headphone Specs",
    userPrompt: "Compare planar magnetic headphones vs closed-back acoustic monitors",
    aiSummary: "Analyzed spatial audio resolution, bass response curve, and acoustic isolation properties.",
    recommendedProducts: ["Acoustic Noise-Isolating Headphones"],
  },
];

function AIConversationsPage() {
  const [aiLogs, setAiLogs] = useState<AIConversationLog[]>(INITIAL_AI_LOGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data } = await supabase
          .from("ai_conversation_logs" as any)
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const formatted: AIConversationLog[] = data.map((d: any) => ({
            id: d.id,
            date: new Date(d.created_at).toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            topic: d.topic,
            userPrompt: d.user_prompt,
            aiSummary: d.ai_summary,
            recommendedProducts: d.recommended_products || [],
          }));
          setAiLogs(formatted);
        }
      } catch (err) {
        console.error("Failed to load AI logs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Account Overview</span>
      </Link>

      <div>
        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Intelligence Log
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          AI Shopping Assistant Log
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Review your past AI concierge inquiries, search logs, and saved recommendations.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Fetching AI logs...</div>
      ) : aiLogs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-background border border-hairline space-y-3">
          <Bot className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No AI Conversation History</h3>
          <p className="text-xs text-muted-foreground">Ask the AI Concierge on the storefront to generate custom setup recommendations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {aiLogs.map((log) => (
            <div
              key={log.id}
              className="p-6 rounded-2xl bg-background border border-hairline shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-foreground">{log.topic}</span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{log.date}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">
                  Your Inquiry
                </span>
                <p className="text-xs text-foreground font-semibold mt-0.5">"{log.userPrompt}"</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface/50 border border-hairline space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent block">
                  AI Summary & Recommendation
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">{log.aiSummary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
