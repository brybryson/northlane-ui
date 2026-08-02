import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executive Sales & Revenue Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time sales performance, category revenue distribution, and average order value (AOV) metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-surface border border-hairline text-xs focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Year to Date (2026)</option>
          </select>

          <button
            onClick={() => toast.success("Executive Financial Report exported to CSV.")}
            className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono">$48,920</div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +22.4% vs last period
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Orders Fulfilled</span>
            <ShoppingBag className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono">214 Orders</div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +15.8% fulfillment velocity
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Average Order Value (AOV)</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono">$228.60</div>
          <span className="text-[11px] text-muted-foreground">+5.7% from bundle staging</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>AI Sales Attribution</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono">38.5%</div>
          <span className="text-[11px] text-indigo-500 font-medium">$18,834 generated via AI assistant</span>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-surface/70 border border-hairline space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Monthly Revenue Trajectory (2026)
            </h3>
            <span className="text-xs font-mono text-muted-foreground">USD ($)</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-hairline">
            {[
              { month: "Jan", rev: 28, pct: 55 },
              { month: "Feb", rev: 32, pct: 62 },
              { month: "Mar", rev: 35, pct: 68 },
              { month: "Apr", rev: 41, pct: 80 },
              { month: "May", rev: 38, pct: 74 },
              { month: "Jun", rev: 44, pct: 86 },
              { month: "Jul", rev: 46, pct: 90 },
              { month: "Aug", rev: 48.9, pct: 96 },
            ].map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  ${m.rev}k
                </div>
                <div
                  style={{ height: `${m.pct}%` }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-accent/40 to-accent group-hover:brightness-125 transition-all duration-300"
                />
                <span className="text-[10px] font-mono text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-surface/70 border border-hairline space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <PieChart className="w-4 h-4 text-accent" />
            Revenue by Category
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { category: "Keyboards & Switches", pct: 42, amount: "$20,546" },
              { category: "Studio Audio & Monitors", pct: 28, amount: "$13,697" },
              { category: "Desk Mats & Accessories", pct: 18, amount: "$8,805" },
              { category: "Task Lighting & Mounts", pct: 12, amount: "$5,872" },
            ].map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{cat.category}</span>
                  <span className="font-mono text-muted-foreground">{cat.amount} ({cat.pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${cat.pct}%` }} className="h-full bg-accent rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
