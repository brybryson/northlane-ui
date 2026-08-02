import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep dive into sales, customer behavior, and traffic metrics.</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
        <BarChart3 className="h-8 w-8 mb-4 opacity-50" />
        <p>Advanced analytics module is coming soon.</p>
        <p className="text-xs mt-2">Detailed charts and funnels will be displayed here.</p>
      </div>
    </div>
  );
}
