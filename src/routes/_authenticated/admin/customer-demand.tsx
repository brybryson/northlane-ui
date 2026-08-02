import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Search, AlertTriangle, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/customer-demand")({
  component: CustomerDemandPage,
});

function CustomerDemandPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Customer Demand Intelligence</h1>
          <span className="bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">New</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Discover what products your customers are looking for that you don't carry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-hairline bg-surface/50 overflow-hidden">
          <div className="p-6 border-b border-hairline">
            <h3 className="font-semibold tracking-tight flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              Top Requested Missing Products
            </h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-hairline bg-muted/20">
              <tr>
                <th className="px-6 py-4 font-medium">Product / Category</th>
                <th className="px-6 py-4 font-medium text-right">Search Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <MissingRow name="MacBook Charger (Magsafe 3)" count={214} intensity="high" />
              <MissingRow name="Ergonomic Vertical Mouse" count={93} intensity="medium" />
              <MissingRow name="USB-C Docking Station (100W)" count={84} intensity="medium" />
              <MissingRow name="Monitor Arm (Dual)" count={45} intensity="low" />
              <MissingRow name="Webcam (4K)" count={28} intensity="low" />
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-hairline bg-surface/50 p-6 bg-gradient-to-br from-surface to-accent/5">
            <h3 className="font-semibold tracking-tight mb-2 flex items-center gap-2 text-accent">
              <AlertTriangle className="h-4 w-4" />
              AI Recommendation
            </h3>
            <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
              Based on the last 30 days of search logs, there is an unusually high demand for <strong>MacBook Chargers</strong>. You currently lose approximately 7 customers a day due to lacking this inventory.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-background rounded-lg border border-hairline p-4">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Est. Revenue Opp</div>
                <div className="text-lg font-semibold tracking-tight">$4,200 / mo</div>
              </div>
              <div className="flex-1 bg-background rounded-lg border border-hairline p-4">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Confidence Score</div>
                <div className="text-lg font-semibold tracking-tight">94%</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface/50 p-6">
            <h3 className="font-semibold tracking-tight mb-6 flex items-center gap-2">
              <LineChart className="h-4 w-4 text-muted-foreground" />
              Trending Search Terms
            </h3>
            <div className="space-y-4">
              <TrendItem name="Laptop Chargers" trend="+38%" />
              <TrendItem name="Docking Stations" trend="+21%" />
              <TrendItem name="Desk Lamps" trend="+18%" />
              <TrendItem name="Cable Management" trend="+12%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissingRow({ name, count, intensity }: any) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 font-medium text-foreground/90">{name}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <span className="font-medium">{count}</span>
          <div className="flex gap-0.5">
            <div className={`h-3 w-1 rounded-full ${intensity === 'high' || intensity === 'medium' || intensity === 'low' ? 'bg-accent' : 'bg-muted'}`} />
            <div className={`h-3 w-1 rounded-full ${intensity === 'high' || intensity === 'medium' ? 'bg-accent' : 'bg-muted'}`} />
            <div className={`h-3 w-1 rounded-full ${intensity === 'high' ? 'bg-accent' : 'bg-muted'}`} />
          </div>
        </div>
      </td>
    </tr>
  );
}

function TrendItem({ name, trend }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3" />
        {trend}
      </span>
    </div>
  );
}
