import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Workflow,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCcw,
  Layers,
  ArrowRight,
  Shield,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/automation")({
  component: AutomationPage,
});

interface WorkflowItem {
  id: string;
  name: string;
  triggerEvent: string;
  status: "active" | "paused";
  lastRun: string;
  totalRuns: number;
  successRate: number;
  description: string;
}

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf-order-processing",
    name: "Customer Order Processing & Invoice Email",
    triggerEvent: "order.created",
    status: "active",
    lastRun: "2026-08-02 15:45",
    totalRuns: 342,
    successRate: 99.4,
    description: "Order Webhook ──► Invoice Generation ──► Email Receipt ──► Slack Notification ──► Google Sheet Update",
  },
  {
    id: "wf-inventory-alert",
    name: "Low Stock Supplier Reorder Alert",
    triggerEvent: "inventory.low_stock",
    status: "active",
    lastRun: "2026-08-01 09:12",
    totalRuns: 48,
    successRate: 100.0,
    description: "Stock Threshold Trigger ──► Email Supplier Reorder ──► Slack Alert ──► ClickUp Purchasing Task",
  },
  {
    id: "wf-abandoned-cart",
    name: "AI Abandoned Cart Recovery Sequence",
    triggerEvent: "cart.abandoned",
    status: "active",
    lastRun: "2026-08-02 11:30",
    totalRuns: 189,
    successRate: 97.8,
    description: "Cart Abandoned Trigger ──► 2h Delay ──► AI Personalized Email + Discount Code ──► SMS Follow-up",
  },
  {
    id: "wf-content-publish",
    name: "Automated Product Launch & SEO Meta Generation",
    triggerEvent: "product.created",
    status: "paused",
    lastRun: "2026-07-25 14:00",
    totalRuns: 12,
    successRate: 91.6,
    description: "Admin Product Create ──► AI Meta Generation ──► Storefront Auto-Publish ──► Scheduled Social Promo",
  },
];

function AutomationPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [runningWfId, setRunningWfId] = useState<string | null>(null);

  const handleTestTrigger = async (wf: WorkflowItem) => {
    setRunningWfId(wf.id);
    try {
      const response = await fetch("http://localhost:3000/api/automation/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: wf.id,
          payload: { trigger: wf.triggerEvent, testMode: true },
        }),
      });

      const data = await response.json();
      setTimeout(() => {
        setRunningWfId(null);
        toast.success(`Triggered n8n workflow: "${wf.name}"`, {
          description: data.message || "Execution completed successfully.",
        });
      }, 500);
    } catch (err) {
      setRunningWfId(null);
      toast.info(`Workflow "${wf.name}" executed (Simulated Mode).`);
    }
  };

  const handleToggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextStatus = w.status === "active" ? "paused" : "active";
          toast.success(`Workflow status updated to ${nextStatus.toUpperCase()}`);
          return { ...w, status: nextStatus };
        }
        return w;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">n8n Automation Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and execute visual n8n workflows for order processing, inventory warnings, and AI sequences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-mono font-medium border border-emerald-500/20 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            n8n Engine Online
          </span>
        </div>
      </div>

      {/* Top Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface/70 border border-hairline space-y-1">
          <span className="text-xs text-muted-foreground block">Active Workflows</span>
          <span className="text-2xl font-bold font-mono text-foreground">
            {workflows.filter((w) => w.status === "active").length} / {workflows.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-surface/70 border border-hairline space-y-1">
          <span className="text-xs text-muted-foreground block">Total Executions</span>
          <span className="text-2xl font-bold font-mono text-accent">591 Runs</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface/70 border border-hairline space-y-1">
          <span className="text-xs text-muted-foreground block">Overall Reliability</span>
          <span className="text-2xl font-bold font-mono text-emerald-500">98.7%</span>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-6 rounded-2xl bg-surface/70 border border-hairline hover:border-foreground/30 transition-all space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    wf.status === "active"
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-muted text-muted-foreground border-hairline"
                  }`}
                >
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {wf.name}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {wf.triggerEvent}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-light">{wf.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleToggleStatus(wf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    wf.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-surface text-muted-foreground border-hairline"
                  }`}
                >
                  {wf.status.toUpperCase()}
                </button>

                <button
                  onClick={() => handleTestTrigger(wf)}
                  disabled={runningWfId === wf.id}
                  className="px-4 py-1.5 rounded-xl bg-foreground text-background font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {runningWfId === wf.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-background" />
                  )}
                  <span>Test Trigger</span>
                </button>
              </div>
            </div>

            {/* Workflow Footer Status Metrics */}
            <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-4">
                <span>Last Run: {wf.lastRun}</span>
                <span>•</span>
                <span>Total Runs: {wf.totalRuns}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{wf.successRate}% Success Rate</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
